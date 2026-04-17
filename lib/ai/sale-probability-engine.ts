import { SaleProbabilityScore, AIAnalysis, PriceSuggestionLegacy, SaleProbabilityFactors } from "@/types/ai";
import { OpenAIClient } from "@/lib/ai/openai-client";
import { prisma } from "@/lib/prisma";

/**
 * Motor de Score de Probabilidade de Venda - IA
 * Calcula a probabilidade de venda de um imóvel com base em múltiplos fatores
 */
export class SaleProbabilityEngine {
  /**
   * Calcula a probabilidade de venda de um imóvel
   * @param propertyId ID da propriedade
   * @returns Score de probabilidade de venda
   */
  static async calculateSaleProbability(
    propertyId: string
  ): Promise<SaleProbabilityScore> {
    try {
      // 1. Obter dados do imóvel
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          leads: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
              },
            },
            select: { id: true, status: true },
          },
          viewRecords: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            select: { count: true },
          },
          announcements: {
            where: { status: "PUBLISHED" },
            select: { portalId: true },
          },
        },
      });

      if (!property) {
        throw new Error("Propriedade não encontrada");
      }

      // 2. Calcular fatores de probabilidade
      const factorValues = await this.calculateFactors(property);

      // 3. Calcular probabilidade final
      const probabilityValue = this.calculateFinalProbability(factorValues);

      // 4. Calcular dias esperados de venda
      const expectedDays = this.calculateExpectedDays(factorValues);

      // 5. Gerar análise da IA
      const aiAnalysis = await this.generateAIAnalysis(factorValues, probabilityValue);

      // Gerar comparação com o mercado
      const marketComparison = {
        averagePrice: property.price ? Number(property.price) : 0,
        priceRange: {
          min: property.price ? Number(property.price) * 0.9 : 0,
          max: property.price ? Number(property.price) * 1.1 : 0,
        },
        pricePercentile: Math.round(probabilityValue * 100),
        daysOnMarketAverage: expectedDays,
        soldRatio: Math.min(0.85, probabilityValue * 0.9),
        competitiveAdvantage: {
          hasAdvantage: probabilityValue > 0.5,
          reason: probabilityValue > 0.5 ? "Imóvel competitivo no mercado" : "Melhorar posicionamento",
          score: Math.round(probabilityValue * 100),
        },
      };

      // Gerar recomendações
      const recommendations = this.generateRecommendations(factorValues, probabilityValue);

      // Mapear fatores para o formato de array esperado pelo SaleProbabilityScore
      const factorsArray = [
        { label: 'Leads Recentes', score: factorValues.leadScore, impact: factorValues.leadScore > 60 ? 'positive' : 'negative' as const },
        { label: 'Visualizações', score: factorValues.viewScore, impact: factorValues.viewScore > 60 ? 'positive' : 'negative' as const },
        { label: 'Portais Ativos', score: factorValues.portalScore, impact: factorValues.portalScore > 60 ? 'positive' : 'negative' as const },
        { label: 'Preço', score: factorValues.priceScore, impact: factorValues.priceScore > 60 ? 'positive' : 'negative' as const },
        { label: 'Engajamento', score: factorValues.engagementScore, impact: factorValues.engagementScore > 60 ? 'positive' : 'negative' as const },
        { label: 'Tempo Online', score: factorValues.timeOnlineScore, impact: factorValues.timeOnlineScore > 60 ? 'positive' : 'negative' as const },
      ];

      return {
        score: Math.round(probabilityValue * 100),
        level: this.determineLevel(probabilityValue),
        trend: 'stable',
        aiInsight: aiAnalysis.detailedAnalysis || 'Análise em processamento',
        predictedDaysToSale: Math.max(7, expectedDays),
        factors: factorsArray,
        
        // Campos de compatibilidade
        probability: Math.min(0.98, Math.max(0.05, probabilityValue)),
        probabilityPercentage: Math.round(probabilityValue * 100),
        expectedDays: Math.max(7, expectedDays),
        engagementScore: factorValues.engagementScore,
        aiAnalysis,
        marketComparison,
        recommendations,
      };
    } catch (error) {
      console.error("Erro ao calcular probabilidade de venda:", error);
      throw new Error("Falha ao calcular probabilidade de venda");
    }
  }

  private static determineLevel(probability: number): 'very_high' | 'high' | 'medium' | 'low' | 'very_low' {
    if (probability >= 0.8) return 'very_high';
    if (probability >= 0.6) return 'high';
    if (probability >= 0.4) return 'medium';
    if (probability >= 0.2) return 'low';
    return 'very_low';
  }

  /**
   * Calcula os fatores que influenciam a probabilidade de venda
   * @param property Dados do imóvel
   * @returns Fatores calculados
   */
  private static async calculateFactors(
    property: any
  ): Promise<any> {
    // 1. Fator de Leads Recentes
    const recentLeads = property.leads?.length || 0;
    const leadScore = this.calculateLeadScore(recentLeads);

    // 2. Fator de Visualizações
    const viewsCount = property.viewRecords?.reduce((sum: number, v: any) => sum + (v.count || 0), 0) || 0;
    const viewScore = this.calculateViewScore(viewsCount);

    // 3. Fator de Portais Ativos
    const activePortals = property.announcements?.length || 0;
    const portalScore = this.calculatePortalScore(activePortals);

    // 4. Fator de Preço
    const priceScore = await this.calculatePriceScore(property);

    // 5. Fator de Engajamento
    const engagementScore = this.calculateEngagementScore(property);

    // 6. Fator de Tempo Online
    const timeOnlineScore = this.calculateTimeOnlineScore(property);

    return {
      leadScore,
      viewScore,
      portalScore,
      priceScore,
      engagementScore,
      timeOnlineScore,
      recentLeads,
      views: viewsCount,
      activePortals,
      favorites: property.favorites || 0,
      inquiries: property.inquiries || 0,
      priceReductionsCount: property.priceReductionsCount || 0,
      daysOnMarket: property.daysOnMarket || 0,
    };
  }

  /**
   * Calcula o score de leads recentes
   */
  private static calculateLeadScore(recentLeads: number): number {
    if (recentLeads >= 5) return 100;
    if (recentLeads >= 3) return 80;
    if (recentLeads >= 1) return 60;
    if (recentLeads >= 0) return 40;
    return 20;
  }

  /**
   * Calcula o score de visualizações
   */
  private static calculateViewScore(views: number): number {
    if (views >= 100) return 100;
    if (views >= 50) return 80;
    if (views >= 25) return 60;
    if (views >= 10) return 40;
    if (views >= 5) return 20;
    return 10;
  }

  /**
   * Calcula o score de portais ativos
   */
  private static calculatePortalScore(activePortals: number): number {
    if (activePortals >= 5) return 100;
    if (activePortals >= 3) return 80;
    if (activePortals >= 1) return 60;
    return 30;
  }

  /**
   * Calcula o score de preço
   */
  private static async calculatePriceScore(property: any): Promise<number> {
    try {
      // Se tiver preço sugerido do PriceRecommender
      if (property.priceSuggestion) {
        const priceDiff =
          Math.abs(property.price - property.priceSuggestion) /
          property.priceSuggestion;

        if (priceDiff <= 0.05) return 100;
        if (priceDiff <= 0.1) return 80;
        if (priceDiff <= 0.15) return 60;
        if (priceDiff <= 0.25) return 40;
        return 20;
      }

      // Se não tiver preço sugerido, usar preço médio do mercado
      return 70;
    } catch (error) {
      console.error("Erro ao calcular score de preço:", error);
      return 50;
    }
  }

  /**
   * Calcula o score de engajamento
   */
  private static calculateEngagementScore(property: any): number {
    const favorites = property.favorites || 0;
    const inquiries = property.inquiries || 0;

    const totalEngagement = favorites + inquiries;
    return Math.min(100, totalEngagement * 5);
  }

  /**
   * Calcula o score de tempo online
   */
  private static calculateTimeOnlineScore(property: any): number {
    const publishedAt = property.publishedAt || property.createdAt;
    const daysOnline =
      (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (daysOnline <= 30) return 100;
    if (daysOnline <= 60) return 90;
    if (daysOnline <= 90) return 80;
    if (daysOnline <= 180) return 70;
    if (daysOnline <= 365) return 60;
    return 50;
  }

  /**
   * Calcula a probabilidade final
   */
  private static calculateFinalProbability(
    factors: SaleProbabilityFactors
  ): number {
    const weights = {
      leadScore: 0.25,
      viewScore: 0.20,
      portalScore: 0.15,
      priceScore: 0.20,
      engagementScore: 0.10,
      timeOnlineScore: 0.10,
    };

    const weightedSum =
      factors.leadScore * weights.leadScore +
      factors.viewScore * weights.viewScore +
      factors.portalScore * weights.portalScore +
      factors.priceScore * weights.priceScore +
      factors.engagementScore * weights.engagementScore +
      factors.timeOnlineScore * weights.timeOnlineScore;

    return weightedSum;
  }

  /**
   * Calcula os dias esperados de venda
   */
  private static calculateExpectedDays(factors: SaleProbabilityFactors): number {
    let baseDays = 90;

    // Reduzir dias se tiver muitos leads
    if (factors.recentLeads >= 5) baseDays -= 30;
    else if (factors.recentLeads >= 3) baseDays -= 15;
    else if (factors.recentLeads >= 1) baseDays -= 5;

    // Reduzir dias se tiver muitas visualizações
    if (factors.views >= 50) baseDays -= 10;
    else if (factors.views >= 25) baseDays -= 5;

    // Aumentar dias se tiver pouco engajamento
    if (factors.engagementScore < 30) baseDays += 20;

    return baseDays;
  }

  /**
   * Gera análise da IA
   */
  private static async generateAIAnalysis(
    factors: SaleProbabilityFactors,
    probability: number
  ): Promise<AIAnalysis> {
    const systemPrompt = `
      Você é um especialista em mercado imobiliário.
      Analise os seguintes fatores de um imóvel e forneça uma análise detalhada.

      Fatores:
      - Lead Score: ${factors.leadScore}
      - View Score: ${factors.viewScore}
      - Portal Score: ${factors.portalScore}
      - Price Score: ${factors.priceScore}
      - Engagement Score: ${factors.engagementScore}
      - Time Online Score: ${factors.timeOnlineScore}

      Probabilidade de venda: ${Math.round(probability * 100)}%

      Retorne um JSON com:
      - confidence: Nível de confiança na análise (0-100)
      - riskScore: Nível de risco (0-100)
      - recommendations: Array de 3-5 recomendações
      - detailedAnalysis: Análise detalhada
    `;

    try {
      const openai = OpenAIClient.getInstance();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(factors),
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Resposta da IA vazia");
      const analysis = JSON.parse(content);

      return {
        confidence: analysis.confidence || 80,
        riskScore: analysis.riskScore || 20,
        recommendations: analysis.recommendations || [],
        detailedAnalysis: analysis.detailedAnalysis || "",
      };
    } catch (error) {
      console.error("Erro ao gerar análise da IA:", error);
      return {
        confidence: 70,
        riskScore: 30,
        recommendations: [
          "Aumente o número de leads qualificados",
          "Atualize as fotos do imóvel",
          "Verifique o preço em relação ao mercado",
        ],
        detailedAnalysis: "Análise padrão sem IA",
      };
    }
  }

  /**
   * Gera recomendações baseadas nos fatores
   */
  private static generateRecommendations(
    factors: SaleProbabilityFactors,
    probability: number
  ): string[] {
    const recommendations: string[] = [];

    if (factors.recentLeads < 3) {
      recommendations.push("Aumente o número de leads qualificados");
    }

    if (factors.views < 25) {
      recommendations.push("Melhore a visibilidade do anúncio");
    }

    if (probability < 0.3) {
      recommendations.push("Reavalie o preço em relação ao mercado");
    }

    if (probability > 0.7) {
      recommendations.push("Considere aumentar o preço");
    }

    if (factors.activePortals < 3) {
      recommendations.push("Publique em mais portais");
    }

    return recommendations.length > 0 ? recommendations : ["Manter estratégia atual"];
  }

  /**
   * Sugere um preço baseado na probabilidade de venda
   * @param propertyId ID da propriedade
   * @returns Sugestão de preço
   */
  static async suggestPrice(propertyId: string): Promise<PriceSuggestionLegacy> {
    try {
      const probability = await this.calculateSaleProbability(propertyId);

      // Se probabilidade > 70%, sugere aumentar o preço
      if (probability.probability > 0.7) {
        const increase = 0.05 + (probability.probability - 0.7) * 0.1;
        return {
          suggestedPrice: null,
          confidence: 85,
          marketAnalysis: "Alta demanda no mercado, preço pode ser aumentado",
        };
      }

      // Se probabilidade < 30%, sugere reduzir o preço
      if (probability.probability < 0.3) {
        const decrease = 0.1 + (0.3 - probability.probability) * 0.2;
        return {
          suggestedPrice: null,
          confidence: 80,
          marketAnalysis: "Baixa demanda, preço deve ser ajustado",
        };
      }

      return {
        suggestedPrice: null,
        confidence: 75,
        marketAnalysis: "Preço adequado para o mercado atual",
      };
    } catch (error) {
      console.error("Erro ao sugerir preço:", error);
      throw new Error("Falha ao sugerir preço");
    }
  }
}
