# API Reference - imobWeb

Documentação completa das APIs do imobWeb.

---

## Índice

1. [IA - Sugestão de Preço](#ia---sugestão-de-preço)
2. [IA - Geração de Descrição](#ia---geração-de-descrição)
3. [IA - Chat com Proprietário](#ia---chat-com-proprietário)
4. [Notificações](#notificações)
5. [Exportação](#exportação)

---

## IA - Sugestão de Preço

### POST /api/ai/suggest-price

Sugere um preço para imóvel baseado em suas características.

#### Request

```bash
POST /api/ai/suggest-price
Content-Type: application/json
```

```json
{
  "type": "apartamento",
  "area": 80,
  "location": "Centro de São Paulo",
  "zone": "centro",
  "beds": 2,
  "baths": 1,
  "parking": 1,
  "age": 5,
  "features": ["piscina", "academia"],
  "floor": 5,
  "hasElevator": true
}
```

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|------------|
| type | string | ✅ | Tipo do imóvel: apartamento, casa, terreno, comercial, salas, galpão, loja, outro |
| area | number | ✅ | Área em metros quadrados (1-10000) |
| location | string | ✅ | Localização/bairro (2-200 caracteres) |
| zone | string | ❌ | Zona: centro, zona-norte, zona-sul, zona-leste, zona-oeste, periferia, litoral, interior |
| beds | number | ❌ | Número de quartos (0-20) |
| baths | number | ❌ | Número de banheiros (0-10) |
| parking | number | ❌ | Número de vagas (0-5) |
| age | number | ❌ | Idade do imóvel em anos (0-200) |
| features | string[] | ❌ | Características especiais |
| floor | number | ❌ | Andar do apartamento |
| hasElevator | boolean | ❌ | Se possui elevador |

#### Response

```json
{
  "success": true,
  "data": {
    "suggestedPrice": 336000,
    "formattedPrice": "R$ 336.000",
    "range": {
      "min": 302400,
      "max": 369600,
      "formattedMin": "R$ 302.400",
      "formattedMax": "R$ 369.600"
    },
    "pricePerSqm": 4200,
    "formattedPricePerSqm": "R$ 4.200",
    "confidence": 0.85,
    "confidenceLevel": "Alto",
    "factors": [
      {
        "name": "Localização",
        "impact": 1.35,
        "description": "Fator baseado na zona: centro"
      }
    ],
    "marketData": {
      "avgPricePerSqm": 3990,
      "propertiesAnalyzed": 342,
      "avgDaysOnMarket": 45,
      "trend": "stable"
    }
  }
}
```

#### Exemplos

**cURL:**
```bash
curl -X POST http://localhost:3000/api/ai/suggest-price \
  -H "Content-Type: application/json" \
  -d '{"type":"apartamento","area":80,"location":"Centro"}'
```

**JavaScript:**
```javascript
const response = await fetch('/api/ai/suggest-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'apartamento',
    area: 80,
    location: 'Centro'
  })
});
const data = await response.json();
```

---

## IA - Geração de Descrição

### POST /api/ai/generate-description

Gera descrições otimizadas para imóveis.

#### Request

```bash
POST /api/ai/generate-description
Content-Type: application/json
```

```json
{
  "title": "Apartamento Moderno",
  "location": "Pinheiros, São Paulo",
  "area": 90,
  "propertyType": "apartamento",
  "beds": 2,
  "baths": 2,
  "parking": 1,
  "features": ["piscina", "academia", "varanda"],
  "highlight": "Vista panorâmica",
  "targetAudience": "família",
  "tone": "formal"
}
```

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|------------|
| title | string | ❌ | Título opcional |
| location | string | ✅ | Localização/bairro |
| area | number | ✅ | Área em m² |
| propertyType | string | ❌ | Tipo: apartamento, casa, terreno, comercial, salas, galpão, loja, outro |
| beds | number | ❌ | Quartos |
| baths | number | ❌ | Banheiros |
| parking | number | ❌ | Vagas |
| floor | number | ❌ | Andar |
| totalFloors | number | ❌ | Total de andares |
| age | number | ❌ | Idade do imóvel |
| features | string[] | ❌ | Características |
| highlight | string | ❌ | Destaque especial |
| targetAudience | string | ❌ | Público: família, jovem, idoso, investidor, corporativo, todos |
| tone | string | ❌ | Tom: formal, informal, persuasivo, técnico, luxo |

#### Response

```json
{
  "success": true,
  "data": {
    "descriptions": {
      "short": "Apartamento 2 quartos c/ 2 banheiros 90m² 1 vaga em Pinheiros, São Paulo",
      "medium": "✨ Apartamento com 90m²\n🛏️ 2 quartos\n🚿 2 banheiros\n🚗 1 vaga de garagem\n📍 Pinheiros, São Paulo\n\n⭐ Vista panorâmica",
      "full": "Apresentamos este belíssimo apartamento localizado em Pinheiros, São Paulo. 2 quartos, 2 banheiros, 1 vaga, 90m² de área. Destaque: Vista panorâmica.\n\n✅ Características e Comodidades:\n• Piscina climatizada\n• Academia completa\n• Varanda gourmet\n\n📍 Localização:\n• Bairro tranquilo e arborizado\n• Próximo a escolas e áreas de lazer\n• Boa infraestrutura local\n\nAgende uma visita e conheça este apartamento."
    },
    "variations": ["..."],
    "tags": ["apartamento", "Pinheiros", "São Paulo", "2-quartos", "90m2"],
    "highlights": ["Vista panorâmica"],
    "seoKeywords": ["apartamento Pinheiros", "apartamento à venda", "imóvel Pinheiros"]
  }
}
```

---

## IA - Chat com Proprietário

### POST /api/ai/chat-with-owner

Chat inteligente para corretores e proprietários.

#### Request

```bash
POST /api/ai/chat-with-owner
Content-Type: application/json
```

```json
{
  "message": "Preciso de ajuda para criar um anúncio",
  "context": {
    "propertyId": "prop-123",
    "propertyTitle": "Apartamento Legal",
    "propertyAddress": "Rua Example, 123",
    "ownerName": "João Silva",
    "userName": "Corretor Maria",
    "previousMessages": [
      { "role": "user", "content": "Olá" },
      { "role": "assistant", "content": "Olá! Como posso ajudar?" }
    ]
  },
  "action": "chat"
}
```

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|------------|
| message | string | ✅ | Mensagem do usuário (1-2000 caracteres) |
| context | object | ❌ | Contexto da conversa |
| context.propertyId | string | ❌ | ID do imóvel |
| context.propertyTitle | string | ❌ | Título do imóvel |
| context.propertyAddress | string | ❌ | Endereço |
| context.ownerName | string | ❌ | Nome do proprietário |
| context.ownerPhone | string | ❌ | Telefone do proprietário |
| context.previousMessages | Message[] | ❌ | Histórico de mensagens |
| context.userName | string | ❌ | Nome do usuário |
| context.userId | string | ❌ | ID do usuário |
| action | string | ❌ | Ação: chat, suggest_price, generate_description, qualify_lead, schedule_visit |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Vou criar uma descrição exclusiva para o imóvel! Me passe os detalhes que você gostaria de destacar.",
    "action": "generate_description",
    "data": {},
    "suggestions": [
      "Tipo de imóvel",
      "Localização",
      "Área",
      "Número de quartos/banheiros",
      "Características especiais"
    ],
    "nextSteps": [
      "Coletar características",
      "Gerar descrição",
      "Oferecer variações"
    ]
  }
}
```

---

## Notificações

### GET /api/notifications

Lista notificações do usuário.

#### Request

```bash
GET /api/notifications?userId=123&limit=20&offset=0&unreadOnly=false
```

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|------------|
| userId | string | ✅ | ID do usuário |
| limit | number | ❌ | Limite de resultados (padrão: 20) |
| offset | number | ❌ | Offset para paginação |
| unreadOnly | boolean | ❌ | Mostrar apenas não lidas |

#### Response

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-123",
        "userId": "123",
        "type": "new_lead",
        "title": "Novo Lead! 🚀",
        "body": "Você recebeu um novo lead.",
        "data": {},
        "priority": "normal",
        "read": false,
        "createdAt": 1699999999999,
        "formattedTime": "5 minutos atrás",
        "icon": "👤",
        "actionUrl": "/leads/456"
      }
    ],
    "unreadCount": 5,
    "hasMore": true
  }
}
```

### POST /api/notifications

Cria uma nova notificação.

#### Request

```bash
POST /api/notifications
Content-Type: application/json
```

```json
{
  "userId": "123",
  "type": "new_lead",
  "title": "Novo Lead!",
  "body": "Você recebeu um novo lead",
  "data": { "leadId": "456" },
  "priority": "normal",
  "channels": ["in_app", "push"],
  "sendPush": true,
  "sendEmail": false
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "notif-789",
    "userId": "123",
    "type": "new_lead",
    "title": "Novo Lead!",
    "body": "Você recebeu um novo lead",
    "priority": "normal",
    "read": false,
    "createdAt": 1699999999999,
    "channels": ["in_app"]
  }
}, "status": 201
```

### PATCH /api/notifications/[id]

Atualiza uma notificação.

#### Request

```bash
PATCH /api/notifications/notif-123?userId=123
Content-Type: application/json
```

```json
{
  "action": "markRead"
}
```

### DELETE /api/notifications/[id]

Exclui uma notificação.

```bash
DELETE /api/notifications/notif-123?userId=123
```

---

## Códigos de Erro

| Código | Descrição |
|--------|------------|
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 404 | Recurso não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

### Formato de Erro

```json
{
  "error": "Mensagem de erro",
  "details": [
    { "field": "email", "message": "Email inválido" }
  ]
}
```

---

## Rate Limiting

- **IA APIs**: 100 requisições por minuto por IP
- **Notificações**: 200 requisições por minuto por usuário

---

## Versão da API

A versão atual é **v1**. Todas as APIs estão em `/api/`.

---

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.