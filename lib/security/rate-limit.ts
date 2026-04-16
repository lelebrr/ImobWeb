/**
 * SERVIÇO DE SEGURANÇA - RATE LIMITING
 * Proteção contra brute-force e ataques DoS usando Upstash Redis
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configuração do Redis (Variáveis de ambiente obrigatórias)
// Lazy initialization to avoid warnings during build if environment variables are missing
let redisInstance: Redis | null = null;

function getRedis() {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      if (process.env.NODE_ENV === "production") {
        console.warn("[RATE_LIMIT] Missing Upstash Redis environment variables in production!");
      }
      // Return a dummy client or handle as needed. 
      // Most Upstash methods will fail if URL/Token are empty, but we avoid the warning at instantiation.
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
