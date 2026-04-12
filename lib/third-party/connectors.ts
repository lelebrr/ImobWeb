/**
 * CONECTORES NO-CODE - imobWeb
 * 2026 - Templates e lógica para Zapier, Make.com e Power Automate
 */

export const NO_CODE_PLATFORMS = {
  ZAPIER: "zapier",
  MAKE: "make",
  POWER_AUTOMATE: "power_automate",
} as const;

/**
 * Formatação de payload específica para plataformas no-code
 * Facilita o mapeamento de campos (field mapping) nestas ferramentas
 */
export function formatNoCodePayload(data: any, platform: keyof typeof NO_CODE_PLATFORMS) {
  // Simplificação de estrutura para facilitar o "click and select" em editores visuais
  return {
    ...data,
    meta_timestamp: new Date().toISOString(),
    source_app: "imobWeb",
    integration_helper_v: "1.0",
  };
}

/**
 * URL Builder para Webhooks de Entrada
 * Usado para configurar gatilhos externos (ex: quando um form no Webflow é submetido)
 */
export function getIntegrationWebhookUrl(orgId: string, integrationId: string) {
  return `https://api.imobweb.app/api/integrations/third-party/webhook/${orgId}/${integrationId}`;
}
