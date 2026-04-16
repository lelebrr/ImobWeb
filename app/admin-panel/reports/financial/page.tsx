'use client';

import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { ReportEngine, ReportDataset } from '@/lib/admin-reports/report-engine';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

/**
 * FINANCIAL REPORT PAGE - SUPER ADMIN
 * Provides deep insights into SaaS revenue, churn, and LTV.
 */
export default function FinancialReportPage() {
  const [reportData, setReportData] = useState<ReportDataset | null>(null);

  useEffect(() => {
    // Simulated fetch
    ReportEngine.generateFinancialReport({
      id: 'fin-001',
      type: 'FINANCIAL',
      range: 'MONTHLY'
    }).then(setReportData);
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight italic">Relatório Financeiro Estratégico</h1>
          <p className="text-slate-500 mt-1">Análise consolidada de MRR, Cashflow e Performance de Planos.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all text-white">
            <Calendar className="w-4 h-4" />
            2026 Q1
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-all text-white shadow-lg">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Receita Recorrente (MRR)" value="R$ 1.25M" growth={14.2} type="up" />
        <MetricCard title="Valor Médio por Tenant (ARPU)" value="R$ 880,00" growth={5.8} type="up" />
        <MetricCard title="Receita Perdida (Churn MRR)" value="R$ 12.4k" growth={-2.1} type="down" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MRR Over Time */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <TrendingUp className="text-emerald-500 w-8 h-8 opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-8">Evolução do Faturamento</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData?.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" border-none axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={4} dot={{ r: 6, fill: '#818cf8', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-8">Distribuição por Plano</h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Essencial', value: 400 },
                    { name: 'Profissional', value: 300 },
                    { name: 'Enterprise', value: 300 },
                    { name: 'White Label', value: 200 },
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {COLORS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 pr-8">
              {['Essencial', 'Profissional', 'Enterprise', 'White Label'].map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-slate-400 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Transactions List Placeholder */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-bold text-white">Últimas Transações Globais</h3>
           <button className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-2">
             Ver Tudo
             <Filter size={14} />
           </button>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600/10 p-2 rounded-xl text-indigo-400">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Assinatura Anual - Imobiliária Santos</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Stripe • 12/04/2026</p>
                </div>
              </div>
              <p className="text-emerald-500 font-black tracking-tight text-lg">+ R$ 12.500,00</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, growth, type }: { title: string, value: string, growth: number, type: 'up' | 'down' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
      <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp className="w-12 h-12 text-white" />
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h2 className="text-3xl font-black text-white italic tracking-tighter mb-4">{value}</h2>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold",
        type === 'up' ? "text-emerald-500" : "text-rose-500"
      )}>
        {type === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {growth}% vs mês anterior
      </div>
    </div>
  );
}
