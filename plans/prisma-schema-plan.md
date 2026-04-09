# Plano de Schema do Prisma para imobWeb

Este documento contém as alterações necessárias no schema do Prisma para suportar:
- Multi-tenancy (Organizações/Imobiliárias)
- RBAC (Roles: superadmin, owner, manager, broker)
- Integração Stripe (Assinaturas, Planos, Faturamento)
- Analytics (Eventos, Métricas)

## Models Existentes (Manter)

Os models existentes como User, Account, Session, VerificationToken do Auth.js devem ser mantidos.

```prisma
// ✅ Manter - Auth.js
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  
  // Novos campos para multi-tenant
  role          Role      @default(BROKER)
  organizationId String?
  organization  Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
}
```

## Novas Adições ao Schema

### 1. Organization (Imobiliária)

```prisma
model Organization {
  id                    String    @id @default(cuid())
  name                  String
  slug                  String    @unique // URL amigável: imobweb.com/[slug]
  logo                  String?
  description           String?
  website               String?
  phone                 String?
  email                 String?
  address               String?
  
  // Status
  status                OrganizationStatus @default(ACTIVE)
  
  // Configurações
  timezone              String    @default("America/Sao_Paulo")
  locale                String    @default("pt-BR")
  
  // Branding (customização por imobiliária)
  primaryColor          String?
  secondaryColor       String?
  logoUrl              String?
  
  // Stripe
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?
  subscription         Subscription? @relation(fields: [stripeSubscriptionId], references: [id], onDelete: SetNull)
  
  // Métricas
  totalProperties       Int       @default(0)
  totalUsers            Int       @default(0)
  totalLeads            Int       @default(0)
  
  //timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  // Relations
  users                 User[]
  properties            Property[]
  clients               Client[]
  subscriptions         Subscription[]
}

enum OrganizationStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_SETUP
}
```

### 2. Subscription (Assinatura Stripe)

```prisma
model Subscription {
  id                      String    @id @default(cuid())
  
  // Stripe IDs
  stripeSubscriptionId   String    @unique
  stripePriceId          String
  stripeProductId        String
  
  // Status
  status                  SubscriptionStatus @default(ACTIVE)
  
  // Período
  currentPeriodStart     DateTime
  currentPeriodEnd       DateTime
  trialStart             DateTime?
  trialEnd               DateTime?
  cancelAtPeriodEnd      Boolean   @default(false)
  canceledAt             DateTime?
  
  // Plano
  plan                   Plan       @default(FREE)
  
  // Metadata
  metadata               Json?
  
  // Relations
  organizationId         String
  organization           Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  INCOMPLETE
  INCOMPLETE_EXPIRED
  TRIALING
}

enum Plan {
  FREE
  PROFESSIONAL
  ENTERPRISE
}
```

### 3. Billing (Faturamento)

```prisma
model Billing {
  id                      String    @id @default(cuid())
  
  // Informações do cliente Stripe
  stripeCustomerId        String    @unique
  stripeInvoicePrefix     String?
  
  // Dados de pagamento
  paymentMethodId         String?
  paymentMethodType       String? // card, pix, etc
  
  // Endereço de cobrança
  billingAddress          Json?
  
  // Histórico de pagamentos
  lastPaymentDate         DateTime?
  lastPaymentAmount       Int? // em centavos
  lastPaymentStatus       String?
  
  // Informações de trial
  trialStartDate          DateTime?
  trialEndDate            DateTime?
  isInTrial               Boolean   @default(false)
  
  // MRR (Monthly Recurring Revenue)
  mrr                     Int       @default(0) // em centavos
  
  // Relations
  organizationId          String    @unique
  organization            Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
}
```

### 4. AuditLog (Auditoria)

```prisma
model AuditLog {
  id              String    @id @default(cuid())
  
  // Ação
  action          String    // "property.created", "user.login", etc.
  entityType      String    // "Property", "User", "Organization"
  entityId        String?
  
  // Usuário
  userId          String?
  userName        String?
  userEmail       String?
  
  // Organização
  organizationId  String?
  
  // Dados
  metadata        Json?
  ipAddress       String?
  userAgent       String?
  
  // Resultado
  success         Boolean   @default(true)
  errorMessage    String?
  
  createdAt       DateTime  @default(now())
}
```

### 5. AnalyticsEvent (Eventos PostHog)

```prisma
model AnalyticsEvent {
  id              String    @id @default(cuid())
  
  // Evento
  name            String    // "Page Viewed", "Button Clicked", etc.
  
  // Propriedades do evento
  properties      Json?
  
  // Usuário
  userId          String?
  distinctId      String?   // PostHog distinct ID
  
  // Organização
  organizationId  String?
  
  // Contexto
  url             String?
  referrer       String?
  
  // timestamps
  timestamp       DateTime  @default(now())
  
  // Index para otimização
  @@index([organizationId, timestamp])
  @@index([name, timestamp])
}
```

### 6. Broadcast (Mensagens em Massa)

```prisma
model Broadcast {
  id              String    @id @default(cuid())
  
  // Conteúdo
  title           String
  content         String
  type            BroadcastType @default(INFO)
  
  // Destinatários
  targetAudience  Audience  @default(ALL)
  targetRoles     String[]  // ["owner", "manager"] - opcional
  targetOrganizations String[] // IDs específicos - opcional
  
  // Status
  isSent          Boolean   @default(false)
  sentAt          DateTime?
  scheduledFor   DateTime?
  
  // Resultados
  totalRecipients Int       @default(0)
  deliveredCount Int       @default(0)
  openedCount    Int       @default(0)
  
  // Metadata
  createdBy       String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum BroadcastType {
  INFO
  WARNING
  SUCCESS
  ERROR
  PROMOTION
}

enum Audience {
  ALL
  ORGANIZATION
  ROLE
  PLAN
}
```

### 7. Actualização do Role Enum

Adicionar ao enum existente ou criar novo:

```prisma
enum Role {
  SUPERADMIN
  OWNER
  MANAGER
  BROKER
}
```

## Alterações em Models Existentes

### User - Adicionar campos

```prisma
model User {
  // ... campos existentes ...
  
  // Novos campos
  role              Role        @default(BROKER)
  organizationId    String?
  organization      Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  
  // Status
  isActive          Boolean     @default(true)
  lastLoginAt       DateTime?
  
  // Permissões específicas
  permissions       Json?       // Permissões customizadas por usuário
  
  @@index([organizationId])
}
```

## Índices Recomendados

```prisma
// No modelo Organization
@@index([status])
@@index([createdAt])

// No modelo Subscription
@@index([status])
@@index([organizationId])
@@index([currentPeriodEnd])

// No modelo User
@@index([organizationId])
@@index([role])
```

## Migração Sugerida

1. **Fase 1**: Adicionar Organization, User updates, Role enum
2. **Fase 2**: Adicionar Subscription, Billing
3. **Fase 3**: Adicionar AuditLog, AnalyticsEvent
4. **Fase 4**: Adicionar Broadcast

## Observações

- Todos os timestamps devem usar `DateTime` com timezone
- Valores monetários sempre em centavos (Int)
- Usar Soft Delete onde necessário (campo `deletedAt`)
- Manter compatibilidade com Auth.js v5