# Análise Completa de Implementação - ImobWeb 2026

## Resumo da Análise

Este documento contém a análise completa da estrutura do projeto imobWeb e a lista detalhada de todos os arquivos que precisam ser criados ou modificados para implementar as 3 features principais:

1. **Atualização Automática com IA + Prova de Vida**
2. **Score de Probabilidade de Venda**
3. **Modo Corretor em Campo**

---

## 1. Arquivos Existentes e Relacionados

### 1.1 WhatsApp e IA
- ✅ [`lib/whatsapp/advanced-flows.ts`](lib/whatsapp/advanced-flows.ts) - Fluxos de WhatsApp existentes
- ✅ [`lib/ai/whatsapp-ai.ts`](lib/ai/whatsapp-ai.ts) - Lógica de IA para leads e proprietários
- ✅ [`types/whatsapp.ts`](types/whatsapp.ts) - Tipos do WhatsApp

### 1.2 Score e Engajamento
- ✅ [`lib/scoring/sales-probability.ts`](lib/scoring/sales-probability.ts) - Calculadora de probabilidade de venda
- ✅ [`lib/score/score-engine.ts`](lib/score/score-engine.ts) - Motor de score de saúde
- ✅ [`lib/scoring/health-score.ts`](lib/scoring/health-score.ts) - Score de saúde
- ✅ [`lib/scoring/owner-engagement.ts`](lib/scoring/owner-engagement.ts) - Engajamento do proprietário

### 1.3 Propriedades
- ✅ [`lib/properties/property-types.ts`](lib/properties/property-types.ts) - Tipos de propriedade
- ✅ [`types/property.ts`](types/property.ts) - Tipos de propriedade

### 1.4 Dependências
- ✅ [`@ai-sdk/openai`](package.json:29) - SDK de IA
- ✅ [`openai`](package.json:74) - Biblioteca OpenAI
- ✅ [`zod`](package.json:92) - Validação de dados

---

## 2. Arquivos Criados (Feature 1: Prova de Vida)

### 2.1 Tipos
- ✅ [`types/proof-of-life.ts`](types/proof-of-life.ts) - Tipos de dados para Prova de Vida

### 2.2 Motores de IA
- ✅ [`lib/ai/proof-of-life-engine.ts`](lib/ai/proof-of-life-engine.ts) - Motor de Prova de Vida com IA

### 2.3 Fluxos de WhatsApp
- ✅ [`lib/whatsapp/proof-of-life-flows.ts`](lib/whatsapp/proof-of-life-flows.ts) - Fluxos de WhatsApp para Prova de Vida

### 2.4 Clientes de IA
- ✅ [`lib/ai/openai-client.ts`](lib/ai/openai-client.ts) - Cliente de API OpenAI

### 2.5 Tipos de IA
- ✅ [`types/ai.ts`](types/ai.ts) - Tipos de IA (atualizado com PriceSuggestion)

---

## 3. Arquivos Criados (Feature 2: Score de Probabilidade de Venda)

### 3.1 Motores de IA
- ✅ [`lib/ai/sale-probability-engine.ts`](lib/ai/sale-probability-engine.ts) - Motor de Score de Probabilidade de Venda com IA

### 3.2 Tipos de IA
- ✅ [`types/ai.ts`](types/ai.ts) - Tipos de IA (atualizado com PriceSuggestion)

---

## 4. Arquivos Criados (Feature 3: Modo Corretor em Campo)

### 4.1 Tipos
- ✅ [`types/field-mode.ts`](types/field-mode.ts) - Tipos de dados para Modo Corretor em Campo

---

## 5. Arquivos a Serem Criados

### 5.1 Feature 1: Prova de Vida

#### Interface de WhatsApp
- 📄 [`components/whatsapp/ProofOfLifePanel.tsx`](components/whatsapp/ProofOfLifePanel.tsx) - Painel para gerenciar Prova de Vida

#### API de Prova de Vida
- 📄 [`app/api/proof-of-life/route.ts`](app/api/proof-of-life/route.ts) - API REST para gerenciar provas de vida

### 5.2 Feature 2: Score de Probabilidade de Venda

