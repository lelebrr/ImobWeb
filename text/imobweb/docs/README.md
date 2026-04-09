# imobWeb - CRM Imobiliário com IA

> Plataforma completa de CRM imobiliário com inteligência artificial avançada, notificações smart e PWA moderno.

## Visão Geral

O **imobWeb** é um sistema de CRM imobiliário moderno construído com Next.js 16, utilizando as mais recentes tecnologias para fornecer uma experiência otimizada para corretores e proprietários de imóveis.

### Tecnologias Principais

- **Framework**: Next.js 16 App Router
- **Linguagem**: TypeScript (strict mode)
- **Estilização**: Tailwind CSS v4 + shadcn/ui
- **Banco de Dados**: Prisma + Supabase
- **Autenticação**: Auth.js v5
- **IA**: Vercel AI SDK
- **Notificações**: In-app + Web Push
- **PWA**: Service Worker com offline support

## Estrutura do Projeto

```
imobWeb/
├── app/
│   ├── (ai)/                    # Rotas de IA avançada
│   │   ├── suggest-price/       # Sugestão de preço
│   │   ├── generate-description/# Geração de descrições
│   │   └── chat-with-owner/     # Chat inteligente
│   ├── api/
│   │   ├── notifications/      # API de notificações
│   │   ├── emails/              # Envio de e-mails
│   │   └── pwa/                # Rotas PWA
│   ├── manifest.json           # Manifesto PWA
│   └── sw.ts                   # Service Worker
├── components/
│   ├── ai/                     # Componentes de IA
│   ├── notifications/          # Componentes de notificação
│   └── pwa/                    # Componentes PWA
├── lib/
│   ├── ai/                     # Lógica de IA
│   ├── notifications/           # Serviço de notificações
│   ├── pwa/                    # Utilitários PWA
│   └── export/                 # Exportação de dados
├── tests/
│   ├── unit/                   # Testes unitários
│   ├── integration/            # Testes de integração
│   └── e2e/                   # Testes E2E
└── docs/                       # Documentação
```

## Funcionalidades

### 🤖 Inteligência Artificial

#### Sugestão de Preço
- Algoritmo inteligente que considera localização, tipo, área, quartos, banheiros, vagas, idade e características especiais
- Retorna preço sugerido, faixa de valores e nível de confiança
- Fatores detalhados que influenciaram o cálculo

#### Geração de Descrições
- Cria descrições em 3 formatos: curto, médio e completo
- Suporta múltiplos tons: formal, informal, persuasivo, técnico, luxo
- Gera tags, highlights e keywords SEO automaticamente

#### Chat Inteligente
- Chatbot para corretores e proprietários
- Detecção de intenção para roteamento automático
- Suporte a contexto de conversas anteriores
-Sugestões contextuais

### 🔔 Sistema de Notificações

- Notificações in-app em tempo real
- Web Push Notifications
- Tipos: novos leads, atualizações de imóvel, lembretes, relatórios
- Preferências personalizáveis por usuário
- Marcação como lido, excluir, filtrar

### 📱 PWA (Progressive Web App)

- Instalável em dispositivos móveis
- Suporte offline para visualização de imóveis e leads
- Cache inteligente de dados
- Indicador de status online/offline
- Atalhos na tela inicial

### 📊 Exportação e Relatórios

- Exportação CSV de imóveis e leads
- Exportação JSON
- Relatórios de performance
- Estatísticas por status e origem

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-repo/imobweb.git

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Execute o desenvolvimento
npm run dev
```

## Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=

# Autenticação
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=

# IA
OPENAI_API_KEY=
```

## Scripts Disponíveis

```bash
npm run dev          # Iniciar desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção
npm run lint         # Verificar código
npm run test         # Testes unitários
npm run test:watch  # Testes em modo watch
npm run test:coverage# Coverage report
npm run test:e2e     # Testes E2E com Playwright
```

## API Reference

### IA - Sugestão de Preço

```bash
POST /api/ai/suggest-price
```

**Body:**
```json
{
  "type": "apartamento",
  "area": 80,
  "location": "Centro de São Paulo",
  "zone": "centro",
  "beds": 2,
  "baths": 1,
  "parking": 1
}
```

### IA - Geração de Descrição

```bash
POST /api/ai/generate-description
```

**Body:**
```json
{
  "location": "Pinheiros",
  "area": 90,
  "propertyType": "apartamento",
  "beds": 2,
  "features": ["piscina", "academia"],
  "tone": "formal"
}
```

### IA - Chat

```bash
POST /api/ai/chat-with-owner
```

**Body:**
```json
{
  "message": "Preciso de ajuda com um imóvel",
  "context": {
    "propertyId": "prop-123",
    "userName": "João"
  }
}
```

### Notificações

```bash
GET /api/notifications?userId=123
POST /api/notifications
PATCH /api/notifications/[id]?userId=123&action=markRead
DELETE /api/notifications/[id]?userId=123
```

## Testes

### Unitários
```bash
npm run test
```

### Integração
```bash
npm run test:integration
```

### E2E
```bash
npm run test:e2e
```

## Contributing

1. Fork o repositório
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

MIT License - lihat o arquivo LICENSE para detalhes.

---

Construído com ❤️ usando Next.js 16 e IA