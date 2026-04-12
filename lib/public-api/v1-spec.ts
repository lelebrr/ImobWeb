/**
 * ESPECIFICAÇÃO DA PUBLIC API v1 - imobWeb
 * 2026 - Padrão OpenAPI / Swagger
 */

export const apiV1Spec = {
  openapi: "3.1.0",
  info: {
    title: "imobWeb Public API",
    version: "1.0.0",
    description: "API de integração enterprise para portais e CRM de terceiros.",
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-KEY",
      },
    },
    schemas: {
      Property: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          price: { type: "number" },
          neighborhood: { type: "string" },
          city: { type: "string" },
          status: { type: "string", enum: ["DISPONIVEL", "VENDIDO", "LOCADO"] },
        },
      },
      Lead: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          interest: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/properties": {
      get: {
        summary: "Lista todos os imóveis da organização",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          "200": {
            description: "Lista de imóveis",
            content: {
              "application/json": {
                schema: { 
                  type: "array", 
                  items: { $ref: "#/components/schemas/Property" } 
                },
              },
            },
          },
        },
      },
    },
    "/leads": {
      post: {
        summary: "Cria um novo lead via integração externa",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Lead" },
            },
          },
        },
        responses: {
          "201": { description: "Lead criado com sucesso" },
        },
      },
    },
  },
};
