import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * SERVIÇO DE CONTRATOS DE PARCERIA - imobWeb 2026
 * Gestão de Termos de Uso (ToS), SLAs de Revenda e Acordos de Franquia.
 */

export interface ContractAcceptance {
  partnerId: string;
  contractType: 'reseller_terms' | 'franchise_agreement' | 'addon_terms';
  version: string;
  ipAddress: string;
  userAgent: string;
}

export class ContractService {
  /**
   * Registra o aceite de um novo contrato/termo pelo parceiro.
   */
  static async recordAcceptance(data: ContractAcceptance): Promise<boolean> {
    try {
      // Em um ambiente real, isso gravaria na tabela `OrganizationAudit` ou `PartnerContracts`
      console.log(`[CONTRACT] Aceite registrado. Parceiro: ${data.partnerId}, Tipo: ${data.contractType}, Versão: ${data.version}`);
      
      // Atualizar metadados da organização do parceiro
      await prisma.organization.update({
        where: { id: data.partnerId },
        data: {
          settings: {
            path: ["compliance", data.contractType],
            set: {
              acceptedAt: new Date().toISOString(),
              version: data.version,
              ip: data.ipAddress
            }
          }
        }
      });

      return true;
    } catch (e) {
      console.error("[CONTRACT_ERROR]", e);
      return false;
    }
  }

  /**
   * Verifica se o parceiro possui todos os contratos obrigatórios ativos.
   */
  static async checkCompliance(partnerId: string): Promise<{ compliant: boolean; missing: string[] }> {
    const org = await prisma.organization.findUnique({
      where: { id: partnerId },
      select: { settings: true }
    });

    const compliance = (org?.settings as any)?.compliance || {};
    const missing = [];

    if (!compliance.reseller_terms) missing.push("Termos de Revendedor");
    
    // Se for nível franquia, exige contrato específico
    const isFranchise = (org?.settings as any)?.level === 'franchise';
    if (isFranchise && !compliance.franchise_agreement) {
      missing.push("Acordo de Franquia");
    }

    return {
      compliant: missing.length === 0,
      missing
    };
  }
}
