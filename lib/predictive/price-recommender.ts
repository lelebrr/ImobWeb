import { PrismaClient, Property } from '@prisma/client';
import { PriceRecommendation } from '../../types/insights';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const prisma = new PrismaClient();

/**
 * Motor de Recomendação Inteligente de Preços.
 * Utiliza dados históricos, métricas de engajamento e análise comparativa.
 */
export class PriceRecommender {
  /**
   * Sugere um preço ideal para um imóvel específico.
   */
  static async suggestPrice(propertyId: string): Promise<PriceRecommendation> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        announcements: true,
        organization: true,
      },
    });

    if (!property || !property.price) {
      throw new Error('Property not found or missing price');
    }

    // 1. Encontrar imóveis similares para benchmark (mesmo bairro e tipo)
    const comparables = await prisma.property.findMany({
      where: {
        neighborhood: property.neighborhood,
        city: property.city,
        type: property.type,
        businessType: property.businessType,
        status: 'DISPONIVEL',
        id: { not: propertyId },
      },
      take: 20,
    });

    const avgMarketPrice = this.calculateAveragePrice(comparables, property.price.toNumber());
    
    // 2. Analisar métricas de engajamento
    // Se tem muitas visualizações mas poucos leads, o preço pode estar alto.
    const views = property.views || 0;
    const leadsCount = await prisma.lead.count({ where: { propertyId } });
    const ctr = views > 0 ? (leadsCount / views) * 100 : 0;

    // 3. Heurística base
    let adjustmentFactor = 1.0;
    const reasoning: string[] = [];

    if (property.price.toNumber() > avgMarketPrice * 1.1) {
      adjustmentFactor -= 0.05;
      reasoning.push('Seu preço está 10% acima da média do bairro.');
    } else if (property.price.toNumber() < avgMarketPrice * 0.9) {
      adjustmentFactor += 0.03;
      reasoning.push('Seu preço está atrativo em relação à vizinhança.');
    }

    if (views > 500 && leadsCount < 2) {
      adjustmentFactor -= 0.07;
      reasoning.push('Alto volume de tráfego com baixa conversão sugere preço acima do esperado pelo mercado.');
    }

    // 4. Integração com IA para Refinamento Avançado (opcional/pago)
    // Aqui poderíamos usar o Vercel AI SDK para analisar o sentimento do mercado
    // ou tendências macroeconômicas de 2026.

    const suggestedPrice = Math.round(property.price.toNumber() * adjustmentFactor);
    
    return {
      suggestedPrice,
      minPrice: Math.round(suggestedPrice * 0.92),
      maxPrice: Math.round(suggestedPrice * 1.05),
      confidence: comparables.length > 5 ? 0.85 : 0.6,
      marketAverage: avgMarketPrice,
      reasoning,
      comparablesCount: comparables.length,
    };
  }

  private static calculateAveragePrice(comparables: Property[], basePrice: number): number {
    if (comparables.length === 0) return basePrice;
    const sum = comparables.reduce((acc, curr) => acc + (curr.price?.toNumber() || 0), 0);
    return sum / comparables.length;
  }

  /**
   * Gera uma justificativa via IA para o proprietário aceitar a mudança de preço.
   */
  static async generatePriceJustification(property: Property, recommendation: PriceRecommendation) {
    // Exemplo de uso do Vercel AI SDK (necessário configurar OPENAI_API_KEY)
    /*
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Crie uma mensagem persuasiva para um proprietário de um imóvel ${property.type} em ${property.neighborhood}.
      O preço atual é R$ ${property.price}. Sugerimos alterar para R$ ${recommendation.suggestedPrice}.
      Justificativa: ${recommendation.reasoning.join(' ')}.
      Seja profissional e focado em velocidade de venda.`,
    });
    return text;
    */
    return `Olá! Analisamos o mercado de ${property.neighborhood} e percebemos que imóveis similares estão sendo vendidos por uma média de R$ ${recommendation.marketAverage}. Para acelerar sua venda, recomendamos ajustar para R$ ${recommendation.suggestedPrice}.`;
  }
}
