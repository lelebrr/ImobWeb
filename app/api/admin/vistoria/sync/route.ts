import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth/get-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    let organizationId = auth?.organizationId;
    let userId = auth?.id;

    // Se a autenticação estiver ausente, buscar a organização padrão da plataforma
    if (!organizationId) {
      const defaultOrg = await prisma.organization.findFirst({
        select: { id: true },
      });
      organizationId = defaultOrg?.id;
    }

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "Organização não encontrada" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const vistoria = body.vistoria || body;

    if (!vistoria) {
      return NextResponse.json(
        { success: false, error: "Dados da vistoria inválidos" },
        { status: 400 }
      );
    }

    const remoteId = vistoria.remoteId || (typeof vistoria.id === "string" ? vistoria.id : undefined);

    let saved;
    if (remoteId) {
      // Upsert ou update
      const existing = await prisma.vistoria.findUnique({
        where: { id: remoteId },
      });

      if (existing) {
        saved = await prisma.vistoria.update({
          where: { id: remoteId },
          data: {
            condominio: vistoria.condominio || null,
            endereco: vistoria.endereco || "Sem endereço informado",
            numero: vistoria.numero || null,
            conjApto: vistoria.conjApto || null,
            cep: vistoria.cep || null,
            bairro: vistoria.bairro || null,
            cidade: vistoria.cidade || null,
            estado: vistoria.estado || null,
            tipoImovel: vistoria.tipoImovel || null,
            finalidade: vistoria.finalidade || null,
            metragem: vistoria.metragem || null,
            mobiliado: vistoria.mobiliado || null,
            locadora: vistoria.locadora || null,
            locadoraCpf: vistoria.locadoraCpf || null,
            locatario: vistoria.locatario || null,
            locatarioCpf: vistoria.locatarioCpf || null,
            vistoriadora: vistoria.vistoriadora || null,
            solicitante: vistoria.solicitante || null,
            consideracoes: vistoria.consideracoes || null,
            dataFotografia: vistoria.dataFotografia || null,
            dataLaudo: vistoria.dataLaudo || null,
            status: vistoria.status || "COMPLETA",
            data: vistoria.rooms || vistoria.data || {},
            userId: userId || undefined,
          },
        });
      }
    }

    if (!saved) {
      saved = await prisma.vistoria.create({
        data: {
          id: remoteId,
          condominio: vistoria.condominio || null,
          endereco: vistoria.endereco || "Sem endereço informado",
          numero: vistoria.numero || null,
          conjApto: vistoria.conjApto || null,
          cep: vistoria.cep || null,
          bairro: vistoria.bairro || null,
          cidade: vistoria.cidade || null,
          estado: vistoria.estado || null,
          tipoImovel: vistoria.tipoImovel || null,
          finalidade: vistoria.finalidade || null,
          metragem: vistoria.metragem || null,
          mobiliado: vistoria.mobiliado || null,
          locadora: vistoria.locadora || null,
          locadoraCpf: vistoria.locadoraCpf || null,
          locatario: vistoria.locatario || null,
          locatarioCpf: vistoria.locatarioCpf || null,
          vistoriadora: vistoria.vistoriadora || null,
          solicitante: vistoria.solicitante || null,
          consideracoes: vistoria.consideracoes || null,
          dataFotografia: vistoria.dataFotografia || null,
          dataLaudo: vistoria.dataLaudo || null,
          status: vistoria.status || "COMPLETA",
          data: vistoria.rooms || vistoria.data || {},
          organizationId,
          userId: userId || undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      remoteId: saved.id,
      error: null,
    });
  } catch (err: any) {
    console.error("[API Vistoria Sync] Erro:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erro interno ao sincronizar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id || body?.remoteId;
      } catch (_) {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID da vistoria não informado" },
        { status: 400 }
      );
    }

    await prisma.vistoria.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Vistoria excluída com sucesso",
    });
  } catch (err: any) {
    console.error("[API Vistoria Delete] Erro:", err);
    // Se o registro já não existia no banco, retorna sucesso mesmo assim
    if (err.code === "P2025") {
      return NextResponse.json({ success: true, message: "Vistoria já removida" });
    }
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao excluir vistoria" },
      { status: 500 }
    );
  }
}

