/**
 * SERVIÇO DE SEGURANÇA - RATE LIMITING
 * Proteção contra brute-force e ataques DoS usando Upstash Redis
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configuração do Redis (Variáveis de ambiente obrigatórias)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Rate Limit Global - 100 requisições a cada 10 segundos por IP
 */
export const globalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "10 s"),
  analytics: true,
  prefix: "@imobweb/ratelimit/global",
});

/**
 * Rate Limit para Roteamento Sensível (Login, Webhooks) - 5 requisições por minuto por IP
 */
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@imobweb/ratelimit/auth",
});

/**
 * Rate Limit para API Pública - 1000 requisições por hora por Organization ID
 */
export const publicApiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, "1 h"),
  analytics: true,
  prefix: "@imobweb/ratelimit/api",
});

export async function checkRateLimit(
  identifier: string,
  type: "global" | "auth" | "api" = "global"
) {
  const ratelimit = 
    type === "auth" ? authRateLimit : 
    type === "api" ? publicApiRateLimit : 
    globalRateLimit;

  return await ratelimit.limit(identifier);
}
