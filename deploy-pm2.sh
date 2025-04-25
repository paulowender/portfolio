#!/bin/bash

# Script para implantar a aplicação usando PM2

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
  echo "PM2 não está instalado. Instalando..."
  npm install -g pm2
fi

# Verificar se o diretório de logs existe
if [ ! -d "logs" ]; then
  echo "Criando diretório de logs..."
  mkdir -p logs
fi

# Verificar se as variáveis de ambiente necessárias estão definidas
echo "Verificando variáveis de ambiente..."
REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "DATABASE_URL"
)

MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    MISSING_VARS+=("$VAR")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "ERRO: As seguintes variáveis de ambiente obrigatórias não estão definidas:"
  for VAR in "${MISSING_VARS[@]}"; do
    echo "  - $VAR"
  done
  echo "Por favor, defina essas variáveis antes de continuar."
  echo "Exemplo:"
  echo "export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
  echo "export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
  echo "export DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
  exit 1
fi

# Instalar dependências
echo "Instalando dependências..."
npm ci

# Gerar o cliente Prisma
echo "Gerando cliente Prisma..."
npm run prisma:generate

# Construir a aplicação
echo "Construindo a aplicação..."
npm run build:production:clean

# Iniciar a aplicação com PM2
echo "Iniciando a aplicação com PM2..."
pm2 start ecosystem.config.js

# Salvar a configuração do PM2
echo "Salvando a configuração do PM2..."
pm2 save

# Gerar script de inicialização (opcional)
read -p "Deseja configurar o PM2 para iniciar automaticamente na inicialização do sistema? (y/n): " setup_startup
if [ "$setup_startup" = "y" ] || [ "$setup_startup" = "Y" ]; then
  echo "Configurando PM2 para iniciar automaticamente..."
  pm2 startup
  echo "Execute o comando acima com sudo para configurar a inicialização automática."
fi

echo "Implantação concluída!"
echo "Para verificar o status da aplicação: pm2 status"
echo "Para visualizar os logs: pm2 logs wender-tech-portfolio"
echo "Para reiniciar a aplicação: npm run restart:pm2:production"
echo "Para parar a aplicação: pm2 stop wender-tech-portfolio"
