import { NextRequest, NextResponse } from "next/server";
import { OnboardingService } from "@/lib/reseller/onboarding-service";

/**
 * API DE GESTÃO DE CLIENTES DO PARCEIRO - imobWeb 2026
 * CRUD e Provisionamento de Sub-contas por Revendedores.
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Payload esperado: partnerId, organizationName, subDomain, planTier, adminEmail
    const result = await OnboardingService.provisionSubAccount(payload);

    if (result.success) {
      return NextResponse.json({ 
        message: "Sub-imobiliária provisionada com sucesso!",
        id: result.organizationId 
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Erro ao processar onboarding de sub-conta." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: "Partner ID é obrigatório." }, { status: 400 });
  }

  // Em produção, isso faria uma query no banco buscando organizações vinculadas ao parentId
  return NextResponse.json([
    { id: "1", name: "Alpha Imóveis", status: "active", mrr: 1200 },
    { id: "2", name: "Riviera Brokers", status: "trial", mrr: 0 },
  ]);
}
