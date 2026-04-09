# imobWeb - Performance, SEO & Marketing Automation

Esta pasta contém o ecossistema de alta performance, visibilidade e automação do imobWeb, desenvolvido com as melhores práticas de 2026.

## 🏗️ Arquitetura das Camadas

### 🚀 Performance (`lib/performance/`, `components/performance/`)
- **React 19 Compiler**: Pré-configurado para otimização automática de re-renderizações.
- **Smart Caching**: Estratégia híbrida usando React `cache` (per-request) e Next.js `unstable_cache` (ISR) em `lib/performance/cache.ts`.
- **Image Pipeline**: Componente `ImageOptimized` com suporte a avif, webp, blur placeholders e priority loading.

### 🔍 Search Engine Optimization (`app/`, `lib/seo/`)
- **Dynamic Sitemap**: Geração automática de `sitemap.xml` para imóveis e blog.
- **Metadata Framework**: Gerador dinâmico de metadados em `lib/seo/metadata.ts` com suporte a Open Graph, Twitter e JSON-LD.
- **Robots Management**: Configuração granular de permissões e prevenção de conteúdo duplicado.

### 📈 Analytics & Tracking (`lib/analytics/`)
- **Hybrid Tracking**: Integração com PostHog, GA4 e Meta Pixel.
- **Meta CAPI**: Suporte a Conversions API (Server-side) para maior precisão em anúncios.
- **Event Orchestration**: Eventos padronizados para conversão de leads e funis de comportamento.

### 📧 Marketing Automation (`lib/marketing/`, `app/api/marketing/`)
- **Email Sequences**: Integração com Resend usando templates React Email.
- **Remarketing Engine**: Lógica de segmentação baseada em comportamento (Property Abandonment).
- **Webhooks**: Handler para atualizações em tempo real de portais imobiliários.

### 📊 Relatórios & BI (`lib/reports/`, `components/reports/`)
- **ROI Engine**: Cálculo de performance por portal (Custo por Lead).
- **Advanced Metrics**: Motor de cálculo para LTV, Churn e Freshness das propriedades.
- **Export System**: Impressão de alta fidelidade para relatórios em PDF.

## 🛠️ Como Integrar
1. Configure as variáveis de ambiente necessárias (`RESEND_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, etc).
2. Use o componente `constructMetadata` em seus layouts.
3. Utilize o componente `ImageOptimized` em todas as listagens de imóveis.
4. Acione a `Welcome Sequence` através do endpoint API em eventos de conversão.

---
*Desenvolvido pela IA de Performance & Marketing 🚀*
