# imobWeb - CRM Imobiliário SaaS

## Descrição

imobWeb é um CRM imobiliário SaaS completo com integrações avançadas para corretoras e imobiliárias. O sistema permite cadastrar imóveis de forma inteligente com IA, publicar em múltiplos portais e gerenciar conversas com proprietários via WhatsApp Business Cloud API.

## Funcionalidades Principais

- **Cadastro Inteligente**: IA preenche automaticamente informações com base em voz, texto ou fotos
- **Publicação Automática**: Publica em portais como OLX, Zap Imóveis, Viva Real e +100 portais via XML VRSync
- **WhatsApp Proativo**: Dispara mensagens automáticas para proprietários sobre atualização de preço e fotos
- **Sincronização em Tempo Real**: Atualiza dados em todos os portais em menos de 5 minutos
- **Dashboard de Análise**: Métricas em tempo real sobre leads, conversões e ROI
- **Multi-Tenant**: Suporte a múltiplas imobiliárias com RBAC completo

## Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Supabase/Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **AI**: OpenAI GPT-4o
- **WhatsApp**: Cloud API Meta
- **Deploy**: Vercel

## Instalação e Configuração

### Pré-requisitos

1. **Node.js 20 ou superior**
2. **Git**
3. **PostgreSQL** (com Supabase ou Neon)

### Passos de Instalação

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/seu-usuario/imobWeb.git
   cd imobWeb
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**
   Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...

   # OpenAI
   NEXT_PUBLIC_OPENAI_API_KEY=...

   # WhatsApp
   WHATSAPP_VERIFY_TOKEN=...
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_ACCESS_TOKEN=...

   # Stripe
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...

   # Redis
   UPSTASH_REDIS_URL=...
   UPSTASH_REDIS_TOKEN=...

   # Vercel
   VERCEL_API_TOKEN=...
   ```

4. **Configurar Supabase**
   - Crie um banco de dados no Supabase
   - Ative Row Level Security (RLS) para multi-tenant
   - Importe o schema Prisma (`prisma/schema.prisma`)

5. **Configurar Prisma**
   ```bash
   npx prisma db push
   ```

6. **Iniciar o servidor**
   ```bash
   npm run dev
   ```

## Deploy no Vercel

### Pré-requisitos

- Conta Vercel
- Conta Supabase
- Conta OpenAI
- Conta WhatsApp Business API
- Conta Stripe

### Passos de Deploy

1. **Configurar Vercel**
   - Crie um novo projeto no Vercel
   - Adicione o repositório do projeto
   - Configure as variáveis de ambiente (ver `.env.local.example`)

2. **Configurar Supabase**
   - Ative o plano de servidorless no Supabase
   - Configure o RLS para multi-tenant

3. **Configurar OpenAI**
   - Crie uma chave de API no OpenAI
   - Configure no arquivo `.env.local`

4. **Configurar WhatsApp**
   - Crie um número de telefone no WhatsApp Business API
   - Configure o webhook no Vercel

5. **Configurar Stripe**
   - Crie um plano no Stripe
   - Configure as rotas de checkout e assinaturas

6. **Testar**
   - Acesse o link do projeto no Vercel
   - Teste o login, cadastro de imóvel e integração com WhatsApp

## Configuração de Portais

O sistema suporta publicação em:
- OLX (Zap Imóveis, Viva Real)
- +100 portais via XML VRSync (ImovelWeb, Chaves na Mão, etc.)

Para configurar os portais:
1. Acesse `/integrations/portals`
2. Adicione as configurações de cada portal
3. Ative o pacote de anúncio correspondente

## Documentação

- [API Reference](https://seu-domínio.com/api/docs)
- [User Guide](https://seu-domínio.com/docs/user-guide)
- [Deployment Guide](https://seu-domínio.com/docs/deployment)

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/SeuNome`)
3. Faça as alterações
4. Faça commit (`git commit -m 'Adiciona nova funcionalidade'`)
5. Envie um push para a branch (`git push origin feature/SeuNome`)
6. Abra um Pull Request

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo `LICENSE` para mais detalhes.
