import type { PortalId, PortalType, PortalConfig } from "@/types/portals";
import type { PropertyData } from "@/lib/portals/xml-generator";

export interface PortalSelectionCriteria {
  propertyType: PropertyData["propertyType"];
  transactionType: PropertyData["transactionType"];
  price: number;
  location: {
    city: string;
    state: string;
  };
  features?: PropertyData["features"];
  priority: "performance" | "reach" | "cost" | "quality";
}

export interface PortalScore {
  portalId: PortalId;
  score: number;
  reasons: string[];
  estimatedReach: number;
  estimatedCost: number;
}

export interface AutoSelectionResult {
  selectedPortals: PortalId[];
  scores: PortalScore[];
  recommendations: string[];
  totalEstimatedReach: number;
  totalEstimatedCost: number;
}

export class PortalAutoSelector {
  private portalConfigs: PortalConfig[];

  constructor(portalConfigs: PortalConfig[]) {
    this.portalConfigs = portalConfigs.filter(
      (config) => config.enabled && config.status === "ATIVO",
    );
  }

  /**
   * Seleciona automaticamente os portais ideais para um imóvel baseado nos critérios
   */
  selectPortals(criteria: PortalSelectionCriteria): AutoSelectionResult {
    const scores = this.calculatePortalScores(criteria);
    const selectedPortals = this.selectBestPortals(scores, criteria);
    const recommendations = this.generateRecommendations(scores, criteria);

    return {
      selectedPortals,
      scores,
      recommendations,
      totalEstimatedReach: scores.reduce(
        (sum, score) => sum + score.estimatedReach,
        0,
      ),
      totalEstimatedCost: scores.reduce(
        (sum, score) => sum + score.estimatedCost,
        0,
      ),
    };
  }

