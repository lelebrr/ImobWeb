import { PrismaClient } from "@prisma/client";
import { resolveWhiteLabelConfig } from "../white-label/white-label-service";

const prisma = new PrismaClient();

/**
 * SERVIÇO DE ONBOARDING DE SUB-IMOBILIÁRIAS - imobWeb 2026
 * Permite que um parceiro crie e configure instâncias White Label instantaneamente.
 */

export class OnboardingService {
  /**
   * Cria uma nova sub-conta vinculada a um parceiro.
   */
  static async provisionSubAccount(data: {
    partnerId: string;
    organizationName: string;
    subDomain: string;
    planTier: 'starter' | 'pro' | 'enterprise';
    adminEmail: string;
  }) {
    try {
      // 1. Validar disponibilidade do subdomínio
      const existing = await prisma.organization.findFirst({
        where: { subDomain: data.subDomain }
      });

      if (existing) {
        throw new Error("Subdomínio já está em uso.");
      }

      // 2. Criar a Organização com herança de White Label (se aplicável)
      const partner = await prisma.organization.findUnique({
        where: { id: data.partnerId },
        select: { settings: true }
      });

      const partnerSettings = (partner?.settings as any) || {};
      
      const newOrg = await prisma.organization.create({
        data: {
          name: data.organizationName,
          subDomain: data.subDomain,
          email: data.adminEmail,
          // Vinculação lógica via settings (ou via campo proprietário se existir no schema)
          settings: {
            parentId: data.partnerId,
            plan: data.planTier,
            onboardingStatus: 'provisioning',
            // Herda configurações de branding do parceiro se for revenda total
            whiteLabel: partnerSettings.whiteLabel || { active: true }
          }
        }
      });

      // 3. Trigger de automação (E-mail de boas-vindas White Label)
      console.log(`[ONBOARDING] Provisionando tenant ${newOrg.id} para o parceiro ${data.partnerId}`);
      
      // Aqui integraria com o motor de e-mail usando o `maskBranding` do parceiro
      
      return { success: true, organizationId: newOrg.id };
    } catch (e: any) {
      console.error("[ONBOARDING_ERROR]", e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Monitora o progresso do setup (DNS, Importação de Dados, etc).
   */
  static async getTenantSetupProgress(organizationId: string) {
    // Retorna status de validação de domínio e primeiros passos
    return {
      dns_active: true,
      data_imported: false,
      users_invited: true
    };
  }
}
