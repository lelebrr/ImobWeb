"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/design-system/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Megaphone,
  Building2,
  DollarSign,
  Zap,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

const ExecutiveDashboard = dynamic(
  () => import("@/components/analytics/ExecutiveDashboard"),
  { loading: () => <p className="text-center py-8">Carregando...</p> },
);
const SalesDashboard = dynamic(
  () => import("@/components/analytics/SalesDashboard"),
  { loading: () => <p className="text-center py-8">Carregando...</p> },
);
const TeamDashboard = dynamic(
  () => import("@/components/analytics/TeamDashboard"),
  { loading: () => <p className="text-center py-8">Carregando...</p> },
);
const MarketingDashboard = dynamic(
  () => import("@/components/analytics/MarketingDashboard"),
  { loading: () => <p className="text-center py-8">Carregando...</p> },
);
const PortfolioDashboard = dynamic(
  () => import("@/components/analytics/PortfolioDashboard"),
  { loading: () => <p className="text-center py-8">Carregando...</p> },
);
const FinancialDashboard = dynamic(
  () => import("@/components/analytics/FinancialDashboard"),
  { loading: () => <p className="text-center py-8">Carregando...</p> },
);
const RoiChannelDashboard = dynamic(
  () => import("@/components/analytics/RoiChannelDashboard"),
  { loading: () => <p className="text-center py-8">Carregando...</p> },
);
const ActionableInsights = dynamic(
  () => import("@/components/analytics/ActionableInsights"),
  { loading: () => <p className="text-center py-8">Carregando...</p> },
);

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("executive");

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">
            Insights & Inteligência
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-[0.2em] opacity-60">
            Análise preditiva e performance operacional estratégica.
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="executive"
        className="w-full space-y-8"
        onValueChange={setActiveTab}
      >
        <div className="flex items-center justify-start overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-white/40 p-1.5 rounded-[2rem] border border-white/60 h-auto gap-2">
            <TabsTrigger
              value="executive"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all text-nowrap"
            >
              <LayoutDashboard className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all text-nowrap"
            >
              <Sparkles className="h-4 w-4 fill-current" />
              IA Insights
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all text-nowrap"
            >
              <TrendingUp className="h-4 w-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all text-nowrap"
            >
              <Users className="h-4 w-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger
              value="marketing"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all text-nowrap"
            >
              <Megaphone className="h-4 w-4" />
              Marketing
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all text-nowrap"
            >
              <Building2 className="h-4 w-4" />
              Carteira
            </TabsTrigger>
            <TabsTrigger
              value="finance"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all text-nowrap"
            >
              <DollarSign className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger
              value="roi"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all text-nowrap"
            >
              <Zap className="h-4 w-4" />
              ROI
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="executive">
          <ExecutiveDashboard />
        </TabsContent>

        <TabsContent value="insights">
          <ActionableInsights />
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
  );
}
