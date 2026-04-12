/**
 * SERVIÇO DE AUDITORIA AVANÇADA - imobWeb
 * 2026 - Registro detalhado de ações críticas para conformidade SOC2
 */

import { PrismaClient, AuditAction } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export interface AuditLogOptions {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  organizationId: string;
  userId: string;
  oldData?: any;
  newData?: any;
  metadata?: Record<string, any>;
}

/**
 * Registra uma ação crítica no banco de dados para auditoria.
 * Inclui automaticamente IP e User Agent da requisição atual.
 */
export async function auditLog({
  action,
  entityType,
  entityId,
  organizationId,
  userId,
  oldData,
  newData,
  metadata = {},
}: AuditLogOptions) {
  try {
    const headerList = headers();
    const ip = (await headerList).get("x-forwarded-for") || "unknown";
    const userAgent = (await headerList).get("user-agent") || "unknown";

    // Calcula diff se oldData e newData estiverem presentes
    const changeDiff = oldData && newData ? calculateDiff(oldData, newData) : null;

    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        organizationId,
        userId,
        ipAddress: ip,
        userAgent: userAgent,
        beforeValues: oldData || undefined,
        afterValues: newData || undefined,
        diff: changeDiff || undefined,
        metadata: metadata as any,
      },
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[AUDIT] Action: ${action} | Entity: ${entityType} | User: ${userId}`);
    }
  } catch (error) {
    console.error("[AUDIT_ERROR]", error);
  }
}

/**
 * Compara dois objetos e retorna apenas as propriedades que mudaram.
 */
function calculateDiff(oldObj: any, newObj: any) {
  const diff: Record<string, { from: any; to: any }> = {};
  
  if (!oldObj || !newObj) return null;

  for (const key in newObj) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      diff[key] = {
        from: oldObj[key],
        to: newObj[key],
      };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Wrapper para auditoria automática de Server Actions.
 */
export async function withAudit<T>(
  options: Omit<AuditLogOptions, "oldData" | "newData">,
  actionFn: () => Promise<T>
): Promise<T> {
  const result = await actionFn();
  
  await auditLog({
    ...options,
    newData: result, // Assume que o resultado da função é o novo estado (opcional)
  });

  return result;
}
