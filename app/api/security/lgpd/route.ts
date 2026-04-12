import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exportUserData, deleteUserAccount } from "@/lib/security/lgpd-service";
import { auditLog } from "@/lib/security/audit-service";

/**
 * API DE CONFORMIDADE LGPD - imobWeb
 * 2026 - Gestão de Direitos do Titular
 */

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const data = await exportUserData(session.user.id);
    
    await auditLog({
      action: "EXPORT",
      entityType: "USER",
      entityId: session.user.id,
      organizationId: session.user.organizationId || "system",
      userId: session.user.id,
      metadata: { reason: "User request via Dashboard", lgpdAction: "data_export" }
    });

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="imobweb-data-export-${session.user.id}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao exportar dados" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const { confirmation } = await request.json();
  if (confirmation !== "DELETE_ACCOUNT") {
    return NextResponse.json({ error: "Confirmação inválida" }, { status: 400 });
  }

  try {
    await deleteUserAccount(session.user.id);

    await auditLog({
      action: "DELETE",
      entityType: "USER",
      entityId: session.user.id,
      organizationId: session.user.organizationId || "system",
      userId: session.user.id,
      metadata: { status: "Anonimized", lgpdAction: "right_to_be_forgotten" }
    });

    return NextResponse.json({ message: "Sua conta foi anonimizada e desativada conforme LGPD." });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao processar solicitação de exclusão" }, { status: 500 });
  }
}
