/**
 * WhatsApp AI Service - ImobWeb 2026
 * IA para leads e proprietários
 */

import { AIResponse, WhatsAppButton } from "@/types/whatsapp";

export function extractLeadData(message: string, existingData?: any): any {
  const lower = message.toLowerCase();
  const data = { ...existingData };

  if (lower.includes("apartamento") || lower.includes("apê"))
    data.propertyType = "APARTAMENTO";
  else if (lower.includes("casa")) data.propertyType = "CASA";
  else if (lower.includes("condomínio")) data.propertyType = "CONDOMINIO";
  else if (lower.includes("terreno")) data.propertyType = "TERRENO";

  if (lower.includes("até 500") || lower.includes("ate 500k")) {
    data.budgetMin = 0;
    data.budgetMax = 500000;
  } else if (lower.includes("500k") && lower.includes("1m")) {
    data.budgetMin = 500000;
    data.budgetMax = 1000000;
  } else if (lower.includes("1m") && lower.includes("2m")) {
    data.budgetMin = 1000000;
    data.budgetMax = 2000000;
  }

  if (lower.includes("visitar")) data.visitDate = "PENDENTE";
  if (lower.includes("comprar")) data.notes = "COMPRA";
  else if (lower.includes("alugar")) data.notes = "ALUGUEL";

  return data;
}

export function calculateLeadScore(message: string): number {
  const lower = message.toLowerCase();
  let score = 50;

  if (lower.includes("interesse") || lower.includes("quero")) score += 15;
  if (lower.includes("visita") || lower.includes("agendar")) score += 20;
  if (lower.includes("urgente") || lower.includes("agora")) score += 10;
  if (lower.includes("à vista") || lower.includes("finan")) score += 15;
  if (lower.includes("investimento")) score += 5;
  if (lower.includes("só olhando")) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export async function generateIntelligentLeadResponse(
  message: string,
  context: any,
): Promise<AIResponse> {
  const leadData = extractLeadData(message, context.existingData);
  const score = calculateLeadScore(message);
  const lower = message.toLowerCase();

  const createActions = (
    buttons: WhatsAppButton[],
  ): AIResponse["suggestedActions"] => ({
    type: "BUTTON",
    items: buttons,
    buttons,
  });

  if (lower.includes("visita")) {
    return {
      message: "Perfeito! Que dia e horário funcionam melhor?",
      suggestedActions: createActions([
        { id: "visit_weekday", title: "Dia útil" },
        { id: "visit_weekend", title: "Fim de semana" },
      ]),
      shouldUpdateCRM: true,
      crmUpdates: { lead: { score } },
      priority: "HIGH",
    };
  }

  if (lower.includes("valor") || lower.includes("preço")) {
    return {
      message: "Qual faixa de preço você tem em mente?",
      suggestedActions: createActions([
        { id: "budget_500k", title: "Até R$ 500mil" },
        { id: "budget_1m", title: "R$ 500mil - 1M" },
        { id: "budget_2m", title: "R$ 1M - 2M" },
        { id: "budget_2m_plus", title: "Acima de R$ 2M" },
      ]),
      priority: "NORMAL",
    };
  }

  if (lower.includes("finan")) {
    return {
      message:
        "Temos especialistas em financiamento! Pretende usar banco ou FGTS?",
      suggestedActions: createActions([
        { id: "finance_bank", title: "Banco" },
        { id: "finance_fgts", title: "FGTS" },
      ]),
      priority: "NORMAL",
    };
  }

  if (lower.includes("interesse") || lower.includes("quero")) {
    return {
      message: "Ótimo! Busca para compra ou aluguel?",
      suggestedActions: createActions([
        { id: "buy", title: "Comprar" },
        { id: "rent", title: "Alugar" },
      ]),
      shouldUpdateCRM: true,
      crmUpdates: { lead: { status: "QUALIFYING" } },
      priority: "NORMAL",
    };
  }

  return {
    message: "Entendido! Qual tipo de imóvel você procura?",
    suggestedActions: createActions([
      { id: "type_apartment", title: "Apartamento" },
      { id: "type_house", title: "Casa" },
      { id: "type_condo", title: "Condomínio" },
    ]),
    priority: "NORMAL",
  };
}

export async function generateIntelligentOwnerResponse(
  propertyData: any,
  flowType: string,
): Promise<AIResponse> {
  const views30 = propertyData.views30Days || 0;
  const healthScore = propertyData.healthScore || 50;
  const priceSuggestion = propertyData.priceSuggestion;
  const daysToExpire = propertyData.daysToExpire || 30;

  const createActions = (
    buttons: WhatsAppButton[],
  ): AIResponse["suggestedActions"] => ({
    type: "BUTTON",
    items: buttons,
    buttons,
  });

  if (flowType === "PROPERTY_UPDATE_30D") {
    return {
      message:
        "📊 Seu imóvel:\n\n• " +
        views30 +
        " visualizações (30 dias)\n• " +
        Math.floor(views30 * 0.3) +
        " salvaram\n• " +
        Math.floor(views30 * 0.1) +
        " agendaram visitas\n\n" +
        (views30 > 50 ? "Excelente!" : "Que tal atualizar as fotos?"),
      suggestedActions: createActions([
        { id: "update_photos", title: "Atualizar fotos" },
        { id: "adjust_price", title: "Ajustar preço" },
      ]),
      priority: "NORMAL",
    };
  }

  if (flowType === "PRICE_SUGGESTION") {
    const healthMsg =
      healthScore >= 80
        ? "Excelente"
        : healthScore >= 60
          ? "Bom"
          : healthScore >= 40
            ? "Regular"
            : "Precisa atenção";
    let msg =
      "🏠 Análise do imóvel\n\nSaúde: " +
      healthMsg +
      " (" +
      healthScore +
      "/100)";
    if (priceSuggestion) {
      msg += "\n\nSugestão: R$ " + priceSuggestion.toLocaleString();
    }
    return {
      message: msg,
      suggestedActions: createActions([
        { id: "accept_price", title: "Aceitar" },
        { id: "negotiate_price", title: "Negociar" },
      ]),
      priority: "NORMAL",
    };
  }

  if (flowType === "PHOTO_REQUEST") {
    return {
      message:
        "📸 Fotos profissionais vendem 3x mais rápido!\n\nSeu imóvel tem " +
        views30 +
        " visualizações.",
      suggestedActions: createActions([
        { id: "upload_photos", title: "Enviar fotos" },
        { id: "schedule_photo", title: "Agendar Fotógrafo" },
      ]),
      priority: "HIGH",
    };
  }

  if (flowType === "EXPIRING_REMINDER") {
    return {
      message:
        "⚠️ Anúncio expira em " +
        daysToExpire +
        " dias!\n\nRenove para manter no topo:",
      suggestedActions: createActions([
        { id: "renew_highlight", title: "Destacar" },
        { id: "renew_standard", title: "Renovar" },
      ]),
      priority: "URGENT",
    };
  }

  return {
    message: "Olá! Posso ajudar com estatísticas, preço e fotos.",
    suggestedActions: createActions([
      { id: "view_stats", title: "Estatísticas" },
      { id: "adjust_price", title: "Preço" },
    ]),
    priority: "NORMAL",
  };
}
