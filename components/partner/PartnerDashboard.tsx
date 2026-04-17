"use client";

import React, { useState, useEffect } from "react";
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
  Globe,
} from "lucide-react";
import {
  Partner,
  PartnerDashboardStats,
  ResellerClient,
  BrandingConfig,
} from "@/types/partner";
// Removendo importações que não estão sendo usadas diretamente nesse componente por enquanto
// import { WhiteLabelService } from '@/lib/white-label/white-label-service';
// import { CommissionEngine } from '@/lib/partner/commission-engine';

/**
 * PORTAL DO PARCEIRO / REVENDEDOR - imobWeb 2026
 * Um dashboard de alta conversão para gestão de ecossistema.
 */

export const PartnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "clients" | "earnings" | "addons"
  >("overview");
  const [stats, setStats] = useState<PartnerDashboardStats | null>(null);
  const [subAccounts, setSubAccounts] = useState<
    Array<
      ResellerClient & {
        owner: string;
        health: number;
      }
    >
  >([]);
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Simulação de parceiro logado (em um app real, viria do contexto de auth)
  const partnerId = "partner_123";

  useEffect(() => {
    // Buscar dados do parceiro
    loadPartnerData();
  }, [partnerId]);

  const loadPartnerData = async () => {
    try {
      setLoading(true);

      // Em um app real, estas seriam chamadas para o backend
      // Por enquanto, vamos simular com dados mockados baseados nos nossos tipos

      // Simular estatísticas do parceiro
      const mockStats: PartnerDashboardStats = {
        totalClients: 48,
        activeClients: 42,
        totalCommissionEarned: 15680,
        pendingCommissions: 3136,
        monthlyRecurringRevenue: 18816,
        clientGrowth: 14.2,
        revenueGrowth: 18.5,
      };

      // Simular sub-contas (clientes do parceiro)
      const mockSubAccounts: Array<
        ResellerClient & {
          owner: string;
          health: number;
        }
      > = [
        {
          id: "sub_1",
          partnerId,
          subAccountId: "org_1",
          clientName: "Alpha Imóveis",
          clientDomain: "crm.alphaimoveis.com.br",
          status: "active",
          planId: "enterprise",
          monthlyValue: 1200,
          commissionValue: 240, // 20% de 1200
          commissionRate: 20,
          startedAt: new Date("2026-01-15"),
          endedAt: null,
          lastPaymentDate: new Date("2026-04-05"),
          nextPaymentDate: new Date("2026-05-05"),
          createdAt: new Date("2026-01-15"),
          updatedAt: new Date("2026-04-10"),
          owner: "Carlos Silva",
          health: 98,
        },
        {
          id: "sub_2",
          partnerId,
          subAccountId: "org_2",
          clientName: "Riviera Brokers",
          clientDomain: "crm.rivierabrokers.com.br",
          status: "active",
          planId: "pro",
          monthlyValue: 490,
          commissionValue: 98, // 20% de 490
          commissionRate: 20,
          startedAt: new Date("2026-02-01"),
          endedAt: null,
          lastPaymentDate: new Date("2026-04-03"),
          nextPaymentDate: new Date("2026-05-03"),
          createdAt: new Date("2026-02-01"),
          updatedAt: new Date("2026-04-08"),
          owner: "Ana Paulo",
          health: 85,
        },
        {
          id: "sub_3",
          partnerId,
          subAccountId: "org_3",
          clientName: "Matriz Imobiliária",
          clientDomain: "crm.matrizimobiliaria.com.br",
          status: "active",
          planId: "pro",
          monthlyValue: 490,
          commissionValue: 98, // 20% de 490
          commissionRate: 20,
          startedAt: new Date("2026-03-10"),
          endedAt: null,
          lastPaymentDate: new Date("2026-04-07"),
          nextPaymentDate: new Date("2026-05-07"),
          createdAt: new Date("2026-03-10"),
          updatedAt: new Date("2026-04-12"),
          owner: "Roberto Melo",
          health: 92,
        },
      ];

      // Simular configuração de branding
      const mockBrandingConfig: BrandingConfig = {
        id: "branding_123",
        partnerId,
        domain: "crm.customimobiliaria.com.br",
        logoUrl: "/logos/custom-imobiliaria.png",
        faviconUrl: "/favicons/custom-imobiliaria.ico",
        primaryColor: "#8B5CF6", // Roxo violeta
        secondaryColor: "#7C3AED",
        backgroundColor: "#FFFFFF",
        textColor: "#1F2937",
        accentColor: "#EC4899",
        fontFamily: "'Inter', sans-serif",
        darkModeEnabled: true,
        darkModeColors: {
          primary: "#7C3AED",
          secondary: "#6D28D9",
          background: "#111827",
          text: "#F9FAFB",
          accent: "#F472B6",
        },
        hidePlatformBranding: true,
        customCss: null,
        customJs: null,
        createdAt: new Date("2026-01-10"),
        updatedAt: new Date("2026-04-15"),
      };

      setStats(mockStats);
      setSubAccounts(mockSubAccounts);
      setBrandingConfig(mockBrandingConfig);
    } catch (error) {
      console.error("Erro ao carregar dados do parceiro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubAccount = async () => {
    // Em um app real, isso abriria um modal ou redirecionaria para o fluxo de criação
    console.log("Criando nova sub-conta...");
  };

  const handleConfigureWhiteLabel = () => {
    // Em um app real, isso abriria o configurador de white label
    console.log("Configurando White Label...");
  };

  const handleRequestWithdrawal = async () => {
    // Em um app real, isso processaria o saque
    console.log("Solicitando saque de royalties...");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

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
            Partner{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            Gerencie sua rede de revenda, monitore faturamento e expanda sua
            operação White Label.
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
        {!stats ? (
          <div className="col-span-4 text-center py-12">
            <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Carregando estatísticas...
            </p>
          </div>
        ) : (
          <>
            <div
              key="1"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all group-hover:bg-blue-500/10"></div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                  <Users size={20} />
                </div>
                <Activity
                  size={16}
                  className="text-slate-300 dark:text-slate-700"
                />
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Sub-Imobiliárias
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                    {stats.totalClients}
                  </h3>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    +6 novos
                  </span>
                </div>
              </div>
            </div>
            <div
              key="2"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-all group-hover:bg-emerald-500/10"></div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <TrendingUp size={20} />
                </div>
                <Activity
                  size={16}
                  className="text-slate-300 dark:text-slate-700"
                />
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Faturamento Rede
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                    R$ {stats.monthlyRecurringRevenue.toLocaleString()}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    +{stats.revenueGrowth}%
                  </span>
                </div>
              </div>
            </div>
            <div
              key="3"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition-all group-hover:bg-indigo-500/10"></div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                  <DollarSign size={20} />
                </div>
                <Activity
                  size={16}
                  className="text-slate-300 dark:text-slate-700"
                />
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Meus Royalties
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                    R$ {stats.pendingCommissions.toLocaleString()}
                  </h3>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Prev. R$ {stats.totalCommissionEarned.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div
              key="4"
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl transition-all group-hover:bg-amber-500/10"></div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                  <Zap size={20} />
                </div>
                <Activity
                  size={16}
                  className="text-slate-300 dark:text-slate-700"
                />
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Adoção Add-ons
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                    62%
                  </h3>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Top 5%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        {/* Sub-Accounts Management */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between p-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Minhas Sub-contas
                </h2>
                <p className="text-sm text-slate-500">
                  Imobiliárias sob sua gestão direta.
                </p>
              </div>
              <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button className="rounded-lg px-4 py-1.5 text-xs font-bold bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white">
                  Ativas
                </button>
                <button className="rounded-lg px-4 py-1.5 text-xs font-bold text-slate-500">
                  Pendentes
                </button>
              </div>
            </div>

            <div className="px-2 pb-2">
              <div className="grid gap-2 overflow-hidden">
                {subAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="group flex items-center justify-between rounded-2xl p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                        {account.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">
                          {account.clientName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {account.owner}
                          </span>
                          <span>•</span>
                          <span>{account.monthlyValue} corretores</span>{" "}
                          {/* Using monthlyValue as a proxy for size */}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-center">
                      <div className="text-xs font-semibold text-slate-400 mb-1 tracking-widest uppercase">
                        Saúde
                      </div>
                      <div className="h-1.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-${account.health > 90 ? "emerald" : "amber"}-500`}
                          style={{ width: `${account.health}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          R$ {account.monthlyValue}
                        </div>
                        <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                          {account.planId}
                        </div>
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
              <div className="rounded-lg bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                Pago em abr 2026
              </div>
            </div>

            <div className="space-y-1 mb-8">
              <p className="text-indigo-100 text-sm font-medium">
                Comissão Total a Receber
              </p>
              <h2 className="text-4xl font-black">R$ 3.136,00</h2>
            </div>

            <div className="h-px bg-white/10 w-full mb-8" />

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-100">Assinaturas Ativas</span>
                <span className="font-bold">R$ 15.680</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-indigo-100 font-medium">
                  Sua Taxa (Gold)
                </span>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dica de Crescimento
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Revendedores <b>Platinum</b> têm acesso a comissão de 25% +
              Marketplace de Add-ons aberto para customização de preço. Você
              está a apenas <b>R$ 4.320 em MRR</b> de subir de nível.
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
