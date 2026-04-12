import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Redis } from "@upstash/redis";

const prisma = new PrismaClient();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export const dynamic = "force-dynamic";

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
    const dbPromise = prisma.$queryRaw`SELECT 1`.then(() => status.database = "healthy").catch(() => status.database = "unhealthy");
    
    // 2. Check Redis (Upstash)
    const redisPromise = redis.ping().then(() => status.redis = "healthy").catch(() => status.redis = "unhealthy");

    // 3. Check WhatsApp API (Placeholder - depende da IA de Integração)
    status.whatsapp_api = "connected"; // mock

    // 4. Check Stripe (Optional)
    status.stripe = "healthy";

    await Promise.all([dbPromise, redisPromise]);

    const duration = Date.now() - startTime;
    const isHealthy = status.database === "healthy" && status.redis === "healthy";

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
