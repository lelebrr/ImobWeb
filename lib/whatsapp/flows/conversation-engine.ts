/**
 * Conversation Engine - ImobWeb 2026
 * Motor central de fluxos conversacionais com IA
 */

import { prisma } from "@/lib/prisma";
import {
  FlowType,
  AIResponse,
  ConversationContext,
  MessagePriority,
  WhatsAppButton,
  SuggestedActions,
} from "@/types/whatsapp";
import { generateLeadResponse } from "@/lib/ai/agents/lead-qualifier";
import { generateOwnerResponse } from "@/lib/ai/agents/owner-updater";
import { sendWhatsAppMessage } from "@/lib/whatsapp/cloud-api";

const CONVERSATION_TIMEOUT_MS = 24 * 60 * 60 * 1000;
const MAX_AUTO_RETRIES = 2;

interface ConversationSession {
  id: string;
  phoneNumber: string;
  state: string;
  flowType: FlowType;
  leadId?: string;
  ownerId?: string;
  propertyId?: string;
  agentId?: string;
  tenantId: string;
  context: ConversationContext;
  retryCount: number;
  lastMessageAt: Date;
  createdAt: Date;
}

class ConversationEngine {
  private flows: Map<
    string,
    (phone: string, msg: string, ctx: any) => Promise<AIResponse>
  > = new Map();

  constructor() {
    this.flows.set("LEAD_QUALIFICATION", generateLeadResponse);
    this.flows.set("PROPERTY_UPDATE", generateOwnerResponse);
    this.flows.set("PRICE_SUGGESTION", generateOwnerResponse);
    this.flows.set("PHOTO_REQUEST", generateOwnerResponse);
    this.flows.set("VISIT_CONFIRMATION", generateLeadResponse);
    this.flows.set("EXPIRING_REMINDER", generateOwnerResponse);
    this.flows.set("GENERAL", generateLeadResponse);
  }

  async processIncomingMessage(
    phoneNumber: string,
    message: string,
    messageType: string = "text",
    mediaUrl?: string,
  ): Promise<AIResponse> {
    const tenantId = await this.getTenantIdByPhone(phoneNumber);
    if (!tenantId) {
      throw new Error("Tenant not found");
    }

    let session = await this.getOrCreateSession(phoneNumber, tenantId);

    await this.logMessage(
      session.id,
      message,
      "INBOUND",
      messageType,
      mediaUrl,
    );

    if (
      Date.now() - session.lastMessageAt.getTime() >
      CONVERSATION_TIMEOUT_MS
    ) {
      session = await this.resetSession(session);
    }

    let response = await this.generateAIResponse(session, message);

    if (response.isFallback) {
      session.retryCount++;
      if (session.retryCount <= MAX_AUTO_RETRIES) {
        return this.processIncomingMessage(
          phoneNumber,
          message,
          messageType,
          mediaUrl,
        );
      }

      await this.notifyFallback(session, message);
      response = {
        message: "Obrigado! Um corretor entrará em contato em breve.",
        priority: "HIGH",
      };
    }

    await this.sendResponse(session.phoneNumber, response);
    await this.updateSession(session, message, response);

    if (response.shouldUpdateCRM && response.crmUpdates) {
      await this.applyCRMUpdates(session, response.crmUpdates);
    }

    return response;
  }

