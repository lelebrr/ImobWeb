# imobWeb - CRM Imobiliário Completo

> 🚀 Plataforma SaaS de CRM imobiliário com IA avançada, PWA, Notificações Smart e Segurança Enterprise.

## Visão Geral

O **imobWeb** é um sistema de CRM imobiliário moderno construído com Next.js 16, desenvolvido por 4 IAs especializadas trabalhando em conjunto. O projeto combina o melhor da arquitetura moderna com funcionalidades avançadas de IA e segurança enterprise.

### Tecnologias do Stack

| Categoria | Tecnologias |
|-----------|-------------|
| **Framework** | Next.js 16 App Router |
| **Linguagem** | TypeScript (strict mode) |
| **Estilização** | Tailwind CSS v4 + shadcn/ui |
| **Database** | Prisma ORM + PostgreSQL (Supabase) |
| **Auth** | Auth.js v5 + Supabase Auth |
| **IA** | Vercel AI SDK + OpenAI |
| **Pagamentos** | Stripe |
| **Analytics** | PostHog |
| **Messaging** | WhatsApp Cloud API |
| **Testing** | Vitest + Playwright |
| **PWA** | Service Worker + Web App Manifest |

## Estrutura do Projeto

```
imobWeb/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Área administrativa
│   ├── (ai)/              # APIs de IA avançada
│   ├── (branding)/        # White Label
│   ├── (dashboard)/       # Dashboard principal
│   ├── (marketing)/        # Landing pages
│   ├── (onboarding)/       # Fluxo de onboarding
│   ├── (settings)/         # Configurações
│   ├── api/               # API Routes
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── admin/             # Componentes Admin
│   ├── ai/                # Componentes de IA
│   ├── branding/          # White Label
│   ├── design-system/     # Design System
│   ├── help/              # Help Center
│   ├── marketing/         # Componentes Marketing
│   ├── notifications/    # Notificações
│   └── pwa/               # PWA Components
├── lib/                   # Libraries
│   ├── ai/                # Lógica de IA
│   ├── analytics/         # PostHog
│   ├── billing/           # Stripe
│   ├── design-system/     # Design System
│   ├── export/            # Exportação
│   ├── feature-flags/     # Feature Flags
│   ├── help/              # Help Center
│   ├── monitoring/        # Monitoring
│   ├── notifications/     # Notificações
│   ├── pwa/               # PWA
│   ├── public-api/        # Public API
│   ├── rbac/              # Permissões
│   └── security/          # Segurança
├── prisma/                # Schema do banco
├── public/                # Arquivos públicos
├── tests/                 # Testes
├── docs/                  # Documentação
└── i18n/                  # Internacionalização
```

## Funcionalidades Principais

### 🤖 Inteligência Artificial (IA 3)
- **Sugestão de Preço**: Algoritmo inteligente que considera localização, tipo, área, quartos, banheiros, vagas, idade e características especiais
- **Geração de Descrições**: Cria descrições em 3 formatos (curto, médio, completo) com múltiplos tons
- **Chat Inteligente**: Chatbot para corretores e proprietários com detecção de intenção

### 📱 PWA Offline (IA 3)
- Instalável em dispositivos móveis
- Cache offline para imóveis e leads
- Indicador de status online/offline
- Atalhos na tela inicial

### 🔔 Sistema de Notificações (IA 3)
- Notificações in-app em tempo real
- Web Push Notifications
- Tipos variados: leads, imóveis, visitas, relatórios
- Preferências personalizáveis por usuário

### 🎨 Design System (IA 4)
- Componentes baseados em shadcn/ui
- Sistema de temas White Label
- Suporte completo a dark mode
- Tokens de design padronizados

### 🛡️ Segurança Enterprise (IA 4)
- Rate limiting
- Content Security Policy
- LGPD compliance
- Auditoria de ações
- Criptografia de dados sensíveis

### 💳 Billing (IA 2)
- Integração com Stripe
- Assinaturas recorrentes
- Múltiplos planos (Básico, Destaque, Premium)
- Webhooks para processamento

