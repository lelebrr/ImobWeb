/**
 * tRPC Router para a API Pública do imobWeb
 * Permite integrações de terceiros e acesso programático aos dados
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { PrismaClient } from "@prisma/client"
import { z } from 'zod'

const prisma = new PrismaClient()
const t = initTRPC.create()

/**
 * Middleware de Autenticação por API Key
 */
const isPublicAuthorized = t.middleware(async ({ ctx, next }) => {
  // Mock de autenticação via API Key
  // Em produção, buscaria na tabela de integracoes da Organizacao
  const apiKey = "DUMMY_KEY"; // Extrair do header via context no futuro
  
  if (!apiKey) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'API Key Ausente' });
  }

  return next();
});

const publicProcedure = t.procedure.use(isPublicAuthorized);

export const publicApiRouter = t.router({
  // Listagem de Imóveis (Read-only)
  getProperties: publicProcedure
    .input(z.object({
      orgId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      city: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return prisma.property.findMany({
        where: {
          organizationId: input.orgId,
          city: input.city,
          status: "DISPONIVEL"
        },
        take: input.limit,
        include: {
          photos: {
            take: 1
          }
        }
      });
    }),

  // Detalhes do Imóvel
  getPropertyDetails: publicProcedure
    .input(z.object({ propertyId: z.string() }))
    .query(async ({ input }) => {
      return prisma.property.findUnique({
        where: { id: input.propertyId },
        include: { photos: true }
      });
    }),

  // Criação de Lead (Web-to-Lead)
  captureLead: t.procedure // Aberto para site público
    .input(z.object({
      orgId: z.string(),
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      propertyId: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return prisma.lead.create({
        data: {
          organizationId: input.orgId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          propertyId: input.propertyId,
          notes: input.message,
          status: "NOVO",
          source: "WEBSITE"
        }
      });
    }),
});

export type PublicApiRouter = typeof publicApiRouter;
