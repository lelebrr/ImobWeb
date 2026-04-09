# ============================================
# GUIA COMPLETO DE MERGE - IMOBWEB
# ============================================
# 
# Este documento fornece todos os passos necessários
# para mesclar o trabalho das 4 IAs em um projeto funcional.
#
# ============================================

## ÍNDICE
1. [Pré-requisitos](#pré-requisitos)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Passo a Passo do Merge](#passo-a-passo-do-merge)
4. [Comandos de Configuração](#comandos-de-configuração)
5. [Verificação Final](#verificação-final)

---

## PRÉ-REQUISITOS

### Software Necessário
- Node.js 18.x ou superior
- npm 9.x ou superior
- Git
- PostgreSQL (Supabase ou local)

### Tecnologias Já Instaladas no Projeto
- Next.js 15.x
- TypeScript
- Tailwind CSS
- Prisma
- Supabase

---

## ESTRUTURA DE ARQUIVOS

### Arquivos do Projeto Principal (IA 1 + IA 2)
```
imobWeb/
├── app/
│   ├── (admin)/
│   ├── (marketing)/
│   ├── (onboarding)/
│   ├── api/
│   │   ├── billing/
│   │   └── webhooks/
│   └── middleware.ts
├── components/
│   ├── admin/
│   ├── marketing/
│   └── onboarding/
├── lib/
│   ├── billing/
│   ├── rbac/
│   └── analytics/
├── prisma/
│   └── schema.prisma
└── package.json (base)
```

### Arquivos da IA 3 (text/imobweb)
```
text/imobweb/
├── app/
│   ├── ai/                 # Sugestão preço, descrição, chat
│   └── api/
│       └── notifications/ # API de notificações
├── components/
│   ├── pwa/               # Install prompt, status indicator
│   └── notifications/
├── lib/
│   ├── ai/                # price-suggester, description-generator, chat-agent
│   ├── notifications/     # types, service
│   ├── pwa/               # storage (IndexedDB)
│   └── export/            # properties, leads
├── public/
│   ├── icons/             # Ícones PWA SVG
│   └── offline.html       # Página offline
├── manifest.json          # PWA Manifest
├── sw.ts                  # Service Worker
├── tests/
│   ├── unit/              # Testes unitários
│   └── e2e/               # Testes E2E
├── vitest.config.ts
├── playwright.config.ts
└── docs/                  # README, API, SETUP, USER_GUIDE, MERGE_GUIDE
```

### Arquivos da IA 4 (text/imobweb/...)
```
text/imobweb/
├── app/
│   ├── (settings)/        # Help, Feature Flags
│   ├── api/
│   │   ├── devops/        # Health check
│   │   ├── security/      # LGPD
│   │   └── public/        # Public API v1
├── components/
│   ├── branding/          # Branding provider, theme customizer
│   ├── design-system/     # Button, Card, Input, Table, etc.
│   ├── help/              # Chatbot, guided tour
├── lib/
│   ├── design-system/     # Tokens, theme utils
│   ├── feature-flags/     # Feature flags
│   ├── monitoring/        # Error boundary
│   ├── public-api/        # Router
│   ├── security/          # Audit, CSP, encryption, LGPD, rate-limit
│   └── help/              # MDX service
├── .github/
│   └── workflows/         # CI/CD pipelines
├── tailwind.config.ts     # Tokens do Design System
├── app/globals.css        # Estilos completos
├── next.config.mjs        # Headers, CSP, PWA
└── middleware.ts          # Rate limiting, security
```

---

## PASSO A PASSO DO MERGE

### ETAPA 1: PREPARAÇÃO

```powershell
# 1. Clone o repositório principal (se necessário)
git clone https://github.com/seu-repo/imobweb.git
cd imobweb

# 2. Verifique a estrutura atual
ls -la
```

### ETAPA 2: COPIAR ARQUIVOS DA IA 3

```powershell
# Copiar APIs de IA Avançada
Copy-Item -Path "text/imobweb\app\ai" -Destination "app\" -Recurse -Force

# Copiar API de Notificações
Copy-Item -Path "text/imobweb\app\api\notifications" -Destination "app\api\" -Recurse -Force

# Copiar Components PWA
Copy-Item -Path "text/imobweb\components\pwa" -Destination "components\" -Recurse -Force

# Copiar Components de Notificações (se houver)
Copy-Item -Path "text/imobweb\components\notifications" -Destination "components\" -Recurse -Force

# Copiar Libraries de IA
Copy-Item -Path "text/imobweb\lib\ai" -Destination "lib\" -Recurse -Force

# Copiar Libraries de Notificações
Copy-Item -Path "text/imobweb\lib\notifications" -Destination "lib\" -Recurse -Force

# Copiar Library PWA
Copy-Item -Path "text/imobweb\lib\pwa" -Destination "lib\" -Recurse -Force

# Copiar Library de Export
Copy-Item -Path "text/imobweb\lib\export" -Destination "lib\" -Recurse -Force

# Copiar Arquivos Públicos PWA
Copy-Item -Path "text/imobweb\manifest.json" -Destination "public\" -Force
Copy-Item -Path "text/imobweb\public\offline.html" -Destination "public\" -Force
Copy-Item -Path "text/imobweb\sw.ts" -Destination "public\sw.js" -Force
Copy-Item -Path "text/imobweb\public\icons" -Destination "public\" -Recurse -Force
```

### ETAPA 3: COPIAR ARQUIVOS DA IA 4

```powershell
# Copiar Settings (Help, Feature Flags)
Copy-Item -Path "text/imobweb\app\(settings)" -Destination "app\" -Recurse -Force

# Copiar APIs de DevOps e Security
Copy-Item -Path "text/imobweb\app\api\devops" -Destination "app\api\" -Recurse -Force
Copy-Item -Path "text/imobweb\app\api\security" -Destination "app\api\" -Recurse -Force
Copy-Item -Path "text/imobweb\app\api\public" -Destination "app\api\" -Recurse -Force

# Copiar Components de Branding
Copy-Item -Path "text/imobweb\components\branding" -Destination "components\" -Recurse -Force

# Copiar Components de Design System
Copy-Item -Path "text/imobweb\components\design-system" -Destination "components\" -Recurse -Force

# Copiar Components de Help
Copy-Item -Path "text/imobweb\components\help" -Destination "components\" -Recurse -Force

# Copiar Libraries de Design System
Copy-Item -Path "text/imobweb\lib\design-system" -Destination "lib\" -Recurse -Force

# Copiar Libraries de Feature Flags
Copy-Item -Path "text/imobweb\lib\feature-flags" -Destination "lib\" -Recurse -Force

# Copiar Libraries de Monitoring
Copy-Item -Path "text/imobweb\lib\monitoring" -Destination "lib\" -Recurse -Force

# Copiar Libraries de Security
Copy-Item -Path "text/imobweb\lib\security" -Destination "lib\" -Recurse -Force

# Copiar Libraries de Public API
Copy-Item -Path "text/imobweb\lib\public-api" -Destination "lib\" -Recurse -Force

# Copiar Libraries de Help
Copy-Item -Path "text/imobweb\lib\help" -Destination "lib\" -Recurse -Force
```

### ETAPA 4: COPIAR TESTES E DOCUMENTAÇÃO

```powershell
# Copiar Tests
Copy-Item -Path "text/imobweb\tests" -Destination "." -Recurse -Force

# Copiar Docs
Copy-Item -Path "text/imobweb\docs" -Destination "." -Recurse -Force

# Copiar i18n
Copy-Item -Path "text/imobweb\i18n" -Destination "." -Recurse -Force

# Copiar GitHub workflows
Copy-Item -Path "text/imobweb\.github" -Destination "." -Recurse -Force
```

### ETAPA 5: MESCLAR ARQUIVOS DE CONFIGURAÇÃO

```powershell
# Copiar tailwind.config.ts mesclado
Copy-Item -Path "merged\tailwind.config.ts" -Destination "." -Force

# Copiar next.config.mjs mesclado
Copy-Item -Path "merged\next.config.mjs" -Destination "." -Force

# Copiar globals.css mesclado
Copy-Item -Path "merged\app\globals.css" -Destination "app\" -Force
```

### ETAPA 6: ATUALIZAR PACKAGE.JSON

```powershell
# O package.json mesclado já está em merged/package.json
# Copie e substitua o existente
Copy-Item -Path "merged\package.json" -Destination "." -Force
```

---

## COMANDOS DE CONFIGURAÇÃO

### 1. Instalar Dependências

```bash
npm install
```

### 2. Gerar Prisma Client

```bash
npm run db:generate
# ou: npx prisma generate
```

### 3. Atualizar Banco de Dados

```bash
npm run db:push
# ou: npx prisma db push
```

### 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` com as variáveis necessárias:

```env
# Database
DATABASE_URL="postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJETO].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[CHAVE-ANON]"
SUPABASE_SERVICE_ROLE_KEY="[CHAVE-SERVICE]"

# Auth
NEXTAUTH_SECRET="[CHAVE-SECRETA-ALEATORIA]"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI (opcional)
OPENAI_API_KEY="sk-..."

# PostHog (opcional)
NEXT_PUBLIC_POSTHOG_KEY="[CHAVE]"
NEXT_PUBLIC_POSTHOG_HOST="[URL]"
```

### 5. Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 6. Rodar Testes (opcional)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## VERIFICAÇÃO FINAL

### Checklist de Funcionalidades

- [ ] Homepage carrega sem erros
- [ ] Login funciona (Auth.js + Supabase)
- [ ] Dashboard exibe dados
- [ ] CRUD de imóveis completo
- [ ] CRUD de leads completo
- [ ] IA sugere preços (teste: POST /api/ai/suggest-price)
- [ ] IA gera descrições (teste: POST /api/ai/generate-description)
- [ ] Chat IA responde (teste: POST /api/ai/chat-with-owner)
- [ ] Notificações funcionam (teste: GET /api/notifications?userId=test)
- [ ] PWA manifest carrega (teste: GET /manifest.json)
- [ ] Tema dark/light alterna
- [ ] Help Center funciona (/help)
- [ ] Feature Flags (/settings/feature-flags)

### Checklist de Arquivos

- [ ] package.json com todas dependências
- [ ] tailwind.config.ts com tokens do Design System
- [ ] next.config.mjs com headers de segurança
- [ ] globals.css com todos os estilos
- [ ] prisma/schema.prisma com todos os modelos
- [ ] middleware.ts com rate limiting
- [ ] todas as rotas de API funcionando

### Verificação de Erros Comuns

```bash
# Verificar se há erros de TypeScript
npm run type-check

# Verificar lint
npm run lint

# Verificar build
npm run build
```

---

## RESOLUÇÃO DE PROBLEMAS

### Erro: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Prisma schema not found"

```bash
npx prisma generate
```

### Erro: "Database connection failed"

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
npx prisma studio
```

### Erro: "PWA not installing"

```bash
# Verificar se manifest.json está sendo servido
curl http://localhost:3000/manifest.json

# Verificar service worker
chrome://serviceworkers
```

---

## PRÓXIMOS PASSOS

1. ✅ Completar merge
2. 🔄 Testar todas funcionalidades
3. ⏳ Configurar CI/CD
4. ⏳ Deploy em produção (Vercel)
5. ⏳ Configurar domínio personalizado

---

## SUPorte

Para dúvidas:
- Email: suporte@imobweb.com
- Docs: docs.imobweb.com
- Discord: discord.gg/imobweb

---

**Merge completo! 🚀**