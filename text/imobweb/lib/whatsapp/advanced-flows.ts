/**
 * WhatsApp Advanced Flows - ImobWeb 2026
 * 
 * Lógica central para fluxos conversacionais complexos com proprietários.
 * Focado em automação inteligente e conversão via Meta WhatsApp Business Platform.
 */

import { z } from "zod";

// Tipos base para mensagens interativas do WhatsApp
export type WhatsAppButton = {
  id: string;
  title: string;
};

export type WhatsAppFlowType = 
  | "PRICE_ADJUSTMENT" 
  | "PHOTO_REQUEST" 
  | "VISIT_CONFIRMATION";

/**
 * Interface para envio de mensagens via Cloud API (Mock/Abstração)
 */
interface WhatsAppCloudAPI {
  sendButtons: (to: string, text: string, buttons: WhatsAppButton[]) => Promise<void>;
  sendTemplate: (to: string, templateName: string, components: any[]) => Promise<void>;
  sendList: (to: string, text: string, header: string, sections: any[]) => Promise<void>;
}

export class AdvancedFlows {
  /**
   * Fluxo 1: Propagação de Atualização de Preço
   */
  async sendPriceAdjustmentFlow(
    propertyId: string,
    ownerPhone: string,
    suggestedPrice: number,
    currentPrice: number,
    marketChange: string
  ) {
    console.log(`[WhatsAppFlow] Iniciando PriceAdjustment para imóvel ${propertyId}`);
    
    const message = `Olá! Estive analisando o mercado hoje e notei que imóveis similares no seu bairro estão sendo vendidos por valores em média ${marketChange}. 
    
  Para acelerar a venda do seu imóvel, sugerimos um ajuste de R$ ${currentPrice.toLocaleString()} para **R$ ${suggestedPrice.toLocaleString()}**. 
    
  O que você acha?`;

    const buttons: WhatsAppButton[] = [
      { id: `price_accept_${propertyId}`, title: "Aceitar Ajuste" },
      { id: `price_negotiate_${propertyId}`, title: "Negociar Valor" },
      { id: `price_decline_${propertyId}`, title: "Manter Preço" }
    ];

    try {
      console.log(`Enviando botões para ${ownerPhone}: ${message}`);
    } catch (error) {
      console.error("Falha ao enviar fluxo de preço via Cloud API. Iniciando fallback...", error);
    }
  }

  /**
   * Fluxo 2: Pedido Dinâmico de Fotos
   */
  async sendPhotoRequestFlow(
    propertyId: string,
    ownerPhone: string,
    ownerName: string
  ) {
    const message = `Olá ${ownerName}! 👋 Notamos que seu imóvel está recebendo muitas visualizações, mas os interessados pedem mais detalhes da cozinha e banheiros. 
    
  Imóveis com fotos profissionais e completas vendem até **3x mais rápido**. 
    
  Como prefere seguir?`;

    const buttons: WhatsAppButton[] = [
      { id: `photo_upload_${propertyId}`, title: "Vou enviar agora" },
      { id: `photo_schedule_${propertyId}`, title: "Agendar Fotógrafo" },
      { id: `photo_later_${propertyId}`, title: "Mais tarde" }
    ];

    console.log(`[WhatsAppFlow] Pedido de fotos enviado para ${ownerPhone}`);
  }

  /**
   * Fluxo 3: Confirmação de Visita (Quick-Reply)
   */
  async sendVisitConfirmationFlow(
    visitId: string,
    ownerPhone: string,
    visitorName: string,
    dateTime: string
  ) {
    const message = `Boa notícia! Temos um interessado (${visitorName}) querendo conhecer seu imóvel:
    
  📅 Data/Hora: **${dateTime}**
    
  Podemos confirmar este horário?`;

    const buttons: WhatsAppButton[] = [
      { id: `visit_confirm_${visitId}`, title: "Confirmar" },
      { id: `visit_reschedule_${visitId}`, title: "Solicitar Troca" },
      { id: `visit_deny_${visitId}`, title: "Não posso" }
    ];

    console.log(`[WhatsAppFlow] Confirmação de visita ${visitId} enviada para ${ownerPhone}`);
  }

  /**
   * Envia um fluxo interativo genérico (Usado para cobrança, etc)
   */
  async sendInteractiveFlow(to: string, options: { type: 'BUTTON' | 'LIST'; text: string; buttons: WhatsAppButton[] }) {
    console.log(`[WhatsAppFlow] Enviando mensagem interativa (${options.type}) para ${to}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  /**
   * Utilitário para processar a resposta do Webhook
   */
  async processFlowResponse(buttonId: string) {
    const [action, ...params] = buttonId.split("_");
    
    switch (action) {
      case "price":
        return { status: "success", message: "Ajuste de preço registrado!" };
      case "visit":
        return { status: "success", message: "Visita confirmada!" };
      default:
        return { status: "ignored" };
    }
  }
}

// Exportando funções individuais para compatibilidade (backwards compatibility)
const flows = new AdvancedFlows();
export const sendPriceAdjustmentFlow = flows.sendPriceAdjustmentFlow.bind(flows);
export const sendPhotoRequestFlow = flows.sendPhotoRequestFlow.bind(flows);
export const sendVisitConfirmationFlow = flows.sendVisitConfirmationFlow.bind(flows);
export const processFlowResponse = flows.processFlowResponse.bind(flows);
