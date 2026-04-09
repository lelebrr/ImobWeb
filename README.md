# imobWeb

**O CRM Imobiliário mais completo e inteligente do Brasil em 2026**

**Tagline:** Cadastro 1x. Publica em todos os portais. WhatsApp automático para proprietários. Nunca mais anúncio desatualizado.

imobWeb é um SaaS CRM imobiliário full-stack construído com Next.js 16, projetado para resolver o maior problema do mercado brasileiro: **cadastros desatualizados**. 

Com ele, o corretor cadastra o imóvel **uma única vez**, escolhe o pacote e o sistema publica automaticamente no Grupo OLX (Zap Imóveis, Viva Real, OLX) + +100 portais, enquanto dispara fluxos inteligentes de WhatsApp para os proprietários pedindo atualização de preço, fotos e status.

---

## ✨ Principais Diferenciais

- **Cadastro único + Publicação multi-plataforma** (melhor que Tecimob, ImobTotal, Imobisoft)
- **WhatsApp Business Cloud API proativo para proprietários** (diferencial quase inexistente no mercado)
- **IA Preditiva**: Score de saúde do anúncio, recomendação de preço, previsão de churn
- **Mobile-first + Offline support** perfeito para corretores em campo
- **Suporte a Franquias e Multi-Tenant avançado**
- **Financeiro completo** com cálculo de comissões, NFS-e e integração contábil
- **Design System + White Label** completo
- **Segurança enterprise** (LGPD, Audit Log, CSP, Rate Limiting)
- **Help Center + Onboarding interativo** para alta taxa de adoção

---

## 🛠️ Arquitetura e Tech Stack (2026)

- **Frontend**: Next.js 16 (App Router, Server Components, React 19)
- **Estilo**: Tailwind CSS v4 + shadcn/ui + Design System customizável
- **Banco**: PostgreSQL (Supabase/Neon) + Prisma ORM
- **Auth**: Auth.js v5 com MFA e RBAC granular
- **IA**: Vercel AI SDK + OpenAI/Claude (preenchimento, sugestão de preço, agents conversacionais)
- **WhatsApp**: WhatsApp Cloud API oficial + fluxos avançados
- **Pagamentos**: Stripe + lógica fiscal brasileira
- **Deploy**: Vercel + Edge Functions
- **Outros**: PostHog, Sentry, Upstash Redis, Resend, PWA completo

---

## 📋 Funcionalidades Construídas (por IA)

### IA 1 – Core do CRM
- Cadastro inteligente de imóveis (voz, texto, IA)
- Publicação automática em portais (Grupo OLX + XML)
- Sincronização bidirecional de preço/fotos/status
- Fluxo básico de WhatsApp para leads e proprietários
- Dashboard principal e pipeline

### IA 2 – Admin, Marketing e Cobrança
- Painel Super Admin
- Landing Page pública + Pricing
- Onboarding wizard da imobiliária
- Integração completa com Stripe (planos, usage-based, webhooks)

### IA 3 – IA Avançada, PWA e Testes
- Agentes de IA (geração de descrição, qualificação de leads)
- PWA completo com offline support básico
- Sistema de notificações (in-app, push, e-mail)
- Testes unitários, integração e E2E

### IA 4 – Design System, Segurança e DevOps
- Design System + White Label completo (temas dinâmicos por imobiliária)
- Segurança enterprise (Audit Log, LGPD, CSP, Rate Limiting)
- GitHub Actions CI/CD
- Feature Flags avançados
- Guided Tour com react-joyride

### IA 5 – Performance, SEO e Marketing
- Otimização extrema de performance (Core Web Vitals)
- SEO técnico (sitemap dinâmico, structured data para imóveis, JSON-LD)
- Integrações com Google Analytics, Meta Pixel, Google Maps
- Automação de marketing e remarketing

