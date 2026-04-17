import { prisma } from "@/lib/prisma";
import {
  Partner,
  ResellerClient,
  Commission,
  PartnerAddon,
} from "@/types/partner";
import { v4 as uuidv4 } from "uuid";

/**
 * Motor de Comissão e Royalties
 * Responsável pelo cálculo automático de comissões e pagamentos a parceiros
 */
export class CommissionEngine {
  /**
   * Calcula comissão para um cliente indicado pelo parceiro
   */
  static async calculateCommission(
    partnerId: string,
    resellerClientId: string,
    amount: number,
    period: string, // YYYY-MM format
  ): Promise<Commission> {
    // Busca o cliente revenda para obter a taxa de comissão
    const user = await prisma.user.findUnique({
      where: { id: resellerClientId },
    });

    if (!user || user.organizationId !== partnerId) {
      throw new Error("Invalid user or organization mismatch");
    }

    // Calcula o valor da comissão (taxa fixa de 10% como exemplo)
    const commissionValue = amount * 0.10;

    // Cria o registro de comissão
    const commission = await (prisma as any).commission.create({
      data: {
        id: uuidv4(),
        partnerId: partnerId,
        resellerClientId: resellerClientId,
        amount: commissionValue,
        period,
        status: "pending",
        calculatedAt: new Date(),
        createdAt: new Date(),
      },
    });

    return {
      id: commission.id,
      partnerId,
      resellerClientId: commission.resellerClientId,
      amount: Number(commission.amount),
      period,
      status: commission.status,
      calculatedAt: commission.calculatedAt,
    } as any;
  }

  /**
   * Processa comissões pendentes para um parceiro em um período específico
   */
  static async processPendingCommissions(
    partnerId: string,
    period: string, // YYYY-MM format
  ): Promise<Commission[]> {
    // Busca comissões pendentes do parceiro no período
    const pendingCommissions = await (prisma as any).commission.findMany({
      where: {
        partnerId,
        period,
        status: "pending",
      },
    });

    // Atualiza para processando (em um sistema real, isso dispararia um job de pagamento)
    const updatedCommissions = await Promise.all(
      pendingCommissions.map(async (commission: any) => {
        const updated = await (prisma as any).commission.update({
          where: { id: commission.id },
          data: {
            status: "paid",
            paidAt: new Date(),
          },
        });
        
        return {
          ...updated,
          amount: Number(updated.amount),
        } as Commission;
      }),
    );

    return updatedCommissions;
  }

  /**
   * Calcula royalties para franquias (modelo hierárquico)
   */
  static async calculateFranchiseRoyalties(
    franchiseId: string,
    period: string, // YYYY-MM format
  ): Promise<{ amount: number; details: import("@/types/partner").FranchiseRoyaltyDetail[] }> {
    // Busca a franquia
    const franchise = await prisma.user.findUnique({
      where: { id: franchiseId },
    });

    if (!franchise) {
      throw new Error("Invalid franchise");
    }

    // Busca todas as subfranquias (filiais) desta franquia
    const subFranchises = await (prisma as any).partner.findMany({
      where: { parentId: franchiseId },
    });

    // Busca todas as franquias filiais e suas respectivas subcontas
    const allSubAccounts = await (prisma as any).resellerClient.findMany({
      where: {
        OR: [
          { partnerId: franchiseId }, // Subcontas diretas da franquia
          { partnerId: { in: subFranchises.map((sf: any) => sf.id) } }, // Subcontas das subfranquias
        ],
        status: "active",
      },
    });

    // Calcula o MRR total gerado por todas as subcontas
    const totalMrr = await (prisma as any).resellerClient.aggregate({
      where: {
        OR: [
          { partnerId: franchiseId },
          { partnerId: { in: subFranchises.map((sf: any) => sf.id) } },
        ],
        status: "active",
      },
      _sum: {
        monthlyValue: true,
      },
    });

    // Aplica a taxa de royalties da franquia (ex: 10% do MRR das subfranquias)
    const royaltyRate = 0.1; // 10% - configurável por franquia
    const royaltyAmount = Number(totalMrr._sum.monthlyValue || 0) * royaltyRate;

    // Detalhes para transparência
    const details = [
      {
        type: "direct_clients",
        count: await (prisma as any).resellerClient.count({
          where: { partnerId: franchiseId, status: "active" },
        }),
        mrr: await (prisma as any).resellerClient
          .aggregate({
            where: { partnerId: franchiseId, status: "active" },
            _sum: { monthlyValue: true },
          })
          .then((r: any) => r._sum.monthlyValue || 0),
      },
      {
        type: "sub_franchise_clients",
        count: await (prisma as any).resellerClient.count({
          where: {
            partnerId: { in: subFranchises.map((sf: any) => sf.id) },
            status: "active",
          },
        }),
        mrr: await (prisma as any).resellerClient
          .aggregate({
            where: {
              partnerId: { in: subFranchises.map((sf: any) => sf.id) },
              status: "active",
            },
            _sum: { monthlyValue: true },
          })
          .then((r: any) => r._sum.monthlyValue || 0),
      },
    ];

    return {
      amount: royaltyAmount,
      details,
    };
  }

