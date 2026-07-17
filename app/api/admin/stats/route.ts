import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Dynamically import prisma to avoid build errors when DB is not available
    const { prisma } = await import('@/lib/prisma');

    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      activeUsers,
      totalProperties,
      activeProperties,
      totalLeads,
    ] = await Promise.all([
      prisma.organization.count().catch(() => 0),
      prisma.organization.count({ where: { status: 'ATIVO' } }).catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.user.count({ where: { status: 'ATIVO' } }).catch(() => 0),
      prisma.property.count().catch(() => 0),
      prisma.property.count({ where: { status: 'DISPONIVEL' } }).catch(() => 0),
      prisma.lead.count().catch(() => 0),
    ]);

    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ATIVO' },
      select: { status: true, billingCycle: true },
    }).catch(() => []);

    const totalMRR = subscriptions.length;

    const orgsByPlan = await prisma.organization.groupBy({
      by: ['planType'],
      _count: true,
    }).catch(() => []);

    const recentOrgs = await prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, planType: true, status: true, createdAt: true,
        _count: { select: { users: true, properties: true } },
      },
    }).catch(() => []);

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
    return NextResponse.json({
      totalOrganizations: 0, activeOrganizations: 0, totalUsers: 0, activeUsers: 0,
      totalProperties: 0, activeProperties: 0, totalLeads: 0, totalMRR: 0,
      activeSubscriptions: 0, orgsByPlan: [], recentOrganizations: [],
    });
  }
}
