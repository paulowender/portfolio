import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { sealCertificate, openCertificate } from '../../src/lib/nfse/vault';
test('criptografa certificado e senha, vinculando os dados ao proprietário', () => {
 const key = randomBytes(32).toString('base64');
 const credentials = { pfx: Buffer.from('synthetic-private-key'), passphrase: 'synthetic-password' };
 const sealed = sealCertificate(credentials, 'user-a', key);
 assert.doesNotMatch(sealed, /synthetic/);
 const restored = openCertificate(sealed, 'user-a', key);
 assert.deepEqual(restored.pfx, credentials.pfx); assert.equal(restored.passphrase, credentials.passphrase);
 assert.notEqual(sealCertificate(credentials, 'user-a', key), sealed);
 assert.throws(() => openCertificate(sealed, 'user-b', key));
 assert.throws(() => openCertificate(sealed, 'user-a', randomBytes(32).toString('base64')));
 const tampered = JSON.parse(sealed); tampered.data = Buffer.from('tampered').toString('base64');
 assert.throws(() => openCertificate(JSON.stringify(tampered), 'user-a', key));
 assert.throws(() => sealCertificate(credentials, 'user-a', 'short'));
});
