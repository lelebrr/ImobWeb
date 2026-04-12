import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { metaCatalogGenerator } from '@/lib/xml-processor/meta-catalog';

/**
 * API para servir o Catálogo do Facebook/Instagram
 */
export async function GET(req: NextRequest) {
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'DISPONIVEL' },
      include: { photos: true }
    });

    const xml = metaCatalogGenerator.generateFeed(properties as any);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300' // Cache de 5min é suficiente para Meta
      }
    });

  } catch (error: any) {
    console.error('[MetaAPI] Error generating catalog:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
