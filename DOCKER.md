# Guia de Implantação Docker com Portainer para Wender Tech Portfolio

Este guia explica como implantar a aplicação Wender Tech Portfolio usando Docker com Portainer.

## Pré-requisitos

- Portainer instalado e configurado no seu servidor
- Um nome de domínio apontando para o seu servidor (para implantação em produção)
- Certificado SSL (opcional, mas recomendado)

## Passos para Implantação com Portainer

### 1. Preparar o Repositório

Certifique-se de que seu repositório Git contém os seguintes arquivos:

- `Dockerfile`
- `docker-compose.yml`
- Todos os arquivos do projeto

### 2. Configurar o Stack no Portainer

1. Acesse o Portainer no seu navegador
2. Navegue até "Stacks" e clique em "Add stack"
3. Escolha "Git repository" como método de implantação
4. Insira a URL do seu repositório Git
5. Defina a referência (branch, tag ou commit)
6. Defina o caminho para o arquivo docker-compose.yml (geralmente "/docker-compose.yml")

### 3. Configurar Variáveis de Ambiente no Portainer

No Portainer, adicione as seguintes variáveis de ambiente:

```
# Configuração do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Conexão com o Banco de Dados (para Prisma)
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# Configuração da Aplicação
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Wender Tech
NEXT_PUBLIC_APP_DESCRIPTION=Portfolio e Gerenciamento de Projetos

# Configuração do NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Ambiente
NODE_ENV=production
NEXT_PUBLIC_PRODUCTION=true
```

### 4. Implantar o Stack

Depois de configurar as variáveis de ambiente, clique em "Deploy the stack" para iniciar a implantação.

O Portainer irá:

1. Clonar o repositório Git
2. Construir a imagem Docker usando o Dockerfile
3. Iniciar o contêiner com as variáveis de ambiente configuradas
4. Expor a porta configurada (3000 por padrão)

### 5. Configurar Proxy Reverso (Opcional)

Para expor sua aplicação com um domínio personalizado e SSL:

1. Configure um proxy reverso (Nginx, Traefik, etc.) no seu servidor
2. Aponte o proxy para o contêiner da aplicação na porta 3000
3. Configure o SSL usando Let's Encrypt ou outro provedor de certificados

### 6. Verificar a Implantação

1. No Portainer, verifique se o contêiner está em execução na seção "Containers"
2. Verifique os logs do contêiner para identificar possíveis erros
3. Acesse a aplicação através do navegador usando o IP do servidor e a porta exposta ou o domínio configurado

### 7. Atualizar a Aplicação

Para atualizar a aplicação:

1. Faça push das alterações para o repositório Git
2. No Portainer, vá para o stack da aplicação
3. Clique em "Pull and redeploy" para atualizar com as últimas alterações

## Manutenção no Portainer

### Visualizando Logs

No Portainer:

1. Vá para a seção "Containers"
2. Encontre o contêiner da sua aplicação
3. Clique no ícone de logs para visualizar os logs em tempo real

### Reiniciando o Contêiner

Se precisar reiniciar o contêiner:

1. Vá para a seção "Containers"
2. Encontre o contêiner da sua aplicação
3. Clique no ícone de restart

### Atualizando a Aplicação

Para atualizar a aplicação:

1. Faça push das alterações para o repositório Git
2. No Portainer, vá para o stack da aplicação
3. Clique em "Pull and redeploy" para atualizar com as últimas alterações

### Parando a Aplicação

Para parar a aplicação:

1. Vá para a seção "Stacks"
2. Encontre o stack da sua aplicação
3. Clique em "Stop" para parar todos os contêineres do stack

## Solução de Problemas

### Contêiner Não Inicia

Verifique os logs no Portainer para identificar erros:

1. Vá para a seção "Containers"
2. Encontre o contêiner da sua aplicação
3. Clique no ícone de logs para visualizar os logs

### Problemas com Variáveis de Ambiente

Se você vir erros relacionados ao Supabase ou outras variáveis de ambiente:

1. Verifique se todas as variáveis de ambiente necessárias estão configuradas no Portainer
2. Certifique-se de que os valores estão corretos (URLs, chaves, etc.)
3. Reinicie o contêiner após fazer alterações nas variáveis de ambiente

### Verificando Variáveis de Ambiente no Contêiner

Para verificar as variáveis de ambiente dentro do contêiner:

1. Vá para a seção "Containers" no Portainer
2. Clique no contêiner da aplicação
3. Vá para a aba "Console"
4. Execute o comando: `env | grep NEXT_PUBLIC`

### Problemas de Conexão com o Banco de Dados

1. Verifique se a variável `DATABASE_URL` está correta
2. Certifique-se de que o IP do servidor onde o contêiner está rodando está permitido no painel do Supabase
3. Verifique se o banco de dados está acessível a partir do servidor

## Considerações de Segurança

- Mantenha as variáveis de ambiente seguras no Portainer
- Atualize regularmente suas imagens Docker para obter patches de segurança
- Configure um firewall para restringir o acesso ao seu servidor
- Use HTTPS para todas as comunicações externas
- Considere usar secrets do Docker para informações sensíveis em vez de variáveis de ambiente
