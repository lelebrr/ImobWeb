import { NextRequest, NextResponse } from "next/server";
import { OnboardingService } from "@/lib/reseller/onboarding-service";
import { getTenantHierarchy } from "@/lib/tenant/tenant-manager";

/**
 * API DE GESTÃO DE SUB-CONTAS - imobWeb
 * 2026 - Gestão de Rede por Parceiros
 */

export async function GET(req: NextRequest) {
  const partnerId = req.nextUrl.searchParams.get("partnerId");
  if (!partnerId) return NextResponse.json({ error: "Partner ID required" }, { status: 400 });

  try {
    const hierarchy = await getTenantHierarchy(partnerId);
    return NextResponse.json(hierarchy?.children || []);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Provisiona uma nova instância imobiliária
    const result = await OnboardingService.provisionSubAccount({
      partnerId: data.partnerId,
      imobiliariaName: data.name,
      adminEmail: data.email,
      planId: data.planId || 'starter',
      customLimits: data.limits
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
