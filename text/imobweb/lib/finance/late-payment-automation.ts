/**
 * Late Payment Automation - ImobWeb 2026
 * 
 * Orquestra o envio de cobranças automáticas via WhatsApp para clientes inadimplentes.
 * Integra-se com o motor de faturamento e a API do WhatsApp.
 */

import { AdvancedFlows } from '../whatsapp/advanced-flows';

export interface LatePaymentRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  daysLate: number;
  amount: number;
  invoiceUrl: string;
}

export class LatePaymentAutomation {
  private whatsapp: AdvancedFlows;

  constructor() {
    this.whatsapp = new AdvancedFlows();
  }

  /**
   * Dispara a primeira cobrança (3 dias de atraso)
   */
  async sendFirstNotice(record: LatePaymentRecord) {
    console.log(`[LatePayment] Enviando 1ª notificação para ${record.customerName}`);
    
    // Usamos um fluxo interativo para facilitar o pagamento
    const message = `Olá ${record.customerName}, notamos que o pagamento de R$ ${record.amount.toFixed(2)} está atrasado há ${record.daysLate} dias. Deseja receber a 2ª via do boleto agora?`;
    
    return this.whatsapp.sendInteractiveFlow(record.customerPhone, {
      type: 'BUTTON',
      text: message,
      buttons: [
        { id: 'send_invoice', title: 'Sim, mandar 2ª via' },
        { id: 'already_paid', title: 'Já paguei' }
      ]
    });
  }

  /**
   * Processa a lista de inadimplentes e automatiza notificações
   */
  async processDailyInadimplencia(records: LatePaymentRecord[]) {
    const results = [];
    for (const record of records) {
      if (record.daysLate === 3 || record.daysLate === 10) {
        const result = await this.sendFirstNotice(record);
        results.push({ id: record.id, sent: true });
      }
    }
    return results;
  }
}