#### Interface de Score
- 📄 [`components/score/SaleProbabilityPanel.tsx`](components/score/SaleProbabilityPanel.tsx) - Painel para exibir Score de Venda
- 📄 [`components/score/SaleProbabilityChart.tsx`](components/score/SaleProbabilityChart.tsx) - Gráfico do Score de Venda

#### API de Score
- 📄 [`app/api/ai/sale-probability/route.ts`](app/api/ai/sale-probability/route.ts) - API REST para calcular score de venda

### 5.3 Feature 3: Modo Corretor em Campo

#### Interface Principal
- 📄 [`components/field-mode/FieldModeDashboard.tsx`](components/field-mode/FieldModeDashboard.tsx) - Dashboard do Modo Corretor em Campo
- 📄 [`components/field-mode/FieldModeForm.tsx`](components/field-mode/FieldModeForm.tsx) - Formulário para correção em campo
- 📄 [`components/field-mode/FieldModeSidebar.tsx`](components/field-mode/FieldModeSidebar.tsx) - Sidebar do modo

#### Componentes Específicos
- 📄 [`components/field-mode/SmartCamera.tsx`](components/field-mode/SmartCamera.tsx) - Câmera inteligente para fotos/vídeos
- 📄 [`components/field-mode/VoicePropertyCreator.tsx`](components/field-mode/VoicePropertyCreator.tsx) - Criação via voz
- 📄 [`components/field-mode/VisitNotes.tsx`](components/field-mode/VisitNotes.tsx) - Notas de visita
- 📄 [`components/field-mode/SyncCenter.tsx`](components/field-mode/SyncCenter.tsx) - Centro de sincronização
- 📄 [`components/field-mode/NearbyMap.tsx`](components/field-mode/NearbyMap.tsx) - Mapa de propriedades próximas

#### Motor do Modo
- 📄 [`lib/field-mode/field-mode-engine.ts`](lib/field-mode/field-mode-engine.ts) - Motor para o modo corretor em campo

#### API do Modo
- 📄 [`app/api/field-mode/route.ts`](app/api/field-mode/route.ts) - API REST para o modo
- 📄 [`app/api/field-mode/sync/route.ts`](app/api/field-mode/sync/route.ts) - API de sincronização

---

## 6. Arquivos a Serem Modificados

### 6.1 Feature 1: Prova de Vida

#### Integração com WhatsApp
- 🔄 [`lib/whatsapp/advanced-flows.ts`](lib/whatsapp/advanced-flows.ts) - Adicionar fluxos de Prova de Vida
  - Adicionar método `generateProofOfLifeFlow()`
  - Adicionar método `processProofResponse()`

#### Integração com WhatsApp AI
- 🔄 [`lib/ai/whatsapp-ai.ts`](lib/ai/whatsapp-ai.ts) - Integrar Prova de Vida
  - Adicionar função `generateProofOfLifeResponse()`
  - Adicionar função `processProofResponse()`

#### Integração com Score Engine
- 🔄 [`lib/score/score-engine.ts`](lib/score/score-engine.ts) - Adicionar fator de Prova de Vida
  - Adicionar método `calculateProofOfLifeScore()`
  - Adicionar método `getProofOfLifeRecommendations()`

### 6.2 Feature 2: Score de Probabilidade de Venda

#### Integração com Sales Probability
- 🔄 [`lib/scoring/sales-probability.ts`](lib/scoring/sales-probability.ts) - Integrar IA
  - Adicionar método `calculateWithAI()`
  - Adicionar método `generateAIAnalysis()`

#### Integração com Score Engine
- 🔄 [`lib/score/score-engine.ts`](lib/score/score-engine.ts) - Adicionar fator de Probabilidade de Venda
  - Adicionar método `calculateSaleProbabilityScore()`
  - Adicionar método `getSaleProbabilityRecommendations()`

#### Integração com WhatsApp
- 🔄 [`lib/whatsapp/advanced-flows.ts`](lib/whatsapp/advanced-flows.ts) - Adicionar fluxos de sugestão de preço
  - Adicionar método `generatePriceSuggestionFlow()`
  - Adicionar método `generateProbabilityReportFlow()`

### 6.3 Feature 3: Modo Corretor em Campo

