# NFS-e em homologação

Acesse **Integrações → NFS-e · Homologação** (`/dashboard/integrations/nfse`). Importe o XML de uma nota emitida para criar o modelo. A importação preserva os dados fiscais da DPS e remove a assinatura antiga; não verifica se a nota importada é autêntica. Revise cliente, competência, valor, descrição e tributação antes de transmitir.

Esta versão usa apenas `https://sefin.producaorestrita.nfse.gov.br/API/SefinNacional/`. Não existe opção de apontar para produção. A emissão é manual; o agendamento mensal será uma etapa posterior aos testes reais.

## Configurar o servidor

1. Configure no ambiente privado do servidor:

   ```dotenv
   NFSE_OWNER_USER_ID=uuid-do-seu-usuario-na-tabela-users
   NFSE_ENCRYPTION_KEY=chave-aleatoria-de-32-bytes-em-base64
   # Opcional, para hospedar em volume persistente:
   # NFSE_CERTIFICATE_STORE_DIR=/caminho/privado/nfse
   ```

   Gere a chave uma única vez com `node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))'` diretamente no servidor. Não compartilhe essa chave. Não use prefixo `NEXT_PUBLIC_`. Preserve-a nos backups junto com o armazenamento privado; trocá-la impede abrir certificados já salvos. Neste ambiente local a chave e o usuário já foram configurados em `.env.local` (ignorado pelo Git, permissão 600).
2. Acesse **NFS-e Nacional**, selecione seu certificado A1 `.p12`/`.pfx`, digite a senha e pressione **Salvar e testar conexão**. O botão consulta os parâmetros do município na SEFIN de homologação: não emite notas. Um certificado pode ser salvo corretamente mesmo com a SEFIN indisponível; a tela informa esses resultados separadamente e oferece **Testar certificado salvo**.
3. O certificado e a senha são criptografados juntos com AES-256-GCM, vinculados ao usuário. O arquivo criptografado fica em `private/nfse/` por padrão, com permissão 600, fora de `public/` e ignorado pelo Git. A senha não é devolvida pela API nem preenchida de volta na tela. Não há certificado ou senha em fixtures. Certificados A3/token não são suportados. Em Docker/PM2, mantenha o diretório privado e a chave em armazenamento persistente e restrito; hospedagem com disco efêmero exige esse volume antes de usar o upload.
4. As tabelas de homologação usam `prisma/migrations/20261030150000_nfse_homologation/migration.sql`. **Essa migração específica já foi aplicada ao banco configurado localmente em 30/10/2026**, criando apenas as duas tabelas e seus índices/chaves/RLS. O modelo QI Plus foi importado do XML fornecido, sem emitir nota. Não rode `prisma migrate deploy` indiscriminadamente: o repositório também contém migrações antigas/manuais.
5. Revise os dados do modelo e emita somente quando quiser testar uma nota. O botão de configuração/conexão nunca emite notas. Depois da autorização, **Baixar XML da nota** recupera o XML autorizado.

### Rodar localmente

Na pasta do projeto:

```sh
npm install
npm run prisma:generate
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Abra `http://localhost:3000/dashboard/integrations/nfse` e entre na sua conta. O comando equivalente usando Yarn é `yarn dev --hostname 127.0.0.1 --port 3000`. Use apenas um gerenciador para instalar dependências; o lockfile atualizado desta integração é `package-lock.json`.

A configuração antiga por `NFSE_CERTIFICATE_PATH` e `NFSE_CERTIFICATE_PASSWORD` permanece como compatibilidade até o primeiro upload pela tela. O certificado enviado pela tela tem prioridade. Não é necessário preencher essas variáveis para usar o novo formulário.

## Segurança contra duplicidade e falhas

Cada modelo admite uma reserva por mês de competência (dia 01). O número da DPS é próprio do banco e usa série 1; não reutiliza a série 70000 do Emissor Web. A reserva é persistida antes da transmissão e a transição para envio é atômica. Requisições concorrentes não transmitem duas vezes.

- `prepared`: não houve transmissão. A mesma reserva pode ser retomada.
- `sending` / `unknown`: pode ter ocorrido autorização. Use **Consultar resultado**; não há reenvio automático.
- `rejected`: a SEFIN retornou erros fiscais explícitos. Corrija o formulário ou atualize o modelo importando outro XML e reenvie a mesma reserva/número.
- `authorized`: confirmação da SEFIN em homologação, com chave armazenada.

