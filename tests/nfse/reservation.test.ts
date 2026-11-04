import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '../../src/generated/prisma';
import { reserveTransmission } from '../../src/lib/nfse/reservation';
const url = process.env.NFSE_TEST_DATABASE_URL;
if (url && (!url.startsWith('postgresql://postgres:nfse-test-only@127.0.0.1:55439/nfse_homologation_test'))) throw new Error('Testes de banco exigem o Postgres local descartável.');
test('reserva concorrente, retomada sem transmissão e correção de rejeição usam a mesma DPS', { skip: !url }, async () => {
 const db = new PrismaClient({ datasourceUrl: url });
 const user = await db.user.create({ data: { email: `nfse-${Date.now()}@example.test`, name: 'Teste', skills: [] } });
 try {
  const template = await db.nfseTemplate.create({ data: { userId: user.id, name: 'Modelo', businessKey: 'test', xml: '<synthetic/>' } });
  const input = { userId: user.id, templateId: template.id, competence: '2026-10-01', amount: '7000.00', description: 'Teste' };
  await assert.rejects(() => reserveTransmission(db, { ...input, competence: '2026-10-02' }, number => ({ id: `DPS${number}`, xml: 'signed' })));
  await assert.rejects(() => reserveTransmission(db, input, () => { throw new Error('sign failed'); }));
  const prepared = await db.nfseEmission.findFirstOrThrow({ where: { templateId: template.id } });
  assert.equal(prepared.status, 'prepared'); assert.equal(prepared.dpsId, null);
  const results = await Promise.allSettled([1,2].map(() => reserveTransmission(db, input, number => ({ id: `DPS${number}`, xml: 'signed' }))));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  const sent = await db.nfseEmission.findUniqueOrThrow({ where: { id: prepared.id } });
  assert.equal(sent.number, prepared.number); assert.equal(sent.status, 'sending');
  await assert.rejects(() => reserveTransmission(db, input, number => ({ id: `DPS${number}`, xml: 'signed' })));
  await db.nfseEmission.update({ where: { id: sent.id }, data: { status: 'rejected' } });
  const corrected = await reserveTransmission(db, { ...input, description: 'Corrigido' }, number => ({ id: `DPS${number}`, xml: 'corrected' }));
  assert.equal(corrected.id, prepared.id); assert.equal(corrected.number, prepared.number);
  assert.equal(corrected.description, 'Corrigido');
  assert.equal(await db.nfseEmission.count({ where: { templateId: template.id } }), 1);
 } finally {
  await db.nfseEmission.deleteMany({ where: { userId: user.id } });
  await db.nfseTemplate.deleteMany({ where: { userId: user.id } });
  await db.user.delete({ where: { id: user.id } });
  await db.$disconnect();
 }
});
