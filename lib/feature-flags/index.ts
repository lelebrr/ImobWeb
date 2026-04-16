/**
 * SERVIÇO DE FEATURE FLAGS - imobWeb
 * 2026 - Controle dinâmico de funcionalidades e A/B Testing
 */

import { Redis } from "@upstash/redis";

// Lazy initialization for Redis to avoid warnings during build
let redisInstance: Redis | null = null;

function getRedis() {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      // In build/dev without env vars, return a dummy client that fails gracefully
      return new Redis({
        url: url || "https://dummy-url.upstash.io",
        token: token || "dummy",
      });
    }

    redisInstance = new Redis({ url, token });
  }
  return redisInstance;
}

const redis = getRedis();

export type FlagType = "release" | "experiment" | "operational" | "permission";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  type: FlagType;
  organizationIds?: string[]; // Targeting por organização
  percentage?: number; // Rollout progressivo (0-100)
  description?: string;
}

/**
 * Verifica se uma feature flag está ativa para um contexto específico.
 */
export async function isFeatureEnabled(
  flagKey: string,
  context?: { organizationId?: string; userId?: string }
): Promise<boolean> {
  try {
    const flag = await redis.get<FeatureFlag>(`@imobweb/flags/${flagKey}`);
    
    if (!flag) return false;
    if (!flag.enabled) return false;

    // 1. Verificação por Organização (Whitelisting)
    if (flag.organizationIds && flag.organizationIds.length > 0) {
      if (!context?.organizationId || !flag.organizationIds.includes(context.organizationId)) {
        return false;
      }
    }

    // 2. Rollout Progressivo (Baseado em ID determinístico)
    if (flag.percentage !== undefined && flag.percentage < 100) {
      if (!context?.organizationId) return false; // Sem contexto, desabilita para segurança
      
      const hash = await getDeterministicHash(context.organizationId + flagKey);
      if (hash > flag.percentage) return false;
    }

    return true;
  } catch (error) {
    console.error(`[FEATURE_FLAG_ERROR] Key: ${flagKey}`, error);
    return false; // Fail-safe: feature desabilitada em caso de erro
  }
}

/**
 * Gera um número de 1-100 baseado em uma string de forma determinística.
 */
async function getDeterministicHash(input: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashInt = hashArray[0]; // Pega o primeiro byte (0-255)
  return (hashInt % 100) + 1;
}

/**
 * Atalhos para flags críticas de 2026
 */
export const Flags = {
  WHITE_LABEL: "white-label-v2",
  AI_PRICE_SUGGESTION: "ai-price-suggestion",
  WHATSAPP_BULK_MESSAGING: "whatsapp-bulk-v2",
  ADVANCED_ANALYTICS: "advanced-analytics-soc2",
};
