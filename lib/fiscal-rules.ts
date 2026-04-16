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
 * Valida CEP brasileiro (8 dígitos)
 */
export function validateCep(cep: string): boolean {
  if (!cep || typeof cep !== 'string') return false;
  // Remove caracteres não numéricos
  const cleaned = cep.replace(/\D/g, '');
  // Verifica se tem 8 dígitos
  return /^\d{8}$/.test(cleaned);
}

/**
 * Valida CPF ou CNPJ brasileiro
 */
export function validateCpfCnpj(cpfCnpj: string): boolean {
  if (!cpfCnpj || typeof cpfCnpj !== 'string') return false;

  // Remove caracteres não numéricos
  const cleaned = cpfCnpj.replace(/\D/g, '');

  // Verifica tamanho
  if (cleaned.length !== 11 && cleaned.length !== 14) return false;

  // Verifica CPF
  if (cleaned.length === 11) {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleaned)) return false;

    // Cálculo do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleaned[9]) !== digit1) return false;

    // Cálculo do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i);
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleaned[10]) === digit2;
  }

  // Verifica CNPJ
  if (cleaned.length === 14) {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleaned)) return false;

    // Cálculo do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned[i]) * (13 - i);
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleaned[12]) !== digit1) return false;

    // Cálculo do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned[i]) * (14 - i);
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleaned[13]) === digit2;
  }

  return false;
}

/**
 * Valida telefone brasileiro (com ou sem DDD)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  // Verifica se tem 10 ou 11 dígitos
  return /^(\d{10}|\d{11})$/.test(cleaned);
}

/**
 * Valida email brasileiro
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // Regex simples para validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
