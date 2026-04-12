import { PrismaClient } from '@prisma/client';
import { HealthScore } from '../../types/insights';

const prisma = new PrismaClient();

/**
 * Calculadora de Saúde do Anúncio (Ad Health Score).
 * Avalia a qualidade do anúncio para maximizar conversão.
 */
export class HealthScoreCalculator {
  static async calculate(propertyId: string): Promise<HealthScore> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        photos: true,
        announcements: true,
      },
    });

    if (!property) throw new Error('Property not found');

    let score = 100;
    const factors: { label: string; impact: number; description: string }[] = [];
    const recommendations: string[] = [];

    // 1. Fotos (Mínimo 15 para um anúncio premium em 2026)
    const photoCount = property.photos.length;
    if (photoCount < 5) {
      score -= 30;
      factors.push({ label: 'Fotos Insuficientes', impact: -30, description: 'Anúncios com menos de 5 fotos performam 80% pior.' });
      recommendations.push('Adicione pelo menos mais 10 fotos de alta qualidade, incluindo áreas comuns.');
    } else if (photoCount < 15) {
      score -= 10;
      factors.push({ label: 'Quantidade de Fotos', impact: -10, description: 'Mais fotos aumentam o tempo de permanência no anúncio.' });
      recommendations.push('Imóveis com 15+ fotos têm maior taxa de conversão.');
    }

    // 2. Descrição (Mínimo 300 caracteres)
    const descriptionLength = property.description?.length || 0;
    if (descriptionLength < 100) {
      score -= 20;
      factors.push({ label: 'Descrição Curta', impact: -20, description: 'Faltam detalhes que geram confiança no comprador.' });
      recommendations.push('Detalhe mais as características do imóvel e do condomínio.');
    }

    // 3. Informações completas (Banheiros, Quartos, Vagas)
    if (!property.bathrooms || !property.bedrooms || !property.garages) {
      score -= 15;
      factors.push({ label: 'Dados Incompletos', impact: -15, description: 'Campos técnicos vazios dificultam a filtragem em portais.' });
      recommendations.push('Preencha todos os campos técnicos (quartos, banheiros, vagas).');
    }

    // 4. Preço definido
    if (!property.price && !property.priceRent) {
      score -= 25;
      factors.push({ label: 'Sem Preço', impact: -25, description: 'Imóveis sem preço são ignorados pela maioria dos leads.' });
      recommendations.push('Defina um valor de venda ou locação imediatamente.');
    }

    // 5. Localização precisa
    if (!property.latitude || !property.longitude) {
      score -= 10;
      factors.push({ label: 'Sem Mapa', impact: -10, description: 'A localização exata é o fator #1 de escolha em 2026.' });
      recommendations.push('Configure a localização exata no mapa para aparecer em buscas por raio.');
    }

    return {
      score: Math.max(0, score),
      factors,
      recommendations,
    };
  }
}
