# Guia de Configuração - imobWeb

Este guia detalhado ensina como configurar o ambiente de desenvolvimento do imobWeb, incluindo todas as integrações necessárias.

## Pré-requisitos

### Software Necessário

- **Node.js** 18.x ou superior
- **npm** 9.x ou superior (ou pnpm/yarn)
- **Git** 2.x
- **Supabase CLI** (opcional, para desenvolvimento local)
- **PostgreSQL** (via Supabase ou local)

### Tecnologias do Stack

- Next.js 16 (App Router)
- TypeScript 5.x (strict)
- Tailwind CSS v4
- shadcn/ui
- Prisma ORM
- Supabase (Auth + DB + Realtime)
- Auth.js v5
- Vercel AI SDK
- WhatsApp Cloud API
- Stripe (pagamentos)
- PostHog (analytics)

---

## passo 1: Clone e Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-repo/imobweb.git
cd imobweb

# Instale dependências
npm install

# ou se preferir pnpm
pnpm install
```

---

## passo 2: Configuração do Banco de Dados (Supabase)

### 2.1 Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name**: imobweb
   - **Database Password**: (guarde essa senha!)
   - **Region**: São Paulo (sgr-gru1)
4. Clique em "Create new project"

### 2.2 Obter Credenciais

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (NÃO exponha no frontend!)

### 2.3 Configurar Variáveis de Ambiente

Crie o arquivo `.env.local`:

```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[SEU-PROJETO].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[SUA-CHAVE-ANON]"
SUPABASE_SERVICE_ROLE_KEY="[SUA-CHAVE-SERVICE]"

# Auth.js
NEXTAUTH_SECRET="[GERE-UMA-CHAVE-SECRETA-ALEATORIA]"
NEXTAUTH_URL="http://localhost:3000"

# Opcional: OpenAI para recursos de IA avançados
OPENAI_API_KEY="sk-..."
```

### 2.4 Executar Migrações

```bash
npx prisma generate
npx prisma db push
```

---

## passo 3: Configuração de Autenticação (Auth.js)

### 3.1 Configurar Provedores

O imobWeb usa Auth.js v5 com múltiplos provedores. Configure em `lib/auth.ts`:

```typescript
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub,
    Google,
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Implementar lógica de login com Supabase
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

### 3.2 Configurar Supabase como Backend de Auth

Em `lib/auth/supabase-adapter.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Funções para gerenciar usuários no Supabase
export async function createUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}
```

---

## passo 4: Configuração do WhatsApp Cloud API

### 4.1 Configurar App no Meta Developer

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um novo app (tipo "Consumer")
3. Adicione o produto "WhatsApp"
4. Configure o Webhook

### 4.2 Obter Credenciais

1. No painel do WhatsApp Business API:
   - **Phone Number ID**: obtido no painel
   - **WhatsApp Business Account ID**: obtido no painel
   - **Access Token**: Token temporário (renovar regularmente)

### 4.3 Variáveis de Ambiente

```env
WHATSAPP_PHONE_NUMBER_ID="[SEU-PHONE-NUMBER-ID]"
WHATSAPP_BUSINESS_ACCOUNT_ID="[SEU-ACCOUNT-ID]"
WHATSAPP_ACCESS_TOKEN="[SEU-ACCESS-TOKEN]"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="[TOKEN-PARA-VERIFICACAO]"
```

### 4.4 Implementar Webhook

Crie a rota em `app/api/webhooks/whatsapp/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Invalid verification' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Processar mensagens recebidas
  // Implementar lógica de processamento aqui
  
  return NextResponse.json({ status: 'ok' });
}
```

---

## passo 5: Configuração de Pagamentos (Stripe)

### 5.1 Criar Conta Stripe

1. Acesse [stripe.com](https://stripe.com)
2. Complete o cadastro
3. Obtenha as chaves de API em **Developers** → **API Keys**

### 5.2 Variáveis de Ambiente

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 5.3 Configurar Produtos

Crie produtos no Stripe Dashboard:
- Plano Básico
- Plano Profissional
- Plano Enterprise

### 5.4 Implementar Checkout

```typescript
// app/api/billing/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { priceId, customerId } = await request.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing/cancel`,
    customer: customerId,
  });

  return Response.json({ url: session.url });
}
```

### 5.5 Webhook para Eventos

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json({ error: 'Webhook Error' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Ativar assinatura
      break;
    case 'customer.subscription.updated':
      // Atualizar status
      break;
    case 'customer.subscription.deleted':
      // Cancelar acesso
      break;
  }

  return Response.json({ received: true });
}
```

---

## passo 6: Configuração de Analytics (PostHog)

### 6.1 Criar Projeto PostHog

1. Acesse [posthog.com](https://posthog.com)
2. Crie um novo projeto
3. Obtenha a API key

### 6.2 Variáveis de Ambiente

```env
NEXT_PUBLIC_POSTHOG_KEY="[SUA-CHAVE]"
NEXT_PUBLIC_POSTHOG_HOST="[SUA-URL]"
```

### 6.3 Configurar Provider

Em `app/providers.tsx`:

```typescript
import { PostHogProvider } from '@/components/providers/posthog';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      {children}
    </PostHogProvider>
  );
}
```

---

## passo 7: Configuração de PWA

### 7.1 Manifesto

O `manifest.json` já está configurado em `text/imobweb/manifest.json`. Para usar em produção, copie para a raiz do projeto:

```bash
cp text/imobweb/manifest.json ./public/manifest.json
```

### 7.2 Service Worker

O service worker (`sw.ts`) está em `text/imobweb/sw.ts`. Configure no Next.js:

1. Copie o arquivo para `public/sw.js` ou use um plugin
2. Registre o service worker no componente raiz

### 7.3 Ícones

Coloque os ícones em `public/icons/`:
- `icon-192x192.svg`
- `icon-512x512.svg`

---

## passo 8: Configuração de IA

### 8.1 OpenAI (Opcional)

Para recursos avançados de IA com LLMs:

```env
OPENAI_API_KEY="sk-..."
```

### 8.2 Configuração de Agentes

Os agentes de IA estão em `lib/ai/`:
- `price-suggester.ts` - Sugestão de preços
- `description-generator.ts` - Geração de descrições
- `chat-agent.ts` - Chatbot

Para integrar com OpenAI/Vercel AI SDK, atualize as funções em `lib/ai/` para usar a API.

---

## passo 9: Executar o Projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

### Build de Produção

```bash
npm run build
npm run start
```

### Verificar Instalação

Após iniciar, verifique:
1. ✅ Página inicial carrega
2. ✅ Autenticação funciona
3. ✅ API de IA responde (teste em `/api/ai/suggest-price`)
4. ✅ PWA instalável (manifest carrega)
5. ✅ Notificações funcionam

---

## Troubleshooting

### Erro de Conexão com Supabase

```bash
# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL

# Testar conexão
npx prisma studio
```

### Erro de Autenticação

```bash
# Verificar NEXTAUTH_SECRET
# Deve ter pelo menos 32 caracteres
openssl rand -base64 32
```

### Problemas com PWA

```bash
# Limpar cache do navegador
# Verificar se manifest.json está sendo servido
curl http://localhost:3000/manifest.json

# Verificar service worker
chrome://serviceworkers
```

---

## Próximos Passos

1. Configurar CI/CD (GitHub Actions/Vercel)
2. Deploy em produção
3. Configurar domínio personalizado
4. Configurar monitoramento (Sentry)
5. Configurar backups do banco de dados

---

Para mais detalhes, consulte a [API Documentation](./API.md) e [User Guide](./USER_GUIDE.md).