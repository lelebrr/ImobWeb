import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { portalAnalytics } from '../../../../lib/portals/analytics';

const prisma = new PrismaClient();

/**
 * API para fornecer dados agregados de performance para o Dashboard de ROI
 */
export async function GET(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const performance = await portalAnalytics.getPortalPerformance(org.id);

    // Dados para gráfico de tendência de leads (mockado para demo)
    const trends = [
      { date: '2026-03-01', leads: 12, views: 150 },
      { date: '2026-03-15', leads: 25, views: 320 },
      { date: '2026-04-01', leads: 40, views: 500 },
    ];

    return NextResponse.json({ 
      performance,
      trends,
      totalSummary: {
        avgCPL: 42.50, // Exemplo de cálculo futuro
        topPortal: 'ZAP',
        totalROI: '4.2x'
      }
    });

  } catch (error: any) {
    console.error('[AnalyticsAPI] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
