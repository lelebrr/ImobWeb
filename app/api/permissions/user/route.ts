import { NextRequest, NextResponse } from "next/server";
import { ROLE_PERMISSIONS } from "@/types/permissions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 },
      );
    }

    const userRoles = ["AGENCY_CORRETOR"];

    const permissions = userRoles
      .map((roleId) => ROLE_PERMISSIONS[roleId])
      .filter(Boolean);

    return NextResponse.json({
      userId,
      organizationId: organizationId || "",
      roles: userRoles,
      permissions: permissions.map((p) => ({
        resource: "*",
        actions: p?.permissions?.[0]?.actions || [],
      })),
    });
  } catch (error) {
    console.error("[API] Erro ao buscar permissões:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, organizationId, roles } = body;

    if (!userId || !roles) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      userId,
      organizationId: organizationId || "",
      roles,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("[API] Erro ao salvar permissões:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
