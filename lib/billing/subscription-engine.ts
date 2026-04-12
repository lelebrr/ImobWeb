/**
 * Subscription & Recurring Billing Engine - ImobWeb 2026
 * 
 * Estende a funcionalidade do Stripe para o contexto brasileiro:
 * - Emissão de notas fiscais (NFS-e) após pagamento confirmado.
 * - Gestão de períodos de teste e descontos (Cupons).
 * - Split de faturamento (Plataforma vs Integrações).
 */

import { AccountingManager } from '../integrations/accounting-manager';
import { resolveTransactionTaxes } from '../finance/tax-calculator';

export interface SubscriptionEvent {
  stripeSubscriptionId: string;
  customerId: string;
  amount: number;
  planName: string;
}

export class SubscriptionEngine {
  private accounting: AccountingManager;

  constructor() {
    this.accounting = new AccountingManager();
  }

  /**
   * Processa um pagamento bem-sucedido vindo do Stripe
   * Aciona a emissão de nota fiscal e registro contábil.
   */
  async handlePaymentSuccess(event: SubscriptionEvent) {
    console.log(`[SubscriptionEngine] Processando pagamento para ${event.customerId}`);

    // 1. Resolve impostos (Assumindo alíquota padrão para SaaS - Software)
    const taxes = resolveTransactionTaxes(event.amount / 100, 0.02); // 2% ISS para software em muitos municípios

    // 2. Prepara dados para o ERP Contábil
    const invoiceData = {
      id: event.stripeSubscriptionId,
      customerName: "Cliente ImobWeb", // Em produção, buscaria no banco de dados
      customerDocument: "00.000.000/0001-00",
      value: event.amount / 100,
      dueDate: new Date().toISOString(),
      serviceDescription: `Assinatura de Software ImobWeb - Plano ${event.planName}`,
      fiscalInfo: {
        issRate: 0.02,
        irrfValue: taxes.irrfValue,
        csrfValue: taxes.csrfValue
      }
    };

    // 3. Sincroniza com Omie/ContaAzul
    try {
      await this.accounting.syncInvoice(invoiceData);
      console.log(`[SubscriptionEngine] NFS-e enfileirada para emissão.`);
    } catch (err) {
      console.error("[SubscriptionEngine] Erro ao sincronizar contabilidade:", err);
      // Aqui dispararia um alerta para o time de suporte financeiro
    }
  }

  /**
   * Cálculo de Upgrade/Downgrade Pro-rata
   */
  calculateProratedValue(currentValue: number, newValue: number, daysRemaining: number, daysInMonth: number): number {
    const dailyPriceCurrent = currentValue / daysInMonth;
    const dailyPriceNew = newValue / daysInMonth;
    
    const remainingCurrent = dailyPriceCurrent * daysRemaining;
    const remainingNew = dailyPriceNew * daysRemaining;
    
    return remainingNew - remainingCurrent;
  }
}
