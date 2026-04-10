import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PortalType, PortalIntegrationStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API para listar e gerenciar integrações com portais
 */
export async function GET(req: NextRequest) {
  try {
    const portals = await prisma.portalIntegration.findMany({
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

    const portal = await prisma.portalIntegration.upsert({
      where: { 
        apiKey_type: { 
          apiKey: data.apiKey || 'TEMP_KEY', 
          type: data.type as PortalType 
        } 
      },
      update: {
        name: data.name,
        enabled: data.enabled,
        settings: data.settings,
        status: data.enabled ? 'ATIVO' : 'INATIVO'
      },
      create: {
        name: data.name,
        type: data.type as PortalType,
        apiKey: data.apiKey || 'TEMP_KEY',
        status: 'ATIVO',
        settings: data.settings || {},
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