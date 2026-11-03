import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth/get-auth";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof prisma.vistoria.findFirst>> & {};

/** Dados extras gravados junto dos cômodos (formato novo: data = { rooms, ...extras }). */
function extrasFrom(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const d = data as Record<string, any>;
  return {
    tipoVistoria: typeof d.tipoVistoria === "string" ? d.tipoVistoria : "ENTRADA",
    linkedRemoteId: typeof d.linkedRemoteId === "string" ? d.linkedRemoteId : null,
    medidores: d.medidores ?? null,
    medidoresEntrada: d.medidoresEntrada ?? null,
    chaves: Array.isArray(d.chaves) ? d.chaves : [],
    signatures: d.signatures ?? null,
  };
}

function toDto(r: NonNullable<Row>, withRooms: boolean) {
  return {
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
    rooms: withRooms ? (Array.isArray(r.data) ? r.data : (r.data as any)?.rooms || []) : [],
    ...(withRooms ? extrasFrom(r.data) : {}),
    createdAt: r.createdAt.getTime(),
    updatedAt: r.updatedAt.getTime(),
  };
}

const SUMMARY_SELECT = {
  id: true, condominio: true, endereco: true, numero: true, conjApto: true, cep: true,
  bairro: true, cidade: true, estado: true, tipoImovel: true, finalidade: true, metragem: true,
  mobiliado: true, locadora: true, locadoraCpf: true, locatario: true, locatarioCpf: true,
  vistoriadora: true, solicitante: true, consideracoes: true, dataFotografia: true,
  dataLaudo: true, status: true, organizationId: true, userId: true, createdAt: true, updatedAt: true,
} as const;

/**
 * GET /api/admin/vistoria/list            → resumo (sem cômodos/fotos) das vistorias da organização
 * GET /api/admin/vistoria/list?id=<id>    → uma vistoria completa (com cômodos e fotos)
 * GET /api/admin/vistoria/list?full=1     → todas completas (compatibilidade; evite: resposta pesada)
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth?.id || !auth.organizationId) {
    return NextResponse.json(
      { success: false, vistorias: [], error: "Não autenticado" },
      { status: 401 }
    );
  }

  try {
    const params = new URL(request.url).searchParams;
    const id = params.get("id");

    if (id) {
      const r = await prisma.vistoria.findFirst({
        where: { id, organizationId: auth.organizationId },
      });
      return NextResponse.json({ success: true, vistorias: r ? [toDto(r, true)] : [], error: null });
    }

    const full = params.get("full") === "1";
    const where = { organizationId: auth.organizationId };
    const orderBy = { createdAt: "desc" as const };
    const records = full
      ? await prisma.vistoria.findMany({ where, orderBy })
      : await prisma.vistoria.findMany({ where, orderBy, select: SUMMARY_SELECT });

    return NextResponse.json({
      success: true,
      vistorias: (records as any[]).map((r) => toDto({ data: null, ...r } as NonNullable<Row>, full)),
      error: null,
    });
  } catch (err: any) {
    console.error("[API Vistoria List] Erro:", err);
    return NextResponse.json(
      { success: false, vistorias: [], error: "Erro ao listar vistorias" },
      { status: 500 }
    );
  }
}
