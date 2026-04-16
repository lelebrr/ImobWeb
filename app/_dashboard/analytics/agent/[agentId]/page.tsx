'use client';

import { useState } from 'react';
import { User, TrendingUp, DollarSign, Target, Users, Calendar, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

const AGENT_STATS = {
  name: 'Carlos Silva',
  email: 'carlos.silva@imobweb.com',
  avatar: null,
  phone: '(11) 99999-9999',
  team: 'Equipe Alpha',
  joinedAt: '2024-03-15'
};

const PERFORMANCE_DATA = [
  { month: 'Jan', deals: 8, revenue: 120000, leads: 25 },
  { month: 'Feb', deals: 10, revenue: 150000, leads: 28 },
  { month: 'Mar', deals: 12, revenue: 180000, leads: 32 },
  { month: 'Apr', deals: 9, revenue: 135000, leads: 30 },
  { month: 'May', deals: 14, revenue: 210000, leads: 38 },
  { month: 'Jun', deals: 16, revenue: 240000, leads: 42 }
];

const DEALS_BY_STAGE = [
  { name: 'Proposta', value: 8, color: '#3B82F6' },
  { name: 'Negociação', value: 5, color: '#F59E0B' },
  { name: 'Contrato', value: 3, color: '#8B5CF6' },
  { name: 'Assinatura', value: 2, color: '#EC4899' }
];

const LEADS_BY_SOURCE = [
  { source: 'Zap Imóveis', leads: 45, converted: 8 },
  { source: 'Viva Real', leads: 32, converted: 6 },
  { source: 'OLX', leads: 24, converted: 3 },
  { source: 'Indicação', leads: 18, converted: 5 },
  { source: 'Outros', leads: 12, converted: 2 }
];

const RECENT_DEALS = [
  { id: '1', client: 'Maria Santos', property: 'Rua das Flores, 123', value: 450000, stage: 'Negociação', probability: 75 },
  { id: '2', client: 'João Silva', property: 'Av. Paulista, 500', value: 380000, stage: 'Proposta', probability: 60 },
  { id: '3', client: 'Ana Costa', property: 'Rua Augusta, 200', value: 520000, stage: 'Contrato', probability: 90 },
  { id: '4', client: 'Pedro Lima', property: 'Av. Brigadeiro, 300', value: 290000, stage: 'Assinatura', probability: 95 }
];

export default function AgentDashboard() {
  const timeRange = 'month';

  const kpiCards = [
    { title: 'Negócios Fechados', value: '16', trend: 22, icon: <Target className="h-5 w-5" /> },
    { title: 'Receita', value: 'R$ 240k', trend: 15, icon: <DollarSign className="h-5 w-5" /> },
    { title: 'Novos Leads', value: '42', trend: 18, icon: <Users className="h-5 w-5" /> },
    { title: 'Conversão', value: '14%', trend: 3, icon: <TrendingUp className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
              CS
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{AGENT_STATS.name}</h1>
              <p className="text-gray-500">{AGENT_STATS.email}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4" />
                <span>Na equipe desde {new Date(AGENT_STATS.joinedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1">
            <Award className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-700">Top Performer</span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      {kpi.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{kpi.title}</p>
                      <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                    </div>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                    kpi.trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  )}>
                    {kpi.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(kpi.trend)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Performance - {timeRange === 'month' ? 'Este Mês' : timeRange}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERFORMANCE_DATA}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#6B7280"
                        tickFormatter={(value) => `R$ ${value / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                        formatter={(value: number) => [formatCurrency(value), 'Receita']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fill="url(#revenueGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Negocios por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DEALS_BY_STAGE}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {DEALS_BY_STAGE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Leads por Fonte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LEADS_BY_SOURCE} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} stroke="#6B7280" width={80} />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Oportunidades Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">Cliente</th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">Imóvel</th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">Valor</th>
                      <th className="pb-3 text-center text-sm font-medium text-gray-500">Etapa</th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">Probabilidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_DEALS.map((deal) => (
                      <tr key={deal.id} className="border-b last:border-0">
                        <td className="py-3 font-medium text-gray-900">{deal.client}</td>
                        <td className="py-3 text-gray-600">{deal.property}</td>
                        <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(deal.value)}</td>
                        <td className="py-3 text-center">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            deal.stage === 'Negociação' && 'bg-amber-100 text-amber-700',
                            deal.stage === 'Proposta' && 'bg-blue-100 text-blue-700',
                            deal.stage === 'Contrato' && 'bg-purple-100 text-purple-700',
                            deal.stage === 'Assinatura' && 'bg-green-100 text-green-700'
                          )}>
                            {deal.stage}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                              <div className="h-full rounded-full bg-green-500" style={{ width: `${deal.probability}%` }} />
                            </div>
                            <span className="text-sm text-gray-600">{deal.probability}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
