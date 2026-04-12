"use client";

/**
 * Financial Dashboard - ImobWeb 2026
 * 
 * Visão consolidada da saúde financeira da imobiliária.
 * Inclui KPIs de faturamento SaaS (MRR) e métricas de imobiliária (Comissões).
 */

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Home, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Dados mock para visualização de 2026
const monthlyData = [
  { month: "Jan", revenue: 45200, expenses: 28000, commission: 12000 },
  { month: "Fev", revenue: 52000, expenses: 30000, commission: 15000 },
  { month: "Mar", revenue: 48000, expenses: 32000, commission: 11000 },
  { month: "Abr", revenue: 61000, expenses: 35000, commission: 18000 },
  { month: "Mai", revenue: 58000, expenses: 34000, commission: 16000 },
  { month: "Jun", revenue: 72000, expenses: 38000, commission: 22000 },
];

const kpiData = [
  { title: "GMV Total", value: "R$ 4.2M", change: "+12.5%", trend: "up", icon: Home },
  { title: "Receita Líquida", value: "R$ 72.4k", change: "+8.2%", trend: "up", icon: DollarSign },
  { title: "Comissões a Pagar", value: "R$ 22.1k", change: "+15.4%", trend: "down", icon: Users },
  { title: "Inadimplência", value: "2.4%", change: "-0.5%", trend: "up", icon: TrendingUp },
];

export default function FinancialDashboard() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">Monitoramento fiscal e de faturamento em tempo real.</p>
      </header>

      {/* KPI Section */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="border-none shadow-sm shadow-slate-200 dark:shadow-slate-900 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <kpi.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{kpi.value}</div>
              <p className={cl("text-xs font-medium flex items-center gap-1 mt-1", kpi.trend === "up" ? "text-green-500" : "text-red-500")}>
                {kpi.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm shadow-slate-200 dark:shadow-slate-900">
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
            <CardDescription>Evolução financeira consolidada dos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="transparent" strokeDasharray="5 5" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm shadow-slate-200 dark:shadow-slate-900 text-white bg-slate-900 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-100">Distribuição de Comissões</CardTitle>
            <CardDescription className="text-slate-400">Repasses realizados aos corretores (Top 5).</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {[
                  { name: "Carlos Imóveis", value: "R$ 8.400", sub: "Venda - Ed. Horizon" },
                  { name: "Luciana Costa", value: "R$ 5.200", sub: "Venda - Garden Resid." },
                  { name: "Pedro Silva", value: "R$ 3.800", sub: "Aluguel - Corporativo" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                        {item.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-100">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.sub}</div>
                      </div>
                    </div>
                    <div className="text-sm font-black text-green-400">{item.value}</div>
                  </div>
                ))}
                <button className="w-full py-3 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest mt-4">
                  Ver Relatório Completo
                </button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Utility function (placeholder for cn)
function cl(...args: any[]) {
  return args.filter(Boolean).join(" ");
}
