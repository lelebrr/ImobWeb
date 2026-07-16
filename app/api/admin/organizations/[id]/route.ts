import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { users: true, properties: true, leads: true, contracts: true },
        },
        users: {
          take: 10,
          select: { id: true, name: true, email: true, role: true, status: true },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Admin organization detail error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar organização' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const allowedFields = [
      'status',
      'planType',
      'maxUsers',
      'maxProperties',
      'maxLeads',
      'primaryColor',
      'secondaryColor',
    ];

    const updateData: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualizar' },
        { status: 400 }
      );
    }

    const updated = await prisma.organization.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin organization update error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar organização' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: params.id },
      select: { isPlatform: true },
    });

    if (org?.isPlatform) {
      return NextResponse.json(
        { error: 'Não é possível remover a organização da plataforma' },
        { status: 403 }
      );
    }

    await prisma.organization.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin organization delete error:', error);
    return NextResponse.json(
      { error: 'Erro ao remover organização' },
      { status: 500 }
    );
  }
}
