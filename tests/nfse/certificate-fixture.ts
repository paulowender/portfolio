import forge from 'node-forge';
export function syntheticPfx() {
 const keys = forge.pki.rsa.generateKeyPair(2048);
 const cert = forge.pki.createCertificate();
 cert.publicKey = keys.publicKey; cert.serialNumber = '01';
 cert.validity.notBefore = new Date(Date.now() - 60_000); cert.validity.notAfter = new Date(Date.now() + 86400_000);
 cert.setSubject([{ name: 'commonName', value: 'Teste sintetico' }]); cert.setIssuer(cert.subject.attributes);
 cert.sign(keys.privateKey, forge.md.sha256.create());
 const pfx = Buffer.from(forge.asn1.toDer(forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], 'secret', { algorithm: '3des' })).getBytes(), 'binary');
 return pfx;
}