  async startOwnerFlow(
    propertyId: string,
    flowType: FlowType,
    propertyData: any,
  ): Promise<void> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { owner: true },
      });

      if (!property?.owner?.whatsapp) {
        console.log(
          "[ConversationEngine] Owner no WhatsApp for property:",
          propertyId,
        );
        return;
      }

      const tenantId = property.organizationId;

      const session = await this.createSession(
        property.owner.whatsapp,
        tenantId,
        "PROPERTY_UPDATE",
        { propertyId, propertyData },
      );

      const response = await generateOwnerResponse(
        property.owner.whatsapp,
        "",
        { propertyId, propertyData, flowType },
      );

      await this.sendResponse(property.owner.whatsapp, response);
      await this.updateSession(session, "", response);
    } catch (error) {
      console.error("[ConversationEngine] startOwnerFlow error:", error);
    }
  }

  async startLeadFlow(
    leadId: string,
    _source: string = "portal",
  ): Promise<void> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead?.whatsapp) return;

      const tenantId = lead.organizationId;

      const session = await this.createSession(
        lead.whatsapp,
        tenantId,
        "LEAD_QUALIFICATION",
        { leadId },
      );

      const response: AIResponse = {
        message:
          "Olá " +
          (lead.name || "") +
          "! Obrigado pelo interesse. Como posso ajudar?",
        suggestedActions: {
          type: "BUTTON",
          items: [
            { id: "interested", title: "Tenho interesse" },
            { id: "visit_schedule", title: "Quero visitar" },
            { id: "more_info", title: "Mais informações" },
          ],
        },
      };

      await this.sendResponse(lead.whatsapp, response);
      await this.updateSession(session, "", response);
    } catch (error) {
      console.error("[ConversationEngine] startLeadFlow error:", error);
    }
  }

  private async getOrCreateSession(
    phoneNumber: string,
    tenantId: string,
  ): Promise<ConversationSession> {
    try {
      const conv = await prisma.conversation.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (conv) {
        return {
          id: conv.id,
          phoneNumber,
          state: "ACTIVE",
          flowType: "LEAD_QUALIFICATION",
          leadId: conv.leadId,
          tenantId,
          context: {},
          retryCount: 0,
          lastMessageAt: conv.createdAt,
          createdAt: conv.createdAt,
        };
      }
    } catch (e) {
      console.log("[ConversationEngine] getOrCreateSession error:", e);
    }

    return this.createSession(phoneNumber, tenantId, "LEAD_QUALIFICATION", {});
  }

  private async createSession(
    phoneNumber: string,
    tenantId: string,
    flowType: FlowType,
    context: ConversationContext,
  ): Promise<ConversationSession> {
    return {
      id: "session_" + Date.now(),
      phoneNumber,
      state: "NEW_LEAD",
      flowType,
      tenantId,
      context,
      retryCount: 0,
      lastMessageAt: new Date(),
      createdAt: new Date(),
    };
  }

  private async generateAIResponse(
    session: ConversationSession,
    message: string,
  ): Promise<AIResponse> {
    const flowHandler = this.flows.get(session.flowType);

    if (!flowHandler) {
      return { message: "Desculpe, não entendi.", priority: "NORMAL" };
    }

    try {
      return await flowHandler(session.phoneNumber, message, session.context);
    } catch (error) {
      console.error("[ConversationEngine] AI error:", error);
      return {
        message: "Erro ao processar. Um corretor vai te atender.",
        isFallback: true,
        priority: "HIGH",
      };
    }
  }

  private async sendResponse(
    phoneNumber: string,
    response: AIResponse,
  ): Promise<void> {
    const actions = response.suggestedActions?.items;

    await sendWhatsAppMessage(phoneNumber, response.message, {
      type: actions?.length ? "INTERACTIVE" : "TEXT",
      buttons: actions as WhatsAppButton[],
    });
  }

  private async updateSession(
    session: ConversationSession,
    incomingMessage: string,
    response: AIResponse,
  ): Promise<void> {
    session.context = {
      ...session.context,
      lastIncomingMessage: incomingMessage,
      lastOutgoingMessage: response.message,
      lastResponseAt: new Date(),
    };
    session.lastMessageAt = new Date();
  }

  private async resetSession(
    session: ConversationSession,
  ): Promise<ConversationSession> {
    return this.createSession(
      session.phoneNumber,
      session.tenantId,
      session.flowType,
      session.context,
    );
  }

  private async logMessage(
    conversationId: string,
    message: string,
    direction: string,
    messageType: string,
    _mediaUrl?: string,
  ): Promise<void> {
    try {
      await prisma.conversation.create({
        data: {
          id: "conv_" + Date.now(),
          leadId: conversationId,
          message,
          direction: "INBOUND" as any,
          status: "ENTREGUE",
          messageType,
        },
      });
    } catch (e) {
      console.log("[ConversationEngine] Log message error:", e);
    }
  }

  private async notifyFallback(
    session: ConversationSession,
    _originalMessage: string,
  ): Promise<void> {
    if (!session.agentId) return;
    console.log(
      "[ConversationEngine] Notify fallback to agent:",
      session.agentId,
    );
  }

  private async applyCRMUpdates(
    session: ConversationSession,
    updates: Record<string, any>,
  ): Promise<void> {
    if (session.leadId && updates.lead) {
      try {
        await prisma.lead.update({
          where: { id: session.leadId },
          data: updates.lead as any,
        });
      } catch (e) {
        console.log("[ConversationEngine] CRM update error:", e);
      }
    }
  }

  private async getTenantIdByPhone(
    phoneNumber: string,
  ): Promise<string | null> {
    try {
      const lead = await prisma.lead.findFirst({
        where: { OR: [{ whatsapp: phoneNumber }, { phone: phoneNumber }] },
      });
      return lead?.organizationId || null;
    } catch {
      return null;
    }
  }

  async processInteractiveResponse(
    _phoneNumber: string,
    buttonId: string,
  ): Promise<AIResponse> {
    const actionResponses: Record<string, string> = {
      interested: "Ótimo! Qual tipo de imóvel você busca?",
      visit_schedule: "Perfeito! Qual data e horário?",
      more_info: "Claro! O que gostaria de saber?",
      price_accept: "Preço ajustado! Vou atualizar.",
      price_negotiate: "Entendido. Qual valor sugere?",
      photo_upload: "Pode enviar as fotos aqui.",
      photo_schedule: "Qual data funciona?",
      visit_confirm: "Visita confirmada!",
      visit_reschedule: "Qual outro horário?",
    };

    const action = buttonId.split("_")[0];
    return {
      message: actionResponses[action] || "Entendido. Como posso ajudar?",
      priority: "NORMAL",
    };
  }

  async listActiveConversations(_tenantId: string): Promise<any[]> {
    return prisma.conversation.findMany({
      where: { status: "ATIVA" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getConversationsStats() {
    try {
      const total = await prisma.conversation.count();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCount = await prisma.conversation.count({
        where: { createdAt: { gte: today } },
      });

      return { total, today: todayCount };
    } catch {
      return { total: 0, today: 0 };
    }
  }

  async sendQuickReply(
    phoneNumber: string,
    message: string,
    actions?: SuggestedActions,
  ): Promise<boolean> {
    try {
      const result = await sendWhatsAppMessage(phoneNumber, message, {
        type: actions?.items?.length ? "INTERACTIVE" : "TEXT",
        buttons: actions?.items as WhatsAppButton[],
      });
      return result.success;
    } catch {
      return false;
    }
  }
}

export const conversationEngine = new ConversationEngine();
export default conversationEngine;
