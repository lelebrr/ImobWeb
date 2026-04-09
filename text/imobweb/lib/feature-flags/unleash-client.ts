/**
 * Gerenciador de Feature Flags para o imobWeb
 * Permite habilitar/desabilitar funcionalidades em tempo real sem deploy
 */

// Simulação de sistema de flags (Baseado em Unleash ou PostHog conforme solicitado)
// Por simplicidade e robustez, usaremos uma implementação que pode ser alimentada via Supabase Config

export interface FeatureFlags {
  "new-ai-features": boolean;
  "white-label-v2": boolean;
  "whatsapp-bulk-campaigns": boolean;
  "public-api-access": boolean;
}

const defaultFlags: FeatureFlags = {
  "new-ai-features": false,
  "white-label-v2": true,
  "whatsapp-bulk-campaigns": false,
  "public-api-access": true,
};

export function isEnabled(flag: keyof FeatureFlags, orgId?: string): boolean {
  // Lógica de resolução da flag:
  // 1. Verifica contexto da organização (se algumas flags forem por plano)
  // 2. Verifica variáveis de ambiente ou DB
  
  const envFlag = process.env[`NEXT_PUBLIC_FLAG_${flag.toUpperCase()}`];
  if (envFlag !== undefined) return envFlag === "true";

  return defaultFlags[flag];
}

/**
 * Hook para uso no lado do cliente
 */
export function useFeatureFlags() {
  // Poderia carregar dinamicamente do Supabase/Edge Config aqui
  return {
    isEnabled: (flag: keyof FeatureFlags) => isEnabled(flag),
    allFlags: defaultFlags,
  };
}
