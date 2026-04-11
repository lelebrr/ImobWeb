import { initTRPC } from "@trpc/server";
import { PrismaClient } from "@prisma/client";
import { 
  PublicPropertySchema, 
  CreatePropertySchema, 
  CaptureLeadSchema, 
  PublicLeadSchema,
  SendMessageSchema,
} from "../../types/api";
import { authenticatePublicRequest, validateScope, PublicApiContext } from "./auth";
import { z } from "zod";

/**
 * tRPC v11 Router para a API Pública do imobWeb
 */

const prisma = new PrismaClient();

const t = initTRPC.context<PublicApiContext>().create();

/**
 * Procedures Base
 */
const publicProcedure = t.procedure;
const authenticatedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.authenticated) {
    throw new Error("UNAUTHORIZED");
  }
  return next();
});

export const publicApiRouter = t.router({
  // --- IMÓVEIS (PROPERTIES) ---

  /**
   * Listar Imóveis
   */
  getProperties: authenticatedProcedure
    .meta({ openapi: { method: 'GET', path: '/properties', tags: ['Properties'] } })
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().default(0),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
    }))
    .output(z.array(PublicPropertySchema))
    .query(async ({ input, ctx }) => {
      validateScope(ctx, "properties:read");
      
      const properties = await prisma.property.findMany({
        where: {
          organizationId: ctx.organizationId,
          price: {
            gte: input.minPrice,
            lte: input.maxPrice,
          },
        },
        take: input.limit,
        skip: input.offset,
        orderBy: { updatedAt: 'desc' },
      });

      return properties as any[];
    }),

  /**
   * Criar Imóvel
   */
  createProperty: authenticatedProcedure
    .meta({ openapi: { method: 'POST', path: '/properties', tags: ['Properties'] } })
    .input(CreatePropertySchema)
    .output(PublicPropertySchema)
    .mutation(async ({ input, ctx }) => {
      validateScope(ctx, "properties:write");

      const property = await prisma.property.create({
        data: {
          ...input,
          organizationId: ctx.organizationId,
        },
      });

      return property as any;
    }),

  /**
   * Detalhes de um Imóvel
   */
  getProperty: authenticatedProcedure
    .meta({ openapi: { method: 'GET', path: '/properties/{id}', tags: ['Properties'] } })
    .input(z.object({ id: z.string().uuid() }))
    .output(PublicPropertySchema)
    .query(async ({ input, ctx }) => {
      validateScope(ctx, "properties:read");

      const property = await prisma.property.findUnique({
        where: { 
          id: input.id,
          organizationId: ctx.organizationId
        },
      });

      if (!property) throw new Error("NOT_FOUND");
      return property as any;
    }),

  /**
   * Atualizar Imóvel
   */
  updateProperty: authenticatedProcedure
    .meta({ openapi: { method: 'PATCH', path: '/properties/{id}', tags: ['Properties'] } })
    .input(z.object({
      id: z.string().uuid(),
      data: CreatePropertySchema.partial()
    }))
    .output(PublicPropertySchema)
    .mutation(async ({ input, ctx }) => {
      validateScope(ctx, "properties:write");

      const property = await prisma.property.update({
        where: { 
          id: input.id,
          organizationId: ctx.organizationId
        },
        data: input.data,
      });

      return property as any;
    }),

  // --- LEADS ---

  /**
   * Capturar Lead (Web-to-Lead)
   */
  captureLead: authenticatedProcedure
    .meta({ openapi: { method: 'POST', path: '/leads', tags: ['Leads'] } })
    .input(CaptureLeadSchema)
    .output(PublicLeadSchema)
    .mutation(async ({ input, ctx }) => {
      validateScope(ctx, "leads:write");

      const lead = await prisma.lead.create({
        data: {
          ...input,
          organizationId: ctx.organizationId,
          status: "NOVO"
        },
      });

      return lead as any;
    }),

  /**
   * Listar Leads
   */
  getLeads: authenticatedProcedure
    .meta({ openapi: { method: 'GET', path: '/leads', tags: ['Leads'] } })
    .input(z.object({ limit: z.number().default(50) }))
    .output(z.array(PublicLeadSchema))
    .query(async ({ input, ctx }) => {
      validateScope(ctx, "leads:read");

      return prisma.lead.findMany({
        where: { organizationId: ctx.organizationId },
        take: input.limit,
        orderBy: { createdAt: 'desc' }
      }) as any;
    }),

  // --- WHATSAPP ---

  /**
   * Enviar Mensagem WhatsApp
   */
  sendWhatsApp: authenticatedProcedure
    .meta({ openapi: { method: 'POST', path: '/whatsapp/send', tags: ['WhatsApp'] } })
    .input(SendMessageSchema)
    .output(z.object({ success: z.boolean(), messageId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      validateScope(ctx, "whatsapp:send");

      // Integração com o serviço de WhatsApp existente (mockado aqui por segurança de escopo)
      console.log(`Enviando WhatsApp para ${input.to} via Org ${ctx.organizationId}`);
      
      return { success: true, messageId: `msg_${Math.random().toString(36).substr(2, 9)}` };
    }),

  // --- STATUS DE ANÚNCIOS ---

  /**
   * Consultar Status de Publicação nos Portais
   */
  getPortalStatus: authenticatedProcedure
    .meta({ openapi: { method: 'GET', path: '/properties/{id}/portal-status', tags: ['Properties'] } })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.array(z.object({
      portal: z.string(),
      status: z.enum(['SYNCED', 'PENDING', 'ERROR']),
      lastSync: z.string().datetime().optional(),
      error: z.string().optional()
    })))
    .query(async ({ input, ctx }) => {
      validateScope(ctx, "properties:read");

      // Mock de status de portais (baseado na estrutura XML VRSync do projeto)
      return [
        { portal: "Zap Imóveis", status: "SYNCED", lastSync: new Date().toISOString() },
        { portal: "Viva Real", status: "SYNCED", lastSync: new Date().toISOString() },
        { portal: "OLX", status: "ERROR", error: "Missing required photo metadata" }
      ];
    }),
});

export type PublicApiRouter = typeof publicApiRouter;
