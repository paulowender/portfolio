import { createHash } from 'node:crypto';
import { DOMParser, XMLSerializer, type Element, type Document } from '@xmldom/xmldom';

const NS = 'http://www.sped.fazenda.gov.br/nfse';
export const MAX_XML_BYTES = 512_000;
const serializer = new XMLSerializer();

function parse(xml: string): Document {
  if (Buffer.byteLength(xml) > MAX_XML_BYTES || /<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new Error('XML muito grande ou com declaração de entidades não permitida.');
  }
  let invalid = false;
  const doc = new DOMParser({ onError: () => { invalid = true; } }).parseFromString(xml, 'application/xml');
  if (invalid || !doc.documentElement || doc.documentElement.namespaceURI !== NS) {
    throw new Error('XML de NFS-e inválido.');
  }
  return doc;
}

function one(root: Document | Element, name: string): Element {
  const nodes = root.getElementsByTagNameNS(NS, name);
  if (nodes.length !== 1) throw new Error(`O XML deve conter exatamente um campo ${name}.`);
  return nodes.item(0)!;
}
function value(root: Document | Element, name: string) { return one(root, name).textContent || ''; }
function set(root: Element, name: string, text: string) { one(root, name).textContent = text; }

export function importTemplate(xml: string) {
  const doc = parse(xml);
  const dps = one(doc, 'DPS');
  if (dps.getAttribute('versao') !== '1.01') throw new Error('Esta integração usa DPS na versão 1.01.');
  const info = one(dps, 'infDPS');
  const provider = value(one(info, 'prest'), 'CNPJ');
  const municipality = value(info, 'cLocEmi');
  if (!/^\d{14}$/.test(provider) || !/^\d{7}$/.test(municipality) || value(info, 'tpEmit') !== '1') {
    throw new Error('Modelo deve ser emitido pelo prestador com CNPJ e município válidos.');
  }
  // A assinatura do documento original não vale para uma nova declaração.
  const signatures = dps.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'Signature');
  while (signatures.length) signatures.item(0)!.parentNode!.removeChild(signatures.item(0)!);
  if (info.getElementsByTagNameNS(NS, 'subst').length) throw new Error('Notas de substituição não podem ser usadas como modelo.');
  const customerNode = one(info, 'toma');
  return {
    xml: serializer.serializeToString(dps), provider, municipality,
    businessKey: createHash('sha256').update(`${provider}|${value(customerNode, 'CNPJ')}|${value(info, 'cTribNac')}`).digest('hex'),
    customer: value(customerNode, 'xNome'),
    customerDocument: value(customerNode, 'CNPJ'),
    amount: value(one(info, 'vServPrest'), 'vServ'),
    description: value(info, 'xDescServ'),
    serviceCode: value(info, 'cTribNac'),
  };
}

export type DpsInput = { competence: string; amount: string; description: string; number: number };
export function buildDps(template: string, input: DpsInput, now = new Date()) {
  const model = importTemplate(template);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.competence) ||
      !Number.isFinite(Date.parse(input.competence)) ||
      new Date(input.competence).toISOString().slice(0, 10) !== input.competence) throw new Error('Competência inválida.');
  if (!/^\d{1,12}\.\d{2}$/.test(input.amount) || Number(input.amount) <= 0) throw new Error('Valor deve ser positivo, com duas casas decimais.');
  if (!input.description.trim() || input.description.length > 2000 || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(input.description)) throw new Error('Descrição inválida (máximo de 2.000 caracteres).');
  if (!Number.isSafeInteger(input.number) || input.number < 1) throw new Error('Número da DPS inválido.');
  if (Number(input.amount) !== Number(model.amount)) {
    const values = one(parse(model.xml), 'valores').getElementsByTagNameNS(NS, '*');
    for (let i = 0; i < values.length; i++) {
      const el = values.item(i)!;
      if (el.localName !== 'vServ' && el.getElementsByTagName('*').length === 0 && /^v[A-Z]/.test(el.localName || '') && Number(el.textContent) > 0) {
        throw new Error('Este modelo contém valores fixos de descontos, deduções ou tributos. Importe um modelo atualizado antes de alterar o valor.');
      }
    }
  }
  const doc = parse(model.xml);
  const info = one(doc, 'infDPS');
  const id = `DPS${model.municipality}2${model.provider}00001${String(input.number).padStart(15, '0')}`;
  info.setAttribute('Id', id);
  // Homologação NT009 (20/10/2026): finalidade regular obrigatória fora do grupo IBS/CBS.
  if (!info.getElementsByTagNameNS(NS, 'finNFSe').length) {
    const purpose = doc.createElementNS(NS, 'finNFSe');
    purpose.textContent = '0';
    info.insertBefore(purpose, one(info, 'cLocEmi'));
  }
  set(info, 'tpAmb', '2');
  // Usar o mesmo fuso da SEFIN evita rejeição E0008 na comparação de horário.
  set(info, 'dhEmi', new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, '-03:00'));
  set(info, 'verAplic', 'WenderTech_1.0');
  set(info, 'serie', '1');
  set(info, 'nDPS', String(input.number));
  set(info, 'dCompet', input.competence);
  set(info, 'xDescServ', input.description.trim());
  set(one(info, 'vServPrest'), 'vServ', input.amount);
  return { id, xml: '<?xml version="1.0" encoding="UTF-8"?>' + serializer.serializeToString(doc) };
}
