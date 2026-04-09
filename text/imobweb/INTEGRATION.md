# imobWeb - Integração IA Avançada

## Arquivos Criados por Esta IA (IA 3)

Esta pasta contém todos os arquivos desenvolvidos pela IA 3 para o projeto imobWeb.

### Estrutura

```
text/imobweb/
├── manifest.json           # Manifesto PWA
├── sw.ts                   # Service Worker
├── public/
│   ├── offline.html        # Página offline
│   └── icons/              # Ícones PWA (SVG)
├── app/
│   ├── ai/                 # APIs de IA Avançada
│   │   ├── suggest-price/
│   │   ├── generate-description/
│   │   └── chat-with-owner/
│   └── api/
│       └── notifications/  # API de Notificações
├── components/
│   ├── pwa/                # Componentes PWA
│   └── notifications/     # Componentes de Notificação
├── lib/
│   ├── ai/                 # Lógica de IA
│   ├── notifications/     # Serviço de Notificações
│   ├── pwa/               # Utilitários PWA
│   └── export/            # Exportação de Dados
├── tests/
│   ├── unit/              # Testes Unitários
│   ├── integration/       # Testes de Integração
│   └── e2e/              # Testes E2E (Playwright)
├── docs/                  # Documentação
├── i18n/                  # Internacionalização
├── vitest.config.ts       # Configuração Vitest
└── playwright.config.ts   # Configuração Playwright
```

---

## Como Fazer o Merge

### Passo 1: Copiar Arquivos para o Projeto Principal

**Windows (PowerShell):**
```powershell
# Copiar APIs de IA
Copy-Item -Path "text/imobweb/app/ai" -Destination "app/" -Recurse

# Copiar APIs de Notificações  
Copy-Item -Path "text/imobweb/app/api/notifications" -Destination "app/api/" -Recurse

# Copiar Components
Copy-Item -Path "text/imobweb/components/pwa" -Destination "components/" -Recurse

# Copiar Libs
Copy-Item -Path "text/imobweb/lib/ai" -Destination "lib/" -Recurse
Copy-Item -Path "text/imobweb/lib/notifications" -Destination "lib/" -Recurse
Copy-Item -Path "text/imobweb/lib/pwa" -Destination "lib/" -Recurse
Copy-Item -Path "text/imobweb/lib/export" -Destination "lib/" -Recurse

# Copiar Tests
Copy-Item -Path "text/imobweb/tests" -Destination "." -Recurse

# Copiar Docs
Copy-Item -Path "text/imobweb/docs" -Destination "." -Recurse

# Copiar i18n
Copy-Item -Path "text/imobweb/i18n" -Destination "." -Recurse

# Copiar arquivos raiz
Copy-Item -Path "text/imobweb/manifest.json" -Destination "public/"
Copy-Item -Path "text/imobweb/sw.ts" -Destination "public/sw.js" # Renomear
Copy-Item -Path "text/imobweb/public/offline.html" -Destination "public/"
Copy-Item -Path "text/imobweb/public/icons" -Destination "public/" -Recurse
```

**Linux/Mac (bash):**
```bash
# Copiar APIs
cp -r text/imobweb/app/ai app/
cp -r text/imobweb/app/api/notifications app/api/

# Copiar Components
cp -r text/imobweb/components/pwa components/
cp -r text/imobweb/components/notifications components/

# Copiar Libs
cp -r text/imobweb/lib/ai lib/
cp -r text/imobweb/lib/notifications lib/
cp -r text/imobweb/lib/pwa lib/
cp -r text/imobweb/lib/export lib/

# Copiar Tests e Docs
cp -r text/imobweb/tests .
cp -r text/imobweb/docs .
cp -r text/imobweb/i18n .

# Copiar arquivos raiz
cp text/imobweb/manifest.json public/
cp text/imobweb/sw.ts public/sw.js
cp -r text/imobweb/public/* public/
```

### Passo 2: Atualizar package.json

Adicione os scripts de teste:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Adicione dependências de desenvolvimento:

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### Passo 3: Configurar next.config.mjs

Adicione configurações PWA:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
```

### Passo 4: Verificar Funcionamento

```bash
# Instalar dependências
npm install

# Rodar desenvolvimento
npm run dev

# Rodar testes
npm run test
npm run test:e2e
```

### Passo 5: Verificar APIs

```bash
# Testar Suggest Price
curl -X POST http://localhost:3000/api/ai/suggest-price \
  -H "Content-Type: application/json" \
  -d '{"type":"apartamento","area":80,"location":"Centro"}'

# Testar Generate Description  
curl -X POST http://localhost:3000/api/ai/generate-description \
  -H "Content-Type: application/json" \
  -d '{"location":"Centro","area":80}'

# Testar Chat
curl -X POST http://localhost:3000/api/ai/chat-with-owner \
  -H "Content-Type: application/json" \
  -d '{"message":"Olá"}'

# Testar Notificações
curl http://localhost:3000/api/notifications?userId=test
```

---

## Funcionalidades Incluídas

### 🤖 Inteligência Artificial
- Sugestão de preço com fatores detalhados
- Geração de descrições em múltiplos tons
- Chatbot inteligente com detecção de intenção

### 📱 PWA
- Manifesto com atalhos
- Service Worker com cache offline
- Página offline elegante
- Indicador de status online/offline

### 🔔 Notificações
- API REST completa
- Tipos de notificação variados
- Preferências personalizáveis

### 📊 Export
- CSV de imóveis
- CSV de leads
- Transformações de dados

### 🧪 Testes
- Unitários (Vitest)
- E2E (Playwright)
- Coverage configurado

### 📚 Documentação
- README completo
- Setup guide detalhado
- API reference
- User guide
- Merge guide

### 🌎 i18n
- Traduções completas em pt-BR
- Estrutura pronta para expansão

---

## Variáveis de Ambiente Necessárias

```env
# Para testes de IA (opcional)
OPENAI_API_KEY=sk-...

# Para notificações push (opcional)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

---

## Suporte

Para dúvidas sobre a integração:
- Ver docs/MERGE_GUIDE.md para detalhes
- Ver docs/SETUP.md para configuração
- Ver docs/API.md para referência

---

**Pronto para uso! 🚀**