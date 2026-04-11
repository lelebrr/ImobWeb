import { NextRequest, NextResponse } from "next/server";
import { AddonStore } from "../../../lib/marketplace/addon-store";

/**
 * API DE INSTALAÇÃO DE ADD-ONS - imobWeb 2026
 * Processamento One-Click com ativação instantânea no Tenant.
 */

export async function POST(req: NextRequest) {
  try {
    const { addonId, tenantId } = await req.json();

    if (!addonId || !tenantId) {
      return NextResponse.json({ error: "Parâmetros insuficientes." }, { status: 400 });
    }

    const result = await AddonStore.installAddon(tenantId, addonId);

    if (result.success) {
      return NextResponse.json({ 
        message: "Add-on instalado com sucesso!",
        provisioned: true 
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: "Erro interno no processamento do marketplace." }, { status: 500 });
  }
}
