import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Serviço de Analytics para Portais
 * Responsável por rastrear visualizações, leads e performance de cada portal.
 */
export class PortalAnalytics {
  /**
   * Registra uma visualização ou clique em um anúncio de portal
   */
  async trackEvent(propertyId: string, portalId: string, type: 'view' | 'click' | 'lead') {
    try {
      const data: any = {};
      if (type === 'view') data.views = { increment: 1 };
      if (type === 'click') data.clicks = { increment: 1 };
      
      // Atualizar no anúncio específico
      await prisma.announcement.updateMany({
        where: { propertyId, portalId },
        data
      });

      // Também poderíamos salvar em uma tabela de eventos temporal se necessário
    } catch (error) {
      console.error('[PortalAnalytics] Error tracking event:', error);
    }
  }

  /**
   * Obtém o ROI e performance básica por portal para uma organização
   */
  async getPortalPerformance(organizationId: string) {
    const stats = await prisma.announcement.groupBy({
      by: ['portalType'],
      where: { property: { organizationId } },
      _sum: {
        views: true,
        clicks: true,
      },
      _count: {
        id: true
      }
    });

    // Buscar leads por portal via sourceDetails
    const leads = await prisma.lead.findMany({
      where: { organizationId, source: 'PORTAL' }
    });

    return stats.map(s => ({
      portal: s.portalType,
      totalAds: s._count.id,
      totalViews: s._sum.views || 0,
      totalClicks: s._sum.clicks || 0,
      totalLeads: leads.filter(l => (l.sourceDetails as any)?.portal === s.portalType).length
    }));
  }
}

export const portalAnalytics = new PortalAnalytics();
