"use client";

import React, { useState } from "react";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  ArrowUpRight, 
  Calendar, 
  ChevronRight,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Zap,
  MoreVertical,
  Activity,
  Globe
} from "lucide-react";

/**
 * PORTAL DO PARCEIRO / REVENDEDOR - imobWeb 2026
 * Um dashboard de alta conversão para gestão de ecossistema.
 */

export const PartnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock de performance da rede
  const stats = [
    { label: "Sub-Imobiliárias", value: "48", icon: <Users size={20} />, trend: "+6 novos", color: "blue" },
    { label: "Faturamento Rede", value: "R$ 15.680", icon: <TrendingUp size={20} />, trend: "+14.2%", color: "emerald" },
    { label: "Meus Royalties", value: "R$ 3.136", icon: <DollarSign size={20} />, trend: "Prev. R$ 3.800", color: "indigo" },
    { label: "Adoção Add-ons", value: "62%", icon: <Zap size={20} />, trend: "Top 5%", color: "amber" },
  ];

  const subAccounts = [
    { id: "1", name: "Alpha Imóveis", owner: "Carlos Silva", plan: "Enterprise", size: "25 corretores", health: 98, mrr: 1200 },
    { id: "2", name: "Riviera Brokers", owner: "Ana Paulo", plan: "Pro", size: "12 corretores", health: 85, mrr: 490 },
    { id: "3", name: "Matriz Imobiliária", owner: "Roberto Melo", plan: "Pro", size: "8 corretores", health: 92, mrr: 490 },
  ];

  return (
    <div className="min-h-screen space-y-8 p-6 lg:p-10 bg-slate-50/50 dark:bg-slate-950/20">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
        <ShieldCheck size={14} className="text-indigo-500" />
        <span>Ecosystem Portal</span>
        <ChevronRight size={12} />
        <span className="text-slate-900 dark:text-white">Partner Hub</span>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Partner <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            Gerencie sua rede de revenda, monitore faturamento e expanda sua operação White Label.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Globe size={18} />
            Configurar White Label
          </button>
          <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40">
            <UserPlus size={18} />
            Nova Sub-conta
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50">
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${stat.color}-500/5 blur-2xl transition-all group-hover:bg-${stat.color}-500/10`}></div>
            
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-950/30 dark:text-${stat.color}-400`}>
                {stat.icon}
              </div>
              <Activity size={16} className="text-slate-300 dark:text-slate-700" />
            </div>
            
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                <span className={`text-xs font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        {/* Sub-Accounts Management */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between p-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Minhas Sub-contas</h2>
                <p className="text-sm text-slate-500">Imobiliárias sob sua gestão direta.</p>
              </div>
              <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button className="rounded-lg px-4 py-1.5 text-xs font-bold bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white">Ativas</button>
                <button className="rounded-lg px-4 py-1.5 text-xs font-bold text-slate-500">Pendentes</button>
              </div>
            </div>

            <div className="px-2 pb-2">
              <div className="grid gap-2 overflow-hidden">
                {subAccounts.map((account) => (
                  <div key={account.id} className="group flex items-center justify-between rounded-2xl p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">
                          {account.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{account.owner}</span>
                          <span>•</span>
                          <span>{account.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-center">
                      <div className="text-xs font-semibold text-slate-400 mb-1 tracking-widest uppercase">Saúde</div>
                      <div className="h-1.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-${account.health > 90 ? 'emerald' : 'amber'}-500`}
                          style={{ width: `${account.health}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">R$ {account.mrr}</div>
                        <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{account.plan}</div>
                      </div>
                      <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-all hover:bg-indigo-600 hover:text-white dark:bg-slate-800">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 p-6">
              <button className="flex w-full items-center justify-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-all">
                Ver Todas as Sub-Contas <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Finance & Royalties Card */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-500/20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Resumo Financeiro</h3>
              <div className="rounded-lg bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Pago em abr 2026</div>
            </div>
            
            <div className="space-y-1 mb-8">
              <p className="text-indigo-100 text-sm font-medium">Comissão Total a Receber</p>
              <h2 className="text-4xl font-black">R$ 3.136,00</h2>
            </div>
            
            <div className="h-px bg-white/10 w-full mb-8" />
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-100">Assinaturas Ativas</span>
                <span className="font-bold">R$ 15.680</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-indigo-100 font-medium">Sua Taxa (Gold)</span>
                <span>20%</span>
              </div>
            </div>

            <button className="mt-10 w-full rounded-2xl bg-white py-4 text-sm font-black text-indigo-600 shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-95">
              SOLICITAR SAQUE
            </button>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dica de Crescimento</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Revendedores <b>Platinum</b> têm acesso a comissão de 25% + Marketplace de Add-ons aberto para customização de preço. Você está a apenas <b>R$ 4.320 em MRR</b> de subir de nível.
            </p>
            <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">
              Ver benefícios do nível Platinum <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
