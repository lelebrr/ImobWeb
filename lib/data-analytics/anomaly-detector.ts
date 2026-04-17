import { prisma } from '@/lib/prisma';

/**
 * Detector de Anomalias em Imóveis e Leads.
 * Identifica quedas bruscas de performance ou comportamentos fora do padrão.
 */
export class AnomalyDetector {
  /**
   * Detecta anomalias de visualização (ex: queda repentina de 50%+ em relação à média).
   */
  static async detectViewAnomalies(propertyId: string) {
    // Em um sistema real, teríamos uma tabela de 'PropertyViewsDaily'
    // Aqui simularemos com os dados disponíveis no Property (views totais)
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) return null;

    // Lógica simplificada: Se o imóvel está publicado há mais de 30 dias 
    // e tem menos de 10 visualizações totais, é uma anomalia de visibilidade.
    const daysSincePublish = property.publishedAt 
      ? Math.floor((Date.now() - property.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSincePublish > 15 && (property.viewCount || 0) < 5) {
      return {
        type: 'LOW_VISIBILITY',
        severity: 'HIGH',
        message: 'Seu imóvel não está recebendo visualizações. Verifique a integração com os portais.',
      };
    }

    return null;
  }

  /**
   * Detecta anomalias no funil de conversão.
   */
  static async detectConversionAnomalies(propertyId: string) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return null;

    const leadsCount = await prisma.lead.count({ where: { propertyId } });
    const viewCount = property.viewCount || 0;

    // Se tem muitas views mas zero leads, é uma anomalia de conversão (provavelmente preço ou fotos ruins)
    if (viewCount > 300 && leadsCount === 0) {
      return {
        type: 'CONVERSION_DROP',
        severity: 'CRITICAL',
        message: 'Alta exposição sem nenhuma conversão. Recomendamos revisar o preço imediatamente.',
      };
    }

    return null;
  }
}
