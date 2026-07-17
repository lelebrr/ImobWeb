import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    const validRoles = [
      'PLATFORM_MASTER', 'PLATFORM_MARKETING', 'PLATFORM_FINANCE', 'PLATFORM_SUPPORT',
      'AGENCY_MASTER', 'AGENCY_SALES', 'AGENCY_HR', 'AGENCY_MARKETING',
      'AGENCY_FINANCE', 'AGENCY_SUPPORT',
      'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE',
    ];

    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role inválida' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin user role update error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar role do usuário' },
      { status: 500 }
    );
  }
}
