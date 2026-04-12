import { NextRequest, NextResponse } from "next/server";

/**
 * RECEBEDOR DE WEBHOOKS EXTERNOS - imobWeb
 * 2026 - Endpoint central para webhooks de terceiros (ex: Stripe, WhatsApp, RD Station)
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const source = req.nextUrl.searchParams.get("source") || "unknown";

    console.log(`📥 Webhook recebido de ${source}:`, payload);

    // Lógica de Processamento baseada na origem
    switch (source) {
      case "stripe":
        // Handle Stripe events (payment.succeeded, etc.)
        break;
      case "whatsapp":
        // Handle incoming messages or status updates
        break;
      case "rd_station":
        // Handle new leads from RD Station
        break;
      default:
        return NextResponse.json({ error: "Source not identified" }, { status: 400 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro ao processar webhook externo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
