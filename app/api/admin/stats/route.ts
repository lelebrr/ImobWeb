import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      activeUsers,
      totalProperties,
      activeProperties,
      totalLeads,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { status: 'ATIVO' } }),
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ATIVO' } }),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'DISPONIVEL' } }),
      prisma.lead.count(),
    ]);

    const subscriptions = await prisma.subscription.findMany({
      where: { status: { in: ['ACTIVE', 'TRIALING'] } },
      select: { monthlyPrice: true, status: true },
    });

    const totalMRR = subscriptions.reduce(
      (sum, sub) => sum + (Number(sub.monthlyPrice) || 0),
      0
    );

    const orgsByPlan = await prisma.organization.groupBy({
      by: ['planType'],
      _count: true,
    });

    const recentOrgs = await prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        planType: true,
        status: true,
        createdAt: true,
        _count: { select: { users: true, properties: true } },
      },
    });

    return NextResponse.json({
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      activeUsers,
      totalProperties,
      activeProperties,
      totalLeads,
      totalMRR,
      activeSubscriptions: subscriptions.length,
      orgsByPlan: orgsByPlan.map((g) => ({
        plan: g.planType || 'SEM_PLANO',
        count: g._count,
      })),
      recentOrganizations: recentOrgs,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
