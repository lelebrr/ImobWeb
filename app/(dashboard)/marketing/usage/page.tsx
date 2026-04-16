import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CommunicationUsageCard } from '@/components/dashboard/marketing/CommunicationUsageCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function AgencyCommunicationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.user.organizationId as string;

  // 1. Fetch Cotas Atuais
  const quotas = await prisma.communicationQuota.findMany({
    where: { organizationId },
  });

  // 2. Fetch Histórico Recente de Envios
  const recentUsage = await prisma.communicationUsage.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: { select: { name: true } },
    },
  });

  const formattedQuotas = quotas.map((q: any) => ({
    type: q.type as 'EMAIL' | 'SMS',
    used: q.used,
    limit: q.limit,
    estimatedCost: Number(q.estimatedCost),
  }));

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Comunicação e Marketing</h2>
      </div>

      <CommunicationUsageCard data={formattedQuotas} />

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Histórico Recente de Envios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Assunto/Conteúdo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Autor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Nenhum envio registrado recentemente.
                  </TableCell>
                </TableRow>
              ) : (
                recentUsage.map((usage: any) => (
                  <TableRow key={usage.id}>
                    <TableCell className="text-xs">
                      {format(new Date(usage.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{usage.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{usage.recipient}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {usage.subject || usage.content?.substring(0, 30) + '...'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={usage.status} />
                    </TableCell>
                    <TableCell className="text-sm">{usage.user?.name || 'Sistema'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    ENVIADO: 'bg-blue-100 text-blue-700',
    ENTREGUE: 'bg-green-100 text-green-700',
    LIDO: 'bg-purple-100 text-purple-700',
    FALHOU: 'bg-red-100 text-red-700',
    PENDENTE: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <Badge className={`${styles[status] || ''} border-none font-normal`}>
      {status}
    </Badge>
  );
}
