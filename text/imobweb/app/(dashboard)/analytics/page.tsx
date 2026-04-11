'use client'

import React from 'react'
import { BarChart3, TrendingUp, Users, Home, Search, Target, PieChart, Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Badge } from '@/components/design-system/badge'
import { cn } from '@/lib/responsive/tailwind-utils'

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Insights & Analytics</h1>
          <p className="text-muted-foreground font-medium">Performance baseada em dados reais e comportamento de leads.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="glass border-none h-12 px-6 rounded-2xl font-bold">
              <Calendar className="w-4 h-4 mr-2" /> Últimos 30 dias <ChevronDown className="w-4 h-4 ml-2" />
           </Button>
           <Button className="shadow-lg shadow-primary/20 h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest">
              Exportar Relatório
           </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsStatCard title="Total de Leads" value="1.284" trend="+12%" icon={Users} color="primary" />
        <AnalyticsStatCard title="Novos Imóveis" value="47" trend="+5%" icon={Home} color="blue" />
        <AnalyticsStatCard title="Buscas no Site" value="12.4k" trend="+24%" icon={Search} color="purple" />
        <AnalyticsStatCard title="Taxa de Conversão" value="8.4%" trend="+1.2%" icon={Target} color="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Performance Chart Mockup */}
        <div className="xl:col-span-2 glass border-none rounded-[2rem] p-8 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black tracking-tighter">Performance de Conversão</h3>
              <p className="text-sm text-muted-foreground font-medium">Leads qualificados vs. Vendas fechadas</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase opacity-60">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-xs font-bold text-muted-foreground uppercase opacity-60">Vendas</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 h-64 px-4 overflow-hidden">
             {[40, 65, 45, 90, 55, 100, 75, 40, 85, 60, 95, 70].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-crosshair">
                  <div className="w-full relative flex flex-col items-center">
                    <div 
                      className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-all duration-500" 
                      style={{ height: `${h}%` }} 
                    />
                    <div 
                        className="w-full bg-blue-400/30 rounded-t-lg absolute bottom-0 group-hover:bg-blue-400/50 transition-all duration-500" 
                        style={{ height: `${h * 0.4}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-tighter">M{i+1}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Source Distribution Mockup */}
        <div className="glass border-none rounded-[2rem] p-8">
          <h3 className="text-xl font-black tracking-tighter mb-2">Origem dos Leads</h3>
          <p className="text-sm text-muted-foreground font-medium mb-8">Canal de entrada principal</p>
          
          <div className="space-y-6">
             <SourceIndicator label="WhatsApp IA" percentage={45} color="bg-emerald-400" />
             <SourceIndicator label="Zap Imóveis" percentage={25} color="bg-blue-400" />
             <SourceIndicator label="VivaReal" percentage={15} color="bg-purple-400" />
             <SourceIndicator label="Website" percentage={10} color="bg-primary" />
             <SourceIndicator label="Outros" percentage={5} color="bg-slate-400" />
          </div>

          <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
             <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lead Quente</p>
                <p className="text-lg font-black italic text-emerald-400">WhatsApp IA</p>
             </div>
             <TrendingUp className="w-10 h-10 text-emerald-400/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsStatCard({ title, value, trend, icon: Icon, color }: any) {
  const colorMap: any = {
    primary: 'text-primary bg-primary/10',
    blue: 'text-blue-400 bg-blue-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/10'
  }

  return (
    <div className="glass border-none rounded-3xl p-6 group hover:translate-y-[-4px] transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-black tracking-tighter">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-1">{title}</p>
      </div>
    </div>
  )
}

function SourceIndicator({ label, percentage, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
