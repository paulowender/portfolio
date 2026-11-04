import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

type Credentials = { pfx: Buffer; passphrase: string };
function encryptionKey(encoded: string) {
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('A chave de proteção do certificado não está configurada corretamente no servidor.');
  return key;
}
export function sealCertificate(credentials: Credentials, owner: string, encodedKey: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(encodedKey), iv);
  cipher.setAAD(Buffer.from(owner));
  const plain = Buffer.from(JSON.stringify({ pfx: credentials.pfx.toString('base64'), passphrase: credentials.passphrase }));
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  return JSON.stringify({ version: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: encrypted.toString('base64') });
}
export function openCertificate(sealed: string, owner: string, encodedKey: string): Credentials {
  const envelope = JSON.parse(sealed);
  if (envelope.version !== 1) throw new Error('Formato do certificado salvo não reconhecido.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(encodedKey), Buffer.from(envelope.iv, 'base64'));
  decipher.setAAD(Buffer.from(owner));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  const plain = Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]);
  const credentials = JSON.parse(plain.toString('utf8'));
  if (typeof credentials.pfx !== 'string' || typeof credentials.passphrase !== 'string') throw new Error('Certificado salvo inválido.');
  return { pfx: Buffer.from(credentials.pfx, 'base64'), passphrase: credentials.passphrase };
}
