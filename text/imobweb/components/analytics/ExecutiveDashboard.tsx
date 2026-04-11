'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  Building2,
  Users,
  DollarSign,
  FileText,
  Target,
  Activity,
  PieChart
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
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { cn, formatCurrency } from '@/lib/utils';
import { formatKpiValue, KPI_DEFINITIONS } from '@/lib/analytics/kpi-definitions';
import type { KpiValue, KpiTrend, KpiCategory } from '@/types/analytics';

const MOCK_KPI_VALUES: KpiValue[] = [
  { kpiId: 'total_revenue', value: 1250000, previousValue: 980000, trend: 'up', trendPercentage: 27.6, period: { start: new Date(), end: new Date() }, updatedAt: new Date() },
  { kpiId: 'monthly_revenue', value: 185000, previousValue: 165000, trend: 'up', trendPercentage: 12.1, period: { start: new Date(), end: new Date() }, updatedAt: new Date() },
  { kpiId: 'conversion_rate', value: 8.5, previousValue: 7.2, trend: 'up', trendPercentage: 18.1, period: { start: new Date(), end: new Date() }, updatedAt: new Date() },
  { kpiId: 'average_ticket', value: 450000, previousValue: 420000, trend: 'up', trendPercentage: 7.1, period: { start: new Date(), end: new Date() }, updatedAt: new Date() },
  { kpiId: 'active_properties', value: 156, previousValue: 142, trend: 'up', trendPercentage: 9.9, period: { start: new Date(), end: new Date() }, updatedAt: new Date() },
  { kpiId: 'total_leads', value: 234, previousValue: 198, trend: 'up', trendPercentage: 18.2, period: { start: new Date(), end: new Date() }, updatedAt: new Date() },
  { kpiId: 'average_sale_time', value: 45, previousValue: 52, trend: 'down', trendPercentage: -13.5, period: { start: new Date(), end: new Date() }, updatedAt: new Date() },
  { kpiId: 'pipeline_value', value: 3200000, previousValue: 2800000, trend: 'up', trendPercentage: 14.3, period: { start: new Date(), end: new Date() }, updatedAt: new Date() },
];

const REVENUE_DATA = [
  { month: 'Jan', revenue: 85000, deals: 12 },
  { month: 'Feb', revenue: 92000, deals: 14 },
  { month: 'Mar', revenue: 78000, deals: 11 },
  { month: 'Apr', revenue: 115000, deals: 18 },
  { month: 'May', revenue: 98000, deals: 15 },
  { month: 'Jun', revenue: 142000, deals: 22 },
  { month: 'Jul', revenue: 165000, deals: 24 },
  { month: 'Aug', revenue: 185000, deals: 28 },
  { month: 'Sep', revenue: 178000, deals: 26 },
  { month: 'Oct', revenue: 195000, deals: 30 },
  { month: 'Nov', revenue: 168000, deals: 25 },
  { month: 'Dec', revenue: 210000, deals: 32 },
];

const LEADS_FUNNEL = [
  { name: 'Total Leads', value: 234, color: '#3B82F6' },
  { name: 'Contatados', value: 187, color: '#8B5CF6' },
  { name: 'Visitas', value: 89, color: '#F59E0B' },
  { name: 'Propostas', value: 45, color: '#10B981' },
  { name: 'Fechados', value: 20, color: '#059669' },
];

const PORTAL_PERFORMANCE = [
  { portal: 'Zap', leads: 89, revenue: 520000, roi: 3.2 },
  { portal: 'Viva', leads: 67, revenue: 380000, roi: 2.8 },
  { portal: 'OLX', leads: 45, revenue: 210000, roi: 1.9 },
  { portal: 'ImovelWeb', leads: 33, revenue: 140000, roi: 1.5 },
];

const TOP_AGENTS = [
  { name: 'Carlos Silva', deals: 18, revenue: 280000, conversion: 12.5 },
  { name: 'Ana Santos', deals: 15, revenue: 245000, conversion: 11.2 },
  { name: 'Pedro Oliveira', deals: 12, revenue: 198000, conversion: 9.8 },
  { name: 'Maria Costa', deals: 10, revenue: 175000, conversion: 8.5 },
  { name: 'João Lima', deals: 8, revenue: 152000, conversion: 7.2 },
];

