import { NextRequest, NextResponse } from "next/server";
import {
  ROLE_PERMISSIONS,
  PLATFORM_ROLES,
  AGENCY_ROLES,
} from "@/types/permissions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const level = searchParams.get("level");

    let roles = Object.values(ROLE_PERMISSIONS);

    if (type === "platform") {
      roles = Object.values(PLATFORM_ROLES);
    } else if (type === "agency") {
      roles = Object.values(AGENCY_ROLES);
    }

    if (level) {
      roles = roles.filter((r) => r.level === level);
    }

    return NextResponse.json(roles);
  } catch (error) {
    console.error("[API] Erro ao buscar roles:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, type, level, permissions } = body;

    if (!id || !name || !type || !level) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    const newRole = {
      id,
      name,
      description: description || "",
      type: type as "platform" | "agency" | "custom",
      level: level as "platform" | "agency" | "team" | "user",
      permissions: permissions || [],
      isSystem: false,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return NextResponse.json(newRole);
  } catch (error) {
    console.error("[API] Erro ao criar role:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
