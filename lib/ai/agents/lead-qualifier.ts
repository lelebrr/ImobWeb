/**
 * Lead Qualifier Agent - ImobWeb 2026
 * Agente para qualificação de leads via WhatsApp
 */

import {
  AIResponse,
  LeadQualificationData,
  WhatsAppButton,
  SuggestedActions,
} from "@/types/whatsapp";

const LEAD_SYSTEM_PROMPT =
  "Você é um assistente virtual da ImobWeb que qualifica leads de forma natural e Friendly.";

export async function generateLeadResponse(
  phoneNumber: string,
  incomingMessage: string,
  context: any,
): Promise<AIResponse> {
  const leadData = context.leadData || {};
  const propertyId = context.propertyId;
  const flowType = context.flowType;

  const createActions = (
    btns: { id: string; title: string }[],
  ): SuggestedActions => ({
    type: "BUTTON",
    items: btns,
    buttons: btns,
  });

  // Mensagem de boas-vindas inicial
  if (!incomingMessage && flowType === "LEAD_QUALIFICATION") {
    const name = leadData.name || "";
    const welcomeMsg = name
      ? "Olá " + name + "! Obrigado pelo interesse. Como posso ajudar?"
      : "Olá! Sou assistente ImobWeb. Como posso ajudar?";

    return {
      message: welcomeMsg,
      suggestedActions: createActions([
        { id: "interested", title: "Tenho interesse" },
        { id: "visit_schedule", title: "Quero visitar" },
        { id: "more_info", title: "Mais informações" },
      ]),
      priority: "NORMAL",
    };
  }

  // Detecção de intenção
  const lowerMsg = (incomingMessage || "").toLowerCase();

  if (lowerMsg.includes("interesse") || lowerMsg.includes("quero")) {
    return {
      message: "Ótimo! Me conta: você busca imóvel para compra ou aluguel?",
      suggestedActions: createActions([
        { id: "buy", title: "Comprar" },
        { id: "rent", title: "Alugar" },
        { id: "both", title: "Ambos" },
      ]),
      priority: "NORMAL",
      shouldUpdateCRM: true,
      crmUpdates: { lead: { status: "QUALIFYING" } },
    };
  }

  if (lowerMsg.includes("visita") || lowerMsg.includes("visitar")) {
    return {
      message: "Perfeito! Qual data e horário funcionam melhor para você?",
      suggestedActions: createActions([
        { id: "visit_weekday_morning", title: "Dia útil manhã" },
        { id: "visit_weekday_afternoon", title: "Dia útil tarde" },
        { id: "visit_weekend", title: "Finais de semana" },
      ]),
      priority: "HIGH",
    };
  }

  if (
    lowerMsg.includes("valor") ||
    lowerMsg.includes("preço") ||
    lowerMsg.includes("quanto")
  ) {
    return {
      message: "Qual faixa de preço você tem em mente?",
      suggestedActions: createActions([
        { id: "budget_up_to_500k", title: "Até R$ 500mil" },
        { id: "budget_500k_1m", title: "R$ 500mil - 1M" },
        { id: "budget_1m_2m", title: "R$ 1M - 2M" },
        { id: "budget_above_2m", title: "Acima de R$ 2M" },
      ]),
      priority: "NORMAL",
    };
  }

  if (lowerMsg.includes("financiamento") || lowerMsg.includes("finan")) {
    return {
      message:
        "Temos especialistas em financiamento! Pretende usar financiamento bancário ou FGTS? Posso te conectar com nosso parceiros.",
      suggestedActions: createActions([
        { id: "finance_bank", title: "Financiamento bancário" },
        { id: "finance_fgts", title: "FGTS" },
        { id: "finance_both", title: "Não sei ainda" },
      ]),
      priority: "NORMAL",
    };
  }

  if (
    lowerMsg.includes("localização") ||
    lowerMsg.includes("bairro") ||
    lowerMsg.includes("onde")
  ) {
    return {
      message: "Em qual bairro ou região você busca?",
      suggestedActions: createActions([
        { id: "loc_zona_sul", title: "Zona Sul" },
        { id: "loc_zona_oeste", title: "Zona Oeste" },
        { id: "loc_centro", title: "Centro" },
        { id: "loc_other", title: "Outra região" },
      ]),
      priority: "NORMAL",
    };
  }

  if (
    lowerMsg.includes("sim") ||
    lowerMsg.includes("pode") ||
    lowerMsg.includes("quero")
  ) {
    return {
      message: "Perfeito! Vou confirmar sua visita. Qual seu nome completo?",
      suggestedActions: createActions([
        { id: "confirm_name", title: "Ok, vou informar" },
      ]),
      priority: "HIGH",
    };
  }

  if (
    lowerMsg.includes("não") ||
    lowerMsg.includes("não posso") ||
    lowerMsg.includes("impossível")
  ) {
    return {
      message:
        "Sem problemas! Podemos remarcar para outro horário. Quando prefere?",
      suggestedActions: createActions([
        { id: "reschedule_other", title: "Propor outro horário" },
        { id: "reschedule_later", title: "Depois falamos" },
      ]),
      priority: "NORMAL",
    };
  }

  // Classificação de lead
  const score = qualifyLead(incomingMessage);

  if (score > 0) {
    return {
      message:
        "Entendi! Posso te ajudar melhor. Você já visitou algum imóvel ou é primeiro pencarian?",
      suggestedActions: createActions([
        { id: "first_time", title: "Primeira vez" },
        { id: "visited_before", title: "Já visitei" },
        { id: "need_more", title: "Preciso de opções" },
      ]),
      priority: "NORMAL",
      crmUpdates: { lead: { score } },
    };
  }

  // Resposta padrão
  return {
    message:
      "Entendido! Para eu te ajudar melhor, me conta: qual tipo de imóvel você procura?",
    suggestedActions: createActions([
      { id: "type_apartment", title: "Apartamento" },
      { id: "type_house", title: "Casa" },
      { id: "type_condo", title: "Condomínio" },
      { id: "type_land", title: "Terreno" },
    ]),
    priority: "NORMAL",
  };
}

