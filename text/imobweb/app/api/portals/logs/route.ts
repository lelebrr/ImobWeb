import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API para buscar logs de auditoria relacionados a integrações com portais
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const portalId = searchParams.get('portalId');

    // Busca logs de auditoria de ANNOUNCEMENT
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: 'ANNOUNCEMENT',
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Filtra por portalId nos metadados se fornecido
    const filtered = portalId
      ? logs.filter((log) => {
          const meta = log.metadata as Record<string, unknown> | null;
          return meta && meta['portalId'] === portalId;
        })
      : logs;

    return NextResponse.json(filtered);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PortalLogsAPI] Error fetching logs:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
