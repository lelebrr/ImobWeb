# Guia de Merge - imobWeb

Este documento explica como mesclar os três projetos das IAs em um único projeto coeso.

## Visão Geral

O imobWeb foi desenvolvido por 3 IAs trabalhando em paralelo:

| IA | Responsabilidade |
|----|------------------|
| **IA 1** | Dashboard, Imóveis, Leads, CRUD completo |
| **IA 2** | Autenticação, Billing, RBAC, Analytics |
| **IA 3 (você)** | IA Avançada, Notificações, PWA, Testes, Docs |

## Estrutura Final

```
imobWeb/
├── app/
│   ├── (dashboard)/        # IA 1 - Dashboard principal
│   ├── (admin)/           # IA 2 - Admin
│   ├── (marketing)/       # IA 1 - Marketing
│   ├── (onboarding)/      # IA 1 - Onboarding
│   ├── (ai)/              # IA 3 - IA Avançada
│   │   ├── suggest-price/
│   │   ├── generate-description/
│   │   └── chat-with-owner/
│   ├── api/
│   │   ├── notifications/ # IA 3 - Notificações
│   │   ├── emails/        # IA 3 - Emails
│   │   └── pwa/           # IA 3 - PWA
│   ├── manifest.json     # IA 3 - PWA
│   └── sw.ts            # IA 3 - Service Worker
├── components/
│   ├── dashboard/        # IA 1
│   ├── admin/           # IA 2
│   ├── marketing/        # IA 1
│   ├── onboarding/       # IA 1
│   ├── ai/               # IA 3
│   ├── notifications/    # IA 3
│   └── pwa/              # IA 3
├── lib/
│   ├── ai/              # IA 3
│   ├── notifications/    # IA 3
│   ├── pwa/             # IA 3
│   ├── export/          # IA 3
│   ├── billing/         # IA 2
│   ├── analytics/       # IA 2
│   ├── onboarding/      # IA 1
│   └── rbac/            # IA 2
├── prisma/
│   └── schema.prisma    # Compartilhado
├── tests/               # IA 3
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/                # IA 3
    ├── README.md
    ├── SETUP.md
    ├── API.md
    └── USER_GUIDE.md
```

##passo a passo de Merge

###passo 1: Preparar o Repositório

```bash
# Clone o repositório principal
git clone https://github.com/seu-repo/imobweb.git
cd imobweb

# Adicione os remote das outras IAs
git remote add ia1 https://github.com/ia1/imobweb.git
git remote add ia2 https://github.com/ia2/imobweb.git

# Busca todos os branches
git fetch --all
```

###passo 2: Mergiar IA 3 (Este Projeto)

Copie os arquivos da IA 3:

```bash
# Copiar estrutura de pasta (use cp -r no Linux/Mac ou xcopy no Windows)
cp -r text/imobweb/app/(ai) app/
cp -r text/imobweb/app/api/notifications app/api/
cp -r text/imobweb/app/api/emails app/api/
cp -r text/imobweb/app/manifest.json app/
cp -r text/imobweb/sw.ts app/  # ou crie link

# Components
cp -r text/imobweb/components/ai components/
cp -r text/imobweb/components/notifications components/
cp -r text/imobweb/components/pwa components/

# Lib
cp -r text/imobweb/lib/ai lib/
cp -r text/imobweb/lib/notifications lib/
cp -r text/imobweb/lib/pwa lib/
cp -r text/imobweb/lib/export lib/

# Tests
cp -r text/imobweb/tests .

# Docs
cp -r text/imobweb/docs .
```

###passo 3: Resolver Conflitos

可能的冲突：

1. **package.json**: Merge dependências
2. **next.config.mjs**: Combinar configurações
3. **tsconfig.json**: Unificar paths
4. **Prisma schema**: Manter schema existente

#### Resolve package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    // Combine todas as dependências
    // Remova duplicatas
    // Mantenha versões compatíveis
  },
  "devDependencies": {
    // Combine dependências de desenvolvimento
  }
}
```

#### Resolve next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações da IA 1
  images: {
    domains: ['supabase.co'],
  },
  // Configurações da IA 3 - PWA
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```

###passo 4: Configurar Ambiente

```bash
# Criar arquivo .env.local
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Stripe (se necessário)
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# OpenAI (para IA avançada)
OPENAI_API_KEY="sk-..."

# PostHog
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="..."
EOF
```

###passo 5: Instalar Dependências

```bash
npm install

# Verificar se tudo está ok
npm run build
```

###passo 6: Verificar Funcionalidades

```bash
# Iniciar desenvolvimento
npm run dev

# Testar endpoints
curl http://localhost:3000/api/ai/suggest-price
curl http://localhost:3000/api/ai/generate-description  
curl http://localhost:3000/api/ai/chat-with-owner
curl http://localhost:3000/api/notifications?userId=test

# Verificar PWA
curl http://localhost:3000/manifest.json
```

###passo 7: Executar Testes

```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e
```

## Verificações de Integração

### Checklist de Funcionalidades

- [ ] Homepage carrega
- [ ] Login/Logout funciona
- [ ] Dashboard exibe dados
- [ ] CRUD de imóveis completo
- [ ] CRUD de leads completo
- [ ] IA sugere preços
- [ ] IA gera descrições
- [ ] Chat IA responde
- [ ] Notificações aparecem
- [ ] PWA instala
- [ ] Offline funciona
- [ ] ExportCSV funciona

### Checklist de Conflitos

- [ ] Sem conflitos em package.json
- [ ] Sem conflitos em next.config.mjs
- [ ] Sem conflitos em tsconfig.json
- [ ] Schema do banco continua válido
- [ ] Todas as rotas funcionando

## Configuração de CI/CD

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
```

## Deploy

### Vercel (Recomendado)

1. Conecte o repositório no Vercel
2. Configure variáveis de ambiente
3. Deploy automático em push

### Railway/Render

```bash
# Build
npm run build

# Start
npm run start
```

## Resolução de Problemas Comuns

### Erro: "Module not found"

```bash
# Limpar node_modules e reinstall
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Database connection failed"

```bash
# Verificar DATABASE_URL
# Executar migrations
npx prisma db push
```

### Erro: "PWA not installing"

```bash
# Verificar manifest.json
# Verificar service worker
# Usar HTTPS em produção
```

## Próximos Passos

1. **Configurar domínio personalizado**
2. **Configurar monitoring (Sentry)**
3. **Configurar backup automático**
4. **Configurar CI/CD completo**
5. **Implementar mais features de IA**

## Suporte

Para dúvidas sobre o merge:
- 📧 suporte@imobweb.com
- 📚 docs.imobweb.com/merge-guide
- 💬 Discord: discord.gg/imobweb

---

**Boa sorte com o merge!** 🚀