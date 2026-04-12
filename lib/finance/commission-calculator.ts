/**
 * Commission Calculator - ImobWeb 2026
 * 
 * Lógica especializada para cálculo de comissões imobiliárias (Venda e Aluguel).
 * Suporta split de pagamento e retenções fiscais vinculadas ao fiscal-rules.ts.
 */

import { calculateIRRF, calculateISS } from '../fiscal-rules';

export interface CommissionSplit {
  agencyValue: number;
  listingBrokerValue: number; // Captação
  sellingBrokerValue: number; // Venda
  taxes: number;
  netValue: number;
}

export interface CommissionConfig {
  listingPercentage: number;   // % para quem captou o imóvel (ex: 10% da comissão total)
  sellingPercentage: number;   // % para quem vendeu o imóvel (ex: 40% da comissão total)
  agencyPercentage: number;    // % que fica com a imobiliária
  issRate: number;             // Alíquota de ISS da cidade
}

/**
 * Calcula a comissão para uma venda de imóvel
 * @param salesPrice Preço total da venda do imóvel
 * @param commissionRate Taxa de comissão acordada (ex: 6% = 0.06)
 * @param config Configurações de split da imobiliária
 */
export function calculateSaleCommission(
  salesPrice: number,
  commissionRate: number,
  config: CommissionConfig
): CommissionSplit {
  const totalCommission = salesPrice * commissionRate;
  
  // Splits
  const listingValue = totalCommission * (config.listingPercentage / 100);
  const sellingValue = totalCommission * (config.sellingPercentage / 100);
  const agencyValue = totalCommission - listingValue - sellingValue;

  // Cálculo de impostos sobre a nota cheia (emissão pela imobiliária)
  const taxISS = calculateISS(totalCommission, config.issRate);
  
  // Observação: Retenções de IRRF costumam ocorrer no repasse se o corretor for PJ
  // Para simplificação do dash, consideramos o BRUTO descontando apenas impostos diretos da nota.
  
  return {
    agencyValue,
    listingBrokerValue: listingValue,
    sellingBrokerValue: sellingValue,
    taxes: taxISS,
    netValue: totalCommission - taxISS
  };
}

/**
 * Calcula a comissão de aluguel (Taxa de intermediação + Taxa de administração)
 * @param rentValue Valor mensal do aluguel
 * @param adminFee Taxa de adm mensal (ex: 10% = 0.1)
 * @param isFirstMonth Se é o primeiro mês (Taxa de intermediação costuma ser 100% do 1º aluguel)
 */
export function calculateRentalCommission(
  rentValue: number,
  adminFee: number,
  isFirstMonth: boolean = false
): number {
  if (isFirstMonth) {
    return rentValue; // Geralmente o primeiro aluguel integral fica com a imobiliária/corretor
  }
  return rentValue * adminFee;
}

/**
 * Calcula o Split para o corretor com retenção de IRRF
 * Útil para o extrato de repasse do corretor.
 */
export function calculateBrokerPayout(grossValue: number): { gross: number; irrf: number; net: number } {
  const irrf = calculateIRRF(grossValue);
  return {
    gross: grossValue,
    irrf,
    net: grossValue - irrf
  };
}
