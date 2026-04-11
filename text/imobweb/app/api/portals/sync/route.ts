import { NextRequest, NextResponse } from 'next/server';
import { syncEngine } from '@/lib/portals/sync-engine';

/**
 * API para disparar a sincronização manual ou via CRON
 */
export async function POST(req: NextRequest) {
  try {
    const { portalId, propertyId, syncAll } = await req.json();

    if (syncAll && portalId) {
      const results = await syncEngine.syncAll(portalId);
      return NextResponse.json({ success: true, results });
    }

    if (portalId && propertyId) {
      const result = await syncEngine.syncProperty(propertyId, portalId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });

  } catch (error: any) {
    console.error('[SyncAPI] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
