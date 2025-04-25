# Guia de Implantação com PM2

Este guia explica como implantar a aplicação Wender Tech Portfolio usando PM2, uma alternativa ao Docker para gerenciamento de processos Node.js em produção.

## O que é PM2?

PM2 é um gerenciador de processos para aplicações Node.js com um balanceador de carga integrado. Ele permite que você mantenha aplicações online 24/7, recarregue-as sem tempo de inatividade e facilite tarefas comuns de administração do sistema.

## Pré-requisitos

- Node.js 18+ instalado no servidor
- NPM ou Yarn
- Acesso SSH ao servidor

## Instalação do PM2

Se você ainda não tem o PM2 instalado globalmente:

```bash
npm install -g pm2
```

## Implantação Automatizada

Fornecemos um script de implantação que automatiza todo o processo:

```bash
./deploy-pm2.sh
```

Este script irá:
1. Verificar se o PM2 está instalado
2. Verificar se as variáveis de ambiente necessárias estão definidas
3. Instalar dependências
4. Gerar o cliente Prisma
5. Construir a aplicação
6. Iniciar a aplicação com PM2
7. Configurar o PM2 para iniciar automaticamente na inicialização do sistema (opcional)

## Implantação Manual

Se preferir implantar manualmente, siga estas etapas:

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd portfolio
```

### 2. Configure as Variáveis de Ambiente

Defina as variáveis de ambiente necessárias:

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
export DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
export NEXT_PUBLIC_APP_URL=https://your-domain.com
export NEXT_PUBLIC_APP_NAME="Wender Tech"
export NEXT_PUBLIC_APP_DESCRIPTION="Portfolio e Gerenciamento de Projetos"
export NEXTAUTH_URL=https://your-domain.com
export NEXTAUTH_SECRET=your-nextauth-secret
```

Para tornar essas variáveis permanentes, adicione-as ao seu arquivo `~/.bashrc` ou `~/.profile`.

### 3. Instale as Dependências

```bash
npm ci
```

### 4. Gere o Cliente Prisma

```bash
npm run prisma:generate
```

### 5. Construa a Aplicação

```bash
npm run build:production:clean
```

### 6. Inicie a Aplicação com PM2

Usando o script NPM:

```bash
npm run start:pm2:production
```

Ou diretamente com o arquivo de configuração do PM2:

```bash
pm2 start ecosystem.config.js
```

### 7. Configure o PM2 para Iniciar na Inicialização do Sistema

```bash
pm2 startup
pm2 save
```

Siga as instruções exibidas pelo comando `pm2 startup` para configurar a inicialização automática.

## Comandos Úteis do PM2

### Verificar Status

```bash
pm2 status
```

### Visualizar Logs

```bash
pm2 logs wender-tech-portfolio
```

### Reiniciar a Aplicação

```bash
npm run restart:pm2:production
```

Ou diretamente com o PM2:

```bash
pm2 restart wender-tech-portfolio
```

### Parar a Aplicação

```bash
pm2 stop wender-tech-portfolio
```

### Remover a Aplicação do PM2

```bash
pm2 delete wender-tech-portfolio
```

### Monitoramento em Tempo Real

```bash
pm2 monit
```

## Configuração do Nginx (Opcional)

Para expor sua aplicação com um domínio personalizado e SSL, configure o Nginx como proxy reverso:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Para configurar SSL com Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Solução de Problemas

### Aplicação Não Inicia

Verifique os logs para identificar o problema:

```bash
pm2 logs wender-tech-portfolio
```

### Problemas com Variáveis de Ambiente

Verifique se todas as variáveis de ambiente necessárias estão definidas:

```bash
pm2 env wender-tech-portfolio
```

### Problemas de Memória

Se a aplicação estiver consumindo muita memória, ajuste o limite no arquivo `ecosystem.config.js`:

```javascript
max_memory_restart: '2G' // Aumentar para 2GB
```

### Reinicialização Frequente

Se a aplicação estiver reiniciando com frequência, verifique os logs e ajuste as configurações de reinicialização no arquivo `ecosystem.config.js`:

```javascript
max_restarts: 5,
min_uptime: '1m'
```

## Considerações de Segurança

- Mantenha o Node.js e o PM2 atualizados
- Use HTTPS para todas as comunicações externas
- Configure um firewall para restringir o acesso ao seu servidor
- Não execute o PM2 como root; use um usuário com privilégios limitados
- Armazene variáveis de ambiente sensíveis de forma segura
