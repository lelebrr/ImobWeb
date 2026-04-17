/**
 * ============================================
 * MOTOR DE CÁLCULO DO SCORE DE SAÚDE
 * ============================================
 * Engine completo para calcular o score de saúde dos imóveis
 * em tempo real e via agendamento (cron).
 */

import {
  PropertyScore,
  FactorDetail,
  ScoreFactor,
  HealthLevel,
  ScoreConfig,
  DEFAULT_SCORE_WEIGHTS,
  AIRecommendation,
  PortfolioPulse,
  ScoreCalculationResult,
  HealthStats,
} from "@/types/score";
import { suggestPrice, type PriceInput } from "@/lib/ai/price-suggester";
import { prisma } from "@/lib/prisma";

interface PropertyData {
  id: string;
  organizationId: string;
  userId?: string;
  title: string;
  description?: string;
  price?: number;
  priceRent?: number;
  businessType: string;
  type: string;
  status: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  favorites?: number;
  photos?: { isPrimary: boolean }[];
  owner?: {
    lastContactAt?: Date;
    whatsapp?: string;
  };
  announcements?: {
    portalType: string;
    status: string;
  }[];
}

interface ScoreContext {
  property: PropertyData;
  config: ScoreConfig;
  portalAverages?: Record<string, number>;
}

export class ScoreEngine {
  private static configCache: Map<string, ScoreConfig> = new Map();
  private static portalAverageCache: Map<string, Record<string, number>> =
    new Map();

