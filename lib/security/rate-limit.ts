/**
 * SERVIÇO DE SEGURANÇA - RATE LIMITING
 * Proteção contra brute-force e ataques DoS usando Upstash Redis
 * 
 * Fully lazy initialization: Redis + Ratelimit instances are only
 * created when `checkRateLimit()` is actually invoked at runtime,
 * so the build/static-generation phase never triggers the warning.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Lazy singletons ───────────────────────────────────────────────
let _redis: Redis | null = null;
let _globalRL: Ratelimit | null = null;
let _authRL: Ratelimit | null = null;
let _apiRL: Ratelimit | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // During build / static generation env vars may not be set.
    // Return a dummy instance – it will never be called at build time.
    return new Redis({
      url: url || "https://placeholder.upstash.io",
      token: token || "placeholder",
    });
  }

  _redis = new Redis({ url, token });
  return _redis;
}

/**
 * Rate Limit Global - 100 requisições a cada 10 segundos por IP
 */
export function getGlobalRateLimit(): Ratelimit {
  if (!_globalRL) {
    _globalRL = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(100, "10 s"),
      analytics: true,
      prefix: "@imobweb/ratelimit/global",
    });
  }
  return _globalRL;
}

/**
 * Rate Limit para Roteamento Sensível (Login, Webhooks) - 5 requisições por minuto por IP
 */
export function getAuthRateLimit(): Ratelimit {
  if (!_authRL) {
    _authRL = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "@imobweb/ratelimit/auth",
    });
  }
  return _authRL;
}

/**
 * Rate Limit para API Pública - 1000 requisições por hora por Organization ID
 */
export function getPublicApiRateLimit(): Ratelimit {
  if (!_apiRL) {
    _apiRL = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(1000, "1 h"),
      analytics: true,
      prefix: "@imobweb/ratelimit/api",
    });
  }
  return _apiRL;
}

// Keep backwards-compatible named exports (lazy getters)
export const globalRateLimit = { get limit() { return getGlobalRateLimit().limit.bind(getGlobalRateLimit()); } };
export const authRateLimit   = { get limit() { return getAuthRateLimit().limit.bind(getAuthRateLimit()); } };
export const publicApiRateLimit = { get limit() { return getPublicApiRateLimit().limit.bind(getPublicApiRateLimit()); } };

export async function checkRateLimit(
  identifier: string,
  type: "global" | "auth" | "api" = "global"
) {
  const ratelimit =
    type === "auth" ? getAuthRateLimit() :
    type === "api" ? getPublicApiRateLimit() :
    getGlobalRateLimit();

  return await ratelimit.limit(identifier);
}
