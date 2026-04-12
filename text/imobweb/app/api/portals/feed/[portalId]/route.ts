import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { xmlGenerator } from '@/lib/xml-processor/xml-generator';

/**
 * Endpoint que serve o feed XML para os portais (PULL mechanism)
 * Ex: https://crm.imobweb.com.br/api/portals/feed/zap-xml-123
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ portalId: string }> }
) {
  try {
    const { portalId } = await params;

    // 1. Buscar a integração e validar status
    const integration = await prisma.portalIntegration.findUnique({
      where: { id: portalId },
      include: { announcements: true }
    });

    if (!integration || integration.status !== 'ATIVO') {
      return new NextResponse('Portal integration not found or inactive', { status: 404 });
    }

    // 2. Buscar imóveis ativos que possuem anúncio para este portal
    // Ou todos os imóveis ativos se for um feed completo
    const properties = await prisma.property.findMany({
      where: {
        status: 'DISPONIVEL',
        announcements: {
          some: { portalId }
        }
      },
      include: { photos: true }
    });

    // 3. Gerar XML formatado (VRSync por padrão)
    const xml = xmlGenerator.generateVRSync(properties as any);

    // 4. Retornar com o Content-Type correto
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error: any) {
    console.error('[FeedAPI] Error generating XML:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
