'use client'

import React, { useState } from 'react'
import ExecutiveDashboard from '@/components/analytics/ExecutiveDashboard'
import SalesDashboard from '@/components/analytics/SalesDashboard'
import TeamDashboard from '@/components/analytics/TeamDashboard'
import MarketingDashboard from '@/components/analytics/MarketingDashboard'
import PortfolioDashboard from '@/components/analytics/PortfolioDashboard'
import FinancialDashboard from '@/components/analytics/FinancialDashboard'
import RoiChannelDashboard from '@/components/analytics/RoiChannelDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/design-system/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Megaphone, 
  Building2, 
  DollarSign, 
  Zap,
  LayoutDashboard
} from 'lucide-react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('executive')

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Insights & Inteligência</h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-[0.2em] opacity-60">Análise preditiva e performance operacional estratégica.</p>
        </div>
      </div>

      <Tabs defaultValue="executive" className="w-full space-y-8" onValueChange={setActiveTab}>
        <div className="flex items-center justify-start overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-white/40 p-1.5 rounded-[2rem] border border-white/60 h-auto gap-2">
            <TabsTrigger value="executive" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
              <LayoutDashboard className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
              <TrendingUp className="h-4 w-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="team" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
              <Users className="h-4 w-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="marketing" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
              <Megaphone className="h-4 w-4" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
              <Building2 className="h-4 w-4" />
              Carteira
            </TabsTrigger>
            <TabsTrigger value="finance" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
              <DollarSign className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="roi" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
              <Zap className="h-4 w-4" />
              ROI
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="executive">
          <ExecutiveDashboard />
        </TabsContent>

        <TabsContent value="sales">
          <SalesDashboard />
        </TabsContent>

        <TabsContent value="team">
          <TeamDashboard />
        </TabsContent>

        <TabsContent value="marketing">
          <MarketingDashboard />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioDashboard />
        </TabsContent>

        <TabsContent value="finance">
          <FinancialDashboard />
        </TabsContent>

        <TabsContent value="roi">
          <RoiChannelDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
