import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * BILLING AGENT - imobWeb 2026
 * Motor de Faturamento Baseado em Uso (Usage-Based Billing).
 * Registra consumo de IA, Tours Virtuais e Armazenamento.
 */

export type MeteredMetric = 'ia_photo_optimize' | 'ia_voice_transcription' | 'virtual_tour_render' | 'whatsapp_hsm_send';

export class BillingAgent {
  /**
   * Registra um evento de consumo para cobrança posterior ou abatimento de créditos.
   */
  static async trackUsage(tenantId: string, metric: MeteredMetric, quantity: number = 1): Promise<boolean> {
    try {
      console.log(`[BILLING] Tenant ${tenantId} consumiu ${quantity} unidade(s) de ${metric}`);

      // 1. Atualizar contador mensal no JSON de settings do Tenant
      // Em larga escala, isso seria feito via InfluxDB/Redis e processado em batch.
      const org = await prisma.organization.findUnique({ where: { id: tenantId } });
      const currentUsage = (org?.settings as any)?.usage || {};
      const metricUsage = currentUsage[metric] || 0;

      await prisma.organization.update({
        where: { id: tenantId },
        data: {
          settings: {
            ...((org?.settings as any) || {}),
            usage: {
              ...currentUsage,
              [metric]: metricUsage + quantity,
              last_updated: new Date().toISOString()
            }
          }
        }
      });

      // 2. Se o Add-on for pré-pago, descontar do saldo de créditos interno
      // Integration hook para Stripe Metered Billing (Usage Records)
      
      return true;
    } catch (e) {
      console.error("[BILLING_TRACK_ERROR]", e);
      return false;
    }
  }

  /**
   * Calcula o valor total por uso para o fechamento da fatura do parceiro.
   */
  static calculateUsageCost(metric: MeteredMetric, quantity: number): number {
    const rates: Record<MeteredMetric, number> = {
      'ia_photo_optimize': 0.50,      // R$ 0,50 por foto
      'ia_voice_transcription': 0.10, // R$ 0,10 por min
      'virtual_tour_render': 15.00,   // R$ 15,00 por tour renderizado
      'whatsapp_hsm_send': 0.05       // R$ 0,05 por template oficial
    };

    return (rates[metric] || 0) * quantity;
  }
}
