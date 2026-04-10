import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API para buscar logs de auditoria relacionados a integrações com portais
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const portalId = searchParams.get('portalId');

    // Buscamos logs onde a entidade é ANNOUNCEMENT (Anúncio)
    // ou logs específicos que marcamos com metadata de portal
    const logs = await prisma.auditLog.findMany({
      where: {
        entity: 'ANNOUNCEMENT',
        ...(portalId && {
          metadata: {
            path: ['portalId'],
            equals: portalId
          }
        })
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(logs);

  } catch (error: any) {
    console.error('[PortalLogsAPI] Error fetching logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
