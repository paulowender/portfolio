import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { HOMOLOGATION_URL, encodeDps, parseSefinResponse } from '../../src/lib/nfse/client';
test('fixa destino de homologação e codifica XML sem alterar assinatura', () => {
 assert.equal(HOMOLOGATION_URL, 'https://sefin.producaorestrita.nfse.gov.br/API/SefinNacional/');
 const xml = '<DPS>á &amp; b</DPS>';
 assert.equal(gunzipSync(Buffer.from(encodeDps(xml).dpsXmlGZipB64, 'base64')).toString(), xml);
});
test('diferencia rejeição fiscal de falha ou resposta não interpretável', () => {
 assert.equal(parseSefinResponse(201, '{"chaveAcesso":"123"}').kind, 'authorized');
 assert.equal(parseSefinResponse(400, '{"erros":[{"Codigo":"E1","Descricao":"Campo inválido"}]}').kind, 'rejected');
 assert.equal(parseSefinResponse(500, '{}').kind, 'unknown');
 assert.equal(parseSefinResponse(200, '<html>erro</html>').kind, 'unknown');
 assert.equal(parseSefinResponse(200, '{}').kind, 'unknown');
});
test('consulta convênio no ADN de homologação e mantém emissão na SEFIN', async () => {
 const { resolveHomologationUrl } = await import('../../src/lib/nfse/client');
 assert.equal(resolveHomologationUrl('parametros_municipais/5105622/convenio').href, 'https://adn.producaorestrita.nfse.gov.br/parametrizacao/5105622/convenio');
 assert.equal(resolveHomologationUrl('nfse').href, `${HOMOLOGATION_URL}nfse`);
 assert.throws(() => resolveHomologationUrl('https://sefin.nfse.gov.br/nfse'));
 assert.throws(() => resolveHomologationUrl('../nfse'));
});
