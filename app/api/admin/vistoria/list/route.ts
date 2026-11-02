import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth/get-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    let organizationId = auth?.organizationId;

    if (!organizationId) {
      const defaultOrg = await prisma.organization.findFirst({
        select: { id: true },
      });
      organizationId = defaultOrg?.id;
    }

    if (!organizationId) {
      return NextResponse.json(
        { success: false, vistorias: [], error: "Organização não encontrada" },
        { status: 400 }
      );
    }

    const records = await prisma.vistoria.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    const vistorias = records.map((r) => ({
      id: 0,
      remoteId: r.id,
      condominio: r.condominio || "",
      endereco: r.endereco || "",
      numero: r.numero || "",
      conjApto: r.conjApto || "",
      cep: r.cep || "",
      bairro: r.bairro || "",
      cidade: r.cidade || "",
      estado: r.estado || "",
      tipoImovel: r.tipoImovel || "",
      finalidade: r.finalidade || "",
      metragem: r.metragem || "",
      mobiliado: r.mobiliado || "",
      locadora: r.locadora || "",
      locadoraCpf: r.locadoraCpf || "",
      locatario: r.locatario || "",
      locatarioCpf: r.locatarioCpf || "",
      vistoriadora: r.vistoriadora || "",
      solicitante: r.solicitante || "",
      consideracoes: r.consideracoes || "",
      dataFotografia: r.dataFotografia || "",
      dataLaudo: r.dataLaudo || "",
      status: r.status,
      rooms: (Array.isArray(r.data) ? r.data : (r.data as any)?.rooms || []),
      createdAt: r.createdAt.getTime(),
      updatedAt: r.updatedAt.getTime(),
    }));

    return NextResponse.json({
      success: true,
      vistorias,
      error: null,
    });
  } catch (err: any) {
    console.error("[API Vistoria List] Erro:", err);
    return NextResponse.json(
      { success: false, vistorias: [], error: err.message || "Erro ao listar vistorias" },
      { status: 500 }
    );
  }
}
