import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const plan = searchParams.get('plan') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (plan) where.planType = plan;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { users: true, properties: true, leads: true },
          },
          subscriptions: {
            where: { status: { in: ['ACTIVE', 'TRIALING'] } },
            take: 1,
            select: { monthlyPrice: true, planName: true, status: true },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return NextResponse.json({
      organizations: organizations.map((org) => ({
        id: org.id,
        name: org.name,
        cnpj: org.cnpj,
        email: org.email,
        city: org.city,
        state: org.state,
        status: org.status,
        planType: org.planType,
        isPlatform: org.isPlatform,
        createdAt: org.createdAt,
        userCount: org._count.users,
        propertyCount: org._count.properties,
        leadCount: org._count.leads,
        subscription: org.subscriptions[0] || null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Admin organizations error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar organizações' },
      { status: 500 }
    );
  }
}
