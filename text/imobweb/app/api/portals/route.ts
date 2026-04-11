import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PortalType, PortalIntegrationStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API para listar e gerenciar integrações com portais
 */
export async function GET(req: NextRequest) {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });

    const portals = await prisma.portalIntegration.findMany({
      where: { organizationId: org.id },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ portals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Buscar organização padrão (ou do usuário logado)
    const org = await prisma.organization.findFirst();
    if (!org) throw new Error('Organization not found');

    const type = (data.type as unknown) as PortalType;
    const status = (data.enabled ? 'ATIVO' : 'INATIVO') as PortalIntegrationStatus;

    const portal = await prisma.portalIntegration.upsert({
      where: { 
        apiKey_type: { 
          apiKey: data.apiKey || 'TEMP_KEY', 
          type 
        } 
      },
      update: {
        name: data.name,
        settings: data.settings,
        status: status,
        organizationId: org.id
      },
      create: {
        name: data.name,
        type: type,
        apiKey: data.apiKey || 'TEMP_KEY',
        status: 'ATIVO' as PortalIntegrationStatus,
        settings: data.settings || {},
        organizationId: org.id
      }
    });

    return NextResponse.json({ success: true, portal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID missing' }, { status: 400 });

    await prisma.portalIntegration.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
