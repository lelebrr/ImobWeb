import { NextRequest, NextResponse } from "next/server";
import { publicApiRouter } from "@/lib/public-api/router";
import { createTRPCContext } from "@/server/api/trpc"; // Mockando contexto se necessário

/**
 * REST Fallback para a API Pública do imobWeb
 * Permite acesso via HTTP clássico (JSON) para sistemas que não usam tRPC
 * Rota: /api/public/v1/properties
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ route?: string[] }> }
) {
  const { route } = await params;
  const routeString = route?.join("/") || "";
  const { searchParams } = new URL(req.url);

  try {
    // Roteamento REST manual para os comandos do tRPC
    if (routeString === "properties") {
      const orgId = searchParams.get("orgId");
      if (!orgId) return NextResponse.json({ error: "orgId is required" }, { status: 400 });

      // @ts-ignore - Chamada interna ao caller do tRPC
      const data = await publicApiRouter.getProperties({
        rawInput: { orgId, limit: Number(searchParams.get("limit")) || 20 },
        path: "getProperties",
        type: "query",
        ctx: {}, // Contexto vazio para API Pública
      });

      return NextResponse.json(data);
    }

    if (routeString.startsWith("properties/")) {
      const id = routeString.split("/")[1];
      // @ts-ignore
      const data = await publicApiRouter.getPropertyDetails({
        rawInput: { propertyId: id },
        path: "getPropertyDetails",
        type: "query",
        ctx: {},
      });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  } catch (error) {
    console.error(`[REST API ERROR] ${routeString}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ route?: string[] }> }
) {
  const { route } = await params;
  const routeString = route?.join("/") || "";

  try {
    if (routeString === "leads") {
      const body = await req.json();
      // @ts-ignore
      const data = await publicApiRouter.captureLead({
        rawInput: body,
        path: "captureLead",
        type: "mutation",
        ctx: {},
      });
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
