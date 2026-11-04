import { request } from 'node:https';
import { gzipSync } from 'node:zlib';

// Não aceitar URLs do navegador ou ambiente: esta versão nunca transmite em produção.
export const HOMOLOGATION_URL = 'https://sefin.producaorestrita.nfse.gov.br/API/SefinNacional/';
export function encodeDps(xml: string) { return { dpsXmlGZipB64: gzipSync(Buffer.from(xml, 'utf8')).toString('base64') }; }
export function parseSefinResponse(status: number, body: string) {
  let data: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed;
  } catch { /* HTML de proxy não é uma confirmação fiscal. */ }
  const authorized = status >= 200 && status < 300 && typeof data.chaveAcesso === 'string';
  const rejected = status === 400 && Array.isArray(data.erros) && data.erros.length > 0;
  return { kind: authorized ? 'authorized' as const : rejected ? 'rejected' as const : 'unknown' as const, status, data };
}
export function resolveHomologationUrl(path: string) {
  const municipality = /^parametros_municipais\/(\d{7})\/convenio$/.exec(path);
  if (municipality) return new URL(`https://adn.producaorestrita.nfse.gov.br/parametrizacao/${municipality[1]}/convenio`);
  if (!/^(nfse(?:\/\d{50})?|dps\/DPS\d{42})$/.test(path)) throw new Error('Caminho da NFS-e inválido.');
  return new URL(path, HOMOLOGATION_URL);
}
export async function callSefin(path: string, credentials: { pfx: Buffer; passphrase: string }, xml?: string) {
  const url = resolveHomologationUrl(path);
  const body = xml === undefined ? undefined : JSON.stringify(encodeDps(xml));
  return await new Promise<ReturnType<typeof parseSefinResponse>>((resolve, reject) => {
    const req = request(url, {
      method: body ? 'POST' : 'GET', pfx: credentials.pfx, passphrase: credentials.passphrase,
      minVersion: 'TLSv1.2', rejectUnauthorized: true,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}) },
    }, res => {
      const chunks: Buffer[] = []; let size = 0;
      res.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > 4_000_000) { res.destroy(); req.destroy(new Error('Resposta da SEFIN excedeu o limite.')); return; }
        chunks.push(chunk);
      });
      res.on('error', reject);
      res.on('end', () => resolve(parseSefinResponse(res.statusCode || 0, Buffer.concat(chunks).toString('utf8'))));
    });
    const deadline = setTimeout(() => req.destroy(new Error('Tempo limite ao consultar a SEFIN.')), 25_000);
    req.on('close', () => clearTimeout(deadline));
    req.on('error', reject);
    req.end(body);
  });
}
