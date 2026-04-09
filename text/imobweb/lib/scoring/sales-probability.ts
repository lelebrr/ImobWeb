import { PrismaClient } from '@prisma/client';
import { SalesProbability } from '../../types/insights';

const prisma = new PrismaClient();

/**
 * Calculadora de Probabilidade de Venda/Aluguel.
 * Estima o tempo para fechamento baseado em velocidade de leads e mercado.
 */
export class SalesProbabilityCalculator {
  static async calculate(propertyId: string): Promise<SalesProbability> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) throw new Error('Property not found');

    // Média base de mercado para o bairro (Exemplo: 90 dias)
    let expectedDays = 90;
    let probability = 0.5;

    // 1. Velocidade de Leads (Últimos 15 dias)
    const recentLeads = await prisma.lead.count({
      where: {
        propertyId,
        createdAt: { gte: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }
      }
    });

    // Se tem mais de 3 leads recentes, a probabilidade sobe drasticamente
    if (recentLeads > 5) {
      probability += 0.3;
      expectedDays -= 30;
    } else if (recentLeads > 1) {
      probability += 0.15;
      expectedDays -= 15;
    } else {
      probability -= 0.1;
      expectedDays += 20;
    }

    // 2. Ajuste por Preço (comparado à média do Recomender)
    // Se estivéssemos integrando o PriceRecommender aqui:
    // const rec = await PriceRecommender.suggestPrice(propertyId);
    // if (property.price < rec.suggestPrice) { probability += 0.1; expectedDays -= 10; }

    // 3. Escore de Engajamento (Views/Clicks)
    const views = property.views || 0;
    const engagementScore = views > 0 ? (recentLeads / (views / 100)) : 0;
    
    if (engagementScore > 5) {
      probability += 0.1;
    }

    return {
      probability: Math.min(0.98, Math.max(0.05, probability)),
      expectedDays: Math.max(7, expectedDays),
      engagementScore: Math.round(engagementScore * 10)
    };
  }
}
