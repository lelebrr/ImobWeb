'use client';

import React from 'react';
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
import { 
  BarChart3, 
  Globe, 
  MessageSquare, 
  Zap, 
  CloudLightning,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

const USAGE_DATA = [
  { day: 'Seg', whatsapp: 1200, syncs: 450, ai: 85 },
  { day: 'Ter', whatsapp: 1900, syncs: 520, ai: 120 },
  { day: 'Qua', whatsapp: 1500, syncs: 480, ai: 110 },
  { day: 'Qui', whatsapp: 2100, syncs: 600, ai: 150 },
  { day: 'Sex', whatsapp: 2400, syncs: 650, ai: 180 },
  { day: 'Sáb', whatsapp: 800, syncs: 300, ai: 45 },
  { day: 'Dom', whatsapp: 600, syncs: 250, ai: 30 },
];

/**
 * USAGE ANALYTICS PAGE - SUPER ADMIN
 * Real-time monitoring of platform activity and resource consumption.
 */
export default function UsageReportPage() {
  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Análise de Uso Global</h1>
          <p className="text-slate-500 mt-1">Monitoramento de tráfego, integrações e consumo de API.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-xs font-bold px-3 py-1.5 rounded-full ring-1 ring-emerald-500/20">
          <CloudLightning className="w-3.5 h-3.5 animate-pulse" />
          DADOS EM TEMPO REAL
        </div>
      </div>

      {/* Activity Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UsageCard 
          title="WhatsApp Enviados" 
          value="45.2k" 
          icon={MessageSquare} 
          color="bg-emerald-500" 
          trend="+18%" 
        />
        <UsageCard 
          title="Sincronizações" 
          value="12.8k" 
          icon={Globe} 
          color="bg-blue-500" 
          trend="+5%" 
        />
        <UsageCard 
          title="Processamento de IA" 
          value="2.4k" 
          icon={Zap} 
          color="bg-amber-500" 
          trend="+40%" 
        />
        <UsageCard 
          title="Imóveis Ativos" 
          value="124k" 
          icon={BarChart3} 
          color="bg-indigo-500" 
          trend="+2%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Usage Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white font-mono">Tráfego de Mensagens Interno</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-xs text-slate-400">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" /> WhatsApp
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-400">
                 <div className="w-2 h-2 rounded-full bg-amber-500" /> IA Tokens
               </div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USAGE_DATA}>
                <defs>
                  <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                />
                <Area type="monotone" dataKey="whatsapp" stroke="#10b981" fillOpacity={1} fill="url(#colorWhatsapp)" strokeWidth={3} />
                <Area type="monotone" dataKey="ai" stroke="#f59e0b" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Tenants by Resource Usage */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Top Consumidores</h3>
          <div className="space-y-6">
            {[
              { name: 'Imobiliária Alpha', usage: 92, status: 'VIP' },
              { name: 'Lopes São Paulo', usage: 85, status: 'Enterprise' },
              { name: 'House & Co', usage: 64, status: 'Pro' },
              { name: 'Santos Imóveis', usage: 52, status: 'Pro' },
              { name: 'Elite Real Estate', usage: 48, status: 'Pro' },
            ].map((tenant, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {tenant.name}
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                    {tenant.status}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000"
                    style={{ width: `${tenant.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
            Ver Todos os Limites
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function UsageCard({ title, value, icon: Icon, color, trend }: { title: string, value: string, icon: any, color: string, trend: string }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl relative group overflow-hidden">
      <div className={cn("absolute -top-4 -right-4 w-16 h-16 opacity-10 group-hover:opacity-20 transition-all rounded-full", color)} />
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("p-2 rounded-xl text-white", color)}>
          <Icon size={20} />
        </div>
        <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
          <TrendingUp size={12} />
          {trend}
        </span>
      </div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
    </div>
  );
}
