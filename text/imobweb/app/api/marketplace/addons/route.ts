import { NextRequest, NextResponse } from "next/server";
import { AddonStore } from "@/lib/marketplace/addon-store";

/**
 * API DO MARKETPLACE - imobWeb
 * 2026 - Instalação e Listagem de Extensões
 */

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (!tenantId) return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });

  const addons = await AddonStore.getAvailableAddons(tenantId);
  return NextResponse.json(addons);
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId, addonId } = await req.json();
    
    if (!tenantId || !addonId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const result = await AddonStore.installAddon(tenantId, addonId);
    
    if (result.success) {
      return NextResponse.json({ message: "Add-on instalado com sucesso" });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