### IA 6 – Mobile e WhatsApp Avançado
- Experiência mobile-first com gestos e bottom navigation
- Fluxos conversacionais ricos no WhatsApp (botões, mídia, quick replies)
- Suporte offline avançado (sync automático)
- Preparação para app nativo

### IA 7 – Financeiro e Contabilidade
- Dashboard financeiro completo (MRR, churn, LTV)
- Cálculo automático de comissões
- Integração com sistemas contábeis brasileiros (Omie, ContaAzul, etc.)
- Emissão de NFS-e e relatórios fiscais

### IA 8 – Multi-Tenant e Franquias
- Suporte a matriz → franquias → filiais
- Hierarquia de equipes e gestão de corretores
- Permissões granulares (RBAC + ABAC)
- Royalties automáticos para franquias

### IA 9 – IA Preditiva e Insights
- Score de Saúde do Anúncio
- Recomendação inteligente de preço
- Previsão de churn (imóveis e clientes)
- Insights automáticos semanais

### IA 10 – Adoção e Suporte
- Help Center avançado com busca por IA
- Onboarding interativo v2 + checklists
- Tutoriais em vídeo e guiados
- Sistema de tickets de suporte

---

## 🚀 Como Rodar o Projeto (Desenvolvimento)

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd imobweb

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha: DATABASE_URL, SUPABASE_URL, STRIPE_KEYS, WHATSAPP_TOKEN, OPENAI_API_KEY, etc.

# 4. Gere o Prisma
npx prisma generate
npx prisma db push   # ou prisma migrate dev

# 5. Rode o projeto
npm run dev
Acesse: http://localhost:3000
```

### 🔧 Configuração Inicial (Obrigatório)

1. **Supabase** → Criar projeto e configurar RLS
2. **Stripe** → Configurar produtos, webhooks e Billing Portal
3. **WhatsApp Cloud API** → Criar app na Meta, configurar webhook
4. **Vercel** → Deploy com variáveis de ambiente
5. **Auth** → Configurar provedores (Google, Magic Link, Credentials)

---

## 📋 O Que Ainda Falta Fazer (Backlog Priorizado)

### Alta Prioridade
- Finalizar merge completo das 10 IAs (especialmente arquivos compartilhados: globals.css, tailwind.config, next.config, package.json, middleware.ts)
- Integrar o modelo AuditLog no Prisma schema
- Testes end-to-end completos (Playwright)
- Implementar sync real com APIs dos portais (Canal Pro / VRSync)
- Aprovação de templates WhatsApp na Meta

### Média Prioridade
- Integração com mais portais via XML automático
- App nativo (Capacitor ou React Native wrapper)
- Multi-idioma (inglês/espanhol)
- Relatórios em PDF com branding da imobiliária
- Dark mode completo no White Label

### Baixa Prioridade / Futuro
- IA para geração de tours virtuais e fotos aprimoradas
- Marketplace de add-ons
- Integração com assinatura digital de contratos
- Versão White Label completa para revenda

---

## 🛣️ Roadmap Futuro

- **v1.0** — MVP estável (merge + testes)
- **v1.1** — WhatsApp avançado + Offline full
- **v1.2** — IA Preditiva + Insights em produção
- **v2.0** — Suporte nativo a grandes franquias + App Mobile Nativo

---

## 🤝 Como Contribuir

1. Faça fork do projeto
2. Crie uma branch (`feature/nome-da-feature`)
3. Commit com mensagens claras
4. Abra um Pull Request

**Importante:** Sempre respeite as regras de não-conflito entre as camadas construídas pelas diferentes IAs.

---

## 📄 Licença

Proprietário (em desenvolvimento). Uso interno apenas.

---

## 📞 Suporte e Contato

- **Documentação completa**: `/docs` ou Help Center dentro da aplicação
- **Issues**: Abra no GitHub
- **Suporte interno**: Use o sistema de tickets do imobWeb

---

**imobWeb — Feito para transformar o jeito como imobiliárias brasileiras trabalham.**

*"Cadastro uma vez. Atualização automática. Vendas mais rápidas."*