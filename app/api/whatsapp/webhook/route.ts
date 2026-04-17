import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Webhook Handler para WhatsApp Business Cloud API
 * Recebe mensagens e chamadas do WhatsApp
 *
 * Configuração no WhatsApp Business API:
 * - Endpoint: https://seu-dominio.com/api/whatsapp/webhook
 * - Verify Token: token-seguro-aleatorio
 */

/**
 * Verificar assinatura do webhook (segurança)
 */
function verifySignature(
  request: NextRequest,
  signature: string,
  payload: string,
): boolean {
  // Em produção, validar com crypto HMAC + WHATSAPP_APP_SECRET
  // Por enquanto, aceita qualquer assinatura em dev
  return true;
}

/**
 * POST /api/whatsapp/webhook
 * Recebe eventos do WhatsApp (mensagens, chamadas, status)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifySignature(request, signature || "", body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const from = value?.messages?.[0]?.from;
    const message = value?.messages?.[0];
    const call = value?.calls?.[0];
    const statusEvent = value?.statuses?.[0];

    console.log("[WhatsApp Webhook] Event received:", {
      type: payload.object,
      from,
      hasMessage: !!message,
      hasCall: !!call,
      hasStatus: !!statusEvent,
    });

    if (message) {
      return await processIncomingMessage(message, from);
    }

    if (call) {
      return await processIncomingCall(call, from);
    }

    if (statusEvent) {
      return await processMessageStatus(statusEvent);
    }

    // Processa mensagens interativas (botões)
    const interactive = value?.messages?.[0]?.interactive;
    if (interactive) {
      const buttonReply = interactive.button_reply;
      const listReply = interactive.list_reply;
      const buttonId = buttonReply?.id || listReply?.id;

      if (buttonId) {
        console.log("[WhatsApp Webhook] Interactive response:", buttonId);
        // Processa via conversation engine
        return NextResponse.json({ received: true, interactive: buttonId });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/whatsapp/webhook
 * Verificação do webhook (necessário para registrar no WhatsApp)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp Webhook] Webhook verified successfully");
    return NextResponse.json(parseInt(challenge || "0"));
  }

  return NextResponse.json(
    { error: "Invalid verification token" },
    { status: 403 },
  );
}

/**
 * Processa atualização de status de mensagem
 */
async function processMessageStatus(status: any) {
  try {
    const messageId = status.message_id;
    const statusType = status.status;
    const timestamp = status.timestamp;

    const message = await prisma.conversation.findFirst({
      where: { externalId: messageId },
    });

    if (!message) {
      console.log("[WhatsApp Webhook] Message not found:", messageId);
      return NextResponse.json({ received: true });
    }

    await prisma.conversation.update({
      where: { id: message.id },
      data: {
        status:
          statusType === "sent"
            ? "ENVIADO"
            : statusType === "delivered"
              ? "ENTREGUE"
              : statusType === "read"
                ? "LIDA"
                : "ENVIADO",
        deliveredAt:
          statusType === "delivered" ? new Date(timestamp * 1000) : undefined,
        readAt: statusType === "read" ? new Date(timestamp * 1000) : undefined,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing status:", error);
    return NextResponse.json(
      { error: "Error processing status" },
      { status: 500 },
    );
  }
}

/**
 * Processa mensagem recebida - busca lead real pelo número
 */
async function processIncomingMessage(message: any, phoneNumber: string) {
  try {
    const messageText = message.text?.body || "";
    const messageId = message.id;

    // Buscar lead pelo número de WhatsApp ou telefone
    let lead = await prisma.lead.findFirst({
      where: {
        OR: [{ whatsapp: phoneNumber }, { phone: phoneNumber }],
      },
    });

    if (!lead) {
      console.log("[WhatsApp Webhook] No lead found for:", phoneNumber);
      return NextResponse.json({ received: true, matched: false });
    }

    await prisma.conversation.create({
      data: {
        leadId: lead.id,
        message: messageText,
        direction: "INCOMING",
        status: "ENTREGUE",
        externalId: messageId,
        messageType: message.type || "text",
        mediaUrl:
          message.image?.id || message.video?.id || message.audio?.id || null,
        mediaType: message.type !== "text" ? message.type : null,
      },
    });

    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing message:", error);
    return NextResponse.json(
      { error: "Error processing message" },
      { status: 500 },
    );
  }
}

/**
 * Processa chamada recebida
 */
async function processIncomingCall(call: any, phoneNumber: string) {
  try {
    const callId = call.id;
    const callType = call.direction === "inbound" ? "ENTRADA" : "SAÍDA";

    const lead = await prisma.lead.findFirst({
      where: {
        OR: [{ whatsapp: phoneNumber }, { phone: phoneNumber }],
      },
    });

    if (!lead) {
      console.log(
        "[WhatsApp Webhook] No lead found for call from:",
        phoneNumber,
      );
      return NextResponse.json({ received: true, matched: false });
    }

    await prisma.conversation.create({
      data: {
        leadId: lead.id,
        message: `Chamada ${callType} registrada`,
        direction: "INCOMING",
        status: "ATIVA",
        messageType: "call",
        metadata: {
          callId,
          callType,
          from: call.from,
          to: call.to,
          duration: call.creation_timestamp,
        },
      },
    });

    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error processing call:", error);
    return NextResponse.json(
      { error: "Error processing call" },
      { status: 500 },
    );
  }
}
