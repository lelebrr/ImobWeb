/**
 * tRPC Router para a API Pública do imobWeb
 * Permite integrações de terceiros e acesso programático aos dados
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hash } from '@/lib/security/encryption'

const t = initTRPC.create()

/**
 * Middleware de Autenticação por API Key
 * Valida a chave de API contra o banco de dados usando hash SHA-256
 */
const isPublicAuthorized = t.middleware(async ({ ctx, next }) => {
  const apiKeyHeader = (ctx as any)?.headers?.get?.("x-api-key") || (ctx as any)?.req?.headers?.get?.("x-api-key")

  if (!apiKeyHeader) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'API Key Ausente' });
  }

  const keyHash = hash(apiKeyHeader)

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { organization: true }
  })

  if (!apiKeyRecord || !apiKeyRecord.enabled) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'API Key inválida ou desativada' });
  }

  // Update lastUsedAt
  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() }
  })

  return next({
    ctx: {
      ...ctx,
      organizationId: apiKeyRecord.organizationId,
      apiKeyScopes: apiKeyRecord.scopes,
    }
  });
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
