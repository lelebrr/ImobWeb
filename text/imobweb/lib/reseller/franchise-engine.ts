import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * FRANCHISE ENGINE - imobWeb 2026
 * Lógica de rede para compartilhamento de imóveis e leads entre sub-imobiliárias.
 */

export class FranchiseEngine {
  /**
   * Ativa o compartilhamento automático de catálogo dentro da rede da franquia.
   */
  static async enableNetworkSharing(partnerId: string, enabled: boolean = true): Promise<boolean> {
    try {
      await prisma.organization.update({
        where: { id: partnerId },
        data: {
          settings: {
            path: ["franchise", "autoSharing"],
            set: enabled
          }
        }
      });
      return true;
    } catch (e) {
      console.error("[FRANCHISE_ENGINE_ERROR]", e);
      return false;
    }
  }

  /**
   * Recupera imóveis de outras unidades da mesma franquia que foram marcados como 'Rede'.
   */
  static async getNetworkProperties(currentTenantId: string) {
    // 1. Encontrar o Parent (Franqueador)
    const org = await prisma.organization.findUnique({
      where: { id: currentTenantId },
      select: { settings: true }
    });

    const parentId = (org?.settings as any)?.parentId;
    if (!parentId) return [];

    // 2. Buscar imóveis de outros tenants com o mesmo parentId
    // Nota: Em produção, isso usaria uma flag `isSharedInNetwork` no model Property
    console.log(`[FRANCHISE] Buscando imóveis compartilhados na rede do Franqueador: ${parentId}`);
    
    // Simulação de retorno de imóveis de sub-contas irmãs
    return [
      { id: "prop_123", title: "Apartamento Luxo (Unidade Jardins)", price: 2500000, sourceTenant: "Unidade Jardins" },
      { id: "prop_456", title: "Casa de Vila (Unidade Pinheiros)", price: 1800000, sourceTenant: "Unidade Pinheiros" },
    ];
  }

  /**
   * Calcula o 'Override' (taxa extra) da franquia sobre as vendas da rede.
   */
  static calculateFranchiseOverride(saleAmount: number): number {
    return saleAmount * 0.05; // 5% de taxa de franquia fixa sobre o VGV
  }
}
