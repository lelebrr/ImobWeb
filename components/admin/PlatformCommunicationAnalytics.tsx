'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Mail, MessageSquare, TrendingUp, Users } from 'lucide-react';

interface GlobalStats {
  name: string;
  emails: number;
  sms: number;
}

interface OrgStats {
  orgName: string;
  totalSpent: number;
  usageCount: number;
}

interface PlatformCommunicationAnalyticsProps {
  historyData: GlobalStats[];
  orgData: OrgStats[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function PlatformCommunicationAnalytics({ historyData, orgData }: PlatformCommunicationAnalyticsProps) {
  const totalEmails = historyData.reduce((acc, curr) => acc + curr.emails, 0);
  const totalSMS = historyData.reduce((acc, curr) => acc + curr.sms, 0);
  const totalRevenue = orgData.reduce((acc, curr) => acc + curr.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Total E-mails" value={totalEmails.toLocaleString()} icon={<Mail className="h-4 w-4" />} />
        <StatsCard title="Total SMS" value={totalSMS.toLocaleString()} icon={<MessageSquare className="h-4 w-4" />} />
        <StatsCard title="Faturamento Est." value={`R$ ${totalRevenue.toFixed(2)}`} icon={<TrendingUp className="h-4 w-4" />} />
        <StatsCard title="Imobiliárias Ativas" value={orgData.length.toString()} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-xl bg-white/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Histórico de Envios (30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                  <Bar dataKey="emails" fill="#3b82f6" radius={[4, 4, 0, 0]} name="E-mails" />
                  <Bar dataKey="sms" fill="#10b981" radius={[4, 4, 0, 0]} name="SMS" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-xl bg-white/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Distribuição por Imobiliária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orgData}
                    dataKey="totalSpent"
                    nameKey="orgName"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {orgData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-md bg-white/50 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
