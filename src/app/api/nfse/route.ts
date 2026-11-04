import { createDanfse } from '@/lib/nfse/danfse';
import { gunzipSync } from 'node:zlib';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedClient } from '@/lib/auth-helper';
import { canUseNfse, getNfseCertificate, saveNfseCertificate } from '@/lib/nfse/config';
import { buildDps, importTemplate, MAX_XML_BYTES } from '@/lib/nfse/xml';
import { reserveTransmission, ReservationConflict } from '@/lib/nfse/reservation';
import { signDps } from '@/lib/nfse/certificate';
import { callSefin } from '@/lib/nfse/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store, private', Vary: 'Authorization' };
function json(body: unknown, status = 200) { return NextResponse.json(body, { status, headers }); }
async function authorize(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if (!auth.user) return { response: json({ error: 'Entre na sua conta para continuar.' }, 401) };
  if (!canUseNfse(auth.user.id)) return { response: json({ error: 'Integração fiscal não habilitada para este usuário. Configure NFSE_OWNER_USER_ID no servidor.' }, 403) };
  return { user: auth.user };
}
const emitInput = z.object({ action: z.literal('emit'), templateId: z.string().uuid(), competence: z.string().regex(/^\d{4}-\d{2}-01$/), amount: z.string().max(20), description: z.string().max(2000) });
const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('import'), name: z.string().trim().min(1).max(100), xml: z.string().max(MAX_XML_BYTES) }),
  emitInput,
  z.object({ action: z.literal('configure'), pfxBase64: z.string().min(1).max(171000).regex(/^[A-Za-z0-9+/]+={0,2}$/), passphrase: z.string().max(1024), municipality: z.string().regex(/^\d{7}$/) }),
  z.object({ action: z.literal('test_connection'), municipality: z.string().regex(/^\d{7}$/) }),
  z.object({ action: z.literal('consult'), emissionId: z.string().uuid() }),
  z.object({ action: z.literal('download'), emissionId: z.string().uuid(), format: z.enum(['xml', 'pdf']).default('xml') }),
]);
const emissionSelection = { id: true, templateId: true, competence: true, amount: true, description: true, status: true, dpsId: true, accessKey: true, response: true, createdAt: true } as const;
function handleError(error: unknown) {
  if (error instanceof ReservationConflict) return json({ error: error.message }, 409);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return json({ error: 'Já existe um modelo com esse nome ou uma tentativa para essa competência. Consulte o histórico antes de emitir novamente.' }, 409);
    if (error.code === 'P2021') return json({ error: 'A migração das tabelas de homologação ainda não foi aplicada ao banco.' }, 503);
  }
  if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ error: 'Confira os campos enviados.' }, 400);
  // Não expor mensagens de banco, caminhos de arquivos ou conteúdo de credenciais.
  return json({ error: 'Não foi possível concluir a operação. Confira a configuração e tente consultar o histórico.' }, 500);
}

