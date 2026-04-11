import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/public-api/api-key-service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

const prisma = new PrismaClient();

/**
 * LISTAGEM DE IMÓVEIS - PUBLIC API v1
 * 2026 - Padrão Enterprise imobWeb
 */

export async function GET(request: Request) {
  const apiKey = request.headers.get("X-API-KEY");

  if (!apiKey) {
    return NextResponse.json({ error: "API Key ausente" }, { status: 401 });
  }

  try {
    // 1. Validar Chave e Identificar Organização
    const organization = await validateApiKey(apiKey);
    if (!organization) {
      return NextResponse.json({ error: "API Key inválida ou inativa" }, { status: 403 });
    }

    // 2. Aplicar Rate Limit Específico da API Key
    const { success } = await checkRateLimit(organization.id, "api");
    if (!success) {
      return NextResponse.json({ error: "Limite de requisições excedido" }, { status: 429 });
    }

    // 3. Buscar Dados (Filtrados por Organização)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    
    const properties = await prisma.property.findMany({
      where: { organizationId: organization.id },
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        city: true,
        status: true,
        photos: true,
      }
    });

    // 4. Log de Telemetria Sentry
    Sentry.captureMessage(`API_ACCESS: ${organization.name}`, {
      level: "info",
      extra: { organizationId: organization.id, endpoint: "v1/properties" }
    });

    return NextResponse.json({
      data: properties,
      meta: {
        count: properties.length,
        organization: organization.name,
      }
    });

  } catch (error) {
    Sentry.captureException(error);
    console.error("[PUBLIC_API_ERROR]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
