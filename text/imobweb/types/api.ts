import { z } from "zod";

/**
 * Zod Schemas para a API Pública do imobWeb
 * Estes esquemas são usados para validação de entrada/saída e geração de OpenAPI
 */

// --- Imóveis (Properties) ---

export const PropertyStatusSchema = z.enum([
  "DISPONIVEL",
  "VENDIDO",
  "ALUGADO",
  "SUSPENSO",
  "EM_NEGOCIACAO",
]);

export const PropertyTypeSchema = z.enum([
  "APARTAMENTO",
  "CASA",
  "TERRENO",
  "COMERCIAL",
  "LOJA",
  "GALPAO",
  "CHACARA",
]);

export const PublicPropertySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number(),
  type: PropertyTypeSchema,
  status: PropertyStatusSchema,
  city: z.string(),
  neighborhood: z.string(),
  state: z.string().length(2),
  area: z.number(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  parking: z.number().int().min(0),
  features: z.array(z.string()),
  photos: z.array(z.string().url()),
  updatedAt: z.string().datetime(),
});

export const CreatePropertySchema = PublicPropertySchema.omit({
  id: true,
  updatedAt: true,
});

// --- Leads ---

export const LeadStatusSchema = z.enum([
  "NOVO",
  "EM_ATENDIMENTO",
  "QUALIFICADO",
  "DESQUALIFICADO",
  "CONVERTIDO",
]);

export const PublicLeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  propertyId: z.string().uuid().optional(),
  source: z.string(),
  status: LeadStatusSchema,
  createdAt: z.string().datetime(),
});

export const CaptureLeadSchema = PublicLeadSchema.pick({
  name: true,
  email: true,
  phone: true,
  propertyId: true,
  source: true,
});

// --- WhatsApp ---

export const SendMessageSchema = z.object({
  to: z.string().regex(/^\d{10,15}$/), // Formato internacional
  message: z.string().min(1).max(2000),
  templateId: z.string().optional(),
});

// --- API Security ---

export const ApiKeyScopeSchema = z.enum([
  "properties:read",
  "properties:write",
  "leads:read",
  "leads:write",
  "whatsapp:send",
  "webhooks:manage",
  "admin",
]);

export type Property = z.infer<typeof PublicPropertySchema>;
export type Lead = z.infer<typeof PublicLeadSchema>;
export type ApiKeyScope = z.infer<typeof ApiKeyScopeSchema>;
