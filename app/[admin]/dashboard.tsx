import React from 'react';
import { AdminKPIs } from '../../components/admin/dashboard/KPIWidgets';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, Filter, Download, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for charts
const REVENUE_DATA = [
  { month: 'Jan', revenue: 850000, users: 12000 },
  { month: 'Fev', revenue: 920000, users: 15400 },
  { month: 'Mar', revenue: 1050000, users: 18900 },
  { month: 'Abr', revenue: 1250000, users: 22100 },
];

/**
 * SUPER ADMIN DASHBOARD - IMOBWEB 2026
 * The control center for the entire SaaS ecosystem.
 */
export default function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Executivo</h1>
          <p className="text-slate-500 mt-1">Bem-vindo, veja o resumo global do imobWeb hoje.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all">
            <Calendar className="w-4 h-4" />
            Últimos 30 dias
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* --- KPI SECTION --- */}
      <AdminKPIs />

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-[2rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Crescimento de Receita</h2>
              <p className="text-sm text-slate-500 mt-1">Performance consolidada de todas as organizações</p>
            </div>
            <div className="text-emerald-500 flex items-center gap-1 font-bold">
              <ArrowUpRight size={18} />
              +24%
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `R$ ${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Engagement (Placeholder for now) */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-[2rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Ativação de Usuários</h2>
              <p className="text-sm text-slate-500 mt-1">Novos usuários ativos por período</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <Filter size={20} />
            </button>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar
                  dataKey="users"
                  fill="#818cf8"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- RECENT ACTIVITY SECTION (Placeholder) --- */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8">
        <h3 className="text-lg font-bold text-white mb-6">Alertas Críticos & Atividade Recente</h3>
        <div className="space-y-4">
          {[
            { type: 'billing', msg: 'Falha no faturamento - Imobiliária Santos & Co', time: '2 min atrás', color: 'rose' },
            { type: 'portal', msg: 'Sync incompleto com ZAP Imóveis (Token expidado)', time: '15 min atrás', color: 'amber' },
            { type: 'user', msg: 'Novo ticket VIP: Erro no upload de tour 360', time: '1 hora atrás', color: 'indigo' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  log.color === 'rose' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" :
                    log.color === 'amber' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" :
                      "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                )} />
                <div>
                  <p className="text-sm font-medium text-white">{log.msg}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{log.type}</p>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
