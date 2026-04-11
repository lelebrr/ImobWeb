/**
 * Checkout API - ImobWeb 2026
 */

import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/billing/stripe";
import { trackBillingEvent } from "@/lib/analytics/events";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userId, organizationId, priceId, mode } = body;

    // 1. Validação Básica
    if (!userId || !organizationId || !priceId || !mode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Criar Sessão no Stripe
    try {
      const session = await createCheckoutSession({
        userId,
        organizationId,
        priceId,
        mode
      });

      // 3. Track Event
      await trackBillingEvent("Checkout Initiated", session.id, {
        userId,
        organizationId,
        priceId
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });

    } catch (stripeError: any) {
      await trackBillingEvent("Checkout Error", "", {
        error_message: stripeError.message,
        userId
      });
      return NextResponse.json({ error: "Erro na integração com Stripe" }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
