import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canUseNfse } from '../../src/lib/nfse/config';
test('nega uso do certificado por padrão e restringe ao usuário configurado', () => {
 const original = process.env.NFSE_OWNER_USER_ID;
 try {
  delete process.env.NFSE_OWNER_USER_ID;
  assert.equal(canUseNfse(''), false); assert.equal(canUseNfse('user-a'), false);
  process.env.NFSE_OWNER_USER_ID = 'user-a';
  assert.equal(canUseNfse('user-a'), true); assert.equal(canUseNfse('user-b'), false);
 } finally {
  if (original === undefined) delete process.env.NFSE_OWNER_USER_ID;
  else process.env.NFSE_OWNER_USER_ID = original;
 }
});
