import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { crypto } from "next/dist/compiled/@edge-runtime/primitives";
import { ApiKeyScope } from "../../types/api";

/**
 * Valida o hash de uma API Key usando Web Crypto para compatibilidade com Edge
 */
async function hashKey(key: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Contexto da API Pública
 */
export interface PublicApiContext {
  organizationId: string;
  scopes: ApiKeyScope[];
  authenticated: boolean;
}

/**
 * Middleware para validar API Key e Scopes
 */
export async function authenticatePublicRequest(apiKey: string | null): Promise<PublicApiContext> {
  if (!apiKey) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "API Key is missing. Provide it in the 'x-api-key' header.",
    });
  }

  const keyHash = await hashKey(apiKey);

  const keyData = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { organization: true },
  });

  if (!keyData || !keyData.enabled) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or disabled API Key.",
    });
  }

  // Atualiza data de último uso (fire and forget)
  prisma.apiKey.update({
    where: { id: keyData.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  // Mapear scopes do banco (JSON) para o type ApiKeyScope
  const scopes = (keyData.scopes as unknown as ApiKeyScope[]) || [];

  return {
    organizationId: keyData.organizationId,
    scopes,
    authenticated: true,
  };
}

/**
 * Verifica se a requisição possui os scopes necessários
 */
export function validateScope(context: PublicApiContext, requiredScope: ApiKeyScope) {
  if (context.scopes.includes("admin")) return true; // Admin tem todos os scopes
  if (!context.scopes.includes(requiredScope)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Required scope missing: ${requiredScope}`,
    });
  }
}
