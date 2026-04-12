import { Partner, SubAccount } from "../../types/partner";

/**
 * MOTOR DE ROYALTY E COMISSÕES - imobWeb 2026
 * Especializado em redes de franquias e revendedores independentes.
 * Suporte a faturamento global em múltiplas moedas.
 */

export class RoyaltyEngine {
  private static DEFAULT_PLATFORM_FEE = 0.05; // 5% de taxa operacional (gateway + infra)

  // Taxas de câmbio simuladas para 2026 (Em produção, viria de uma API de Forex)
  private static EXCHANGE_RATES: Record<string, number> = {
    'BRL': 1.0,
    'USD': 5.25,
    'EUR': 5.70,
  };

  /**
   * Calcula o lucro líquido do parceiro com suporte a conversão de moeda.
   */
  static async calculatePartnerPayout(partner: Partner, subAccounts: SubAccount[], targetCurrency: string = 'BRL'): Promise<{
    grossAmount: number;
    netAmount: number;
    deductions: number;
    bonus: number;
    currency: string;
  }> {
    const totalMrr = subAccounts
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.mrr, 0);

    // 1. Base Commission by Level
    const baseRate = {
      'silver': 0.15,
      'gold': 0.20,
      'platinum': 0.25,
      'franchise': 0.30
    }[partner.level] || 0.15;

    // 2. Performance Bonus (Expansion)
    const bonus = subAccounts.length > 10 ? totalMrr * 0.02 : 0;

    let grossAmount = (totalMrr * baseRate) + bonus;

    // 3. Conversão de Moeda (Global Scaling)
    if (targetCurrency !== 'BRL') {
      const rate = this.EXCHANGE_RATES[targetCurrency] || 1;
      grossAmount = grossAmount / rate;
    }

    // 4. Deductions (Platform Fee)
    const deductions = grossAmount * this.DEFAULT_PLATFORM_FEE;

    return {
      grossAmount,
      netAmount: grossAmount - deductions,
      deductions,
      bonus,
      currency: targetCurrency
    };
  }

  /**
   * Gera o registro de repasse para o Stripe Connect ou transferência manual.
   */
  static async finalizeMonthlyCycle(partnerId: string): Promise<boolean> {
    console.log(`[FINANCE] Fechando ciclo mensal para o Parceiro: ${partnerId}`);
    return true;
  }

  /**
   * Projeção de ROI para novos parceiros compradores de franquia.
   */
  static calculateProspectROI(initialInvestment: number, projectedClients: number, avgTicket: number): number {
    const monthlyRevenue = (projectedClients * avgTicket) * 0.25; // Baseado em Platinum
    return initialInvestment / monthlyRevenue;
  }
}
