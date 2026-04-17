/**
 * Owner Updater Agent - ImobWeb 2026
 * Agente para proprietário: mensagens proativas sobre o imóvel
 */

import {
  AIResponseRequest,
  AIResponse,
  PropertyUpdateData,
  FlowType,
  WhatsAppButton,
  SuggestedActions,
} from "@/types/whatsapp";

const OWNER_SYSTEM_PROMPT =
  "Você é um assistente virtual inteligente da ImobWeb que ajuda proprietários a acompanhar seus imóveis.";

export async function generateOwnerResponse(
  phoneNumber: string,
  incomingMessage: string,
  context: any,
): Promise<AIResponse> {
  const propertyData = context.propertyData || {};
  const flowType = context.flowType as FlowType;
  const state = context.state;
  const propertyId = context.propertyId;

  const views30 = propertyData.views30Days || 0;
  const views45 = propertyData.views45Days || 0;
  const healthScore = propertyData.healthScore || 50;
  const priceSuggestion = propertyData.priceSuggestion;
  const isExpiring = propertyData.isExpiringSoon || false;
  const daysToExpire = propertyData.daysToExpire || 30;
  const marketTrend = propertyData.marketTrend || "stable";

  const createButtons = (
    btnList: { id: string; title: string }[],
  ): SuggestedActions => {
    return {
      type: "BUTTON",
      items: btnList,
      buttons: btnList,
    };
  };

  if (flowType === "PROPERTY_UPDATE" && state === "PROPERTY_UPDATE_30D") {
    const msg =
      "📊 Seu imóvel está tendo um bom desempenho!\n\n✅ Primeiros 30 dias:\n• " +
      views30 +
      " visualizações\n• " +
      Math.floor(views30 * 0.3) +
      " salvaram\n• " +
      Math.floor(views30 * 0.1) +
      " agendaram visitas\n\n💡 " +
      (views30 > 50 ? "Excelente!" : "Que tal atualizar fotos?") +
      "\n\nQuer acelerar a venda?";
    return {
      message: msg,
      suggestedActions: createButtons([
        { id: "update_photos_" + propertyId, title: "Atualizar fotos" },
        { id: "adjust_price_" + propertyId, title: "Ajustar preço" },
        { id: "view_stats_" + propertyId, title: "Ver estatísticas" },
      ]),
      priority: "NORMAL",
    };
  }

  if (
    flowType === "PRICE_SUGGESTION" ||
    (flowType === "PROPERTY_UPDATE" && state === "PROPERTY_UPDATE_45D")
  ) {
    const trendMap: Record<string, string> = {
      up: "subindo ↗",
      down: "em baixa ↘",
      stable: "estável →",
    };
    let msg =
      "🏠 Análise do imóvel (45 dias)\n\n" +
      getHealthMessage(healthScore) +
      "\n\n📈 Mercado: " +
      trendMap[marketTrend];
    if (priceSuggestion) {
      msg += "\n\n💰 Sugestão: R$ " + priceSuggestion.toLocaleString();
    }
    msg += "\n\nComo proceder?";
    return {
      message: msg,
      suggestedActions: createButtons([
        { id: "accept_price_" + propertyId, title: "Aceitar sugestão" },
        { id: "negotiate_price_" + propertyId, title: "Negociar" },
        { id: "keep_price_" + propertyId, title: "Manter" },
      ]),
      shouldUpdateCRM: false,
      priority: "NORMAL",
    };
  }

  if (flowType === "PHOTO_REQUEST" || healthScore < 40) {
    return {
      message:
        "📸 Fotos fazem diferença! Seu imóvel tem " +
        views30 +
        " visualizações. Imóveis com fotos profissional vendem 3x mais rápido.",
      suggestedActions: createButtons([
        { id: "upload_photos_" + propertyId, title: "Enviar fotos" },
        { id: "schedule_photo_" + propertyId, title: "Agendar Fotógrafo" },
        { id: "later_" + propertyId, title: "Mais tarde" },
      ]),
      priority: "HIGH",
    };
  }

  if (flowType === "EXPIRING_REMINDER" || isExpiring || daysToExpire <= 15) {
    return {
      message:
        "⚠️ Seu anúncio expira em " +
        daysToExpire +
        " dias!\n\nRenove para manter no topo:",
      suggestedActions: createButtons([
        { id: "renew_highlight_" + propertyId, title: "Renovar com destaque" },
        { id: "renew_standard_" + propertyId, title: "Renovar normal" },
        { id: "remove_ad_" + propertyId, title: "Remover" },
      ]),
      shouldUpdateCRM: false,
      priority: "URGENT",
    };
  }

  if (incomingMessage) {
    return {
      message:
        "Obrigado! Seu imóvel tem " + views30 + " visualizações este mês.",
      suggestedActions: createButtons([
        { id: "view_stats_" + propertyId, title: "Estatísticas" },
        { id: "adjust_price_" + propertyId, title: "Ajustar preço" },
        { id: "contact_agent_" + propertyId, title: "Falar corretor" },
      ]),
      priority: "NORMAL",
    };
  }

  return {
    message:
      "Olá! Sou assistente ImobWeb. Posso ajudar com estatísticas, preço, fotos e alertas.",
    suggestedActions: createButtons([
      { id: "view_stats_" + propertyId, title: "Estatísticas" },
      { id: "adjust_price_" + propertyId, title: "Ajustar preço" },
      { id: "update_photos_" + propertyId, title: "Atualizar fotos" },
    ]),
    priority: "NORMAL",
  };
}

function getHealthMessage(score: number): string {
  if (score >= 80) return "✅ Saúde: EXCELENTE (" + score + "/100)";
  if (score >= 60) return "👍 Saúde: BOM (" + score + "/100)";
  if (score >= 40) return "⚠️ Saúde: REGULAR (" + score + "/100)";
  return "❌ Saúde: PRECISA ATENÇÃO (" + score + "/100)";
}

export async function processOwnerButtonResponse(
  propertyId: string,
  buttonId: string,
  ownerId: string,
): Promise<{ success: boolean; message: string; updates?: any }> {
  const action = buttonId.split("_")[0];

  if (action === "accept")
    return {
      success: true,
      message: "Preço atualizado!",
      updates: { price: buttonId.split("_").slice(1).join("_") },
    };
  if (action === "negotiate")
    return { success: true, message: "Entendido. Vou passar para o corretor." };
  if (action === "keep")
    return { success: true, message: "Ok! Preço mantido." };
  if (action === "upload" || action === "update")
    return { success: true, message: "Pode enviar as fotos aqui." };
  if (action === "schedule")
    return { success: true, message: "Agendando fotógrafo." };
  if (action === "renew")
    return { success: true, message: "Renovando anúncio!" };
  if (action === "view") return { success: true, message: "stats" };
  return { success: false, message: "Não entendi." };
}
