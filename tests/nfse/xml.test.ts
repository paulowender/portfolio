import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTemplate, buildDps } from '../../src/lib/nfse/xml';
import { sample, ns } from './fixture';
const input = { competence: '2026-10-01', amount: '7000.00', description: 'Suporte & manutenção <mensal>', number: 1 };
test('importa os dados fiscais e gera nova DPS somente em homologação', () => {
 const model = importTemplate(sample);
 assert.equal(model.customer, 'Cliente teste');
 assert.equal(model.amount, '7000.00');
 const result = buildDps(model.xml, input, new Date('2026-10-30T15:00:00Z'));
 assert.equal(result.id, 'DPS510562221234567800019500001000000000000001');
 assert.match(result.xml, /<tpAmb>2<\/tpAmb>/);
 assert.match(result.xml, /Suporte &amp; manutenção &lt;mensal&gt;/);
 assert.match(result.xml, /<pTotTribSN>2.01<\/pTotTribSN>/);
 assert.doesNotMatch(result.xml, /70000|DPSold/);
});
test('rejeita DTD, XML inválido, namespace estranho e múltiplas DPS', () => {
 for (const xml of ['<!DOCTYPE x><x/>', '<NFSe>', sample.replaceAll(ns, 'https://evil.test'), sample.replace('</infNFSe>', sample.match(/<DPS[\s\S]*<\/DPS>/)![0] + '</infNFSe>')]) assert.throws(() => importTemplate(xml));
});
test('rejeita valores, datas e números inválidos antes da assinatura', () => {
 const model = importTemplate(sample);
 for (const amount of ['0.00', '-1', '7,000', '1e3', 'NaN', '10.001']) assert.throws(() => buildDps(model.xml, { ...input, amount }));
 for (const competence of ['2026-02-30', '2026-13-01', 'x']) assert.throws(() => buildDps(model.xml, { ...input, competence }));
 assert.throws(() => buildDps(model.xml, { ...input, description: ' ' }));
 assert.throws(() => buildDps(model.xml, { ...input, number: -1 }));
});
test('não reaproveita tributos de valor fixo ao alterar o valor do serviço', () => {
 const withDiscount = sample.replace('<vServPrest>', '<vDescCondIncond><vDescIncond>100.00</vDescIncond></vDescCondIncond><vServPrest>');
 assert.throws(() => buildDps(importTemplate(withDiscount).xml, { ...input, amount: '8000.00' }));
});
test('permite alterar o valor quando o modelo só contém o serviço e percentuais', () => {
 assert.match(buildDps(importTemplate(sample).xml, { ...input, amount: '8000.00' }).xml, /<vServ>8000.00<\/vServ>/);
});
test('declara UTF-8 explicitamente no XML destinado à SEFIN (E1229)', () => {
 const dps = buildDps(sample, input);
 assert.match(dps.xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
});
test('adapta modelo anterior à finalidade normal exigida na homologação de outubro/2026', () => {
 const dps = buildDps(sample, input);
 assert.match(dps.xml, /<tpEmit>1<\/tpEmit><finNFSe>0<\/finNFSe><cLocEmi>/);
 const updated = sample.replace('<cLocEmi>', '<finNFSe>0</finNFSe><cLocEmi>');
 assert.equal((buildDps(updated, input).xml.match(/<finNFSe>/g) || []).length, 1);
});
test('emite no fuso usado pela SEFIN sem alterar o instante (E0008)', () => {
 const now = new Date('2026-10-30T16:05:24Z');
 const dps = buildDps(sample, input, now);
 const date = /<dhEmi>(.*?)<\/dhEmi>/.exec(dps.xml)![1];
 assert.equal(date, '2026-10-30T13:05:24-03:00');
 assert.equal(Date.parse(date), now.getTime());
});
