/**
 * WhatsApp Cloud API - ImobWeb 2026
 * Integração com WhatsApp Business Cloud API
 */

import { WhatsAppButton } from "@/types/whatsapp";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

interface SendMessageOptions {
  type: "TEXT" | "INTERACTIVE";
  text?: string;
  interactive?: {
    type: "button" | "list";
    header?: string;
    body: { text: string };
    footer?: string;
    action?: {
      buttons: WhatsAppButton[];
    };
  };
}

export async function sendWhatsAppMessage(
  to: string,
  text: string,
  options?: {
    type?: "TEXT" | "INTERACTIVE";
    buttons?: WhatsAppButton[];
    header?: string;
  },
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.warn(
      "[WhatsApp Cloud API] Credentials not configured, skipping send",
    );
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  const messageOptions: SendMessageOptions =
    options?.type === "INTERACTIVE" && options.buttons
      ? {
          type: "INTERACTIVE",
          interactive: {
            type: "button",
            header: options.header,
            body: { text },
            action: {
              buttons: options.buttons,
            },
          },
        }
      : {
          type: "TEXT",
          text,
        };

  const payload = {
    messaging_product: "whatsapp",
    to: to.replace(/\D/g, ""), // Remove non-digits
    type: messageOptions.type === "INTERACTIVE" ? "interactive" : "text",
    ...(messageOptions.type === "TEXT"
      ? { text: { body: text } }
      : { interactive: messageOptions.interactive }),
  };

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[WhatsApp Cloud API] Send error:", error);
      return { success: false, error };
    }

    const result = await response.json();
    console.log("[WhatsApp Cloud API] Message sent:", result.messages?.[0]?.id);
    return { success: true, messageId: result.messages?.[0]?.id };
  } catch (error) {
    console.error("[WhatsApp Cloud API] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Envia mensagem de template (para frases rápidas)
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  components?: any[],
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  const payload = {
    messaging_product: "whatsapp",
    to: to.replace(/\D/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: "pt_BR" },
      components: components || [],
    },
  };

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, messageId: result.messages?.[0]?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Marca mensagem como lida
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    return false;
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        }),
      },
    );

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Download de mídia
 */
export async function downloadMedia(mediaId: string): Promise<string | null> {
  if (!ACCESS_TOKEN) {
    return null;
  }

  try {
    const mediaResponse = await fetch(`${WHATSAPP_API_URL}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!mediaResponse.ok) {
      return null;
    }

    const mediaData = await mediaResponse.json();
    return mediaData.url;
  } catch {
    return null;
  }
}