  /**
   * Distribui comissões em múltiplos níveis (para franquias)
   */
  static async distributeMultiLevelCommissions(
    partnerId: string,
    amount: number,
    period: string,
    levels: number = 3, // Número máximo de níveis na hierarquia
  ): Promise<void> {
    // Busca a parceiro e sua hierarquia
    const partner = await (prisma as any).partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new Error("Partner not found");
    }

    // Distribui a comissão para os parceiros na hierarquia (ex: 50% para parceiro direto, 30% para o acima, 20% para o topo)
    const distribution = [0.5, 0.3, 0.2]; // Pode ser configurável por parceiro

    let currentPartnerId = partnerId;
    let remainingAmount = amount;
    let level = 0;

    while (remainingAmount > 0 && level < levels && currentPartnerId) {
      const levelPartner = await (prisma as any).partner.findUnique({
        where: { id: currentPartnerId },
      });

      if (!levelPartner) break;

      const levelCommission = Math.min(
        remainingAmount * (distribution[level] || 0),
        remainingAmount,
      );

      // Cria o registro de comissão para este nível
      await (prisma as any).commission.create({
        data: {
          id: uuidv4(),
          partnerId: currentPartnerId,
          resellerClientId: "", // Para comissões de nível, não há cliente específico
          amount: levelCommission,
          period,
          status: "pending",
          calculatedAt: new Date(),
        },
      });

      remainingAmount -= levelCommission;
      level++;

      // Move para o próximo nível na hierarquia (pai)
      currentPartnerId = levelPartner.parentId || "";
    }
  }

  /**
   * Gera relatório de comissões para um parceiro
   */
  static async getPartnerCommissionReport(
    partnerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalEarned: number;
    totalPaid: number;
    totalPending: number;
    commissionsByMonth: Array<{ month: string; amount: number }>;
    topClients: Array<{ clientName: string; amount: number }>;
  }> {
    // Busca comissões do parceiro no período
    const commissions = await (prisma as any).commission.findMany({
      where: {
        partnerId,
        calculatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        resellerClient: {
          select: {
            clientName: true,
          },
        },
      },
    });

    const totalEarned = commissions.reduce((sum: number, c: any) => sum + c.amount, 0);
    const totalPaid = commissions
      .filter((c: any) => c.status === "paid")
      .reduce((sum: number, c: any) => sum + c.amount, 0);
    const totalPending = commissions
      .filter((c: any) => c.status === "pending")
      .reduce((sum: number, c: any) => sum + c.amount, 0);

    // Agrupa por mês
    const commissionsByMonth = Array.from(
      commissions.reduce((map: Map<string, number>, commission: any) => {
        const month = commission.period; // Já está no formato YYYY-MM
        const current = map.get(month) || 0;
        return map.set(month, current + commission.amount);
      }, new Map<string, number>()),
      ([month, amount]) => ({ month, amount }),
    ).sort((a, b) => a.month.localeCompare(b.month));

    // Top 5 clientes por comissão gerada
    const topClients = Array.from(
      commissions.reduce((map: Map<string, number>, commission: any) => {
        if (!commission.resellerClient) return map;
        const clientName = commission.resellerClient.clientName;
        const current = map.get(clientName) || 0;
        return map.set(clientName, current + commission.amount);
      }, new Map<string, number>()),
      ([clientName, amount]) => ({ clientName, amount }),
    )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalEarned,
      totalPaid,
      totalPending,
      commissionsByMonth,
      topClients,
    };
  }

  /**
   * Verifica se um parceiro tem direito a comissão recorrente
   */
  static async hasRecurringCommission(partnerId: string): Promise<boolean> {
    const partner = await (prisma as any).partner.findUnique({
      where: { id: partnerId },
    });

    return partner?.recurringCommission ?? false;
  }

  /**
   * Aplica comissão a um addon de marketplace instalado pelo parceiro
   */
  static async applyAddonCommission(
    partnerId: string,
    addonId: string,
    amount: number,
  ): Promise<void> {
    // Busca o registro do addon instalado pelo parceiro
    const partnerAddon = await (prisma as any).partnerAddon.findFirst({
      where: {
        partnerId,
        addonId,
      },
    });

    if (!partnerAddon) {
      throw new Error("Addon not installed by partner");
    }

    // Em um sistema real, isso poderia gerar uma comissão para o desenvolvedor do addon
    // Ou um desconto para o parceiro, dependendo do modelo de negócio
    // Por enquanto, apenas registramos a transação
    console.log(
      `Addon commission applied: Partner ${partnerId}, Addon ${addonId}, Amount ${amount}`,
    );
  }
}
