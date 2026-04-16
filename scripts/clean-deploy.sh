#!/bin/bash

echo "🧹 Limpando cache para deploy na Vercel..."
echo "Removendo pastas de build anteriores..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf dist

echo "📦 Instalando dependências..."
npm install

echo "🏗️  Executando build..."
npm run build

echo "✅ Build concluído! Pronto para deploy na Vercel."
echo ""
echo "Para deploy, execute:"
echo "git add ."
echo "git commit -m 'Fix: Resolved build issues for Vercel deployment'"
echo "git push"