import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/analytics/posthog";

/**
 * Portal Webhooks Handler
 * Receives updates from property portals (Zap, VivaReal, OLX, etc.)
 * POST /api/integrations/portals/webhooks
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { portal, event, propertyId, data } = payload;

    if (!portal || !event) {
      return NextResponse.json({ error: "Portal and event are required" }, { status: 400 });
    }

    console.log(`[Portal Webhook] Received ${event} from ${portal} for property ${propertyId}`);

    // Track views from external portals in our analytics
    if (event === "view_on_portal") {
      analytics.capture("portal_view", {
        portal,
        propertyId,
        viewsCount: data.views || 1,
        source: "webhook",
      });
    }

    // Logic to update property statistics in the database would go here
    // await prisma.propertyStats.upsert(...)

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("[Portal Webhook] Error processing webhook:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Security: Validate portal callback authenticity
 */
function validateWebhookSource(req: NextRequest) {
  // Logic to verify HMAC or IP ranges would go here
  return true;
}
