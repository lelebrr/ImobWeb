/**
 * WhatsApp Flows Webhook Handler - ImobWeb 2026
 * 
 * Processa respostas de botões interativos e listas.
 * Integra com a lógica de advanced-flows.ts para atualizar o CRM.
 */

import { NextRequest, NextResponse } from "next/server";
import { processFlowResponse } from "@/lib/whatsapp/advanced-flows";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verificação de segurança (X-Hub-Signature etc - Omitido para foco na lógica funcional)
    
    // Extrai o payload da resposta do botão
    // Estrutura padrão da Meta Cloud API
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message?.type === "interactive") {
      const interactive = message.interactive;
      const buttonId = interactive.button_reply?.id || interactive.list_reply?.id;

      if (buttonId) {
        console.log(`[WhatsAppWebhook] Recebida interação: ${buttonId}`);
        
        // Processa a lógica de negócio (ex: confirma visita, altera preço)
        const result = await processFlowResponse(buttonId);

        return NextResponse.json(result);
      }
    }

    return NextResponse.json({ status: "ignored" });
  } catch (error) {
    console.error("[WhatsAppWebhook] Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Endpoint de Verificação (Webhook Challenge) - Obrigatório para Meta
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return new NextResponse("Forbidden", { status: 403 });
}