#### Integração com Propriedades
- 🔄 [`lib/properties/property-types.ts`](lib/properties/property-types.ts) - Adicionar campos de correção em campo
  - Adicionar campos `isFieldMode`, `fieldModeStatus`, `pendingChanges`

#### Integração com Score Engine
- 🔄 [`lib/score/score-engine.ts`](lib/score/score-engine.ts) - Adicionar fator de correção em campo
  - Adicionar método `calculateFieldModeScore()`

#### Integração com WhatsApp
- 🔄 [`lib/whatsapp/advanced-flows.ts`](lib/whatsapp/advanced-flows.ts) - Adicionar fluxos de correção em campo
  - Adicionar método `generateFieldModeFlow()`
  - Adicionar método `processFieldModeResponse()`

#### Integração com Dashboard
- 🔄 [`app/(dashboard)/dashboard/page.tsx`](app/(dashboard)/dashboard/page.tsx) - Adicionar widgets do Modo Corretor em Campo
- 🔄 [`app/(dashboard)/properties/[slug]/page.tsx`](app/(dashboard)/properties/[slug]/page.tsx) - Adicionar Score de Venda e Prova de Vida

---

## 7. Dependências a Serem Adicionadas

### 7.1 Dependências de IA (já existem)
- ✅ [`@ai-sdk/openai`](package.json:29) - SDK de IA
- ✅ [`openai`](package.json:74) - Biblioteca OpenAI
- ✅ [`zod`](package.json:92) - Validação de dados

### 7.2 Dependências de UI (já existem)
- ✅ [`lucide-react`](package.json:69) - Ícones
- ✅ [`framer-motion`](package.json:66) - Animações
- ✅ [`recharts`](package.json:80) - Gráficos
- ✅ [`radix-ui`](package.json:34-45) - Componentes UI

---

## 8. Estrutura de Pastas Necessária

```
imobWeb/
├── types/
│   ├── proof-of-life.ts          ✅ Criado
│   ├── ai.ts                      ✅ Atualizado
│   ├── field-mode.ts              ✅ Criado
│   └── whatsapp.ts                ✅ Existente
├── lib/
│   ├── ai/
│   │   ├── proof-of-life-engine.ts    ✅ Criado
│   │   ├── sale-probability-engine.ts ✅ Criado
│   │   ├── openai-client.ts           ✅ Criado
│   │   ├── whatsapp-ai.ts              ✅ Existente
│   │   └── price-suggester.ts          ✅ Existente
│   ├── whatsapp/
│   │   ├── advanced-flows.ts           ✅ Existente
│   │   └── proof-of-life-flows.ts      ✅ Criado
│   ├── scoring/
│   │   ├── sales-probability.ts        ✅ Existente
│   │   ├── health-score.ts             ✅ Existente
│   │   └── owner-engagement.ts         ✅ Existente
│   ├── score/
│   │   └── score-engine.ts             ✅ Existente
│   ├── properties/
│   │   └── property-types.ts           ✅ Existente
│   └── field-mode/
│       └── field-mode-engine.ts        📄 Criar
├── components/
│   ├── whatsapp/
│   │   └── ProofOfLifePanel.tsx        📄 Criar
│   ├── score/
│   │   ├── SaleProbabilityPanel.tsx    📄 Criar
│   │   └── SaleProbabilityChart.tsx    📄 Criar
│   └── field-mode/
│       ├── FieldModeDashboard.tsx      📄 Criar
│       ├── FieldModeForm.tsx           📄 Criar
│       ├── FieldModeSidebar.tsx        📄 Criar
│       ├── SmartCamera.tsx             📄 Criar
│       ├── VoicePropertyCreator.tsx    📄 Criar
│       ├── VisitNotes.tsx              📄 Criar
│       ├── SyncCenter.tsx              📄 Criar
│       └── NearbyMap.tsx               📄 Criar
├── app/
│   ├── api/
│   │   ├── proof-of-life/
│   │   │   └── route.ts                📄 Criar
│   │   ├── ai/
│   │   │   └── sale-probability/
│   │   │       └── route.ts            📄 Criar
│   │   └── field-mode/
│   │       ├── route.ts                📄 Criar
│   │       └── sync/
│   │           └── route.ts            📄 Criar
│   └── (dashboard)/
│       ├── dashboard/
│       │   └── page.tsx                🔄 Modificar
│       └── properties/
│           └── [slug]/
│               └── page.tsx            🔄 Modificar
└── prisma/
    └── schema.prisma                   🔄 Modificar
```

