import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ENFORCER DE LIMITES E COTAS - imobWeb 2026
 * Garante que sub-contas não excedam os recursos do plano contratado via parceiro.
 */

export interface TenantLimits {
  maxProperties: number;
  maxAgents: number;
  maxStorageGB: number;
  maxWhatsAppMonthly: number;
}

const DEFAULT_LIMITS: Record<string, TenantLimits> = {
  'starter': { maxProperties: 20, maxAgents: 2, maxStorageGB: 5, maxWhatsAppMonthly: 500 },
  'pro': { maxProperties: 150, maxAgents: 10, maxStorageGB: 50, maxWhatsAppMonthly: 5000 },
  'enterprise': { maxProperties: 999999, maxAgents: 999999, maxStorageGB: 500, maxWhatsAppMonthly: 50000 },
};

export class LimitEnforcer {
  /**
   * Verifica se o tenant pode realizar uma ação baseada no limite atual.
   */
  static async canPerformAction(tenantId: string, action: 'add_property' | 'add_agent' | 'send_whatsapp'): Promise<{ allowed: boolean; reason?: string }> {
    const org = await prisma.organization.findUnique({
      where: { id: tenantId },
      select: { settings: true }
    });

    if (!org) return { allowed: false, reason: "Organização não encontrada" };

    const plan = ((org.settings as any)?.plan || 'starter').toLowerCase();
    const limits = DEFAULT_LIMITS[plan] || DEFAULT_LIMITS.starter;

    switch (action) {
      case 'add_property': {
        const count = await prisma.property.count({ where: { organizationId: tenantId } });
        if (count >= limits.maxProperties) {
          return { allowed: false, reason: `Limite de imóveis atingido (${limits.maxProperties}). Faça upgrade para continuar.` };
        }
        break;
      }
      
      case 'add_agent': {
        const count = await prisma.user.count({ where: { organizationId: tenantId, role: 'CORRETOR' } });
        if (count >= limits.maxAgents) {
          return { allowed: false, reason: `Limite de corretores atingido (${limits.maxAgents}).` };
        }
        break;
      }

      case 'send_whatsapp': {
        // Exemplo: Consultar uso mensal no Redis ou tabela de logs
        const monthlyUsage = (org.settings as any)?.usage?.whatsapp_monthly || 0;
        if (monthlyUsage >= limits.maxWhatsAppMonthly) {
          return { allowed: false, reason: "Cota mensal de WhatsApp esgotada." };
        }
        break;
      }
    }

    return { allowed: true };
  }

  /**
   * Recupera o dashboard de uso atual vs limite para exibição na UI.
   */
  static async getUsageReport(tenantId: string) {
    const org = await prisma.organization.findUnique({ where: { id: tenantId } });
    const plan = ((org?.settings as any)?.plan || 'starter').toLowerCase();
    const limits = DEFAULT_LIMITS[plan];

    return {
      plan,
      limits,
      current: {
        properties: await prisma.property.count({ where: { organizationId: tenantId } }),
        agents: await prisma.user.count({ where: { organizationId: tenantId, role: 'CORRETOR' } }),
      }
    };
  }
}
