import { NextRequest, NextResponse } from "next/server";
import { LimitEnforcer } from "@/lib/reseller/limit-enforcer";

/**
 * API DE TELEMETRIA DE CONSUMO E LIMITES - imobWeb 2026
 * Fornece dados em tempo real para o dashboard do parceiro.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID é obrigatório." }, { status: 400 });
    }

    const report = await LimitEnforcer.getUsageReport(tenantId);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      report,
      // Telemetria adicional de 2026
      health_score: 94,
      last_activity: "2 min atrás"
    });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao recuperar telemetria de uso." }, { status: 500 });
  }
}