interface KpiCardProps {
  kpi: KpiValue;
  title: string;
  icon: React.ReactNode;
}

function KpiCard({ kpi, title, icon }: KpiCardProps) {
  const definition = KPI_DEFINITIONS.find(d => d.id === kpi.kpiId);
  const unit = definition?.unit || 'number';

  const getTrendIcon = (trend: KpiTrend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: KpiTrend) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isNegativeBetter = ['average_sale_time', 'stale_properties', 'churn_rate'].includes(kpi.kpiId);
  
  const trendColor = useMemo(() => {
    if (isNegativeBetter) {
      return kpi.trend === 'down' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    }
    return getTrendColor(kpi.trend || 'stable');
  }, [kpi.trend, isNegativeBetter]);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <p className="text-xl font-bold text-gray-900">
                {formatKpiValue(kpi.value, unit)}
              </p>
            </div>
          </div>
          {kpi.trendPercentage !== undefined && (
            <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', trendColor)}>
              {getTrendIcon(kpi.trend || 'stable')}
              <span>{Math.abs(kpi.trendPercentage).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function ExecutiveDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const kpiCards = [
    { kpi: MOCK_KPI_VALUES[0], title: 'Faturamento Total', icon: <DollarSign className="h-5 w-5" /> },
    { kpi: MOCK_KPI_VALUES[1], title: 'Faturamento Mensal', icon: <Calendar className="h-5 w-5" /> },
    { kpi: MOCK_KPI_VALUES[2], title: 'Taxa de Conversão', icon: <Target className="h-5 w-5" /> },
    { kpi: MOCK_KPI_VALUES[3], title: 'Ticket Médio', icon: <FileText className="h-5 w-5" /> },
    { kpi: MOCK_KPI_VALUES[4], title: 'Imóveis Ativos', icon: <Building2 className="h-5 w-5" /> },
    { kpi: MOCK_KPI_VALUES[5], title: 'Total de Leads', icon: <Users className="h-5 w-5" /> },
    { kpi: MOCK_KPI_VALUES[6], title: 'Tempo Médio Venda', icon: <Activity className="h-5 w-5" /> },
    { kpi: MOCK_KPI_VALUES[7], title: 'Valor do Pipeline', icon: <PieChart className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h1>
            <p className="text-gray-500">Visão geral do negócio em tempo real</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último ano</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {kpiCards.map((item, index) => (
            <KpiCard key={index} kpi={item.kpi} title={item.title} icon={item.icon} />
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard title="Faturamento Mensal">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
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
                      formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
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
            </ChartCard>
          </div>

          <div>
            <ChartCard title="Funil de Conversão">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={LEADS_FUNNEL} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#6B7280" width={80} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {LEADS_FUNNEL.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Performance por Portal">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PORTAL_PERFORMANCE} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="portal" tick={{ fontSize: 12 }} stroke="#6B7280" />
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
                  <Bar dataKey="revenue" name="Receita" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium text-gray-500">Portal</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Leads</th>
                    <th className="pb-2 text-right font-medium text-gray-500">Receita</th>
                    <th className="pb-2 text-right font-medium text-gray-500">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {PORTAL_PERFORMANCE.map((portal) => (
                    <tr key={portal.portal} className="border-b last:border-0">
                      <td className="py-2 font-medium text-gray-900">{portal.portal}</td>
                      <td className="py-2 text-right">{portal.leads}</td>
                      <td className="py-2 text-right">{formatCurrency(portal.revenue)}</td>
                      <td className="py-2 text-right">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          portal.roi >= 2 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {portal.roi.toFixed(1)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard title="Top Corretores">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOP_AGENTS} layout="vertical" barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12 }} 
                    stroke="#6B7280"
                    tickFormatter={(value) => `R$ ${value / 1000}k`}
                  />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#6B7280" width={100} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" name="Receita" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {TOP_AGENTS.slice(0, 3).map((agent, index) => (
                <div key={agent.name} className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    )}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{agent.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-green-600">{formatCurrency(agent.revenue)}</span>
                    <span className="ml-2 text-xs text-gray-500">({agent.deals} deals)</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="mt-6 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">Tudo funcionando</span>
              <span className="text-xs text-gray-500">Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Leads hoje: 23</span>
              <span>Visitas hoje: 8</span>
              <span>Contratos hoje: 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
