import { prisma } from "@/prisma/client";
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
    const resellerClient = await prisma.resellerClient.findUnique({
      where: { id: resellerClientId },
    });

    if (!resellerClient || resellerClient.partnerId !== partnerId) {
      throw new Error("Invalid reseller client or partner mismatch");
    }

    // Calcula o valor da comissão
    const commissionValue = amount * (resellerClient.commissionRate / 100);

    // Cria o registro de comissão
    const commission = await prisma.commission.create({
      data: {
        id: uuidv4(),
        partnerId,
        resellerClientId,
        amount: commissionValue,
        period,
        status: "pending",
        calculatedAt: new Date(),
      },
    });

    return commission;
  }

  /**
   * Processa comissões pendentes para um parceiro em um período específico
   */
  static async processPendingCommissions(
    partnerId: string,
    period: string, // YYYY-MM format
  ): Promise<Commission[]> {
    // Busca comissões pendentes do parceiro no período
    const pendingCommissions = await prisma.commission.findMany({
      where: {
        partnerId,
        period,
        status: "pending",
      },
    });

    // Atualiza para processando (em um sistema real, isso dispararia um job de pagamento)
    const updatedCommissions = await Promise.all(
      pendingCommissions.map(async (commission) => {
        return await prisma.commission.update({
          where: { id: commission.id },
          data: {
            // Em um sistema real, teríamos um status 'processing' aqui
            // Mas vamos direto para 'paid' para simplificação neste exemplo
            status: "paid",
            paidAt: new Date(),
          },
        });
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
  ): Promise<{ amount: number; details: any[] }> {
    // Busca a franquia
    const franchise = await prisma.partner.findUnique({
      where: { id: franchiseId },
    });

    if (!franchise || franchise.tier !== "franchise") {
      throw new Error("Invalid franchise partner");
    }

    // Busca todas as subfranquias (filiais) desta franquia
    const subFranchises = await prisma.partner.findMany({
      where: { parentId: franchiseId },
    });

    // Busca todas as franquias filiais e suas respectivas subcontas
    const allSubAccounts = await prisma.resellerClient.findMany({
      where: {
        OR: [
          { partnerId: franchiseId }, // Subcontas diretas da franquia
          { partnerId: { in: subFranchises.map((sf) => sf.id) } }, // Subcontas das subfranquias
        ],
        status: "active",
      },
    });

    // Calcula o MRR total gerado por todas as subcontas
    const totalMrr = await prisma.resellerClient.aggregate({
      where: {
        OR: [
          { partnerId: franchiseId },
          { partnerId: { in: subFranchises.map((sf) => sf.id) } },
        ],
        status: "active",
      },
      _sum: {
        monthlyValue: true,
      },
    });

    // Aplica a taxa de royalties da franquia (ex: 10% do MRR das subfranquias)
    const royaltyRate = 0.1; // 10% - configurável por franquia
    const royaltyAmount = (totalMrr._sum.monthlyValue || 0) * royaltyRate;

    // Detalhes para transparência
    const details = [
      {
        type: "direct_clients",
        count: await prisma.resellerClient.count({
          where: { partnerId: franchiseId, status: "active" },
        }),
        mrr: await prisma.resellerClient
          .aggregate({
            where: { partnerId: franchiseId, status: "active" },
            _sum: { monthlyValue: true },
          })
          .then((r) => r._sum.monthlyValue || 0),
      },
      {
        type: "sub_franchise_clients",
        count: await prisma.resellerClient.count({
          where: {
            partnerId: { in: subFranchises.map((sf) => sf.id) },
            status: "active",
          },
        }),
        mrr: await prisma.resellerClient
          .aggregate({
            where: {
              partnerId: { in: subFranchises.map((sf) => sf.id) },
              status: "active",
            },
            _sum: { monthlyValue: true },
          })
          .then((r) => r._sum.monthlyValue || 0),
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
    const partner = await prisma.partner.findUnique({
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
      const levelPartner = await prisma.partner.findUnique({
        where: { id: currentPartnerId },
      });

      if (!levelPartner) break;

      const levelCommission = Math.min(
        remainingAmount * (distribution[level] || 0),
        remainingAmount,
      );

      // Cria o registro de comissão para este nível
      await prisma.commission.create({
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
      currentPartnerId = levelPartner.parentId;
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
    const commissions = await prisma.commission.findMany({
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

    const totalEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);
    const totalPending = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);

    // Agrupa por mês
    const commissionsByMonth = Array.from(
      commissions.reduce((map, commission) => {
        const month = commission.period; // Já está no formato YYYY-MM
        const current = map.get(month) || 0;
        return map.set(month, current + commission.amount);
      }, new Map<string, number>()),
      ([month, amount]) => ({ month, amount }),
    ).sort((a, b) => a.month.localeCompare(b.month));

    // Top 5 clientes por comissão gerada
    const topClients = Array.from(
      commissions.reduce((map, commission) => {
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
    const partner = await prisma.partner.findUnique({
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
    const partnerAddon = await prisma.partnerAddon.findFirst({
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
