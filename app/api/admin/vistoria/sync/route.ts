import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth/get-auth";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** Limite do corpo aceito (fotos vêm em base64 dentro do JSON). */
const MAX_BODY_BYTES = 40 * 1024 * 1024;

const str = (v: unknown, max = 500): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};

function unauthorized() {
  return NextResponse.json(
    { success: false, remoteId: null, error: "Não autenticado" },
    { status: 401 }
  );
}

function fieldsFrom(v: Record<string, unknown>) {
  return {
    condominio: str(v.condominio),
    endereco: str(v.endereco) || "Sem endereço informado",
    numero: str(v.numero, 40),
    conjApto: str(v.conjApto, 80),
    cep: str(v.cep, 12),
    bairro: str(v.bairro),
    cidade: str(v.cidade),
    estado: str(v.estado, 4),
    tipoImovel: str(v.tipoImovel, 60),
    finalidade: str(v.finalidade, 60),
    metragem: str(v.metragem, 40),
    mobiliado: str(v.mobiliado, 40),
    locadora: str(v.locadora),
    locadoraCpf: str(v.locadoraCpf, 30),
    locatario: str(v.locatario),
    locatarioCpf: str(v.locatarioCpf, 30),
    vistoriadora: str(v.vistoriadora),
    solicitante: str(v.solicitante),
    consideracoes: str(v.consideracoes, 20000),
    dataFotografia: str(v.dataFotografia, 20),
    dataLaudo: str(v.dataLaudo, 20),
    status: "COMPLETA",
    data: (Array.isArray(v.rooms) ? v.rooms : Array.isArray(v.data) ? v.data : []) as Prisma.InputJsonValue,
  };
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth?.id || !auth.organizationId) return unauthorized();

  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, remoteId: null, error: "Vistoria grande demais para sincronizar" },
        { status: 413 }
      );
    }

    const body = await request.json();
    const vistoria = body?.vistoria ?? body;
    if (!vistoria || typeof vistoria !== "object") {
      return NextResponse.json(
        { success: false, remoteId: null, error: "Dados da vistoria inválidos" },
        { status: 400 }
      );
    }

    const data = fieldsFrom(vistoria);
    const remoteId = str(vistoria.remoteId, 64);

    if (remoteId) {
      const existing = await prisma.vistoria.findUnique({
        where: { id: remoteId },
        select: { id: true, organizationId: true },
      });
      if (existing) {
        if (existing.organizationId !== auth.organizationId) {
          return NextResponse.json(
            { success: false, remoteId: null, error: "Vistoria pertence a outra organização" },
            { status: 403 }
          );
        }
        const saved = await prisma.vistoria.update({ where: { id: remoteId }, data });
        return NextResponse.json({ success: true, remoteId: saved.id, error: null });
      }
    }

    // Novo registro: o id é sempre gerado pelo servidor (o cliente não escolhe ids).
    const saved = await prisma.vistoria.create({
      data: { ...data, organizationId: auth.organizationId, userId: auth.id },
    });
    return NextResponse.json({ success: true, remoteId: saved.id, error: null });
  } catch (err: any) {
    console.error("[API Vistoria Sync] Erro:", err);
    return NextResponse.json(
      { success: false, remoteId: null, error: "Erro interno ao sincronizar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth?.id || !auth.organizationId) return unauthorized();

  try {
    let id = new URL(request.url).searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id || body?.remoteId || null;
      } catch {
        /* sem corpo */
      }
    }
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID da vistoria não informado" },
        { status: 400 }
      );
    }

    // Só apaga se a vistoria for da organização do usuário
    const result = await prisma.vistoria.deleteMany({
      where: { id, organizationId: auth.organizationId },
    });
    return NextResponse.json({
      success: true,
      message: result.count ? "Vistoria excluída com sucesso" : "Vistoria já removida",
    });
  } catch (err: any) {
    console.error("[API Vistoria Delete] Erro:", err);
    return NextResponse.json(
      { success: false, error: "Erro ao excluir vistoria" },
      { status: 500 }
    );
  }
}
