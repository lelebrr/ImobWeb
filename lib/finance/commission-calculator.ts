// lib/finance/commission-calculator.ts
// Motor de cálculo de comissões com lógica inteligente

import {
  CommissionCalculationInput,
  CommissionCalculationResult,
  CommissionConfig,
  BusinessType,
  Commission,
  CommissionSplit,
} from "@/types/finance";

/**
 * Calcula a comissão baseado nas configurações e valores fornecidos
 * @param input Dados de entrada para o cálculo
 * @param config Configuração de comissão a ser aplicada
 * @returns Resultado detalhado do cálculo de comissão
 */
export function calculateCommission(
  input: CommissionCalculationInput,
  config: CommissionConfig,
): CommissionCalculationResult {
  // Validar tipo de negócio
  if (input.businessType !== config.businessType) {
    throw new Error(
      `Tipo de negócio incompatível: esperado ${config.businessType}, recebido ${input.businessType}`,
    );
  }

  // Calcular valor base (valor do negócio * percentual base)
  const baseAmount = input.value * (config.basePercentage / 100);

  // Aplicar split (corretor, gerente, imobiliária)
  const brokerAmount = baseAmount * (config.split.broker / 100);
  const managerAmount = baseAmount * (config.split.manager / 100);
  const agencyAmount = baseAmount * (config.split.agency / 100);

  // Verificar elegibilidade para bônus
  let bonusEligible = false;
  let bonusAmount = 0;

  if (
    config.bonusTarget &&
    config.bonusPercentage &&
    input.periodValue !== undefined
  ) {
    // Verificar se a meta do período foi atingida
    bonusEligible = input.periodValue >= config.bonusTarget;
    if (bonusEligible) {
      // Bônus calculado sobre o valor base da comissão (não sobre o valor total do negócio)
      bonusAmount = baseAmount * (config.bonusPercentage / 100);
    }
  }

  // Calcular totais com bônus (bônus geralmente vai apenas para o corretor)
  const totalBrokerAmount = brokerAmount + bonusAmount;
  const totalManagerAmount = managerAmount; // Gerente geralmente não recebe bônus
  const totalAgencyAmount = agencyAmount; // Imobiliária geralmente não recebe bônus

  // Criar resultado do cálculo
  const result: CommissionCalculationResult = {
    contractId: input.contractId,
    brokerId: input.brokerId,
    managerId: input.managerId,
    agencyId: input.agencyId,
    businessType: input.businessType,
    baseValue: input.value,
    basePercentage: config.basePercentage,
    baseAmount,
    split: config.split,
    brokerAmount,
    managerAmount,
    agencyAmount,
    bonusEligible,
    bonusAmount,
    totalBrokerAmount,
    totalManagerAmount,
    totalAgencyAmount,
    calculatedAt: new Date(),
  };

  return result;
}

/**
 * Converte o resultado do cálculo em uma entidade Commission para persistência
 * @param result Resultado do cálculo de comissão
 * @param updatedBy ID do usuário que está realizando o cálculo
 * @returns Entidade Commission pronta para ser salva no banco
 */
export function toCommissionEntity(
  result: CommissionCalculationResult,
  updatedBy: string,
): Commission {
  return {
    id: "", // Será gerado pelo banco
    contractId: result.contractId,
    brokerId: result.brokerId,
    managerId: result.managerId,
    agencyId: result.agencyId,
    businessType: result.businessType,
    contractValue: result.baseValue,
    basePercentage: result.basePercentage,
    baseAmount: result.baseAmount,
    split: result.split,
    brokerAmount: result.brokerAmount,
    managerAmount: result.managerAmount,
    agencyAmount: result.agencyAmount,
    bonusEligible: result.bonusEligible,
    bonusAmount: result.bonusAmount,
    totalBrokerAmount: result.totalBrokerAmount,
    totalManagerAmount: result.totalManagerAmount,
    totalAgencyAmount: result.totalAgencyAmount,
    calculatedAt: result.calculatedAt,
    updatedAt: new Date(),
    updatedBy,
  };
}

/**
 * Calcula comissões para múltiplos contratos de uma vez (útil para processamento em lote)
 * @param inputs Array de entradas para cálculo
 * @param configMap Map de configurações indexadas por ID
 * @returns Array de resultados de cálculo
 */
export function batchCalculateCommissions(
  inputs: CommissionCalculationInput[],
  configMap: Map<string, CommissionConfig>,
): CommissionCalculationResult[] {
  const results: CommissionCalculationResult[] = [];

  for (const input of inputs) {
    const config = configMap.get(input.commissionConfigId);
    if (!config) {
      throw new Error(
        `Configuração de comissão não encontrada para ID: ${input.commissionConfigId}`,
      );
    }

    if (!config.isActive) {
      throw new Error(
        `Configuração de comissão inativa para ID: ${input.commissionConfigId}`,
      );
    }

    try {
      const result = calculateCommission(input, config);
      results.push(result);
    } catch (error) {
      // Em um ambiente real, você talvez queira logar o erro e continuar com os outros
      // Ou então parar todo o lote dependendo da política de negócio
      if (error instanceof Error) {
        throw new Error(
          `Erro ao calcular comissão para contrato ${input.contractId}: ${error.message}`,
        );
      } else {
        throw new Error(
          `Erro desconhecido ao calcular comissão para contrato ${input.contractId}`,
        );
      }
    }
  }

  return results;
}

/**
 * Valida se uma configuração de split está correta (soma 100%)
 * @param split Configuração de split para validar
 * @returns true se válido, false caso contrário
 */
export function validateSplit(split: CommissionSplit): boolean {
  const total = split.broker + split.manager + split.agency;
  return Math.abs(total - 100) < 0.001; // Tolerância para imprecisão de ponto flutuante
}

/**
 * Formata um valor monetário para exibição (BRL)
 * @param value Valor a ser formatado
 * @returns String formatada como moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