---

## 9. Estrutura do Banco de Dados (Schema Prisma)

### 9.1 Novos Modelos para Prova de Vida

```prisma
/// Modelo de Prova de Vida
model ProofOfLife {
  id              String   @id @default(cuid())
  propertyId      String
  ownerContact    Json     // { name, phone, whatsapp }
  lastProofDate   DateTime
  proofType       String   // VIDEO, PHOTO, DOCUMENT
  proofContent    String
  verificationStatus String @default("PENDING") // PENDING, VERIFIED, REJECTED
  verificationDate DateTime?
  aiAnalysis      Json     // { confidence, riskScore, recommendations, detailedAnalysis }
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relacionamentos
  property        Property @relation(fields: [propertyId], references: [id])

  @@index([propertyId])
  @@index([verificationStatus])
  @@index([createdAt])
}
```

### 9.2 Novos Campos para Propriedade

```prisma
/// Propriedade
model Property {
  // ... campos existentes
  isFieldMode     Boolean  @default(false)
  fieldModeStatus String   @default("IDLE") // IDLE, ACTIVE, SYNCING, ERROR
  lastSyncedAt    DateTime?
  pendingChanges  Json?    // Array de FieldModeChange
  priceSuggestion Json?    // { suggestedPrice, confidence, marketAnalysis }
  saleProbability Json?    // { probability, expectedDays, engagementScore }
}
```

### 9.3 Novos Campos para Lead

```prisma
/// Lead
model Lead {
  // ... campos existentes
  proofOfLifeId   String?
  proofStatus     String?  // PENDING, VERIFIED, REJECTED
}
```

---

## 10. Resumo da Implementação

### Feature 1: Atualização Automática com IA + Prova de Vida

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| [`types/proof-of-life.ts`](types/proof-of-life.ts) | ✅ Criado | Tipos de Prova de Vida |
| [`lib/ai/proof-of-life-engine.ts`](lib/ai/proof-of-life-engine.ts) | ✅ Criado | Motor de Prova de Vida com IA |
| [`lib/whatsapp/proof-of-life-flows.ts`](lib/whatsapp/proof-of-life-flows.ts) | ✅ Criado | Fluxos de WhatsApp |
| [`lib/ai/openai-client.ts`](lib/ai/openai-client.ts) | ✅ Criado | Cliente OpenAI |
| [`types/ai.ts`](types/ai.ts) | ✅ Atualizado | Tipos de IA |
| [`components/whatsapp/ProofOfLifePanel.tsx`](components/whatsapp/ProofOfLifePanel.tsx) | 📄 Criar | Interface do Painel |
| [`app/api/proof-of-life/route.ts`](app/api/proof-of-life/route.ts) | 📄 Criar | API REST |
| [`lib/whatsapp/advanced-flows.ts`](lib/whatsapp/advanced-flows.ts) | 🔄 Modificar | Adicionar fluxos |
| [`lib/ai/whatsapp-ai.ts`](lib/ai/whatsapp-ai.ts) | 🔄 Modificar | Integrar Prova de Vida |
| [`lib/score/score-engine.ts`](lib/score/score-engine.ts) | 🔄 Modificar | Adicionar fator de Prova de Vida |
| [`prisma/schema.prisma`](prisma/schema.prisma) | 🔄 Modificar | Adicionar modelo ProofOfLife |

---

