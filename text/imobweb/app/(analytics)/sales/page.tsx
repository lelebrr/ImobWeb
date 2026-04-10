'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

const SALES_FUNNEL = [
  { stage: 'Leads', value: 234, color: '#3B82F6' },
  { stage: 'Qualificados', value: 156, color: '#8B5CF6' },
  { stage: 'Propostas', value: 78, color: '#F59E0B' },
  { stage: 'Negociação', value: 42, color: '#EC4899' },
  { stage: 'Fechados', value: 20, color: '#10B981' }
];

const MONTHLY_SALES = [
  { month: 'Jan', sales: 12, revenue: 180000, target: 150000 },
  { month: 'Feb', sales: 15, revenue: 225000, target: 150000 },
  { month: 'Mar', sales: 11, revenue: 165000, target: 150000 },
  { month: 'Apr', sales: 18, revenue: 270000, target: 180000 },
  { month: 'May', sales: 14, revenue: 210000, target: 180000 },
  { month: 'Jun', sales: 22, revenue: 330000, target: 200000 }
];

const DEAL_STAGES = [
  { stage: 'Proposta', value: 450000, count: 15, color: '#3B82F6' },
  { stage: 'Negociação', value: 320000, count: 10, color: '#F59E0B' },
  { stage: 'Contrato', value: 180000, count: 6, color: '#8B5CF6' },
  { stage: 'Assinatura', value: 120000, count: 4, color: '#EC4899' }
];

const TOP_DEALS = [
  { id: '1', client: 'Carlos Silva', property: 'Rua das Flores, 150', value: 650000, stage: 'Negociação', probability: 75 },
  { id: '2', client: 'Maria Santos', property: 'Av. Paulista, 500', value: 480000, stage: 'Proposta', probability: 60 },
  { id: '3', client: 'João Oliveira', property: 'Rua Augusta, 200', value: 420000, stage: 'Negociação', probability: 80 },
  { id: '4', client: 'Ana Costa', property: 'Rua Oscar Freire, 80', value: 380000, stage: 'Contrato', probability: 90 },
  { id: '5', client: 'Pedro Lima', property: 'Av. Brigadeiro, 300', value: 350000, stage: 'Assinatura', probability: 95 }
];

const SALES_BY_TYPE = [
  { name: 'Venda', value: 850000, color: '#3B82F6' },
  { name: 'Locação', value: 350000, color: '#10B981' }
];

const SALES_BY_REGION = [
  { region: 'Zona Sul', sales: 12, revenue: 520000 },
  { region: 'Zona Oeste', sales: 9, revenue: 380000 },
  { region: 'Centro', sales: 8, revenue: 320000 },
  { region: 'Zona Leste', sales: 6, revenue: 180000 },
  { region: 'Zona Norte', sales: 5, revenue: 150000 }
];

export default function SalesDashboard() {
  const [timeRange, setTimeRange] = useState('month');

  const kpiCards = [
    { title: 'Vendas no Mês', value: '22', trend: 22, icon: <Target className="h-5 w-5" />, color: 'blue' },
    { title: 'Receita', value: 'R$ 330k', trend: 15, icon: <DollarSign className="h-5 w-5" />, color: 'green' },
    { title: 'Propostas', value: '45', trend: 8, icon: <FileText className="h-5 w-5" />, color: 'purple' },
    { title: 'Pipeline', value: 'R$ 1,07M', trend: -5, icon: <BarChart3 className="h-5 w-5" />, color: 'amber' }
  ];

  const conversionRate = (20 / 234) * 100;
  const avgDealValue = 15000;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Vendas</h1>
            <p className="text-gray-500">Acompanhe sua performance comercial</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este ano</option>
            </select>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      kpi.color === 'blue' && 'bg-blue-100 text-blue-600',
                      kpi.color === 'green' && 'bg-green-100 text-green-600',
                      kpi.color === 'purple' && 'bg-purple-100 text-purple-600',
                      kpi.color === 'amber' && 'bg-amber-100 text-amber-600'
                    )}>
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
                <CardTitle className="text-base font-semibold">Vendas vs Meta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MONTHLY_SALES}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        stroke="#6B7280"
                        tickFormatter={(value) => `R$ ${value / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Vendas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" name="Meta" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative h-40 w-40">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="12"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="12"
                        strokeDasharray={`${conversionRate * 2.51} 251`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</span>
                        <p className="text-xs text-gray-500">conversão</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Ticket médio</span>
                    <span className="font-medium text-gray-900">{formatCurrency(avgDealValue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tempo médio</span>
                    <span className="font-medium text-gray-900">38 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Funil de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SALES_FUNNEL.map((stage, index) => {
                  const percentage = (stage.value / SALES_FUNNEL[0].value) * 100;
                  return (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                        <span className="text-sm text-gray-500">{stage.value} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: stage.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Vendas por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SALES_BY_TYPE}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {SALES_BY_TYPE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Principais Oportunidades</CardTitle>
                <Button variant="outline" size="sm">Ver todas</Button>
              </div>
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
                    {TOP_DEALS.map((deal) => (
                      <tr key={deal.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-gray-900">{deal.client}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <p className="text-sm text-gray-600">{deal.property}</p>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-medium text-gray-900">{formatCurrency(deal.value)}</span>
                        </td>
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
                              <div
                                className="h-full rounded-full bg-green-500"
                                style={{ width: `${deal.probability}%` }}
                              />
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Vendas por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SALES_BY_REGION} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 12 }} 
                      stroke="#6B7280"
                      tickFormatter={(value) => `R$ ${value / 1000}k`}
                    />
                    <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} stroke="#6B7280" width={80} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Pipeline por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEAL_STAGES.map((stage) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(stage.value)}</p>
                      <p className="text-xs text-gray-500">{stage.count} deals</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">{formatCurrency(DEAL_STAGES.reduce((sum, s) => sum + s.value, 0))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}