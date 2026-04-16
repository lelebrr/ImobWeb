import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PlatformCommunicationAnalytics } from '@/components/admin/PlatformCommunicationAnalytics';

export default async function CommunicationAdminPage() {
  const session = await auth();

  // Apenas Master Admin pode acessar
  if (!session?.user || session.user.role !== 'PLATFORM_MASTER') {
    redirect('/dashboard');
  }

  // 1. Fetch histórico de 30 dias (Simulado com agregação por dia)
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const usageHistory = await prisma.communicationUsage.groupBy({
    by: ['type', 'createdAt'],
    where: {
      createdAt: { gte: last30Days },
    },
    _count: true,
  });

  // Agrupar por dia para o gráfico
  const historyMap: Record<string, { name: string; emails: number; sms: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    historyMap[dateStr] = { name: dateStr, emails: 0, sms: 0 };
  }

  usageHistory.forEach((u: any) => {
    const dateStr = u.createdAt.toISOString().split('T')[0];
    if (historyMap[dateStr]) {
      if (u.type === 'EMAIL') historyMap[dateStr].emails += u._count;
      else historyMap[dateStr].sms += u._count;
    }
  });

  const formattedHistory = Object.values(historyMap).reverse();

  // 2. Fetch gastos por imobiliária
  const quotas = await prisma.communicationQuota.findMany({
    include: {
      organization: {
        select: { name: true },
      },
    },
  });

  const orgStats = quotas.reduce((acc: any[], curr: any) => {
    const existing = acc.find((a: any) => a.orgName === curr.organization.name);
    if (existing) {
      existing.totalSpent += Number(curr.estimatedCost);
      existing.usageCount += curr.used;
    } else {
      acc.push({
        orgName: curr.organization.name,
        totalSpent: Number(curr.estimatedCost),
        usageCount: curr.used,
      });
    }
    return acc;
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Comunicações</h2>
      </div>
      
      <PlatformCommunicationAnalytics 
        historyData={formattedHistory} 
        orgData={orgStats} 
      />
    </div>
  );
}