A resposta e a DPS assinada ficam no banco para diagnóstico. Os dados são isolados por usuário nas rotas e as tabelas não têm acesso público via Supabase. A API é excluída do cache PWA. Usuários que já tenham um service worker antigo precisam atualizar/reabrir o app para receber a nova política.

Não altere o valor de modelos com descontos, deduções ou tributos fixos sem um XML atualizado: o sistema bloqueia essa combinação para não carregar valores incorretos. Percentuais fiscais são reaproveitados; confirme sua validade para a nova competência. Um modelo representa uma combinação prestador/cliente/código de serviço; contratos distintos com a mesma combinação ainda não são contemplados.

## Verificações

- `npm run test:nfse`: importação, validação, escaping XML, assinatura com certificado sintético, bloqueio de alteração de XML assinado, classificação de respostas e destino fixo.
- `npx tsc --noEmit --incremental false`: tipos.
- O teste de reserva em `tests/nfse/reservation.test.ts` só executa com `NFSE_TEST_DATABASE_URL` apontando explicitamente para um Postgres descartável em `127.0.0.1:55439/nfse_homologation_test`, com a senha de teste definida no próprio teste. Nunca use o banco real. Sem essa configuração ele é pulado.

A validação local de assinatura não prova aceitação pela SEFIN. O pacote XSD oficial de 09/02/2026 contém âncoras `^...$` no padrão da série DPS, incompatíveis com o validador XML Schema do libxml2: até o XML original autorizado falha nessa regra. Esse resultado deve ser distinguido de rejeição da SEFIN. É necessário testar com o certificado real e consultar as parametrizações/regras atuais do município. O conector gera DANFSe/PDF localmente para as notas de homologação. Cancelamento não está incluído nesta etapa.

## Fontes oficiais

- [Documentação de produção e leiautes](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual)
- [Endpoints de homologação e produção](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao)

## Homologação real — 30/10/2026

A consulta do convênio de Mirassol D’Oeste retornou HTTP 200 no ADN de homologação (`/parametrizacao/5105622/convenio`). A consulta municipal não pertence mais ao endpoint de emissão da SEFIN.

A mesma reserva/DPS inicialmente rejeitada foi corrigida e autorizada com HTTP 201 em produção restrita. Confirmados no banco: status autorizado, uma reserva por modelo/competência e XML autorizado disponível. Não houve emissão em produção.

Compatibilidades aplicadas: declaração XML UTF-8 explícita (E1229), campo `finNFSe=0` antes de `cLocEmi` conforme [XSD de homologação de 20/10/2026](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/producao-restrita) e `dhEmi` em UTC-03:00 preservando o mesmo instante (evita E0008). O XML derivado foi validado no XSD atual de homologação sem alterar o esquema oficial.

Testes de regressão cobrem esses campos, o endereço municipal correto e a preservação da assinatura após compactação UTF-8. A tela mostra o motivo da última rejeição ao selecionar um modelo.

## Download do DANFSe (PDF)

No histórico das notas autorizadas, **Baixar DANFSe (PDF)** gera um PDF A4 de uma página a partir do mesmo XML autorizado usado no download de XML. Inclui identificação, partes, serviço, valores, QR Code da consulta pública e aviso obrigatório **NFS-e SEM VALIDADE JURÍDICA**. Não transmite nem emite outra nota. O acesso continua restrito ao proprietário autenticado.

A API oficial de geração de PDF foi suspensa em 03/08/2026, conforme a [NT008 v1.02](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/nt-008-se-cgnfse-danfse-20260714-v1-02.pdf); por isso a geração ocorre no servidor, sem depender do endpoint desativado. Os campos não presentes no XML são indicados com traço. Este gerador atende às notas de homologação atuais da integração; a cobertura integral de operações com tributação IBS/CBS detalhada e eventos de cancelamento precisa ser ampliada antes de habilitar esses cenários.

Conferido visualmente com o XML autorizado da QI Plus e testado pelo botão no navegador autenticado: download PDF válido, uma página A4, valores e aviso de homologação presentes. `pdfkit` permanece externo ao bundle do servidor para disponibilizar suas fontes no Next.js.

Textos que excederem o espaço de um campo podem terminar em reticências, conforme a permissão de formatação da seção 2.1 da NT008; o DANFSe permanece em uma página. O conteúdo integral continua disponível no XML autorizado.
