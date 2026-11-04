import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { syntheticPfx } from './certificate-fixture';
import { saveNfseCertificate, getNfseCertificate } from '../../src/lib/nfse/config';
test('salva credenciais criptografadas e não substitui certificado quando a senha é inválida', async () => {
 const directory = await mkdtemp(join(tmpdir(), 'nfse-vault-test-'));
 const keys = ['NFSE_OWNER_USER_ID', 'NFSE_CERTIFICATE_STORE_DIR', 'NFSE_ENCRYPTION_KEY'];
 const original = keys.map(key => process.env[key]);
 try {
  process.env.NFSE_OWNER_USER_ID = 'test-owner'; process.env.NFSE_CERTIFICATE_STORE_DIR = directory;
  process.env.NFSE_ENCRYPTION_KEY = randomBytes(32).toString('base64');
  const pfx = syntheticPfx();
  const metadata = await saveNfseCertificate(pfx, 'secret');
  assert.ok(metadata.expiresAt); assert.deepEqual(Object.keys(metadata), ['expiresAt']);
  const path = join(directory, 'test-owner.json');
  const stored = await readFile(path, 'utf8');
  assert.doesNotMatch(stored, /secret/); assert.equal((await stat(path)).mode & 0o777, 0o600);
  const loaded = await getNfseCertificate(); assert.deepEqual(loaded.pfx, pfx); assert.equal(loaded.passphrase, 'secret');
  await assert.rejects(() => saveNfseCertificate(pfx, 'wrong'));
  assert.equal(await readFile(path, 'utf8'), stored);
  delete process.env.NFSE_ENCRYPTION_KEY; await assert.rejects(() => getNfseCertificate());
 } finally {
  keys.forEach((key, i) => { if(original[i]===undefined) delete process.env[key]; else process.env[key]=original[i]; });
  await rm(directory, { recursive: true, force: true });
 }
});
