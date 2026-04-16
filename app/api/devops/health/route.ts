import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Lazy-init Redis to avoid build-time crash when env vars are missing.
 */
async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  });
}

/**
 * ENDPOINT DE HEALTH CHECK ENTERPRISE
 * 2026 - Monitoramento completo de infraestrutura e dependências
 */
export async function GET() {
  const startTime = Date.now();
  
  const status = {
    database: "unknown",
    redis: "unknown",
    whatsapp_api: "unknown",
    stripe: "unknown",
  };

  try {
    // 1. Check Database (Prisma)
    const dbPromise = prisma.$queryRaw`SELECT 1`
      .then(() => { status.database = "healthy"; })
      .catch(() => { status.database = "unhealthy"; });
    
    // 2. Check Redis (Upstash) - only if configured
    let redisPromise: Promise<void> = Promise.resolve();
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = await getRedis();
      redisPromise = redis.ping()
        .then(() => { status.redis = "healthy"; })
        .catch(() => { status.redis = "unhealthy"; });
    } else {
      status.redis = "not_configured";
    }

    // 3. Check WhatsApp API
    status.whatsapp_api = process.env.WHATSAPP_VERIFY_TOKEN ? "connected" : "not_configured";

    // 4. Check Stripe
    status.stripe = process.env.STRIPE_SECRET_KEY ? "healthy" : "not_configured";

    await Promise.all([dbPromise, redisPromise]);

    const duration = Date.now() - startTime;
    const isHealthy = status.database === "healthy";

    return NextResponse.json({
      status: isHealthy ? "healthy" : "partially_healthy",
      timestamp: new Date().toISOString(),
      latency: `${duration}ms`,
      uptime: process.uptime(),
      version: "2.0.0-phase2",
      dependencies: status,
      system: {
        memory: process.memoryUsage(),
        platform: process.platform,
      }
    }, { 
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      }
    });

  } catch (error) {
    console.error("[CRITICAL_HEALTH_FAILURE]", error);
    
    return NextResponse.json({
      status: "down",
      timestamp: new Date().toISOString(),
      error: "Critical system failure",
    }, { status: 500 });
  }
}
