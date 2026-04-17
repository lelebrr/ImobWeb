/**
 * WhatsApp Flows API - ImobWeb 2026
 * Endpoints para управления fluxos conversacionais
 */

import { NextRequest, NextResponse } from "next/server";
import { conversationEngine } from "@/lib/whatsapp/flows/conversation-engine";
import { proactiveScheduler } from "@/lib/whatsapp/flows/proactive-scheduler";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/whatsapp/flows
 * Inicia um fluxo para lead ou proprietário
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, type, leadId, propertyId, phoneNumber, message } = body;

    if (action === "start_lead_flow" && leadId) {
      await conversationEngine.startLeadFlow(leadId, "dashboard");
      return NextResponse.json({
        success: true,
        message: "Fluxo de lead iniciado",
      });
    }

    if (action === "start_owner_flow" && propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { owner: true },
      });

      if (!property?.owner?.whatsapp) {
        return NextResponse.json(
          { error: "Proprietário sem WhatsApp" },
          { status: 400 },
        );
      }

      await conversationEngine.startOwnerFlow(
        propertyId,
        type || "PROPERTY_UPDATE",
        {
          views30Days: (property as any).viewCount || 0,
        },
      );

      return NextResponse.json({
        success: true,
        message: "Fluxo de proprietário iniciado",
      });
    }

    if (action === "send_message" && phoneNumber && message) {
      const result = await conversationEngine.sendQuickReply(
        phoneNumber,
        message,
      );
      return NextResponse.json({ success: result });
    }

    if (action === "process_response" && phoneNumber && message) {
      const response = await conversationEngine.processIncomingMessage(
        phoneNumber,
        message,
      );
      return NextResponse.json(response);
    }

    if (action === "get_stats") {
      const stats = await conversationEngine.getConversationsStats();
      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("[WhatsApp Flows API] Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * GET /api/whatsapp/flows
 * Retorna estatísticas ehealth de fluxos
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get("action");

  try {
    if (action === "stats") {
      const stats = await conversationEngine.getConversationsStats();
      return NextResponse.json(stats);
    }

    if (action === "conversations") {
      const conversations =
        await conversationEngine.listActiveConversations("");
      return NextResponse.json(conversations);
    }

    if (action === "trigger_proactive") {
      proactiveScheduler.start();
      return NextResponse.json({ message: "Scheduler iniciado" });
    }

    return NextResponse.json({
      message: "WhatsApp Flows API",
      endpoints: {
        POST: {
          start_lead_flow: "Inicia fluxo para lead",
          start_owner_flow: "Inicia fluxo para proprietário",
          send_message: "Envia mensagem rápida",
          process_response: "Processa resposta do cliente",
          get_stats: "Obtém estatísticas",
        },
      },
    });
  } catch (error) {
    console.error("[WhatsApp Flows API] Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
