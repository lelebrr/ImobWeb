/**
 * Meta Pixel & Conversions API (CAPI) for imobWeb
 * Tracks events for Facebook/Instagram ads optimization.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

interface MetaEvent {
  eventName: string;
  params?: Record<string, any>;
  eventID?: string;
}

/**
 * Client-side Pixel Tracking
 */
export function trackMetaPixel({ eventName, params }: MetaEvent) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, params);
  }
}

/**
 * Server-side Conversions API (CAPI)
 * More reliable than client-side Pixel as it bypasses adblockers.
 */
export async function trackMetaCAPI({ eventName, params, eventID }: MetaEvent) {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

    if (!accessToken || !pixelId) return;

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_id: eventID,
              user_data: {
                // Hashed user data should be sent here
              },
              custom_data: params,
            },
          ],
        }),
      }
    );

    return await response.json();
  } catch (err) {
    console.error("[Meta CAPI] Error tracking event:", err);
  }
}
