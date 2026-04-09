import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { syncEngine, SyncEngine } from '@/lib/portals/sync-engine';
import type { PortalId, PortalConfig } from '@/types/portals';

const portalConfigSchema = z.object({
  id: z.enum(['zap', 'viva', 'olx', 'imovelweb', 'chaves', 'meta', 'vrsync']),
  enabled: z.boolean(),
  credentials: z.object({
    apiKey: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    endpoint: z.string().optional()
  }).optional(),
  syncInterval: z.number().min(60000).max(3600000).optional(),
  syncDirection: z.enum(['push', 'pull', 'bidirectional']).optional(),
  syncFields: z.array(z.string()).optional(),
  autoPublish: z.boolean().optional(),
  autoDepublish: z.boolean().optional(),
  highlightPackage: z.object({
    type: z.enum(['destaque', 'super-destaque', 'patrocinado', 'gold', 'silver']),
    startDate: z.date().optional(),
    endDate: z.date().optional()
  }).optional()
});

const portalsConfig: Record<PortalId, Partial<PortalConfig>> = {
  zap: {
    name: 'Zap Imóveis',
    syncInterval: 120000,
    syncDirection: 'bidirectional',
    syncFields: ['title', 'description', 'price', 'address', 'photos', 'status'],
    autoPublish: true,
    autoDepublish: true
  },
  viva: {
    name: 'Viva Real',
    syncInterval: 120000,
    syncDirection: 'bidirectional',
    syncFields: ['title', 'description', 'price', 'address', 'photos', 'status'],
    autoPublish: true,
    autoDepublish: true
  },
  olx: {
    name: 'OLX',
    syncInterval: 180000,
    syncDirection: 'push',
    syncFields: ['title', 'description', 'price', 'location', 'photos'],
    autoPublish: true,
    autoDepublish: false
  },
  imovelweb: {
    name: 'ImovelWeb',
    syncInterval: 300000,
    syncDirection: 'push',
    syncFields: ['title', 'text', 'price', 'address', 'photos'],
    autoPublish: false,
    autoDepublish: false
  },
  chaves: {
    name: 'Chaves na Mão',
    syncInterval: 300000,
    syncDirection: 'push',
    syncFields: ['title', 'description', 'price', 'address', 'photos'],
    autoPublish: false,
    autoDepublish: false
  },
  meta: {
    name: 'Meta Catalog',
    syncInterval: 600000,
    syncDirection: 'push',
    syncFields: ['title', 'description', 'price', 'photos'],
    autoPublish: false,
    autoDepublish: false
  },
  vrsync: {
    name: 'VRSync (+120 portais)',
    syncInterval: 600000,
    syncDirection: 'push',
    syncFields: ['title', 'description', 'price', 'address', 'photos', 'features'],
    autoPublish: false,
    autoDepublish: false
  }
};

export async function GET() {
  try {
    const configs = syncEngine.getAllPortalConfigs();
    
    const portals = Object.entries(portalsConfig).map(([id, config]) => {
      const existingConfig = configs.find(c => c.id === id);
      return {
        id: id as PortalId,
        name: config.name,
        enabled: existingConfig?.enabled ?? false,
        syncInterval: existingConfig?.syncInterval ?? config.syncInterval,
        syncDirection: existingConfig?.syncDirection ?? config.syncDirection,
        syncFields: existingConfig?.syncFields ?? config.syncFields,
        autoPublish: existingConfig?.autoPublish ?? config.autoPublish,
        autoDepublish: existingConfig?.autoDepublish ?? config.autoDepublish,
        lastSync: existingConfig?.lastSync,
        lastError: existingConfig?.lastError,
        supportedFeatures: {
          highlights: ['destaque', 'super-destaque', 'patrocinado'].includes(id as string),
          video: ['zap', 'viva', 'imovelweb'].includes(id as string),
         360: ['zap', 'viva'].includes(id as string),
          leads: true,
          analytics: true
        }
      };
    });

    return NextResponse.json({ portals });
  } catch (error) {
    console.error('Error fetching portal configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portal configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = portalConfigSchema.parse(body);

    const config: PortalConfig = {
      ...validatedData,
      ...portalsConfig[validatedData.id],
      credentials: validatedData.credentials || {},
      syncInterval: validatedData.syncInterval || portalsConfig[validatedData.id]?.syncInterval || 120000,
      syncDirection: validatedData.syncDirection || portalsConfig[validatedData.id]?.syncDirection || 'bidirectional',
      syncFields: validatedData.syncFields || portalsConfig[validatedData.id]?.syncFields || [],
      autoPublish: validatedData.autoPublish ?? portalsConfig[validatedData.id]?.autoPublish ?? true,
      autoDepublish: validatedData.autoDepublish ?? portalsConfig[validatedData.id]?.autoDepublish ?? true
    };

    syncEngine.registerPortal(config);

    return NextResponse.json({
      success: true,
      portal: config
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error saving portal config:', error);
    return NextResponse.json(
      { error: 'Failed to save portal configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portalId = searchParams.get('id') as PortalId;
    
    if (!portalId) {
      return NextResponse.json(
        { error: 'Portal ID is required' },
        { status: 400 }
      );
    }

    syncEngine.unregisterPortal(portalId);

    return NextResponse.json({
      success: true,
      message: `Portal ${portalId} disconnected`
    });
  } catch (error) {
    console.error('Error disconnecting portal:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect portal' },
      { status: 500 }
    );
  }
}