export async function GET(request: Request) {
  try {
    const auth = await authorize(request); if (auth.response) return auth.response;
    const userId = auth.user!.id;
    const [templates, emissions] = await Promise.all([
      prisma.nfseTemplate.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.nfseEmission.findMany({ where: { userId }, select: emissionSelection, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    let certificate = { ready: false, message: 'Certificado não configurado.' };
    try { const cert = await getNfseCertificate(); certificate = { ready: true, message: `Certificado válido até ${cert.expiresAt.slice(0, 10)}.` }; }
    catch (error) { certificate.message = (error as Error).message; }
    return json({ environment: 'homologacao', certificate, templates: templates.map(t => ({ id: t.id, name: t.name, ...importTemplate(t.xml), xml: undefined })), emissions });
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request) {
  try {
    const auth = await authorize(request); if (auth.response) return auth.response;
    if (Number(request.headers.get('content-length')) > 1_000_000) return json({ error: 'Arquivo muito grande.' }, 413);
    const text = await request.text();
    if (Buffer.byteLength(text) > 1_000_000) return json({ error: 'Arquivo muito grande.' }, 413);
    const input = inputSchema.parse(JSON.parse(text));
    const userId = auth.user!.id;
    if (input.action === 'import') {
      let model;
      try { model = importTemplate(input.xml); } catch (error) { return json({ error: (error as Error).message }, 400); }
      const template = await prisma.nfseTemplate.upsert({ where: { userId_businessKey: { userId, businessKey: model.businessKey } }, create: { userId, name: input.name, xml: model.xml, businessKey: model.businessKey }, update: { name: input.name, xml: model.xml } });
      return json({ template: { id: template.id, name: template.name, ...model, xml: undefined } }, 201);
    }
    if (input.action === 'configure') {
      try { await saveNfseCertificate(Buffer.from(input.pfxBase64, 'base64'), input.passphrase); }
      catch (error) {
        const message = (error as Error).message;
        return json({ error: message.startsWith('Não foi possível abrir o certificado A1') ? message : 'Não foi possível salvar o certificado. Confira a configuração de proteção e armazenamento no servidor.' }, 400);
      }
    }
    let credentials;
    try { credentials = await getNfseCertificate(); } catch (error) { return json({ error: (error as Error).message }, 503); }
    if (input.action === 'configure' || input.action === 'test_connection') {
      const saved = input.action === 'configure';
      try {
        const result = await callSefin(`parametros_municipais/${input.municipality}/convenio`, credentials);
        const connected = result.status >= 200 && result.status < 300 && Object.keys(result.data).length > 0;
        return json({ saved, connected, expiresAt: credentials.expiresAt, message: connected
          ? 'Conexão com a SEFIN de homologação confirmada. Nenhuma nota foi emitida.'
          : `${saved ? 'Certificado salvo. ' : ''}A SEFIN não confirmou a consulta do município (HTTP ${result.status}). Confira o município e tente testar novamente. Nenhuma nota foi emitida.` });
      } catch {
        return json({ saved, connected: false, expiresAt: credentials.expiresAt, message: `${saved ? 'Certificado salvo. ' : ''}Não foi possível confirmar a conexão com a SEFIN de homologação. Tente testar novamente. Nenhuma nota foi emitida.` });
      }
    }
    if (input.action === 'download') {
      const emission = await prisma.nfseEmission.findFirst({ where: { id: input.emissionId, userId, status: 'authorized' } });
      if (!emission?.accessKey) return json({ error: 'Nota autorizada não encontrada.' }, 404);
      let data = emission.response as Record<string, unknown> | null;
      if (typeof data?.nfseXmlGZipB64 !== 'string') {
        try { data = (await callSefin(`nfse/${emission.accessKey}`, credentials)).data; }
        catch { return json({ error: 'A SEFIN não respondeu ao pedido de download. Tente novamente mais tarde.' }, 502); }
      }
      if (typeof data?.nfseXmlGZipB64 !== 'string') return json({ error: 'O XML ainda não está disponível na resposta da SEFIN.' }, 502);
      try {
        const xml = gunzipSync(Buffer.from(data.nfseXmlGZipB64, 'base64'), { maxOutputLength: 4_000_000 }).toString('utf8');
        if (input.format === 'pdf') {
          const pdf = await createDanfse(xml, emission.accessKey);
          return new Response(new Uint8Array(pdf), { headers: { ...headers, 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="danfse-homologacao-${emission.id}.pdf"` } });
        }
        return new Response(xml, { headers: { ...headers, 'Content-Type': 'application/xml; charset=utf-8', 'Content-Disposition': `attachment; filename="nfse-homologacao-${emission.id}.xml"` } });
      } catch { return json({ error: input.format === 'pdf' ? 'Não foi possível gerar o DANFSe a partir do XML autorizado. Tente novamente mais tarde.' : 'A resposta da SEFIN não contém um XML compactado válido.' }, 502); }
    }
    if (input.action === 'consult') {
      const emission = await prisma.nfseEmission.findFirst({ where: { id: input.emissionId, userId } });
      if (!emission?.dpsId) return json({ error: 'Tentativa não encontrada ou ainda sem identificador. Nenhuma nova nota foi enviada.' }, 404);
      if (['authorized', 'rejected'].includes(emission.status)) return json({ emission: { id: emission.id, status: emission.status, accessKey: emission.accessKey } });
      let result;
      try { result = await callSefin(`dps/${emission.dpsId}`, credentials); }
      catch { return json({ error: 'A SEFIN não respondeu à consulta. Nenhuma nova nota foi enviada.' }, 502); }
      if (result.kind === 'authorized') {
        const saved = await prisma.nfseEmission.update({ where: { id: emission.id }, data: { status: 'authorized', accessKey: result.data.chaveAcesso as string, response: result.data as Prisma.InputJsonObject }, select: emissionSelection });
        return json({ emission: saved });
      }
      return json({ error: 'A consulta ainda não confirmou a autorização. Nenhuma nova nota foi enviada; consulte novamente mais tarde.', status: result.status }, 409);
    }
    const template = await prisma.nfseTemplate.findFirst({ where: { id: input.templateId, userId } });
    if (!template) return json({ error: 'Modelo não encontrado.' }, 404);
    try { buildDps(template.xml, { ...input, number: 1 }); }
    catch (error) { return json({ error: (error as Error).message }, 400); }
    const emission = await reserveTransmission(prisma, { userId, templateId: template.id, competence: input.competence, amount: input.amount, description: input.description }, number => {
      const dps = buildDps(template.xml, { ...input, number });
      return { id: dps.id, xml: signDps(dps.xml, credentials) };
    });
    let result;
    try { result = await callSefin('nfse', credentials, emission.signedXml); }
    catch {
      await prisma.nfseEmission.updateMany({ where: { id: emission.id, status: 'sending' }, data: { status: 'unknown' } });
      const current = await prisma.nfseEmission.findUnique({ where: { id: emission.id }, select: emissionSelection });
      if (current?.status === 'authorized') return json({ emission: current }, 201);
      return json({ error: 'A transmissão ficou sem confirmação. Consulte a tentativa no histórico; não envie outra nota para a mesma competência.' }, 502);
    }
    // Uma consulta concorrente já pode ter confirmado a autorização durante a transmissão.
    await prisma.nfseEmission.updateMany({ where: { id: emission.id, ...(result.kind === 'authorized' ? {} : { status: 'sending' }) }, data: {
      status: result.kind, accessKey: result.kind === 'authorized' ? result.data.chaveAcesso as string : null,
      response: result.data as Prisma.InputJsonObject,
    } });
    const saved = await prisma.nfseEmission.findUniqueOrThrow({ where: { id: emission.id }, select: emissionSelection });
    return json({ emission: saved }, saved.status === 'authorized' ? 201 : saved.status === 'rejected' ? 422 : 502);
  } catch (error) { return handleError(error); }
}
