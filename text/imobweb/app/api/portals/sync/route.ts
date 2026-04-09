import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncEngine } from '@/lib/portals/sync-engine';
import type { PortalId } from '@/types/portals';

const syncRequestSchema = z.object({
  propertyId: z.string().optional(),
  portalId: z.enum(['zap', 'viva', 'olx', 'imovelweb', 'chaves', 'meta', 'vrsync']).optional(),
  action: z.enum(['create', 'update', 'delete', 'full']).optional(),
  force: z.boolean().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, portalId, action, force } = syncRequestSchema.parse(body);

    if (propertyId) {
      const portals = portalId ? [portalId] : ['zap', 'viva', 'olx'] as PortalId[];
      
      for (const pId of portals) {
        const syncAction = action === 'full' ? 'update' : (action || 'update');
        await syncEngine.queueSync(propertyId, pId, syncAction, undefined, force ? 10 : 5);
      }

      const results = await syncEngine.processQueue();

      return NextResponse.json({
        success: true,
        queued: portals.length,
        results: results.map(r => ({
          portalId: r.portalId,
          success: r.success,
          processed: r.propertiesProcessed,
          errors: r.errors.length
        }))
      });
    }

    const status = syncEngine.getSyncStatus();

    return NextResponse.json({
      success: true,
      status,
      message: 'Sync queue processed'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error triggering sync:', error);
    return NextResponse.json(
      { error: 'Failed to trigger sync' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portalId = searchParams.get('portalId') as PortalId | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    const history = syncEngine.getSyncHistory(portalId || undefined, limit);
    const status = syncEngine.getSyncStatus();

    return NextResponse.json({
      status,
      history: history.map(h => ({
        portalId: h.portalId,
        success: h.success,
        processed: h.propertiesProcessed,
        successCount: h.propertiesSuccess,
        failedCount: h.propertiesFailed,
        duration: h.duration,
        timestamp: h.timestamp
      }))
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}