# ============================================
# ESTRUTURA FINAL DO PROJETO IMOBWEB - MERGE COMPLETO
# ============================================
# 
# Este documento apresenta a estrutura completa do projeto imobWeb
# após o merge das 4 IAs especializadas:
#
# IA 1 (Core): Dashboard, Imóveis, Leads, CRUD completo
# IA 2: Admin, Marketing/Landing, Onboarding, Stripe/Billing
# IA 3: IA Avançada, PWA, Notificações, Testes, Documentação
# IA 4: Design System, White Label, Segurança Enterprise, DevOps, 
#       Public API, Monitoring, Help Center, Guided Tour
#
# ============================================

imobWeb/
│
├── app/                              # Next.js 16 App Router
│   ├── (admin)/                      # IA 2 - Área administrativa
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (ai)/                         # IA 3 - IA Avançada
│   │   ├── suggest-price/
│   │   │   └── route.ts
│   │   ├── generate-description/
│   │   │   └── route.ts
│   │   └── chat-with-owner/
│   │       └── route.ts
│   ├── (branding)/                   # IA 4 - White Label/Branding
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (dashboard)/                  # IA 1 - Dashboard principal
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── properties/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── leads/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   ├── (marketing)/                  # IA 2 - Landing/Marketing
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── pricing/
│   │       └── page.tsx
│   ├── (onboarding)/                 # IA 2 - Onboarding
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (settings)/                   # IA 4 - Configurações
│   │   ├── layout.tsx
│   │   ├── help/
│   │   │   └── page.tsx
│   │   └── feature-flags/
│   │       └── page.tsx
│   ├── api/                          # APIs Routes
│   │   ├── billing/
│   │   │   ├── checkout.ts           # IA 2 - Stripe Checkout
│   │   │   └── manage-subscription.ts # IA 2 - Gerenciar Assinatura
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── index.ts          # IA 2 - Webhooks Stripe
│   │   ├── notifications/
│   │   │   ├── route.ts              # IA 3 - Notificações
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── devops/
│   │   │   └── health/
│   │   │       └── route.ts          # IA 4 - Health Check
│   │   ├── security/
│   │   │   └── lgpd/
│   │   │       └── route.ts          # IA 4 - LGPD
│   │   └── public/
│   │       └── v1/                   # IA 4 - Public API
│   │           └── [[...route]]/
│   │               └── route.ts
│   ├── globals.css                   # ESTILOS GLOBAIS (merge de todas as IAs)
│   ├── layout.tsx                    # Layout principal
│   ├── manifest.json                 # IA 3 - PWA Manifest
│   ├── middleware.ts                 # IA 2 + IA 4 - Middleware
│   └── page.tsx                      # Página inicial
│
├── components/                       # Componentes React
│   ├── admin/                        # IA 2 - Componentes Admin
│   ├── ai/                           # IA 3 - Componentes de IA
│   ├── branding/                    # IA 4 - White Label
│   │   ├── branding-provider.tsx
│   │   └── theme-customizer.tsx
│   ├── design-system/                # IA 4 - Design System
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── table.tsx
│   ├── help/                         # IA 4 - Help Center
│   │   ├── chatbot.tsx
│   │   └── guided-tour.tsx
│   ├── marketing/                    # IA 2 - Componentes Marketing
│   ├── notifications/                # IA 3 - Componentes de Notificação
│   ├── onboarding/                   # IA 2 - Componentes Onboarding
│   └── pwa/                          # IA 3 - Componentes PWA
│       ├── install-prompt.tsx
│       └── status-indicator.tsx
│
├── lib/                              # Libraries e utilitários
│   ├── ai/                           # IA 3 - IA Avançada
│   │   ├── price-suggester.ts
│   │   ├── description-generator.ts
│   │   └── chat-agent.ts
│   ├── analytics/                    # IA 2 - Analytics (PostHog)
│   │   ├── events.ts
│   │   └── posthog.ts
│   ├── billing/                      # IA 2 - Billing/Stripe
│   │   ├── stripe.ts
│   │   └── webhooks.ts
│   ├── design-system/                # IA 4 - Utils Design System
│   │   ├── tokens.ts
│   │   └── theme-utils.ts
│   ├── export/                      # IA 3 - Exportação
│   │   ├── properties.ts
│   │   └── leads.ts
│   ├── feature-flags/                # IA 4 - Feature Flags
│   │   ├── index.ts
│   │   └── unleash-client.ts
│   ├── help/                         # IA 4 - Help Center
│   │   └── mdx-service.ts
│   ├── monitoring/                   # IA 4 - Monitoring
│   │   └── error-boundary.tsx
│   ├── notifications/                # IA 3 - Notificações
│   │   ├── types.ts
│   │   └── service.ts
│   ├── pwa/                          # IA 3 - PWA
│   │   └── storage.ts
│   ├── public-api/                   # IA 4 - Public API
│   │   └── router.ts
│   ├── rbac/                         # IA 2 - RBAC
│   │   ├── can.ts
│   │   └── permissions.ts
│   └── security/                     # IA 4 - Segurança Enterprise
│       ├── audit-service.ts
│       ├── csp.ts
│       ├── encryption.ts
│       ├── lgpd-service.ts
│       └── rate-limit.ts
│
├── prisma/                           # Database Schema
│   └── schema.prisma                 # Schema completo com AuditLog
│
├── public/                           # Arquivos públicos
│   ├── icons/                        # IA 3 - Ícones PWA
│   ├── offline.html                  # IA 3 - Página offline
│   ├── manifest.json                 # IA 3 - PWA Manifest
│   └── sw.js                         # IA 3 - Service Worker
│
├── tests/                           # IA 3 - Testes
│   ├── unit/
│   │   ├── price-suggester.test.ts
│   │   ├── description-generator.test.ts
│   │   └── chat-agent.test.ts
│   ├── integration/
│   └── e2e/
│       ├── ai.test.ts
│       └── pwa.test.ts
│
├── docs/                            # IA 3 - Documentação
│   ├── README.md
│   ├── SETUP.md
│   ├── API.md
│   ├── USER_GUIDE.md
│   └── MERGE_GUIDE.md
│
├── i18n/                            # IA 3 - Internacionalização
│   └── pt-BR/
│       └── messages.ts
│
├── types/                           # Tipos TypeScript globais
│
├── .github/
│   └── workflows/                    # CI/CD
│       ├── ci.yml
│       ├── enterprise-ci.yml
│       └── security_scan.yml
│
├── next.config.mjs                  # CONFIGURAÇÃO NEXT.JS (merge)
├── tailwind.config.ts               # TAILWIND CONFIG (merge)
├── package.json                     # DEPENDÊNCIAS (merge)
├── vitest.config.ts                  # IA 3 - Testes Unitários
├── playwright.config.ts             # IA 3 - Testes E2E
└── tsconfig.json                    # TypeScript Config
│
# ============================================
# LEGENDA DE ORIGEM
# ============================================
# IA 1: Core CRM (Dashboard, Properties, Leads, WhatsApp)
# IA 2: Admin, Marketing, Onboarding, Billing/Stripe
# IA 3: IA Avançada, PWA, Notificações, Testes, Docs
# IA 4: Design System, White Label, Security, DevOps
# ============================================