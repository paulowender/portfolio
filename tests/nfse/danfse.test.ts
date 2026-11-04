import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDanfse } from '../../src/lib/nfse/danfse';
import { sample } from './fixture';
const key = '1'.repeat(50);
const xml = sample.replace('<infNFSe>', `<infNFSe Id="NFS${key}"><nNFSe>1</nNFSe><dhProc>2026-10-30T13:00:00-03:00</dhProc><cStat>100</cStat><emit><CNPJ>12345678000195</CNPJ><xNome>Prestador teste</xNome></emit><valores><vLiq>7000.00</vLiq></valores>`).replace('<tpAmb>1</tpAmb>','<tpAmb>2</tpAmb>');
test('gera PDF A4 de homologação a partir do XML autorizado, com identificação e QR Code', async () => {
 const pdf = await createDanfse(xml, key);
 assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
 const bytes = pdf.toString('latin1');
 assert.match(bytes, /SEM VALIDADE/);
 assert.match(bytes, /\/Subtype \/Image/);
 assert.equal((bytes.match(/\/Type \/Page\b/g) || []).length, 1);
});
test('recusa XML de produção, chave divergente e declaração externa', async () => {
 await assert.rejects(() => createDanfse(xml.replace('<tpAmb>2</tpAmb>','<tpAmb>1</tpAmb>'), key));
 await assert.rejects(() => createDanfse(xml, '2'.repeat(50)));
 await assert.rejects(() => createDanfse('<!DOCTYPE x>'+xml, key));
});
