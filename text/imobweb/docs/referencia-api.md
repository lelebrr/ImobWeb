# 🔗 API Reference: Integrando com a imobWeb

Toda a inteligência da **imobWeb** está disponível via API para que você possa integrar com seus próprios sistemas, apps ou sites customizados.

## 🔑 Autenticação
Atualmente, usamos o **NextAuth.js** para sessões web. Para acessos via API Externa, utilize o cabeçalho `x-api-key` (Configure em `Configurações > Desenvolvedor`).

---

## 🤖 Endpoints de IA (imobEngine)

### 1. Sugestão de Preço
`POST /api/ai/suggest-price`
Retorna uma estimativa de valor para o imóvel.

**Corpo da Requisição:**
```json
{
  "type": "apartamento",
  "area": 85,
  "location": "Jardins, São Paulo",
  "beds": 3,
  "baths": 2
}
```

---

### 2. Geração de Descrição
`POST /api/ai/generate-description`
Cria textos de anúncio otimizados.

**Corpo da Requisição:**
```json
{
  "propertyId": "prop-123",
  "tone": "luxo",
  "language": "pt-BR"
}
```

---

## 🏠 Endpoints de Imóveis

### Listar Imóveis
`GET /api/properties`
Filtre e busque imóveis da sua conta.

**Parâmetros:**
- `status`: (active, sold, pending)
- `minPrice`: Valor mínimo
- `limit`: Quantidade de resultados

---

## 💬 Integração WhatsApp
`POST /api/webhooks/whatsapp`
Nosso endpoint de recebimento de mensagens da Meta. Se você criar um app próprio, você deve configurar este URL nas configurações do Facebook Developers.

---

### 💡 Dica para Desenvolvedores
Usamos **tRPC** internamente para garantir que o Frontend e o Backend falem a mesma língua (TypeScript). Se você estiver usando React, nossas bibliotecas de hooks facilitam muito o consumo desses dados.

---
*Para ver a especificação completa em OpenAPI, acesse o endpoint `/api/docs` no seu servidor rodando localmente.*
