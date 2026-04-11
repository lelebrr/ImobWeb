import { crypto } from "next/dist/compiled/@edge-runtime/primitives";

/**
 * PROCESSADOR DE WEBHOOKS - imobWeb
 * 2026 - Notificações para sistemas externos
 */

export interface WebhookEvent {
  type: "property.created" | "property.updated" | "lead.new" | "lead.status_changed" | "contract.signed";
  data: any;
  organizationId: string;
}

/**
 * Gera assinatura para o payload para garantir integridade e autenticidade
 */
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Dispara um webhook para um destino específico
 */
export async function dispatchWebhook(url: string, event: WebhookEvent, secret: string) {
  const payload = JSON.stringify({
    id: `evt_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...event,
  });

  const signature = await generateSignature(payload, secret);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ImobWeb-Signature": signature,
        "User-Agent": "imobWeb-Webhooks/1.0",
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    console.log(`✅ Webhook ${event.type} enviado para ${url}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Erro ao enviar Webhook:`, error);
    // Em produção, aqui entraria a lógica de retry via fila (Upstash QStash, etc.)
    return { success: false, error };
  }
}

/**
 * Notificador de eventos de negócio centralizado
 */
export async function notifyEvent(event: WebhookEvent) {
  // 1. Buscar assinaturas de webhook da organização no banco
  // 2. Para cada URL configurada, chamar dispatchWebhook
  console.log(`📡 Evento detectado: ${event.type} para Org ${event.organizationId}`);
  
  // Exemplo de integração com sistemas no-code (Zapier/Make)
  // Eles geralmente não usam assinatura HMAC customizada, mas sim URLs geradas
}