### 📊 Dashboard & CRM (IA 1)
- Gestão completa de imóveis (+80 campos)
- Gestão de leads e conversas
- Integração com WhatsApp
- Publicação em portais (Zap, Vivareal, OLX)

## Como Rodar em Desenvolvimento

### Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- PostgreSQL (via Supabase)
- Stripe Account (para pagamentos)
- WhatsApp Cloud API (para mensagens)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-repo/imobweb.git
cd imobweb

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJETO].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[CHAVE-ANON]"
SUPABASE_SERVICE_ROLE_KEY="[CHAVE-SERVICE]"

# Auth.js
NEXTAUTH_SECRET="[GERE-UMA-CHAVE-SECRETA]"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI (para IA avançada)
OPENAI_API_KEY="sk-..."

# PostHog
NEXT_PUBLIC_POSTHOG_KEY="[CHAVE]"
NEXT_PUBLIC_POSTHOG_HOST="[URL]"

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID="[ID]"
WHATSAPP_ACCESS_TOKEN="[TOKEN]"
```

### Comandos

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm run start

# Testes
npm run test           # Unit tests
npm run test:e2e       # E2E tests

# Database
npm run db:generate    # Gerar Prisma Client
npm run db:push        # Push schema para banco
npm run db:studio      # Abrir Prisma Studio

# Linting
npm run lint
npm run type-check
```

## Configuração de Integrações

### Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Obtenha as credenciais em Settings → API
3. Configure as variáveis de ambiente
4. Execute `npm run db:push`

### Stripe

1. Crie uma conta em [stripe.com](https://stripe.com)
2. Crie produtos/planos no Dashboard
3. Configure os webhooks
4. Adicione as chaves às variáveis de ambiente

### WhatsApp Cloud API

1. Crie um app no Meta Developer
2. Adicione o produto WhatsApp
3. Configure o webhook
4. Obtenha o Access Token

### Vercel Deploy

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Ou conecte o repositório no Vercel Dashboard
```

## APIs Disponíveis

### IA Avançada

```bash
# Sugestão de Preço
POST /api/ai/suggest-price

# Geração de Descrição
POST /api/ai/generate-description

# Chat com Proprietário
POST /api/ai/chat-with-owner
```

### Notificações

```bash
GET  /api/notifications?userId=123
POST /api/notifications
PATCH /api/notifications/[id]?userId=123&action=markRead
DELETE /api/notifications/[id]?userId=123
```

### Billing (Stripe)

```bash
POST /api/billing/checkout
POST /api/billing/manage-subscription
POST /api/webhooks/stripe
```

## Testes de Validação

### Login e Onboarding
1. Acesse `http://localhost:3000`
2. Complete o fluxo de cadastro
3. Verifique o dashboard

### Cadastro de Imóvel com IA
1. Vá para `/properties/new`
2. Preencha os dados básicos
3. Use "Sugerir Preço" para ver a IA em ação
4. Use "Gerar Descrição" para criar um anúncio

### Fluxo WhatsApp
1. Configure as credenciais do WhatsApp
2. Envie uma mensagem de teste
3. Verifique a resposta automática

### Troca de Tema/Branding
1. Vá para `/branding`
2. Altere cores e logo
3. Verifique a aplicação em tempo real

### Guided Tour
1. Acesse `/help`
2. Inicie o tour guiado
3. Navegue pelas funcionalidades

## Contributing

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

MIT License - lihat o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ por 4 IAs especializadas**

- IA 1: Core CRM (Dashboard, Properties, Leads, WhatsApp)
- IA 2: Admin, Marketing, Onboarding, Billing/Stripe
- IA 3: IA Avançada, PWA, Notificações, Testes, Docs
- IA 4: Design System, White Label, Security, DevOps

---

Para mais informações, consulte:
- [Setup Guide](./docs/SETUP.md)
- [API Documentation](./docs/API.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Merge Guide](./docs/MERGE_GUIDE.md)