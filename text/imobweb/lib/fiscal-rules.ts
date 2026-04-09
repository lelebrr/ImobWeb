/**
 * Brazilian Fiscal Rules & Constants - 2026
 * 
 * Centraliza as regras de impostos brasileiros para o setor imobiliário.
 * Baseado no Simples Nacional e Lucro Presumido para Imobiliárias.
 */

export const FISCAL_CONSTANTS = {
  // Retenções padrão para prestação de serviço (Corretagem)
  RETENTIONS: {
    IRRF: 0.015, // 1.5% de IRRF para valores acima de R$ 666,66 (regra geral)
    CSRF: 0.0465, // 4.65% (PIS 0.65%, COFINS 3%, CSLL 1%) - Retenção de serviços acima de R$ 5.000,00
    INSS_AUTONOMO: 0.11, // 11% para corretores PF (limitado ao teto)
  },

  // Alíquotas de ISS padrão (Varia por município)
  ISS_DEFAULT: 0.05, // 5% (Máximo permitido por lei)
  ISS_MINIMUM: 0.02, // 2% (Mínimo permitido por lei)

  // Limites e Isenções
  LIMITS: {
    IRRF_MIN_TAX: 10.0, // Imposto menor que R$ 10,00 não se retém
    CSRF_MIN_VALUE: 5000.0, // Faturamento agregado acima de 5k no mês (regra federal)
  }
};

/**
 * Calcula a retenção de IRRF
 */
export function calculateIRRF(grossValue: number): number {
  const tax = grossValue * FISCAL_CONSTANTS.RETENTIONS.IRRF;
  return tax >= FISCAL_CONSTANTS.LIMITS.IRRF_MIN_TAX ? tax : 0;
}

/**
 * Calcula a retenção de ISS baseado na alíquota da cidade
 */
export function calculateISS(grossValue: number, cityRate: number = FISCAL_CONSTANTS.ISS_DEFAULT): number {
  const rate = Math.max(FISCAL_CONSTANTS.ISS_MINIMUM, Math.min(FISCAL_CONSTANTS.ISS_DEFAULT, cityRate));
  return grossValue * rate;
}

/**
 * Verifica se deve reter CSRF (4.65%)
 */
export function shouldRetainCSRF(monthlyTotal: number): boolean {
  return monthlyTotal > FISCAL_CONSTANTS.LIMITS.CSRF_MIN_VALUE;
}

/**
 * Identifica o regime de tributação simplificado
 */
export type TaxRegime = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';

export interface FiscalConfig {
  regime: TaxRegime;
  cityISS: number;
  hasRetentionCapability: boolean;
}
