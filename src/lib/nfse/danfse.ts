import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { DOMParser, type Element } from '@xmldom/xmldom';

const NS = 'http://www.sped.fazenda.gov.br/nfse';
function node(root: Element | null, path: string): Element | null {
  let current = root;
  for (const name of path.split('/')) {
    let next: Element | null = null;
    for (let c = current?.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 1 && (c as Element).localName === name && (c as Element).namespaceURI === NS) { next = c as Element; break; }
    }
    current = next;
  }
  return current;
}
function value(root: Element | null, path: string) { return node(root, path)?.textContent?.trim() || ''; }
const display = (s: string) => s || '-';
const money = (s: string) => s && Number.isFinite(Number(s)) ? Number(s).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-';
function date(s: string) {
  if (!s) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.split('-').reverse().join('/');
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}:\d{2})/.exec(s);
  return match ? `${match[3]}/${match[2]}/${match[1]} ${match[4]}` : s;
}
function documentId(root: Element | null) { return value(root, 'CNPJ') || value(root, 'CPF') || value(root, 'NIF'); }

/** DANFSe local para o ambiente restrito, baseado no XML autorizado e no modelo NT008. */
export async function createDanfse(xml: string, accessKey: string): Promise<Buffer> {
  if (Buffer.byteLength(xml) > 4_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml) || !/^\d{50}$/.test(accessKey)) throw new Error('XML ou chave de acesso inválidos.');
  let invalid = false;
  const parsed = new DOMParser({ onError: () => { invalid = true; } }).parseFromString(xml, 'application/xml');
  const root = parsed.documentElement;
  const info = node(root, 'infNFSe');
  const dps = node(info, 'DPS/infDPS');
  if (invalid || !root || root.localName !== 'NFSe' || root.namespaceURI !== NS || info?.getAttribute('Id') !== `NFS${accessKey}` || value(dps, 'tpAmb') !== '2') {
    throw new Error('O DANFSe exige o XML autorizado da mesma nota em homologação.');
  }
  const issuer = node(info, 'emit');
  const provider = node(dps, 'prest');
  const customer = node(dps, 'toma');
  const service = node(dps, 'serv');
  const municipal = node(dps, 'valores/trib/tribMun');
  const federal = node(dps, 'valores/trib/tribFed');
  const calculated = node(info, 'valores');
  const consultationUrl = `https://www.nfse.gov.br/ConsultaPublica/?tpc=1&chave=${accessKey}`;
  const qr = await QRCode.toBuffer(consultationUrl, { type: 'png', width: 220, margin: 2, errorCorrectionLevel: 'M' });
  const doc = new PDFDocument({ size: 'A4', margin: 0, compress: false, info: { Title: 'DANFSe - NFS-e SEM VALIDADE JURIDICA', Author: 'Wender Tech', Subject: 'Documento auxiliar da NFS-e em homologação' } });
  const chunks: Buffer[] = [];
  const completed = new Promise<Buffer>((resolve, reject) => { doc.on('data', chunk => chunks.push(Buffer.from(chunk))); doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject); });
  const left = 5.67; const width = doc.page.width - left * 2;
  doc.lineWidth(1).rect(left, left, width, doc.page.height - left * 2).stroke();
  const text = (s: string, x: number, y: number, w: number, h: number, size = 8, bold = false) => {
    // Campos são texto simples: nunca interpretar HTML, comandos PDF ou URLs do XML.
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size).fillColor('black').text(display(s).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''), x, y, { width: w, height: h, ellipsis: true, lineGap: 0 });
  };
  const line = (y: number) => doc.lineWidth(0.5).moveTo(left, y).lineTo(left + width, y).stroke();
  const heading = (title: string, y: number) => { doc.rect(left, y, width, 13).fill('#f2f2f2'); text(title, left + 4, y + 3, width - 8, 10, 7, true); line(y); };
  const fields = (y: number, items: [string, string][], height = 28) => {
    const cellWidth = width / items.length;
    items.forEach(([label, val], i) => { text(label, left + i * cellWidth + 4, y + 2, cellWidth - 8, 9, 6, true); text(val, left + i * cellWidth + 4, y + 12, cellWidth - 8, height - 12, 8); });
  };
  doc.rect(left, left, width, 42).fill('#f2f2f2');
  text('NFS-e', left + 8, 15, 110, 25, 22, true);
  text('DANFSe v2.0', left + 150, 10, 300, 13, 10, true);
  text('Documento Auxiliar da NFS-e', left + 150, 23, 300, 12, 9, true);
  text('NFS-e SEM VALIDADE JURÍDICA', left + 150, 35, 300, 11, 8, true);
  text(`Município: ${value(info, 'xLocEmi')}`, left + width - 135, 11, 130, 20, 7);
  text('Ambiente: homologação', left + width - 135, 32, 130, 10, 7);
  line(48);
  text('CHAVE DE ACESSO DA NFS-e', left + 4, 52, width - 90, 9, 6, true);
  text(accessKey, left + 4, 64, width - 95, 12, 9);
  doc.image(qr, left + width - 75, 52, { width: 65, height: 65 });
  doc.link(left + width - 75, 52, 65, 65, consultationUrl);
  text('Consulte a autenticidade pelo QR Code ou pela chave no Portal Nacional.', left + width - 100, 119, 96, 25, 6);
  const idWidth = (width - 105) / 3;
  const idRow = (y: number, entries: [string, string][]) => entries.forEach(([label, val], i) => { text(label, left + 4 + idWidth * i, y, idWidth - 8, 9, 6, true); text(val, left + 4 + idWidth * i, y + 10, idWidth - 8, 14, 8); });
  idRow(81, [['NÚMERO DA NFS-e', value(info, 'nNFSe')], ['COMPETÊNCIA DA NFS-e', date(value(dps, 'dCompet'))], ['DATA E HORA DA NFS-e', date(value(info, 'dhProc'))]]);
  idRow(108, [['NÚMERO DA DPS', value(dps, 'nDPS')], ['SÉRIE DA DPS', value(dps, 'serie')], ['DATA E HORA DA DPS', date(value(dps, 'dhEmi'))]]);
  fields(142, [['EMITENTE DA NFS-e', value(dps, 'tpEmit') === '1' ? 'Prestador' : value(dps, 'tpEmit')], ['SITUAÇÃO DA NFS-e', value(info, 'cStat') === '100' ? 'Autorizada' : value(info, 'cStat')], ['FINALIDADE', value(dps, 'finNFSe') === '0' ? 'NFS-e regular' : value(dps, 'finNFSe')]]);

  const party = (title: string, y: number, entity: Element | null, address: Element | null) => {
    heading(title, y);
    fields(y + 14, [['CNPJ / CPF / NIF', documentId(entity)], ['INSCRIÇÃO MUNICIPAL', value(entity, 'IM')], ['TELEFONE', value(entity, 'fone')]], 25);
    fields(y + 39, [['NOME / NOME EMPRESARIAL', value(entity, 'xNome')], ['MUNICÍPIO / UF / CÓDIGO IBGE / CEP', [value(address, 'xMun'), value(address, 'UF'), value(address, 'cMun') || value(address, 'endNac/cMun'), value(address, 'CEP') || value(address, 'endNac/CEP')].filter(Boolean).join(' / ')]], 25);
    fields(y + 64, [['ENDEREÇO', ['xLgr', 'nro', 'xCpl', 'xBairro'].map(p => value(address, p)).filter(Boolean).join(', ')], ['E-MAIL', value(entity, 'email')]], 27);
  };
  party('PRESTADOR / FORNECEDOR', 171, issuer, node(issuer, 'enderNac'));
  fields(262, [['SIMPLES NACIONAL NA COMPETÊNCIA', ({ '1': 'Não optante', '2': 'Optante - MEI', '3': 'Optante - ME/EPP' } as Record<string, string>)[value(provider, 'regTrib/opSimpNac')] || value(provider, 'regTrib/opSimpNac')], ['REGIME DE APURAÇÃO PELO SIMPLES NACIONAL', value(provider, 'regTrib/regApTribSN')]], 25);
  party('TOMADOR / ADQUIRENTE', 288, customer, node(customer, 'end'));
  heading('DESTINATÁRIO DA OPERAÇÃO', 380);
  text('DESTINATÁRIO DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e', left + 4, 396, width - 8, 12, 7);
  heading('INTERMEDIÁRIO DA OPERAÇÃO', 411);
  const intermediary = node(dps, 'interm');
  text(intermediary ? [documentId(intermediary), value(intermediary, 'xNome')].filter(Boolean).join(' - ') : 'INTERMEDIÁRIO DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e', left + 4, 426, width - 8, 12, 7);
  heading('SERVIÇO PRESTADO', 440);
  fields(454, [['CÓDIGO DE TRIBUTAÇÃO NACIONAL / MUNICIPAL', [value(service, 'cServ/cTribNac'), value(service, 'cServ/cTribMun')].filter(Boolean).join(' / ')], ['CÓDIGO DA NBS', value(service, 'cServ/cNBS')], ['LOCAL DA PRESTAÇÃO / CÓDIGO IBGE', [value(info, 'xLocPrestacao'), value(service, 'locPrest/cLocPrestacao')].filter(Boolean).join(' / ')]], 25);
  text(value(info, 'xTribMun') || value(info, 'xTribNac'), left + 4, 481, width - 8, 19, 7);
  text('DESCRIÇÃO DO SERVIÇO', left + 4, 500, width - 8, 9, 6, true);
  text(value(service, 'cServ/xDescServ'), left + 4, 511, width - 8, 48, 8);
  heading('TRIBUTAÇÃO MUNICIPAL (ISSQN)', 563);
  fields(577, [['TIPO DE TRIBUTAÇÃO DO ISSQN', ({ '1': 'Operação tributável', '2': 'Imunidade', '3': 'Exportação', '4': 'Não incidência' } as Record<string, string>)[value(municipal, 'tribISSQN')] || value(municipal, 'tribISSQN')], ['MUNICÍPIO DE INCIDÊNCIA / IBGE', [value(info, 'xLocIncid'), value(info, 'cLocIncid')].filter(Boolean).join(' / ')], ['RETENÇÃO DO ISSQN', ({ '1': 'Não retido', '2': 'Retido pelo tomador', '3': 'Retido pelo intermediário' } as Record<string, string>)[value(municipal, 'tpRetISSQN')] || value(municipal, 'tpRetISSQN')]], 25);
  fields(603, [['BASE DE CÁLCULO ISSQN', money(value(calculated, 'vBC'))], ['ALÍQUOTA APLICADA', value(calculated, 'pAliqAplic') ? value(calculated, 'pAliqAplic') + '%' : ''], ['ISSQN APURADO', money(value(calculated, 'vISSQN'))], ['DEDUÇÕES / REDUÇÕES', money(value(calculated, 'vCalcDR'))]], 25);
  heading('TRIBUTAÇÃO FEDERAL (EXCETO CBS)', 630);
  fields(644, [['IRRF', money(value(federal, 'vRetIRRF'))], ['CONTRIBUIÇÃO PREVIDENCIÁRIA RETIDA', money(value(federal, 'vRetCP'))], ['CONTRIBUIÇÕES SOCIAIS RETIDAS', money(value(federal, 'vRetCSLL'))], ['PIS / COFINS', [money(value(federal, 'piscofins/vPis')), money(value(federal, 'piscofins/vCofins'))].join(' / ')]], 26);
  heading('TRIBUTAÇÃO IBS / CBS', 672);
  text(node(dps, 'IBSCBS') ? 'Consulte os grupos IBS/CBS no XML autorizado para os valores detalhados.' : 'IBS / CBS NÃO INFORMADOS NO XML DA NFS-e', left + 4, 689, width - 8, 14, 7);
  heading('VALOR TOTAL DA NFS-e', 708);
  fields(722, [['VALOR DA OPERAÇÃO / SERVIÇO', money(value(dps, 'valores/vServPrest/vServ'))], ['DESCONTO INCONDICIONADO', money(value(dps, 'valores/vDescCondIncond/vDescIncond'))], ['DESCONTO CONDICIONADO', money(value(dps, 'valores/vDescCondIncond/vDescCond'))], ['VALOR LÍQUIDO DA NFS-e', money(value(calculated, 'vLiq'))]], 27);
  heading('INFORMAÇÕES COMPLEMENTARES', 752);
  const rate = value(dps, 'valores/trib/totTrib/pTotTribSN');
  const extra = [value(service, 'infoCompl/xInfComp'), value(info, 'xOutInf'), rate ? `Tributos aproximados - Simples Nacional: ${rate}%` : ''].filter(Boolean).join('\n');
  text(extra, left + 4, 769, width - 8, 48, 8);
  line(825);
  text('Ambiente de homologação - documento auxiliar gerado a partir do XML autorizado.', left + 4, 828, width - 8, 9, 6);
  doc.end();
  return completed;
}