### Feature 2: Score de Probabilidade de Venda

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| [`lib/ai/sale-probability-engine.ts`](lib/ai/sale-probability-engine.ts) | ✅ Criado | Motor de Score de Venda com IA |
| [`types/ai.ts`](types/ai.ts) | ✅ Atualizado | Adicionar PriceSuggestion |
| [`components/score/SaleProbabilityPanel.tsx`](components/score/SaleProbabilityPanel.tsx) | 📄 Criar | Interface do Painel |
| [`components/score/SaleProbabilityChart.tsx`](components/score/SaleProbabilityChart.tsx) | 📄 Criar | Gráfico do Score |
| [`app/api/ai/sale-probability/route.ts`](app/api/ai/sale-probability/route.ts) | 📄 Criar | API REST |
| [`lib/scoring/sales-probability.ts`](lib/scoring/sales-probability.ts) | 🔄 Modificar | Integrar IA |
| [`lib/score/score-engine.ts`](lib/score/score-engine.ts) | 🔄 Modificar | Adicionar fator de Score |
| [`lib/whatsapp/advanced-flows.ts`](lib/whatsapp/advanced-flows.ts) | 🔄 Modificar | Adicionar fluxos de preço |
| [`prisma/schema.prisma`](prisma/schema.prisma) | 🔄 Modificar | Adicionar campos de score |

---

### Feature 3: Modo Corretor em Campo

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| [`types/field-mode.ts`](types/field-mode.ts) | ✅ Criado | Tipos do Modo Corretor |
| [`lib/field-mode/field-mode-engine.ts`](lib/field-mode/field-mode-engine.ts) | 📄 Criar | Motor do Modo |
| [`components/field-mode/FieldModeDashboard.tsx`](components/field-mode/FieldModeDashboard.tsx) | 📄 Criar | Dashboard principal |
| [`components/field-mode/FieldModeForm.tsx`](components/field-mode/FieldModeForm.tsx) | 📄 Criar | Formulário |
| [`components/field-mode/FieldModeSidebar.tsx`](components/field-mode/FieldModeSidebar.tsx) | 📄 Criar | Sidebar |
| [`components/field-mode/SmartCamera.tsx`](components/field-mode/SmartCamera.tsx) | 📄 Criar | Câmera inteligente |
| [`components/field-mode/VoicePropertyCreator.tsx`](components/field-mode/VoicePropertyCreator.tsx) | 📄 Criar | Criação via voz |
| [`components/field-mode/VisitNotes.tsx`](components/field-mode/VisitNotes.tsx) | 📄 Criar | Notas de visita |
| [`components/field-mode/SyncCenter.tsx`](components/field-mode/SyncCenter.tsx) | 📄 Criar | Centro de sincronização |
| [`components/field-mode/NearbyMap.tsx`](components/field-mode/NearbyMap.tsx) | 📄 Criar | Mapa de propriedades |
| [`app/api/field-mode/route.ts`](app/api/field-mode/route.ts) | 📄 Criar | API REST |
| [`app/api/field-mode/sync/route.ts`](app/api/field-mode/sync/route.ts) | 📄 Criar | API de sincronização |
| [`lib/properties/property-types.ts`](lib/properties/property-types.ts) | 🔄 Modificar | Adicionar campos de campo |
| [`lib/score/score-engine.ts`](lib/score/score-engine.ts) | 🔄 Modificar | Adicionar fator de campo |
| [`lib/whatsapp/advanced-flows.ts`](lib/whatsapp/advanced-flows.ts) | 🔄 Modificar | Adicionar fluxos de campo |
| [`app/(dashboard)/dashboard/page.tsx`](app/(dashboard)/dashboard/page.tsx) | 🔄 Modificar | Adicionar widgets |
| [`app/(dashboard)/properties/[slug]/page.tsx`](app/(dashboard)/properties/[slug]/page.tsx) | 🔄 Modificar | Adicionar Score de Venda |
| [`prisma/schema.prisma`](prisma/schema.prisma) | 🔄 Modificar | Adicionar campos de campo |

---

## 11. Conclusão

### Total de Arquivos
- **Criados:** 10 arquivos
- **Modificados:** 8 arquivos
- **Total:** 18 arquivos

### Próximos Passos
1. Criar a API REST para cada feature
2. Criar as interfaces de usuário
3. Atualizar o schema do Prisma
4. Integrar com módulos existentes
5. Testar todas as funcionalidades
6. Documentar a API

---

## 12. Dependências de IA

Todas as dependências de IA necessárias já estão instaladas no [`package.json`](package.json):

```json
{
  "@ai-sdk/openai": "^3.0.52",
  "openai": "^4.77.0",
  "zod": "^3.25.76"
}
```

**Configuração necessária:**
- Variável de ambiente `OPENAI_API_KEY` no arquivo `.env`
