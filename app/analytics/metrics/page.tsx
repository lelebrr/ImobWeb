'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/design-system/select';
import { DateRangePicker } from '@/components/analytics/AnalyticsFilters';
import { formatCurrency } from '@/lib/utils';

interface DashboardMetricsProps {
  dateRange: { start: Date; end: Date };
  refreshInterval?: number;
}

function AnalyticsDashboard({ dateRange, refreshInterval = 300000 }: DashboardMetricsProps) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [dateRange, timeRange]);

  const revenueData = [
    { date: '01/04', value: 85000 },
    { date: '02/04', value: 92000 },
    { date: '03/04', value: 78000 },
    { date: '04/04', value: 115000 },
    { date: '05/04', value: 98000 },
    { date: '06/04', value: 142000 },
    { date: '07/04', value: 165000 },
    { date: '08/04', value: 185000 },
    { date: '09/04', value: 178000 },
    { date: '10/04', value: 195000 }
  ];

  const leadsData = [
    { source: 'Zap', leads: 89, conversion: 12 },
    { source: 'Viva', leads: 67, conversion: 9 },
    { source: 'OLX', leads: 45, conversion: 7 },
    { source: 'Indicação', leads: 23, conversion: 18 },
    { source: 'Outros', leads: 10, conversion: 5 }
  ];

  const funnelData = [
    { name: 'Leads', value: 234, fill: '#3B82F6' },
    { name: 'Contatados', value: 187, fill: '#8B5CF6' },
    { name: 'Visitas', value: 89, fill: '#F59E0B' },
    { name: 'Propostas', value: 45, fill: '#10B981' },
    { name: 'Fechados', value: 20, fill: '#059669' }
  ];

  const propertyStatus = [
    { name: 'Ativo', value: 156, fill: '#10B981' },
    { name: 'Vendido', value: 42, fill: '#3B82F6' },
    { name: 'Locado', value: 28, fill: '#8B5CF6' },
    { name: 'Excluído', value: 12, fill: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="365d">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker
            value={dateRange}
            onChange={() => {}}
          />
        </div>
        <div className="text-sm text-gray-500">
          Atualizado em: {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `R$ ${v/1000}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status dos Imóveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {propertyStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsMetricsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Métricas e relatórios detalhados</p>
        </div>
        <AnalyticsDashboard dateRange={dateRange} />
      </div>
    </div>
  );
}
