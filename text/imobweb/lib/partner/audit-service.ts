import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * SERVIÇO DE AUDITORIA DE REDE - imobWeb 2026
 * Permite que o parceiro monitore eventos críticos de suas sub-contas em tempo real.
 */

export type AuditEvent = 
  | 'TENANT_PROVISIONED' 
  | 'LIMIT_REACHED' 
  | 'PLAN_UPGRADE' 
  | 'DOMAIN_SSL_ACTIVE' 
  | 'ADDON_INSTALLED';

export interface AuditLog {
  partnerId: string;
  tenantId: string;
  event: AuditEvent;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export class AuditService {
  /**
   * Grava um log de evento para o ecossistema do parceiro.
   */
  static async logEvent(data: AuditLog): Promise<void> {
    try {
      console.log(`[AUDIT] Evento: ${data.event} | Tenant: ${data.tenantId} | Parceiro: ${data.partnerId}`);

      // Em um ambiente de 2026, isso seria gravado em uma tabela de logs particionada (TimescaleDB ou ClickHouse)
      await prisma.organization.update({
        where: { id: data.partnerId },
        data: {
          settings: {
            path: ["audit_logs"],
            push: {
              id: Math.random().toString(36).substring(7),
              timestamp: new Date().toISOString(),
              tenantId: data.tenantId,
              event: data.event,
              details: data.details,
              severity: data.severity
            }
          }
        }
      });
    } catch (e) {
      console.error("[AUDIT_LOG_ERROR]", e);
    }
  }

  /**
   * Recupera os últimos eventos da rede do parceiro.
   */
  static async getPartnerLogs(partnerId: string, limit: number = 50) {
    const org = await prisma.organization.findUnique({
      where: { id: partnerId },
      select: { settings: true }
    });

    const logs = (org?.settings as any)?.audit_logs || [];
    return logs.slice(-limit).reverse();
  }
}
