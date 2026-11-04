import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';

export function readCertificate(pfx: Buffer, passphrase: string) {
  try {
    const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(pfx.toString('binary')), passphrase);
    const keyType = forge.pki.oids.pkcs8ShroudedKeyBag;
    const certType = forge.pki.oids.certBag;
    const keyBag = p12.getBags({ bagType: keyType })[keyType]?.find(bag => bag.key);
    if (!keyBag?.key) throw new Error('missing key');
    const key = keyBag.key as forge.pki.rsa.PrivateKey;
    const certBag = p12.getBags({ bagType: certType })[certType]?.find(bag => {
      const publicKey = bag.cert?.publicKey as forge.pki.rsa.PublicKey | undefined;
      return publicKey && publicKey.n.equals(key.n);
    });
    const cert = certBag?.cert;
    if (!cert || cert.validity.notBefore > new Date() || cert.validity.notAfter < new Date()) throw new Error('invalid validity');
    return { key: forge.pki.privateKeyToPem(key), cert: forge.pki.certificateToPem(cert), expiresAt: cert.validity.notAfter.toISOString() };
  } catch {
    throw new Error('Não foi possível abrir o certificado A1. Confira arquivo, senha e validade.');
  }
}

export function signDps(xml: string, credentials: { key: string; cert: string }) {
  const signature = new SignedXml({
    privateKey: credentials.key,
    publicCert: credentials.cert,
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
  });
  signature.addReference({
    xpath: "//*[local-name()='infDPS']",
    transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature', 'http://www.w3.org/2001/10/xml-exc-c14n#'],
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
  });
  signature.computeSignature(xml, { location: { reference: "//*[local-name()='infDPS']", action: 'after' } });
  return signature.getSignedXml();
}
