/**
 * Tax Calculator Helper - ImobWeb 2026
 * 
 * Aplica as regras de fiscal-rules.ts para transações financeiras reais.
 * Gera objetos de "Invoice" prontos para faturamento e exportação.
 */

import { calculateIRRF, calculateISS, shouldRetainCSRF } from '../fiscal-rules';

export interface TaxResolution {
  grossValue: number;
  issValue: number;
  irrfValue: number;
  csrfValue: number;
  netValue: number;
  hasRetention: boolean;
}

/**
 * Resolve todos os impostos de uma nota fiscal de serviço imobiliário
 * @param value Valor bruto da nota
 * @param cityISSRate Alíquota municipal de ISS
 * @param monthlyAccumulated Opcional: faturamento acumulado no mês para regra de CSRF (4.65%)
 */
export function resolveTransactionTaxes(
  value: number,
  cityISSRate: number,
  monthlyAccumulated: number = 0
): TaxResolution {
  const iss = calculateISS(value, cityISSRate);
  const irrf = calculateIRRF(value);
  
  // CSRF (PIS/COFINS/CSLL) - Retenção se o total mensal > 5k
  const csrf = shouldRetainCSRF(monthlyAccumulated + value) 
    ? value * 0.0465 
    : 0;

  const totalRetentions = irrf + csrf; // ISS geralmente é pago pela empresa, não retido na fonte (salvo substituição tributária)
  
  return {
    grossValue: value,
    issValue: iss,
    irrfValue: irrf,
    csrfValue: csrf,
    netValue: value - totalRetentions,
    hasRetention: totalRetentions > 0
  };
}

/**
 * Formata valores para o padrão brasileiro BRL
 */
export const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
