import { NextRequest, NextResponse } from "next/server";
import { scoreEngine } from "@/lib/score/score-engine";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, isRealTime } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId é obrigatório" },
        { status: 400 },
      );
    }

    const result = await scoreEngine.calculateScore(
      propertyId,
      isRealTime || false,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.score);
  } catch (error) {
    console.error("[API] Erro ao calcular score:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const organizationId = searchParams.get("organizationId");

    if (propertyId) {
      const recommendations = await scoreEngine.getRecommendations(propertyId);
      return NextResponse.json(recommendations);
    }

    if (organizationId) {
      const pulse = await scoreEngine.calculatePortfolioPulse(organizationId);
      const stats = await scoreEngine.getHealthStats(organizationId);
      return NextResponse.json({ pulse, stats });
    }

    return NextResponse.json(
      { error: "Parâmetros inválidos" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[API] Erro ao buscar dados do score:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
