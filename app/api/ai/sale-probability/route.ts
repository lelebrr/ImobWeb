import { NextRequest, NextResponse } from "next/server";
import { SaleProbabilityEngine } from "@/lib/ai/sale-probability-engine";
import { auth } from "@/lib/auth";
import { MOCK_PROPERTIES } from "@/lib/data/mock-properties";

/**
 * API ROUTE: Cálculo de Probabilidade de Venda via IA
 * POST /api/ai/sale-probability
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificação de Autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Parse do Corpo da Requisição
    const body = await request.json();
    const { propertyId, context: manualContext } = body;

    if (!propertyId && !manualContext) {
      return NextResponse.json(
        { error: "propertyId ou contexto manual é obrigatório" },
        { status: 400 }
      );
    }

    // 3. Obtenção dos Dados da Propriedade (Mock ou Real)
    // Em um cenário real, buscaríamos no Prisma pelo ID
    const property = MOCK_PROPERTIES.find(p => p.id === propertyId);

    // 4. Preparação do Contexto para a Engine
    const context = manualContext || {
      id: property?.id || propertyId,
      price: property?.price.amount || 0,
      neighborhood: property?.address.neighborhood || "Bairro desconhecido",
      city: property?.address.city || "Cidade desconhecida",
      type: "Residencial", // Simplificado para o exemplo
      photosCount: property?.media.length || 0,
      daysOnMarket: 15,
      viewsMonthlyAverage: 450,
      currentViews: 120,
      priceReductionsCount: 0,
    };

    // 5. Execução do Motor de IA
    const scoreResult = await SaleProbabilityEngine.calculateSaleProbability(propertyId);

    // 6. Retorno do Resultado
    return NextResponse.json(scoreResult);

  } catch (error: any) {
    console.error("[API] Erro no cálculo de probabilidade:", error);
    return NextResponse.json(
      { error: "Falha ao processar análise de IA", details: error.message },
      { status: 500 }
    );
  }
}
