import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { PortalId, LeadFromPortal } from '@/types/portals';

const fetchLeadsSchema = z.object({
  portalId: z.enum(['zap', 'viva', 'olx', 'imovelweb', 'chaves', 'meta', 'vrsync']),
  since: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional()
});

const mockLeads: LeadFromPortal[] = [
  {
    id: 'lead-001',
    portalId: 'zap',
    propertyExternalId: 'prop-zap-123',
    propertyId: 'prop-local-001',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '+5511988887777',
    message: 'Gostaria de agendar uma visita a este apartamento.',
    source: 'Zap Imóveis',
    receivedAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'lead-002',
    portalId: 'viva',
    propertyExternalId: 'prop-viva-456',
    propertyId: 'prop-local-002',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+5511999996666',
    message: 'Interessado no imóvel. Quando posso visitar?',
    source: 'Viva Real',
    receivedAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'lead-003',
    portalId: 'olx',
    propertyExternalId: 'prop-olx-789',
    propertyId: 'prop-local-003',
    name: 'Pedro Oliveira',
    phone: '+5511977775555',
    message: 'Tem interesse neste imóvel para investimento.',
    source: 'OLX',
    receivedAt: new Date(Date.now() - 10800000)
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portalId = searchParams.get('portalId');
    const since = searchParams.get('since');
    const limit = parseInt(searchParams.get('limit') || '50');

    let leads = mockLeads;

    if (portalId) {
      leads = leads.filter(l => l.portalId === portalId);
    }

    if (since) {
      const sinceDate = new Date(since);
      leads = leads.filter(l => new Date(l.receivedAt) > sinceDate);
    }

    leads = leads.slice(0, limit);

    const leadsByPortal = leads.reduce((acc, lead) => {
      if (!acc[lead.portalId]) {
        acc[lead.portalId] = [];
      }
      acc[lead.portalId].push(lead);
      return acc;
    }, {} as Record<PortalId, LeadFromPortal[]>);

    return NextResponse.json({
      leads,
      total: leads.length,
      byPortal: Object.entries(leadsByPortal).map(([portal, leadList]) => ({
        portalId: portal as PortalId,
        count: leadList.length,
        leads: leadList
      })),
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portalId, propertyId, action } = z.object({
      portalId: z.enum(['zap', 'viva', 'olx', 'imovelweb', 'chaves', 'meta', 'vrsync']),
      propertyId: z.string().optional(),
      action: z.enum(['mark-viewed', 'archive', 'delete']).optional()
    }).parse(body);

    console.log(`Processing lead action: ${action} for portal: ${portalId}, property: ${propertyId}`);

    return NextResponse.json({
      success: true,
      message: `Lead action '${action}' processed successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error processing lead action:', error);
    return NextResponse.json(
      { error: 'Failed to process lead action' },
      { status: 500 }
    );
  }
}