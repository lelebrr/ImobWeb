/**
 * Publication API - ImobWeb 2026
 * Endpoints para publicação em múltiplos portais
 */

import { NextRequest, NextResponse } from "next/server";
import { publicationEngine } from "@/lib/publication/publication-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      propertyId,
      packageId,
      field,
      forceSync,
      forceRepublish,
      customPortals,
    } = body;

    if (action === "publish" && propertyId && packageId) {
      const publication = await publicationEngine.publish({
        propertyId,
        packageId,
        forceRepublish,
        customPortals,
      });

      return NextResponse.json({
        success: publication.status === "PUBLISHED",
        publication,
      });
    }

    if (action === "sync" && propertyId) {
      const result = await publicationEngine.sync({
        propertyId,
        field: field || "ALL",
        forceSync,
      });

      return NextResponse.json(result);
    }

    if (action === "republish" && propertyId) {
      const publication = await publicationEngine.republishAll(propertyId);
      return NextResponse.json({ success: true, publication });
    }

    if (action === "validate" && propertyId) {
      const property = await import("@/lib/prisma").then((m) =>
        m.prisma.property.findUnique({ where: { id: propertyId } }),
      );

      if (!property) {
        return NextResponse.json({
          valid: false,
          errors: ["Imóvel não encontrado"],
        });
      }

      const validation = publicationEngine.validateProperty(property);
      return NextResponse.json(validation);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("[Publication API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get("action");
  const propertyId = searchParams.get("propertyId");
  const tenantId = searchParams.get("tenantId");

  try {
    if (action === "stats" && tenantId) {
      const stats = await publicationEngine.getStats(tenantId);
      return NextResponse.json(stats);
    }

    if (action === "publication" && propertyId) {
      const publication = await publicationEngine.getPublication(propertyId);
      return NextResponse.json(publication);
    }

    if (action === "packages" && tenantId) {
      const packages = await publicationEngine.getPackages(tenantId);
      return NextResponse.json(packages);
    }

    if (action === "defaultPackage" && tenantId) {
      const pkg = await publicationEngine.getDefaultPackage(tenantId);
      return NextResponse.json(pkg);
    }

    if (action === "health" && propertyId) {
      const health = await publicationEngine.checkHealth(propertyId);
      return NextResponse.json(health);
    }

    return NextResponse.json({
      message: "Publication API",
      endpoints: {
        POST: {
          publish: "Publica imóvel em múltiplos portais",
          sync: "Sincroniza alterações",
          republish: "Republica em todos os portais",
          validate: "Valida imóvel para publicação",
        },
        GET: {
          stats: "Estatísticas de publicação",
          publication: "Status de publicação do imóvel",
          packages: "Lista de pacotes disponíveis",
          defaultPackage: "Pacote padrão",
          health: "Verifica saúde da publicação",
        },
      },
    });
  } catch (error) {
    console.error("[Publication API] Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
