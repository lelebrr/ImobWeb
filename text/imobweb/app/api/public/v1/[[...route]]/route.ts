import { NextRequest, NextResponse } from "next/server";
import { publicApiRouter } from "@/lib/public-api/router";

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
    const caller = publicApiRouter.createCaller({});

    if (routeString === "properties") {
      const orgId = searchParams.get("orgId");
      if (!orgId) return NextResponse.json({ error: "orgId is required" }, { status: 400 });

      const data = await caller.getProperties({
        orgId,
        limit: Number(searchParams.get("limit")) || 20 
      });

      return NextResponse.json(data);
    }

    if (routeString.startsWith("properties/")) {
      const id = routeString.split("/")[1];
      const data = await caller.getPropertyDetails({ propertyId: id });
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
    const caller = publicApiRouter.createCaller({});
    
    if (routeString === "leads") {
      const body = await req.json();
      const data = await caller.captureLead(body);
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
