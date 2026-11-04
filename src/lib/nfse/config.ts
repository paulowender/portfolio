import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readCertificate } from './certificate';
import { openCertificate, sealCertificate } from './vault';

export function canUseNfse(userId: string) {
  return !!process.env.NFSE_OWNER_USER_ID && process.env.NFSE_OWNER_USER_ID === userId;
}
function storagePath() {
  const owner = process.env.NFSE_OWNER_USER_ID;
  if (!owner || !/^[a-zA-Z0-9-]+$/.test(owner)) throw new Error('Usuário da integração não configurado.');
  return { owner, directory: process.env.NFSE_CERTIFICATE_STORE_DIR || join(process.cwd(), 'private', 'nfse') };
}
export async function saveNfseCertificate(pfx: Buffer, passphrase: string) {
  if (!pfx.length || pfx.length > 128_000 || passphrase.length > 1024) throw new Error('Selecione um certificado de até 125 KB e confira a senha.');
  const certificate = readCertificate(pfx, passphrase);
  const { owner, directory } = storagePath();
  const sealed = sealCertificate({ pfx, passphrase }, owner, process.env.NFSE_ENCRYPTION_KEY || '');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const temporary = join(directory, `${owner}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, sealed, { mode: 0o600, flag: 'wx' });
    await rename(temporary, join(directory, `${owner}.json`));
  } finally { await unlink(temporary).catch(() => {}); }
  return { expiresAt: certificate.expiresAt };
}
export async function getNfseCertificate() {
  const { owner, directory } = storagePath();
  let sealed: string | undefined;
  try { sealed = await readFile(join(directory, `${owner}.json`), 'utf8'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw new Error('Não foi possível ler o certificado salvo.'); }
  if (sealed !== undefined) {
    try {
      const credentials = openCertificate(sealed, owner, process.env.NFSE_ENCRYPTION_KEY || '');
      return { ...credentials, ...readCertificate(credentials.pfx, credentials.passphrase) };
    } catch { throw new Error('Não foi possível abrir o certificado salvo. Confira a chave de proteção do servidor ou selecione o certificado novamente.'); }
  }
  // Compatibilidade com a configuração anterior, até o primeiro envio pela tela.
  const path = process.env.NFSE_CERTIFICATE_PATH;
  const passphrase = process.env.NFSE_CERTIFICATE_PASSWORD;
  if (!path || passphrase === undefined || passphrase === '') throw new Error('Selecione o certificado e informe a senha para configurar a integração.');
  let pfx: Buffer;
  try { pfx = await readFile(path); } catch { throw new Error('Arquivo do certificado indisponível no servidor. Selecione o arquivo novamente.'); }
  return { pfx, passphrase, ...readCertificate(pfx, passphrase) };
}