function qualifyLead(message: string): number {
  const lower = message.toLowerCase();
  let score = 50;

  if (lower.includes("comprar") || lower.includes("pretendo")) score += 20;
  if (lower.includes("à vista") || lower.includes("finan")) score += 15;
  if (lower.includes("urgente") || lower.includes("agora")) score += 15;
  if (lower.includes("investimento")) score += 10;

  return Math.min(score, 100);
}

export async function processLeadButtonResponse(
  leadId: string,
  buttonId: string,
): Promise<{ success: boolean; message: string; updates?: any }> {
  const [action, ...rest] = buttonId.split("_");

  const responses: Record<
    string,
    { message: string; status?: string; score?: number }
  > = {
    interested: {
      message: "Ótimo! Vou te mostrar opções.",
      status: "QUALIFYING",
      score: 70,
    },
    visit_schedule: {
      message: "Agendando visita!",
      status: "VISITA_AGENDADA",
      score: 85,
    },
    more_info: {
      message: "Claro! O que gostaria de saber?",
      status: "EM_ATENDIMENTO",
      score: 60,
    },
    buy: {
      message: "Perfeito! Busca para compra.",
      status: "QUALIFYING",
      score: 80,
    },
    rent: {
      message: "Entendido! Busca para locação.",
      status: "QUALIFYING",
      score: 70,
    },
    both: {
      message: "Pode ser either. Vou te mostrar opções para ambos.",
      status: "QUALIFYING",
      score: 65,
    },
    confirm_name: {
      message: "Visita confirmada!",
      status: "VISITA_CONFIRMADA",
      score: 95,
    },
  };

  const resp = responses[action];
  if (resp) {
    return {
      success: true,
      message: resp.message,
      updates: {
        lead: {
          status: resp.status,
          score: resp.score,
        },
      },
    };
  }

  return { success: false, message: "Não entendi." };
}
