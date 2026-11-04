'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/dashboard/PageHeader';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { FlaskConical } from 'lucide-react';

type Template = { id: string; name: string; provider: string; municipality: string; customer: string; customerDocument: string; amount: string; description: string; serviceCode: string };
type Emission = { id: string; templateId: string; competence: string; amount: string; status: string; accessKey?: string; response?: { erros?: { Codigo?: string; Descricao?: string; Complemento?: string }[] } };
type State = { templates: Template[]; emissions: Emission[]; certificate: { ready: boolean; message: string } };
const statusNames: Record<string, string> = { prepared: 'Preparada', sending: 'Sem confirmação — consultar', unknown: 'Sem confirmação — consultar', rejected: 'Rejeitada', authorized: 'Autorizada em homologação' };
const money = (value: string) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function api(body?: unknown) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Entre na sua conta para continuar.');
  const response = await fetch('/api/nfse', { method: body ? 'POST' : 'GET', cache: 'no-store', headers: { Authorization: `Bearer ${data.session.access_token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (response.ok && /application\/(xml|pdf)/.test(response.headers.get('content-type') || '')) return response.blob();
  const result = await response.json();
  if (!response.ok && !result.emission) throw new Error(result.error || 'Não foi possível carregar a integração.');
  return result;
}

export default function NfsePage() {
  const { user } = useAuth();
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [certificateInputKey, setCertificateInputKey] = useState(0);
  const [municipality, setMunicipality] = useState('5105622');
  const [connection, setConnection] = useState<{ connected: boolean; message: string } | null>(null);
  const [name, setName] = useState('QI Plus');
  const [file, setFile] = useState<File | null>(null);
  const [templateId, setTemplateId] = useState('');
  const [competence, setCompetence] = useState(() => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Cuiaba', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
    return `${parts.find(p => p.type === 'year')!.value}-${parts.find(p => p.type === 'month')!.value}`;
  });
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const load = useCallback(async () => { setState(await api()); }, []);
  useEffect(() => {
    if (!user) return;
    load().catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [user, load]);
  const template = state?.templates.find(item => item.id === templateId);
  useEffect(() => {
    setAmount(template?.amount || ''); setDescription(template?.description || ''); setConfirmed(false);
  }, [template?.id, template?.amount, template?.description]);
  const attempt = state?.emissions.find(item => item.templateId === templateId && item.competence.slice(0, 7) === competence);
  async function run(action: () => Promise<void>) {
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (err) { setError(err instanceof Error ? err.message : 'Falha ao processar a operação.'); }
    finally { await load().catch(err => setError(err.message)); setBusy(false); }
  }
  async function configureCertificate(event: FormEvent) {
    event.preventDefault();
    if (!certificateFile) return;
    if (certificateFile.size > 128_000) { setError('Selecione um certificado de até 125 KB.'); return; }
    const passphrase = certificatePassword;
    setCertificatePassword(''); setConnection(null);
    await run(async () => {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('Não foi possível ler o certificado selecionado.'));
        reader.readAsDataURL(certificateFile);
      });
      const result = await api({ action: 'configure', pfxBase64: base64, passphrase, municipality });
      setConnection(result);
      if (result.saved) { setCertificateFile(null); setCertificateInputKey(key => key + 1); }
    });
  }
  async function importXml(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    if (file.size > 512_000) { setError('Selecione um XML de até 500 KB.'); return; }
    await run(async () => {
      const result = await api({ action: 'import', name, xml: await file.text() });
      setTemplateId(result.template.id); setFile(null); setMessage('Modelo importado. Confira os dados antes de emitir.');
    });
  }
  async function emit(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      const result = await api({ action: 'emit', templateId, competence: `${competence}-01`, amount, description });
      setMessage(statusNames[result.emission.status] || 'Tentativa registrada. Consulte o histórico.');
      setConfirmed(false);
    });
  }
  return (
    <div className="mx-auto max-w-5xl space-y-8 [color-scheme:dark]">
      <PageHeader title="NFS-e Nacional" description="Reutilize os dados de uma nota para preparar a próxima emissão." backHref="/dashboard/integrations" backLabel="Integrações" />
      <div className="flex items-start gap-3 rounded-2xl border border-warning/35 bg-warning/10 p-4 text-warning-foreground">
        <FlaskConical className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <StatusBadge tone="warning">Homologação</StatusBadge>
          <p className="mt-2 text-sm leading-6">As notas geradas aqui são de teste e não substituem a emissão fiscal em produção.</p>
        </div>
      </div>
      {loading && <p role="status">Carregando integração…</p>}
      {error && <p role="alert" className="rounded-md border border-red-700 bg-red-950 p-4 text-red-100">{error}</p>}
      {message && <p role="status" className="text-indigo-200">{message}</p>}
      {!loading && !state && <Button variant="outline" className="border-gray-600 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-white" onClick={() => { setLoading(true); load().then(() => setError('')).catch(err => setError(err.message)).finally(() => setLoading(false)); }}>Tentar carregar novamente</Button>}
      {state && <>
        <section aria-labelledby="certificate-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="certificate-title" className="text-lg font-semibold">Certificado digital</h2>
          <p className="mt-2 text-gray-300">{state.certificate.message}</p>
          <p className="mt-2 text-sm text-gray-400">Selecione um certificado A1. O arquivo e a senha serão guardados criptografados no servidor. A senha nunca será exibida após salvar.</p>
          <form onSubmit={configureCertificate} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="certificate-file">Certificado (.p12 ou .pfx)</Label><Input key={certificateInputKey} id="certificate-file" type="file" accept=".p12,.pfx" required disabled={busy} className="file:mr-3 file:rounded file:border-0 file:bg-gray-700 file:px-2 file:text-gray-100" onChange={e => { setCertificateFile(e.target.files?.[0] || null); setConnection(null); }} /></div>
              <div className="space-y-2"><Label htmlFor="certificate-password">Senha do certificado</Label><Input id="certificate-password" type="password" autoComplete="new-password" maxLength={1024} disabled={busy} value={certificatePassword} onChange={e => setCertificatePassword(e.target.value)} aria-describedby="certificate-password-help" /><p id="certificate-password-help" className="text-sm text-gray-400">Use a senha definida ao exportar o certificado.</p></div>
            </div>
            <div className="max-w-sm space-y-2"><Label htmlFor="municipality">Código IBGE do município da empresa</Label><Input id="municipality" required pattern="[0-9]{7}" maxLength={7} inputMode="numeric" disabled={busy} value={municipality} onChange={e => { setMunicipality(e.target.value); setConnection(null); }} aria-describedby="municipality-help" /><p id="municipality-help" className="text-sm text-gray-400">Mirassol D’Oeste: 5105622.</p></div>
            <div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy || !certificateFile} className="bg-indigo-600 text-white hover:bg-indigo-500">{busy ? 'Aguarde…' : 'Salvar e testar conexão'}</Button><Button type="button" variant="outline" className="border-gray-600 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-white" disabled={busy || !state.certificate.ready || !/^\d{7}$/.test(municipality)} onClick={() => { setConnection(null); run(async () => { setConnection(await api({ action: 'test_connection', municipality })); }); }}>Testar certificado salvo</Button></div>
            <p className="text-sm text-gray-400">O teste consulta a SEFIN de homologação. Nenhuma nota será emitida.</p>
            {connection && <p role="status" className={connection.connected ? 'text-green-300' : 'text-amber-200'}>{connection.message}</p>}
          </form>
        </section>
        <section aria-labelledby="import-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="import-title" className="text-xl font-semibold">Importar nota como modelo</h2>
          <p className="mt-2 text-gray-300">Escolha o XML de uma nota já emitida. Cliente, serviço e tributação serão reaproveitados.</p>
          <form onSubmit={importXml} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="model-name">Nome do modelo</Label><Input id="model-name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="source-xml">XML da nota</Label><Input id="source-xml" className="file:mr-3 file:rounded file:border-0 file:bg-gray-700 file:px-2 file:text-gray-100" type="file" accept=".xml,application/xml,text/xml" required onChange={e => setFile(e.target.files?.[0] || null)} /></div>
            <div><Button type="submit" variant="outline" className="border-gray-600 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-white" disabled={busy || !file}>{busy ? 'Aguarde…' : 'Importar modelo'}</Button></div>
          </form>
        </section>
        <section aria-labelledby="emit-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="emit-title" className="text-xl font-semibold">Preparar nota de teste</h2>
          {!state.templates.length ? <p className="mt-3 text-gray-300">Importe uma nota acima para começar.</p> : <form onSubmit={emit} className="mt-4 space-y-5">
            <div className="space-y-2"><Label htmlFor="template">Modelo</Label><select id="template" required value={templateId} onChange={e => setTemplateId(e.target.value)} className="w-full rounded-md border border-gray-600 bg-gray-900 p-3 focus-visible:outline-2 focus-visible:outline-indigo-400"><option value="">Selecione um modelo</option>{state.templates.map(t => <option key={t.id} value={t.id}>{t.name} — {t.customer}</option>)}</select></div>
            {template && <>
              <dl className="grid gap-3 rounded-md bg-gray-800 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-gray-400">Cliente</dt><dd className="mt-1">{template.customer} · {template.customerDocument}</dd></div>
                <div><dt className="text-gray-400">Prestador</dt><dd className="mt-1">CNPJ {template.provider}</dd></div>
                <div><dt className="text-gray-400">Código do serviço</dt><dd className="mt-1">{template.serviceCode}</dd></div>
                <div><dt className="text-gray-400">Município emissor · código IBGE</dt><dd className="mt-1">{template.municipality}</dd></div>
              </dl>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="competence">Mês de competência</Label><Input id="competence" type="month" required value={competence} onChange={e => { setCompetence(e.target.value); setConfirmed(false); }} /></div>
                <div className="space-y-2"><Label htmlFor="amount">Valor do serviço (R$)</Label><Input id="amount" type="number" step="0.01" min="0.01" required value={amount} onChange={e => { setAmount(e.target.value); setConfirmed(false); }} onBlur={() => { if (amount && Number.isFinite(Number(amount))) setAmount(Number(amount).toFixed(2)); }} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Descrição do serviço</Label><Textarea id="description" required maxLength={2000} rows={4} value={description} onChange={e => { setDescription(e.target.value); setConfirmed(false); }} /></div>
              <label className="flex items-start gap-3 text-sm text-gray-300"><input className="mt-1 h-4 w-4 accent-indigo-500" type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Conferi cliente, competência, valor e descrição. A tributação será a mesma do XML importado.</label>
              {attempt && <div className="space-y-2 text-amber-200">
                <p>Última tentativa para este mês: {statusNames[attempt.status]}. {attempt.status === 'rejected' ? 'Confira o motivo abaixo e use “Reenviar correção em homologação” após corrigir os dados.' : attempt.status === 'prepared' ? 'Confira os dados para retomar esta mesma tentativa.' : 'Consulte o histórico antes de continuar.'}</p>
                {attempt.response?.erros?.map((issue, index) => <p key={index} className="text-sm">Última rejeição — {issue.Codigo}: {issue.Descricao} {issue.Complemento}</p>)}
              </div>}
              <Button type="submit" disabled={busy || !confirmed || !state.certificate.ready || (!!attempt && !['prepared', 'rejected'].includes(attempt.status))} className="bg-indigo-600 text-white hover:bg-indigo-500">{busy ? 'Processando…' : attempt?.status === 'rejected' ? 'Reenviar correção em homologação' : 'Emitir em homologação'}</Button>
            </>}
          </form>}
        </section>
        <section aria-labelledby="history-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="history-title" className="text-xl font-semibold">Histórico de testes</h2><Button variant="outline" className="border-gray-600 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-white" disabled={busy} onClick={() => run(async () => { await load(); })}>Atualizar histórico</Button></div>
          {!state.emissions.length && <p className="mt-4 text-gray-300">Nenhuma tentativa de emissão por aqui ainda.</p>}
          <ul className="mt-4 divide-y divide-gray-700">
            {state.emissions.map(item => <li key={item.id} className="py-5 space-y-2">
              <div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{state.templates.find(t => t.id === item.templateId)?.name || 'Nota'} · {item.competence.slice(0, 7)} · {money(item.amount)}</p><span className={item.status === 'authorized' ? 'text-green-300' : 'text-amber-200'}>{statusNames[item.status] || item.status}</span></div>
              {item.accessKey && <><p className="break-all text-sm text-gray-300">Chave de acesso: {item.accessKey}</p><div className="flex flex-wrap gap-3">
                {(['pdf', 'xml'] as const).map(format => <Button key={format} variant="outline" className="border-gray-600 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-white" disabled={busy || !state.certificate.ready} onClick={() => run(async () => {
                  const blob = await api({ action: 'download', emissionId: item.id, format });
                  const url = URL.createObjectURL(blob); const link = document.createElement('a');
                  link.href = url; link.download = `${format === 'pdf' ? 'danfse' : 'nfse'}-homologacao-${item.id}.${format}`; link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                })}>{format === 'pdf' ? 'Baixar DANFSe (PDF)' : 'Baixar XML da nota'}</Button>)}
              </div></>}
              {item.response?.erros?.map((issue, index) => <p key={index} className="text-sm text-red-200">{issue.Codigo}: {issue.Descricao} {issue.Complemento}</p>)}
              {!['authorized', 'rejected'].includes(item.status) && <Button variant="outline" className="border-gray-600 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-white" disabled={busy || !state.certificate.ready} onClick={() => run(async () => { await api({ action: 'consult', emissionId: item.id }); setMessage('Resultado consultado. Nenhuma nova nota foi enviada.'); })}>Consultar resultado</Button>}
            </li>)}
          </ul>
        </section>
      </>}
    </div>
  );
}
