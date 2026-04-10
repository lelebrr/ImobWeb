# imobWeb Portal Integrations Architecture

Este documento descreve a arquitetura do motor de integração com portais imobiliários do imobWeb (v2026).

## 🚀 Principais Funcionalidades

### 1. Sincronização em Tempo Real
- **Sync Engine**: Orquestrador bidirecional capaz de atualizar +500 anúncios em simultâneo (< 2 minutos).
- **Detecção de Conflitos**: Lógica "CRM vence" com marcação de divergências para revisão manual.

### 2. Ecossistema de Feeds (+120 Portais)
- **VRSync Nativo**: Compatibilidade total com Grupo OLX (Zap, Viva Real, OLX).
- **Custom Mappings**:
  - ImovelWeb
  - Chaves na Mão
  - Chaves na Mão
- **Meta Real Estate Ads**: RSS/XML otimizado para campanhas dinâmicas no Facebook e Instagram.

### 3. Automação e Qualidade
- **Auto-Maintenance**: Bloqueio automático de anúncios não atualizados há mais de 30 dias.
- **Unified Validator**: Validação de regras específicas (fotos mínimas, limites de caracteres, campos obrigatórios por portal).
- **Leads Webhooks**: Captura automática de contatos dos portais diretamente para o pipeline de vendas.

## 🛠️ Componentes Técnicos

- **Generator**: `lib/xml-processor/xml-generator.ts` (VRSync)
- **Meta Generator**: `lib/xml-processor/meta-catalog.ts` (Social Ads)
- **Sync Engine**: `lib/portals/sync-engine.ts`
- **Analytics**: `lib/portals/analytics.ts`
- **Maintenance**: `lib/portals/auto-maintenance.ts`

## 📊 APIs Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/portals/sync` | POST | Dispara sincronização imediata |
| `/api/portals/feed/[id]` | GET | Serve o XML para pull dos portais |
| `/api/portals/feed/meta` | GET | Serve o catálogo para Facebook/Instagram |
| `/api/webhooks/portals` | POST | Endpoint receptor de leads externo |

---
**imobWeb Integrations Module — Phase 2 Delivered.**