  /**
   * Calcula scores para cada portal baseado nos critérios
   */
  private calculatePortalScores(
    criteria: PortalSelectionCriteria,
  ): PortalScore[] {
    return this.portalConfigs
      .map((config) => {
        const score = this.calculateIndividualScore(config, criteria);
        const estimatedReach = this.estimateReach(config, criteria);
        const estimatedCost = this.estimateCost(config, criteria);

        return {
          portalId: config.id as PortalId,
          score,
          reasons: this.getScoreReasons(config, criteria),
          estimatedReach,
          estimatedCost,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Calcula score individual para um portal
   */
  private calculateIndividualScore(
    config: PortalConfig,
    criteria: PortalSelectionCriteria,
  ): number {
    let score = 50; // Base score

    // Score baseado no tipo de imóvel
    const propertyTypeScore = this.getPropertyTypeScore(
      config,
      criteria.propertyType,
    );
    score += propertyTypeScore * 0.3;

    // Score baseado no tipo de transação
    const transactionTypeScore = this.getTransactionTypeScore(
      config,
      criteria.transactionType,
    );
    score += transactionTypeScore * 0.2;

    // Score baseado no preço
    const priceScore = this.getPriceScore(config, criteria.price);
    score += priceScore * 0.2;

    // Score baseado na localização
    const locationScore = this.getLocationScore(config, criteria.location);
    score += locationScore * 0.15;

    // Score baseado nas características
    const featuresScore = this.getFeaturesScore(config, criteria.features);
    score += featuresScore * 0.15;

    // Penalização para portais com histórico de erros
    const errorPenalty = Math.max(0, config.errorCount * 2);
    score -= errorPenalty;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calcula score baseado no tipo de imóvel
   */
  private getPropertyTypeScore(
    config: PortalConfig,
    propertyType: PropertyData["propertyType"],
  ): number {
    const typeScores: Record<
      PortalType,
      Record<PropertyData["propertyType"], number>
    > = {
      ZAP: {
        apartment: 95,
        house: 85,
        commercial: 90,
        land: 70,
        industrial: 60,
      },
      VIVAREAL: {
        apartment: 95,
        house: 85,
        commercial: 90,
        land: 70,
        industrial: 60,
      },
      OLX: {
        apartment: 90,
        house: 80,
        commercial: 85,
        land: 75,
        industrial: 70,
      },
      IMOVELWEB: {
        apartment: 95,
        house: 85,
        commercial: 90,
        land: 70,
        industrial: 60,
      },
      CHAVES_NA_MAO: {
        apartment: 90,
        house: 85,
        commercial: 80,
        land: 70,
        industrial: 60,
      },
      MERCADO_LIVRE: {
        apartment: 70,
        house: 75,
        commercial: 80,
        land: 65,
        industrial: 70,
      },
      PROPRIETARIO_DIRETO: {
        apartment: 85,
        house: 90,
        commercial: 80,
        land: 75,
        industrial: 65,
      },
      IMOBIBRASIL: {
        apartment: 80,
        house: 85,
        commercial: 75,
        land: 70,
        industrial: 65,
      },
      LOFT: {
        apartment: 95,
        house: 85,
        commercial: 80,
        land: 60,
        industrial: 50,
      },
      QUINTO_ANDAR: {
        apartment: 95,
        house: 85,
        commercial: 80,
        land: 60,
        industrial: 50,
      },
      VRSYNC: {
        apartment: 90,
        house: 85,
        commercial: 85,
        land: 70,
        industrial: 60,
      },
      CUSTOM: {
        apartment: 80,
        house: 80,
        commercial: 80,
        land: 80,
        industrial: 80,
      },
    };

    return typeScores[config.type]?.[propertyType] || 50;
  }

  /**
   * Calcula score baseado no tipo de transação
   */
  private getTransactionTypeScore(
    config: PortalConfig,
    transactionType: PropertyData["transactionType"],
  ): number {
    const transactionScores: Record<
      PortalType,
      Record<PropertyData["transactionType"], number>
    > = {
      ZAP: {
        sale: 95,
        rent: 90,
      },
      VIVAREAL: {
        sale: 95,
        rent: 90,
      },
      OLX: {
        sale: 85,
        rent: 95,
      },
      IMOVELWEB: {
        sale: 95,
        rent: 90,
      },
      CHAVES_NA_MAO: {
        sale: 90,
        rent: 95,
      },
      MERCADO_LIVRE: {
        sale: 70,
        rent: 80,
      },
      PROPRIETARIO_DIRETO: {
        sale: 90,
        rent: 85,
      },
      IMOBIBRASIL: {
        sale: 85,
        rent: 80,
      },
      LOFT: {
        sale: 90,
        rent: 85,
      },
      QUINTO_ANDAR: {
        sale: 90,
        rent: 85,
      },
      VRSYNC: {
        sale: 90,
        rent: 90,
      },
      CUSTOM: {
        sale: 80,
        rent: 80,
      },
    };

    return transactionScores[config.type]?.[transactionType] || 50;
  }

  /**
   * Calcula score baseado no preço
   */
  private getPriceScore(config: PortalConfig, price: number): number {
    const priceRanges: Record<
      PortalType,
      { min: number; max: number; score: number }[]
    > = {
      ZAP: [
        { min: 0, max: 200000, score: 90 },
        { min: 200000, max: 500000, score: 95 },
        { min: 500000, max: 1000000, score: 85 },
        { min: 1000000, max: 2000000, score: 80 },
        { min: 2000000, max: Infinity, score: 75 },
      ],
      VIVAREAL: [
        { min: 0, max: 200000, score: 90 },
        { min: 200000, max: 500000, score: 95 },
        { min: 500000, max: 1000000, score: 85 },
        { min: 1000000, max: 2000000, score: 80 },
        { min: 2000000, max: Infinity, score: 75 },
      ],
      OLX: [
        { min: 0, max: 100000, score: 95 },
        { min: 100000, max: 300000, score: 90 },
        { min: 300000, max: 600000, score: 85 },
        { min: 600000, max: 1000000, score: 80 },
        { min: 1000000, max: Infinity, score: 70 },
      ],
      IMOVELWEB: [
        { min: 0, max: 200000, score: 90 },
        { min: 200000, max: 500000, score: 95 },
        { min: 500000, max: 1000000, score: 85 },
        { min: 1000000, max: 2000000, score: 80 },
        { min: 2000000, max: Infinity, score: 75 },
      ],
      CHAVES_NA_MAO: [
        { min: 0, max: 150000, score: 95 },
        { min: 150000, max: 400000, score: 90 },
        { min: 400000, max: 800000, score: 85 },
        { min: 800000, max: 1500000, score: 80 },
        { min: 1500000, max: Infinity, score: 70 },
      ],
      MERCADO_LIVRE: [
        { min: 0, max: 50000, score: 95 },
        { min: 50000, max: 200000, score: 85 },
        { min: 200000, max: 500000, score: 75 },
        { min: 500000, max: 1000000, score: 65 },
        { min: 1000000, max: Infinity, score: 55 },
      ],
      PROPRIETARIO_DIRETO: [
        { min: 0, max: 300000, score: 90 },
        { min: 300000, max: 600000, score: 85 },
        { min: 600000, max: 1200000, score: 80 },
        { min: 1200000, max: 2000000, score: 75 },
        { min: 2000000, max: Infinity, score: 70 },
      ],
      IMOBIBRASIL: [
        { min: 0, max: 250000, score: 85 },
        { min: 250000, max: 500000, score: 90 },
        { min: 500000, max: 1000000, score: 85 },
        { min: 1000000, max: 2000000, score: 80 },
        { min: 2000000, max: Infinity, score: 75 },
      ],
      LOFT: [
        { min: 0, max: 300000, score: 90 },
        { min: 300000, max: 600000, score: 85 },
        { min: 600000, max: 1200000, score: 80 },
        { min: 1200000, max: 2000000, score: 75 },
        { min: 2000000, max: Infinity, score: 70 },
      ],
      QUINTO_ANDAR: [
        { min: 0, max: 400000, score: 90 },
        { min: 400000, max: 800000, score: 85 },
        { min: 800000, max: 1500000, score: 80 },
        { min: 1500000, max: 2500000, score: 75 },
        { min: 2500000, max: Infinity, score: 70 },
      ],
      VRSYNC: [
        { min: 0, max: 200000, score: 90 },
        { min: 200000, max: 500000, score: 95 },
        { min: 500000, max: 1000000, score: 85 },
        { min: 1000000, max: 2000000, score: 80 },
        { min: 2000000, max: Infinity, score: 75 },
      ],
      CUSTOM: [
        { min: 0, max: 200000, score: 80 },
        { min: 200000, max: 500000, score: 80 },
        { min: 500000, max: 1000000, score: 80 },
        { min: 1000000, max: 2000000, score: 80 },
        { min: 2000000, max: Infinity, score: 80 },
      ],
    };

    const ranges = priceRanges[config.type] || [];
    const applicableRange = ranges.find(
      (range) => price >= range.min && price <= range.max,
    );
    return applicableRange?.score || 50;
  }

  /**
   * Calcula score baseado na localização
   */
  private getLocationScore(
    config: PortalConfig,
    location: { city: string; state: string },
  ): number {
    // Simulação de dados de cobertura por portal
    const coverageData: Record<
      PortalType,
      { states: string[]; score: number }
    > = {
      ZAP: { states: ["SP", "RJ", "MG", "PR", "SC"], score: 95 },
      VIVAREAL: { states: ["SP", "RJ", "MG", "PR", "SC"], score: 95 },
      OLX: { states: ["SP", "RJ", "MG", "PR", "SC", "RS", "BA"], score: 90 },
      IMOVELWEB: { states: ["SP", "RJ", "MG", "PR", "SC"], score: 95 },
      CHAVES_NA_MAO: { states: ["SP", "RJ", "MG"], score: 90 },
      MERCADO_LIVRE: {
        states: ["SP", "RJ", "MG", "PR", "SC", "RS", "BA", "PE"],
        score: 85,
      },
      PROPRIETARIO_DIRETO: { states: ["SP", "RJ", "MG", "PR"], score: 85 },
      IMOBIBRASIL: { states: ["SP", "RJ", "MG", "PR", "SC", "RS"], score: 85 },
      LOFT: { states: ["SP", "RJ", "MG", "PR"], score: 90 },
      QUINTO_ANDAR: { states: ["SP", "RJ", "MG", "PR"], score: 90 },
      VRSYNC: { states: ["SP", "RJ", "MG", "PR", "SC"], score: 90 },
      CUSTOM: { states: [], score: 70 },
    };

    const coverage = coverageData[config.type];
    if (!coverage) return 50;

    const isCovered = coverage.states.includes(location.state);
    return isCovered ? coverage.score : 40;
  }

  /**
   * Calcula score baseado nas características do imóvel
   */
  private getFeaturesScore(
    config: PortalConfig,
    features?: PropertyData["features"],
  ): number {
    if (!features) return 50;

    let score = 50;

    // Score baseado no número de quartos
    if (features.bedrooms) {
      if (features.bedrooms >= 3) score += 10;
      if (features.bedrooms >= 4) score += 10;
    }

    // Score baseado no número de banheiros
    if (features.bathrooms) {
      if (features.bathrooms >= 2) score += 10;
      if (features.bathrooms >= 3) score += 10;
    }

    // Score baseado na área
    if (features.area) {
      if (features.area >= 100) score += 10;
      if (features.area >= 200) score += 10;
    }

    // Score baseado no número de vagas
    if (features.parkingSpaces) {
      if (features.parkingSpaces >= 1) score += 5;
      if (features.parkingSpaces >= 2) score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Estima o alcance de um portal
   */
  private estimateReach(
    config: PortalConfig,
    criteria: PortalSelectionCriteria,
  ): number {
    const baseReach: Record<PortalType, number> = {
      ZAP: 5000000,
      VIVAREAL: 4000000,
      OLX: 3000000,
      IMOVELWEB: 2500000,
      CHAVES_NA_MAO: 1000000,
      MERCADO_LIVRE: 2000000,
      PROPRIETARIO_DIRETO: 800000,
      IMOBIBRASIL: 600000,
      LOFT: 1500000,
      QUINTO_ANDAR: 1200000,
      VRSYNC: 3500000,
      CUSTOM: 500000,
    };

    const reach = baseReach[config.type] || 0;

    // Ajuste baseado na localização
    const locationMultiplier = this.getLocationMultiplier(criteria.location);

    // Ajuste baseado no tipo de imóvel
    const propertyTypeMultiplier = this.getPropertyTypeMultiplier(
      config.type,
      criteria.propertyType,
    );

    // Ajuste baseado no tipo de transação
    const transactionTypeMultiplier = this.getTransactionTypeMultiplier(
      config.type,
      criteria.transactionType,
    );

    return Math.round(
      reach *
        locationMultiplier *
        propertyTypeMultiplier *
        transactionTypeMultiplier,
    );
  }

  /**
   * Estima o custo de publicação em um portal
   */
  private estimateCost(
    config: PortalConfig,
    criteria: PortalSelectionCriteria,
  ): number {
    const baseCosts: Record<PortalType, number> = {
      ZAP: 299,
      VIVAREAL: 249,
      OLX: 99,
      IMOVELWEB: 199,
      CHAVES_NA_MAO: 149,
      MERCADO_LIVRE: 79,
      PROPRIETARIO_DIRETO: 99,
      IMOBIBRASIL: 129,
      LOFT: 199,
      QUINTO_ANDAR: 179,
      VRSYNC: 349,
      CUSTOM: 0,
    };

    const baseCost = baseCosts[config.type] || 0;

    // Custo adicional para destaque
    if (criteria.priority === "performance") {
      return baseCost * 1.5;
    }

    return baseCost;
  }

  /**
   * Seleciona os melhores portais baseado nos scores
   */
  private selectBestPortals(
    scores: PortalScore[],
    criteria: PortalSelectionCriteria,
  ): PortalId[] {
    const threshold = criteria.priority === "performance" ? 70 : 60;
    const selected = scores.filter((score) => score.score >= threshold);

    // Limitar o número de portais selecionados
    const maxPortals = criteria.priority === "performance" ? 5 : 3;

    return selected.slice(0, maxPortals).map((score) => score.portalId);
  }

  /**
   * Gera razões para o score
   */
  private getScoreReasons(
    config: PortalConfig,
    criteria: PortalSelectionCriteria,
  ): string[] {
    const reasons: string[] = [];

    if (this.getPropertyTypeScore(config, criteria.propertyType) > 80) {
      reasons.push(`Excelente suporte para ${criteria.propertyType}`);
    }

    if (this.getTransactionTypeScore(config, criteria.transactionType) > 80) {
      reasons.push(`Ótimo para ${criteria.transactionType}`);
    }

    if (this.getLocationScore(config, criteria.location) > 80) {
      reasons.push(
        `Forte cobertura em ${criteria.location.city}/${criteria.location.state}`,
      );
    }

    if (config.errorCount > 0) {
      reasons.push(`Histórico de erros: ${config.errorCount}`);
    }

    return reasons;
  }

  /**
   * Gera recomendações
   */
  private generateRecommendations(
    scores: PortalScore[],
    criteria: PortalSelectionCriteria,
  ): string[] {
    const recommendations: string[] = [];

    const bestScore = scores[0]?.score || 0;
    if (bestScore > 90) {
      recommendations.push("Portal de alto desempenho selecionado");
    }

    const totalReach = scores.reduce(
      (sum, score) => sum + score.estimatedReach,
      0,
    );
    if (totalReach > 10000000) {
      recommendations.push("Alcance total estimado superior a 10 milhões");
    }

    const totalCost = scores.reduce(
      (sum, score) => sum + score.estimatedCost,
      0,
    );
    if (totalCost > 500) {
      recommendations.push("Custo total estimado acima de R$ 500");
    }

    return recommendations;
  }

  /**
   * Multiplicador de alcance baseado na localização
   */
  private getLocationMultiplier(location: {
    city: string;
    state: string;
  }): number {
    // Cidades principais
    const mainCities = [
      "São Paulo",
      "Rio de Janeiro",
      "Belo Horizonte",
      "Porto Alegre",
      "Curitiba",
    ];
    if (mainCities.includes(location.city)) return 1.2;

    // Capitais
    const capitals = [
      "São Paulo",
      "Rio de Janeiro",
      "Belo Horizonte",
      "Porto Alegre",
      "Curitiba",
      "Florianópolis",
      "Brasília",
    ];
    if (capitals.includes(location.city)) return 1.1;

    return 1.0;
  }

  /**
   * Multiplicador de alcance baseado no tipo de imóvel
   */
  private getPropertyTypeMultiplier(
    portalType: PortalType,
    propertyType: PropertyData["propertyType"],
  ): number {
    const multipliers: Record<
      PortalType,
      Record<PropertyData["propertyType"], number>
    > = {
      ZAP: {
        apartment: 1.2,
        house: 1.1,
        commercial: 1.0,
        land: 0.8,
        industrial: 0.7,
      },
      VIVAREAL: {
        apartment: 1.2,
        house: 1.1,
        commercial: 1.0,
        land: 0.8,
        industrial: 0.7,
      },
      OLX: {
        apartment: 1.1,
        house: 1.0,
        commercial: 0.9,
        land: 0.8,
        industrial: 0.8,
      },
      IMOVELWEB: {
        apartment: 1.2,
        house: 1.1,
        commercial: 1.0,
        land: 0.8,
        industrial: 0.7,
      },
      CHAVES_NA_MAO: {
        apartment: 1.1,
        house: 1.0,
        commercial: 0.9,
        land: 0.7,
        industrial: 0.6,
      },
      MERCADO_LIVRE: {
        apartment: 0.9,
        house: 0.9,
        commercial: 1.0,
        land: 0.8,
        industrial: 0.9,
      },
      PROPRIETARIO_DIRETO: {
        apartment: 1.0,
        house: 1.1,
        commercial: 0.9,
        land: 0.8,
        industrial: 0.7,
      },
      IMOBIBRASIL: {
        apartment: 0.9,
        house: 1.0,
        commercial: 0.8,
        land: 0.7,
        industrial: 0.6,
      },
      LOFT: {
        apartment: 1.2,
        house: 1.0,
        commercial: 0.8,
        land: 0.6,
        industrial: 0.5,
      },
      QUINTO_ANDAR: {
        apartment: 1.2,
        house: 1.0,
        commercial: 0.8,
        land: 0.6,
        industrial: 0.5,
      },
      VRSYNC: {
        apartment: 1.2,
        house: 1.1,
        commercial: 1.0,
        land: 0.8,
        industrial: 0.7,
      },
      CUSTOM: {
        apartment: 1.0,
        house: 1.0,
        commercial: 1.0,
        land: 1.0,
        industrial: 1.0,
      },
    };

    return multipliers[portalType]?.[propertyType] || 1.0;
  }

  /**
   * Multiplicador de alcance baseado no tipo de transação
   */
  private getTransactionTypeMultiplier(
    portalType: PortalType,
    transactionType: PropertyData["transactionType"],
  ): number {
    const multipliers: Record<
      PortalType,
      Record<PropertyData["transactionType"], number>
    > = {
      ZAP: {
        sale: 1.1,
        rent: 1.0,
      },
      VIVAREAL: {
        sale: 1.1,
        rent: 1.0,
      },
      OLX: {
        sale: 0.9,
        rent: 1.1,
      },
      IMOVELWEB: {
        sale: 1.1,
        rent: 1.0,
      },
      CHAVES_NA_MAO: {
        sale: 1.0,
        rent: 1.1,
      },
      MERCADO_LIVRE: {
        sale: 0.8,
        rent: 0.9,
      },
      PROPRIETARIO_DIRETO: {
        sale: 1.0,
        rent: 0.9,
      },
      IMOBIBRASIL: {
        sale: 0.9,
        rent: 0.8,
      },
      LOFT: {
        sale: 1.0,
        rent: 0.9,
      },
      QUINTO_ANDAR: {
        sale: 1.0,
        rent: 0.9,
      },
      VRSYNC: {
        sale: 1.1,
        rent: 1.0,
      },
      CUSTOM: {
        sale: 1.0,
        rent: 1.0,
      },
    };

    return multipliers[portalType]?.[transactionType] || 1.0;
  }
}

/**
 * Função utilitária para selecionar portais automaticamente
 */
export function selectPortalsAutomatically(
  portalConfigs: PortalConfig[],
  propertyData: PropertyData,
  priority: "performance" | "reach" | "cost" | "quality" = "performance",
): AutoSelectionResult {
  const criteria: PortalSelectionCriteria = {
    propertyType: propertyData.propertyType,
    transactionType: propertyData.transactionType,
    price: propertyData.price,
    location: {
      city: propertyData.address.city,
      state: propertyData.address.state,
    },
    features: propertyData.features,
    priority,
  };

  const selector = new PortalAutoSelector(portalConfigs);
  return selector.selectPortals(criteria);
}
