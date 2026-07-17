'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminBillingPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'MRR Total', value: formatCurrency(stats?.totalMRR || 0), icon: DollarSign, gradient: 'from-emerald-600/30 to-emerald-900/30' },
    { label: 'Assinaturas Ativas', value: stats?.activeSubscriptions || 0, icon: Users, gradient: 'from-blue-600/30 to-blue-900/30' },
    { label: 'Orgs Ativas', value: stats?.activeOrganizations || 0, icon: TrendingUp, gradient: 'from-indigo-600/30 to-indigo-900/30' },
    { label: 'Total Orgs', value: stats?.totalOrganizations || 0, icon: CreditCard, gradient: 'from-amber-600/30 to-amber-900/30' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Faturamento</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Visão geral do faturamento da plataforma</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 bg-white/[0.02] rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi, i) => (
                <motion.div key={kpi.label} variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
                  <div className={cn('relative rounded-2xl p-5 overflow-hidden border border-white/5', kpi.gradient)}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                        <kpi.icon className="w-5 h-5 text-white/90" />
                      </div>
                      <p className="text-[11px] text-white/50 uppercase tracking-[0.15em] font-semibold mb-1">{kpi.label}</p>
                      <p className="text-2xl font-black text-white tracking-tight">{kpi.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Distribuição de Planos</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Organizações por tier de assinatura</p>
                  </div>
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-white/[0.02] rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {stats?.orgsByPlan?.map((plan: any) => {
                      const total = stats.orgsByPlan.reduce((s: number, p: any) => s + p.count, 0);
                      const pct = total > 0 ? (plan.count / total) * 100 : 0;
                      return (
                        <div key={plan.plan} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-300">{plan.plan}</span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {plan.count} orgs <span className="text-slate-600">({pct.toFixed(0)}%)</span>
                            </span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    }) || (
                      <p className="text-xs text-slate-600 text-center py-8">Sem dados disponíveis</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
