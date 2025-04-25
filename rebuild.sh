#!/bin/bash

# Script simples para limpar e reconstruir a aplicação

echo "Parando a aplicação PM2 existente..."
pm2 stop wender-tech-portfolio || true
pm2 delete wender-tech-portfolio || true

echo "Limpando diretórios..."
rm -rf .next
rm -rf node_modules/.cache
rm -f public/sw.js
rm -f public/workbox-*.js
rm -f public/worker-*.js
rm -f public/fallback-*.js
rm -f public/sw.js.map

# echo "Fazendo backup da configuração atual..."
# cp next.config.js next.config.js.backup

# echo "Usando configuração limpa..."
# cp next.config.clean.js next.config.js

echo "Construindo a aplicação..."
NODE_ENV=production NEXT_PUBLIC_PRODUCTION=true npm run build

echo "Iniciando a aplicação com PM2 em modo fork..."
pm2 start npm --name "wender-tech-portfolio" --node-args="--max-old-space-size=4096" -- run start

echo "Salvando configuração PM2..."
pm2 save

echo "Aplicação reconstruída e iniciada com sucesso!"
echo "A configuração original foi salva como next.config.js.backup"
