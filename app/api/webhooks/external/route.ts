import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-06-30.basil" })
  : null;

/**
 * RECEBEDOR DE WEBHOOKS EXTERNOS - imobWeb
 * 2026 - Endpoint central para webhooks de terceiros (ex: Stripe, WhatsApp, RD Station)
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const source = req.nextUrl.searchParams.get("source") || "unknown";

    console.log(`[External Webhook] Received from ${source}:`, { type: payload.type || payload.event || "unknown" });

    switch (source) {
      case "stripe":
        await handleStripeWebhook(payload);
        break;
      case "rd_station":
        await handleRDStationWebhook(payload);
        break;
      default:
        return NextResponse.json({ error: "Source not identified" }, { status: 400 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[External Webhook] Error processing:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleStripeWebhook(event: any) {
  const eventType = event.type;

  switch (eventType) {
    case "checkout.session.completed": {
      const session = event.data?.object;
      if (session?.metadata?.organizationId) {
        const subscription = await prisma.subscription.findFirst({
          where: { organizationId: session.metadata.organizationId, status: "ATIVO" }
        });
        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: "ATIVO" }
          });
          await prisma.paymentHistory.create({
            data: {
              subscriptionId: subscription.id,
              amount: session.amount_total / 100,
              paymentMethod: "CREDIT_CARD",
              status: "completed",
              transactionId: session.payment_intent,
              invoiceId: session.invoice,
              description: `Pagamento via Stripe: ${session.metadata?.planName || "Plano"}`,
              processedAt: new Date()
            }
          });
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data?.object;
      if (invoice?.subscription) {
        const subscription = await prisma.subscription.findFirst({
          where: { id: invoice.subscription }
        });
        if (subscription) {
          await prisma.paymentHistory.create({
            data: {
              subscriptionId: subscription.id,
              amount: invoice.amount_paid / 100,
              paymentMethod: "CREDIT_CARD",
              status: "completed",
              transactionId: invoice.payment_intent,
              invoiceId: invoice.id,
              description: `Fatura paga: ${invoice.number}`,
              processedAt: new Date()
            }
          });
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data?.object;
      if (invoice?.subscription) {
        const subscription = await prisma.subscription.findFirst({
          where: { id: invoice.subscription }
        });
        if (subscription) {
          await prisma.paymentHistory.create({
            data: {
              subscriptionId: subscription.id,
              amount: invoice.amount_due / 100,
              paymentMethod: "CREDIT_CARD",
              status: "failed",
              transactionId: invoice.payment_intent,
              invoiceId: invoice.id,
              description: `Fatura com falha: ${invoice.number}`
            }
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscriptionData = event.data?.object;
      if (subscriptionData?.id) {
        await prisma.subscription.updateMany({
          where: { id: subscriptionData.id },
          data: { status: "CANCELADO", canceledAt: new Date() }
        });
      }
      break;
    }
  }
}

async function handleRDStationWebhook(payload: any) {
  const { event, payload: eventData } = payload;

  if (event === "lead.created" && eventData) {
    // Find organization by RD Station integration
    const orgId = eventData.organization_id || eventData.org_id;

    if (orgId) {
      await prisma.lead.create({
        data: {
          organizationId: orgId,
          name: eventData.name || "Lead RD Station",
          email: eventData.email,
          phone: eventData.phone || eventData.mobile_phone,
          whatsapp: eventData.whatsapp || eventData.mobile_phone,
          status: "NOVO",
          source: "WEBSITE",
          notes: `Lead importado via RD Station`,
          sourceDetails: { rd_station_id: eventData.id, tags: eventData.tags }
        }
      });
    }
  }
}
