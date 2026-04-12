'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Eye, Target, 
  ArrowUpRight, ArrowDownRight, 
  Filter, Calendar, Download,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ROIReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portals/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb & Title */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link 
              href="/integrations" 
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft size={16} /> Voltar para Portais
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-foreground mt-2">
              ROI & Performance <span className="text-primary italic">Analytics</span>
            </h1>
            <p className="text-muted-foreground mt-2 italic">Análise de conversão e retorno por canal imobiliário.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition-all">
              <Calendar size={18} /> Últimos 30 dias
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Download size={18} /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <KPICard 
            title="Total de Visualizações" 
            value="15.8k" 
            trend="+12.4%" 
            icon={<Eye className="text-blue-500" />}
          />
          <KPICard 
            title="Leads Gerados" 
            value={data?.performance?.reduce((acc: any, p: any) => acc + p.totalLeads, 0) || 0} 
            trend="+8.1%" 
            icon={<Users className="text-purple-500" />}
          />
          <KPICard 
            title="Taxa de Conversão" 
            value="2.4%" 
            trend="-0.5%" 
            icon={<Target className="text-emerald-500" />}
            isNegative
          />
          <KPICard 
            title="Custo Médio p/ Lead" 
            value={`R$ ${data?.totalSummary?.avgCPL.toFixed(2)}`} 
            trend="+2.1%" 
            icon={<TrendingUp className="text-amber-500" />}
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Conversão por Portal */}
          <div className="lg:col-span-2 rounded-3xl border bg-card/50 p-8 backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="text-primary" /> Conversão por Portal Target
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.performance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="portal" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.1 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'hsl(var(--card))', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalLeads" name="Leads" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={40} />
                  <Bar dataKey="totalViews" name="Views (100x)" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking de ROI */}
          <div className="rounded-3xl border bg-card p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">🏆 Ranking de Eficiência</h3>
            <div className="space-y-6">
              {data?.performance?.sort((a: any, b: any) => b.totalLeads - a.totalLeads).map((p: any, i: number) => (
                <div key={p.portal} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{p.portal}</span>
                    <span className="text-primary font-black bg-primary/10 px-3 py-1 rounded-full text-xs">#{i + 1}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 flex-1 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-1000" 
                        style={{ width: `${(p.totalLeads / 50) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12">{p.totalLeads} L</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary uppercase mb-2">Insight do Sistema</p>
              <p className="text-sm text-foreground italic leading-relaxed">
                "O portal <strong>{data?.totalSummary?.topPortal}</strong> está performando 25% melhor que a média. Recomendamos realocar verba para maximizar o volume de leads este final de semana."
              </p>
            </div>
          </div>

          {/* Tendência Temporal */}
          <div className="lg:col-span-3 rounded-3xl border bg-card p-8 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <TrendingUp size={200} className="text-primary rotate-12" />
            </div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
              <TrendingUp className="text-blue-500" /> Tendência de Captação
            </h3>
            <div className="h-[300px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trends}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, icon, isNegative }: { title: string, value: string | number, trend: string, icon: React.ReactNode, isNegative?: boolean }) {
  return (
    <div className="group rounded-3xl border bg-card p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-primary/50 cursor-default overflow-hidden relative">
      <div className="flex justify-between items-start relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center transition-colors group-hover:bg-primary/10">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${isNegative ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
          {isNegative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="mt-4 relative z-10">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
        <div className="text-4xl font-black mt-1 text-foreground">{value}</div>
      </div>
      <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary/5 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
    </div>
  );
}