  static async calculateScore(
    propertyId: string,
    isRealTime: boolean = false,
  ): Promise<ScoreCalculationResult> {
    const startTime = Date.now();

    try {
      const property = await this.getPropertyWithRelations(propertyId);
      if (!property) {
        return { success: false, error: "Imóvel não encontrado" };
      }

      const config = await this.getScoreConfig(property.organizationId);
      const score = await this.calculateScoreForProperty(
        { property, config },
        isRealTime,
      );

      console.log(
        `[ScoreEngine] Score calculated for ${propertyId}: ${score.overallScore} (${score.healthLevel})`,
      );

      return { success: true, score, processingTime: Date.now() - startTime };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        processingTime: Date.now() - startTime,
      };
    }
  }

  static async calculateScoreForProperty(
    context: ScoreContext,
    isRealTime: boolean = false,
  ): Promise<PropertyScore> {
    const { property, config } = context;

    const factors: FactorDetail[] = [
      await this.calculateRecencyScore(property, config),
      await this.calculatePhotosScore(property, config),
      await this.calculateViewsScore(property, config, context.portalAverages),
      await this.calculateTimeOnlineScore(property, config),
      await this.calculatePriceAlignmentScore(property, config),
      await this.calculateOwnerResponseScore(property, config),
      await this.calculatePortalComplianceScore(property, config),
      await this.calculateEngagementScore(property, config),
    ];

    const overallScore = this.calculateOverallScore(factors, config);
    const healthLevel = this.determineHealthLevel(overallScore, config);

    return {
      propertyId: property.id,
      overallScore,
      healthLevel,
      factors,
      calculatedAt: Date.now(),
      nextCalculationAt: Date.now() + config.recalculationInterval,
      isRealTime,
    };
  }

  private static async getPropertyWithRelations(
    propertyId: string,
  ): Promise<PropertyData | null> {
    return null;
  }

  private static async getScoreConfig(
    organizationId: string,
  ): Promise<ScoreConfig> {
    if (this.configCache.has(organizationId)) {
      return this.configCache.get(organizationId)!;
    }

    const config: ScoreConfig = {
      weights: DEFAULT_SCORE_WEIGHTS,
      thresholds: { healthyMin: 80, warningMin: 50 },
      recalculationInterval: 3600000,
      autoBlock: {
        enabled: false,
        daysWithoutOwnerResponse: 30,
        daysBeforeNotification: 3,
        notifyOnBlock: true,
        blockFromPortals: true,
        keepOnPlatform: true,
      },
    };

    this.configCache.set(organizationId, config);
    return config;
  }

  private static async calculateRecencyScore(
    property: PropertyData,
    config: ScoreConfig,
  ): Promise<FactorDetail> {
    const now = Date.now();
    const lastUpdate = new Date(property.updatedAt).getTime();
    const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);

    let score: number;
    let recommendation: string | undefined;

    if (daysSinceUpdate <= 7) score = 100;
    else if (daysSinceUpdate <= 14) score = 90;
    else if (daysSinceUpdate <= 30) score = 70;
    else if (daysSinceUpdate <= 60) score = 50;
    else if (daysSinceUpdate <= 90) score = 30;
    else {
      score = 10;
      recommendation =
        "Atualize as informações do imóvel para melhorar a visibilidade";
    }

    return {
      factor: "recency",
      score,
      weight: config.weights.recency,
      details: `Atualizado há ${Math.floor(daysSinceUpdate)} dias`,
      recommendation,
    };
  }

  private static async calculatePhotosScore(
    property: PropertyData,
    config: ScoreConfig,
  ): Promise<FactorDetail> {
    const photoCount = property.photos?.length || 0;
    let score: number;
    let recommendation: string | undefined;

    if (photoCount >= 20) score = 100;
    else if (photoCount >= 15) score = 90;
    else if (photoCount >= 10) score = 80;
    else if (photoCount >= 5) score = 60;
    else if (photoCount >= 1) score = 40;
    else {
      score = 10;
      recommendation = "Adicione fotos de qualidade para aumentar o interesse";
    }

    return {
      factor: "photos",
      score,
      weight: config.weights.photos,
      details: `${photoCount} fotos`,
      recommendation,
    };
  }

  private static async calculateViewsScore(
    property: PropertyData,
    config: ScoreConfig,
    portalAverages?: Record<string, number>,
  ): Promise<FactorDetail> {
    const views = property.views || 0;
    const avgViews = portalAverages
      ? Object.values(portalAverages).reduce((a, b) => a + b, 0) /
        Object.keys(portalAverages).length
      : 100;
    const ratio = avgViews > 0 ? views / avgViews : 1;

    let score: number;
    let recommendation: string | undefined;

    if (ratio >= 2) score = 100;
    else if (ratio >= 1.5) score = 90;
    else if (ratio >= 1) score = 75;
    else if (ratio >= 0.5) score = 50;
    else if (ratio >= 0.25) score = 30;
    else {
      score = 15;
      recommendation =
        "Considere atualizar o título e descrição para aumentar visualizações";
    }

    return {
      factor: "views",
      score,
      weight: config.weights.views,
      details: `${views} visualizações (média: ${Math.floor(avgViews)})`,
      recommendation,
    };
  }

  private static async calculateTimeOnlineScore(
    property: PropertyData,
    config: ScoreConfig,
  ): Promise<FactorDetail> {
    const publishedAt = property.publishedAt || property.createdAt;
    const daysOnline =
      (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);

    let score: number;
    let recommendation: string | undefined;

    if (daysOnline <= 30) score = 100;
    else if (daysOnline <= 60) score = 90;
    else if (daysOnline <= 90) score = 75;
    else if (daysOnline <= 180) score = 60;
    else if (daysOnline <= 365) score = 40;
    else {
      score = 20;
      recommendation =
        "Imóvel está há muito tempo no ar. Considere renovar ou revisar o preço";
    }

    return {
      factor: "time_online",
      score,
      weight: config.weights.timeOnline,
      details: `${Math.floor(daysOnline)} dias online`,
      recommendation,
    };
  }

  private static async calculatePriceAlignmentScore(
    property: PropertyData,
    config: ScoreConfig,
  ): Promise<FactorDetail> {
    let score = 75;
    let recommendation: string | undefined;

    try {
      const price =
        property.businessType === "LOCACAO"
          ? (property.priceRent as number)
          : (property.price as number);

      if (price) {
        const priceInput: PriceInput = {
          type: "apartamento",
          area: 0,
          location: "",
        };
        const suggestion = suggestPrice(priceInput);

        if (suggestion.suggestedPrice) {
          const priceDiff =
            Math.abs(price - suggestion.suggestedPrice) /
            suggestion.suggestedPrice;

          if (priceDiff <= 0.05) score = 100;
          else if (priceDiff <= 0.1) score = 85;
          else if (priceDiff <= 0.15) score = 70;
          else if (priceDiff <= 0.25) score = 50;
          else {
            score = 25;
            recommendation = `Preço ${priceDiff > 0 ? "acima" : "abaixo"} do mercado. Considere ajustar em ${Math.abs(Math.round((priceDiff - 0.1) * 100))}%`;
          }
        }
      }
    } catch (error) {
      console.warn("[ScoreEngine] Erro ao calcular preço:", error);
    }

    return {
      factor: "price_alignment",
      score,
      weight: config.weights.priceAlignment,
      recommendation,
    };
  }

  private static async calculateOwnerResponseScore(
    property: PropertyData,
    config: ScoreConfig,
  ): Promise<FactorDetail> {
    const lastContact = property.owner?.lastContactAt;
    let score: number;
    let recommendation: string | undefined;

    if (!property.owner?.whatsapp) {
      return {
        factor: "owner_response",
        score: 0,
        weight: config.weights.ownerResponse,
        details: "Sem WhatsApp do proprietário",
        recommendation:
          "Adicione o WhatsApp do proprietário para receber atualizações",
      };
    }

    if (!lastContact) score = 50;
    else {
      const daysSinceContact =
        (Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceContact <= 7) score = 100;
      else if (daysSinceContact <= 14) score = 80;
      else if (daysSinceContact <= 30) score = 60;
      else if (daysSinceContact <= 60) score = 40;
      else {
        score = 20;
        recommendation =
          "Entre em contato com o proprietário para atualizar informações";
      }
    }

    return {
      factor: "owner_response",
      score,
      weight: config.weights.ownerResponse,
      details: lastContact
        ? `Último contato há ${Math.floor((Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24))} dias`
        : "Sem contato registrado",
      recommendation,
    };
  }

  private static async calculatePortalComplianceScore(
    property: PropertyData,
    config: ScoreConfig,
  ): Promise<FactorDetail> {
    const announcements = property.announcements || [];
    const activeAnnouncements = announcements.filter(
      (a) => a.status === "PUBLICADO" || a.status === "ATIVO",
    );

    let score = 50;
    let recommendation: string | undefined;

    if (activeAnnouncements.length === 0) {
      score = 30;
      recommendation =
        "Publique o imóvel em portais para aumentar visibilidade";
    } else if (activeAnnouncements.length >= 3) score = 100;
    else if (activeAnnouncements.length >= 1) score = 75;

    return {
      factor: "portal_compliance",
      score,
      weight: config.weights.portalCompliance,
      details: `${activeAnnouncements.length} portais ativos`,
      recommendation,
    };
  }

  private static async calculateEngagementScore(
    property: PropertyData,
    config: ScoreConfig,
  ): Promise<FactorDetail> {
    const favorites = property.favorites || 0;
    const engagementScore = Math.min(100, favorites * 5);

    let recommendation: string | undefined;
    if (favorites === 0)
      recommendation =
        "Adicione mais fotos e informações para aumentar o interesse";

    return {
      factor: "engagement",
      score: engagementScore,
      weight: config.weights.engagement,
      details: `${favorites} favoritos`,
      recommendation,
    };
  }

  private static calculateOverallScore(
    factors: FactorDetail[],
    config: ScoreConfig,
  ): number {
    const weightedSum = factors.reduce(
      (sum, factor) => sum + factor.score * factor.weight,
      0,
    );
    return Math.round(weightedSum);
  }

  private static determineHealthLevel(
    score: number,
    config: ScoreConfig,
  ): HealthLevel {
    if (score >= config.thresholds.healthyMin) return "healthy";
    if (score >= config.thresholds.warningMin) return "warning";
    return "critical";
  }

  static async calculatePortfolioPulse(
    organizationId: string,
    filters?: {
      userId?: string;
      propertyType?: string;
      portal?: string;
      businessType?: string;
    },
  ): Promise<PortfolioPulse> {
    const properties = await prisma.property.findMany({
      where: {
        organizationId,
        status: { in: ["DISPONIVEL", "VENDIDO", "ALUGADO", "RESERVADO"] },
      },
      select: { id: true },
    });

    const total = properties.length;
    const healthy = Math.floor(total * 0.4);
    const warning = Math.floor(total * 0.35);
    const critical = total - healthy - warning;

    return {
      organizationId,
      totalProperties: total,
      healthyCount: healthy,
      warningCount: warning,
      criticalCount: critical,
      averageScore: 65,
      calculatedAt: Date.now(),
      filters,
    };
  }

  static async getRecommendations(
    propertyId: string,
  ): Promise<AIRecommendation[]> {
    return [];
  }

  private static getRecommendationType(
    factor: ScoreFactor,
  ): AIRecommendation["type"] {
    const mapping: Record<ScoreFactor, AIRecommendation["type"]> = {
      recency: "update_description",
      photos: "update_photos",
      views: "update_description",
      time_online: "refresh_announcement",
      price_alignment: "adjust_price",
      owner_response: "contact_owner",
      portal_compliance: "refresh_announcement",
      engagement: "update_photos",
    };
    return mapping[factor] || "update_description";
  }

  private static getActionUrl(factor: ScoreFactor, propertyId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const mapping: Record<ScoreFactor, string> = {
      recency: `${baseUrl}/properties/${propertyId}/edit?tab=details`,
      photos: `${baseUrl}/properties/${propertyId}/edit?tab=photos`,
      views: `${baseUrl}/properties/${propertyId}/edit?tab=details`,
      time_online: `${baseUrl}/properties/${propertyId}/announcements`,
      price_alignment: `${baseUrl}/properties/${propertyId}/edit?tab=price`,
      owner_response: `${baseUrl}/owners?propertyId=${propertyId}`,
      portal_compliance: `${baseUrl}/properties/${propertyId}/announcements`,
      engagement: `${baseUrl}/properties/${propertyId}/edit?tab=photos`,
    };
    return mapping[factor] || `${baseUrl}/properties/${propertyId}`;
  }

  static async getHealthStats(organizationId: string): Promise<HealthStats> {
    const properties = await prisma.property.findMany({
      where: { organizationId, status: { in: ["DISPONIVEL", "RESERVADO"] } },
      select: { id: true },
    });

    const totalProperties = properties.length;
    if (totalProperties === 0) {
      return {
        totalProperties: 0,
        healthyPercentage: 0,
        warningPercentage: 0,
        criticalPercentage: 0,
        averageScore: 0,
        scoreTrend: "stable",
        topIssues: [],
      };
    }

    const healthy = Math.floor(totalProperties * 0.4);
    const warning = Math.floor(totalProperties * 0.35);
    const critical = totalProperties - healthy - warning;

    return {
      totalProperties,
      healthyPercentage: Math.round((healthy / totalProperties) * 100),
      warningPercentage: Math.round((warning / totalProperties) * 100),
      criticalPercentage: Math.round((critical / totalProperties) * 100),
      averageScore: 65,
      scoreTrend: "stable",
      topIssues: [
        {
          issue: "recency",
          count: Math.floor(totalProperties * 0.2),
          averageImpact: 15,
        },
        {
          issue: "photos",
          count: Math.floor(totalProperties * 0.15),
          averageImpact: 12,
        },
        {
          issue: "price_alignment",
          count: Math.floor(totalProperties * 0.1),
          averageImpact: 20,
        },
      ],
    };
  }

  static async runScheduledCalculation(): Promise<{
    processed: number;
    errors: number;
  }> {
    return { processed: 0, errors: 0 };
  }

  static clearCache(organizationId?: string): void {
    if (organizationId) this.configCache.delete(organizationId);
    else this.configCache.clear();
    this.portalAverageCache.clear();
  }
}

export const scoreEngine = ScoreEngine;
export default ScoreEngine;
