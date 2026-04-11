# 🗺️ Arquitetura do Sistema: Por dentro da Máquina

Bem-vindo ao mapa técnico da **imobWeb**. Se você quer entender como transformamos código em uma máquina de vendas imobiliárias, você está no lugar certo.

## 🏗️ Visão Geral (The Big Picture)

Nossa arquitetura foi desenhada para ser **rápida, segura e escalável**. Usamos o modelo de **SaaS Multi-Tenant**, o que significa que uma única infraestrutura atende centenas de imobiliárias de forma isolada e segura.

```mermaid
graph TD
    User((Corretor/Lead)) --> CDN[Vercel Edge Network]
    CDN --> NextJS[Next.js 16 App Router]
    
    subgraph "Core Engine (Vercel Edge/Serverless)"
        NextJS --> SA[Server Actions / tRPC]
        SA --> Auth[NextAuth / RBAC]
        SA --> AI[imobEngine - GPT-4o SDK]
    }
    
    subgraph "Data Layer"
        SA --> Prisma[Prisma ORM]
        Prisma --> DB[(PostgreSQL - Neon/Supabase)]
        SA --> Redis[(Upstash Redis - Cache/Rate Limit)]
    }
    
    subgraph "External Ecosystem"
        SA --> WA[WhatsApp Cloud API]
        SA --> Stripe[Stripe Billing]
        SA --> Portals[Portal Integrator - XML/API]
        SA --> Media[Cloudinary - Media Optimization]
    }
```

---

## 층 Camadas do Sistema

### 1. Camada de Apresentação (Frontend)
- **Framework**: Next.js 16. Aproveitamos ao máximo os **Server Components** para entregar o mínimo de JavaScript para o cliente.
- **Estilo**: Tailwind CSS v4. Design atômico e utilitário que garante que o site carregue voando.
- **Interação**: Framer Motion para micro-interações que dão aquele sentimento de "produto premium".

### 2. Camada de Lógica (Backend & Edge)
- **Runtime**: Rodamos grande parte da nossa lógica na **Edge**, o mais próximo possível do usuário.
- **Comunicação**: Usamos **Server Actions** para mutações de dados, eliminando a necessidade de APIs REST complexas e inseguras.
- **IA Engine**: Nosso "imobEngine" centraliza as chamadas para modelos da OpenAI, Anthropic e modelos próprios de processamento de imagem.

### 3. Camada de Dados (Persistence)
- **Banco de Dados**: PostgreSQL com suporte a multi-tenant nativo via chaves de `organizationId`.
- **ORM**: Prisma. Tipagem completa de ponta a ponta.
- **Performance**: Redis para cache de buscas frequentes de imóveis e rate limiting (segurança contra ataques).

---

## 🛡️ Segurança e Multi-Tenancy

Segurança não é opcional na imobWeb.
- **RBAC (Role-Based Access Control)**: Definimos 6 níveis de acesso (Admin, Gerente, Corretor, Proprietário, Parceiro, Lead). Cada um vê apenas o que deve ver.
- **Tenant Isolation**: Cada imobiliária tem seus dados logicamente isolados. Um erro de query nunca vazará dados de uma imobiliária para outra.
- **White-Label Proxy**: Nossa engine de domínios permite que a imobiliária `x.com` use o sistema inteiro com sua própria marca sem saber que está na nossa infra.

---

## 🚀 Fluxo de Trabalho de IA (imobEngine)

Quando você sobe uma foto de um imóvel, o fluxo é o seguinte:
1.  **Ingestion**: A imagem cai no Cloudinary.
2.  **Analysis**: A IA identifica cômodos e objetos (piscina, suítes).
3.  **Enhancement**: O processador remove ruídos e ajusta a luz.
4.  **Privacy**: Retira placas de carros e rostos.
5.  **Metadata**: O banco é atualizado com as "tags" geradas pela IA.

 TUDO isso acontece em menos de 2 segundos.

---

## 🛠️ Guia do Desenvolvedor

Se você for mexer no código, siga estas regras de ouro:
1.  **Server-First**: Sempre que puder, faça no servidor.
2.  **Type-Safe**: Sem `any`. O TypeScript é seu melhor amigo.
3.  **Local-First Logic**: Use hooks customizados em `hooks/` para manter os componentes limpos.
4.  **Performance Check**: Se o Lighthouse cair de 90, algo está errado.

---

<p align="center">
  Dúvidas técnicas? Abra uma Issue ou consulte nossa <a href="docs/referencia-api.md">Referência da API</a>.
</p>
