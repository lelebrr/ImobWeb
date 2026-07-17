'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  Activity,
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  Shield,
  Settings,
  Package,
  RefreshCw,
  CheckCircle2,
  ClipboardCheck,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

function StatCard({
  label,
  value,
  changeLabel,
  icon: Icon,
  gradient,
  href,
}: {
  label: string;
  value: string | number;
  changeLabel?: string;
  icon: React.ElementType;
  gradient: string;
  href?: string;
}) {
  const content = (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }} className="h-full">
      <div className={cn(
        'relative h-full rounded-2xl p-5 overflow-hidden border border-white/5 transition-all group',
        gradient
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-5 h-5 text-white/90" />
            </div>
            <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors" />
          </div>
          <p className="text-[11px] text-white/50 uppercase tracking-[0.15em] font-semibold mb-1">
            {label}
          </p>
          <p className="text-2xl font-black text-white tracking-tight">{value}</p>
          {changeLabel && (
            <p className="text-[11px] text-white/40 mt-1.5 font-medium">{changeLabel}</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }
  return content;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const orgColumns = [
    {
      key: 'name',
      header: 'Organização',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-indigo-500/10">
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{row.name}</p>
            <p className="text-xs text-slate-500">{row.city || 'Sem local'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'planType',
      header: 'Plano',
      render: (row: any) => (
        <Badge className={cn(
          'text-[10px] font-bold border-0 px-2.5 py-0.5',
          row.planType === 'PREMIUM'
            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            : row.planType === 'CORPORATIVO'
            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            : row.planType === 'DESTAQUE'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        )}>
          {row.planType || 'SEM PLANO'}
        </Badge>
      ),
    },
    {
      key: 'userCount',
      header: 'Usuários',
      render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.userCount || 0}</span>,
    },
    {
      key: 'propertyCount',
      header: 'Imóveis',
      render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.propertyCount || 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => (
        <Badge className={cn(
          'text-[10px] font-bold border-0 px-2.5 py-0.5',
          row.status === 'ATIVO'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        )}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Criado',
      render: (row: any) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <Link href={`/admin/organizations?id=${row.id}`}>
          <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
            Ver <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      ),
    },
  ];

  const chartData = stats
    ? [
        { name: 'Orgs', value: stats.activeOrganizations || 0 },
        { name: 'Users', value: stats.activeUsers || 0 },
        { name: 'Props', value: stats.activeProperties || 0 },
        { name: 'Leads', value: stats.totalLeads || 0 },
      ]
    : [];

  const quickActions = [
    { label: 'Organizações', icon: Building2, href: '/admin/organizations', gradient: 'from-indigo-600/20 to-indigo-600/5' },
    { label: 'Usuários', icon: Users, href: '/admin/users', gradient: 'from-blue-600/20 to-blue-600/5' },
    { label: 'Faturamento', icon: DollarSign, href: '/admin/billing', gradient: 'from-emerald-600/20 to-emerald-600/5' },
    { label: 'Vistoria', icon: ClipboardCheck, href: '/admin/vistoria', gradient: 'from-cyan-600/20 to-cyan-600/5' },
    { label: 'Marketplace', icon: Package, href: '/admin/marketplace', gradient: 'from-purple-600/20 to-purple-600/5' },
    { label: 'Segurança', icon: Shield, href: '/admin/security', gradient: 'from-red-600/20 to-red-600/5' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center border border-red-500/10">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Painel Administrativo
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Visão global da plataforma imobWeb
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className={cn('w-4 h-4 mr-1.5', refreshing && 'animate-spin')} />
              <span className="hidden sm:inline text-xs">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className={cn(
                    'relative group p-4 rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10 hover:shadow-lg hover:shadow-black/20',
                    action.gradient
                  )}>
                    <div className="flex items-center gap-3">
                      <action.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* KPI Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 bg-white/[0.02] rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Organizações"
                value={stats?.totalOrganizations || 0}
                icon={Building2}
                gradient="bg-gradient-to-br from-indigo-600/30 to-indigo-900/30"
                href="/admin/organizations"
                changeLabel={`${stats?.activeOrganizations || 0} ativas`}
              />
              <StatCard
                label="MRR Total"
                value={formatCurrency(stats?.totalMRR || 0)}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-emerald-600/30 to-emerald-900/30"
                href="/admin/billing"
                changeLabel={`${stats?.activeSubscriptions || 0} assinaturas ativas`}
              />
              <StatCard
                label="Usuários Ativos"
                value={stats?.activeUsers || 0}
                icon={Users}
                gradient="bg-gradient-to-br from-blue-600/30 to-blue-900/30"
                href="/admin/users"
                changeLabel={`${stats?.totalUsers || 0} total cadastrados`}
              />
              <StatCard
                label="Imóveis Ativos"
                value={stats?.activeProperties || 0}
                icon={Home}
                gradient="bg-gradient-to-br from-amber-600/30 to-amber-900/30"
                changeLabel={`${stats?.totalProperties || 0} total no sistema`}
              />
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <div className="p-5 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Visão Geral</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Métricas da plataforma</p>
                    </div>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="p-5">
                  {loading ? (
                    <div className="h-52 bg-white/[0.02] rounded-xl animate-pulse" />
                  ) : (
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#12121a',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            }}
                            itemStyle={{ color: '#818cf8' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] h-full overflow-hidden">
                <div className="p-5 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Planos</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Distribuição</p>
                    </div>
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <div className="p-5">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-white/[0.02] rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats?.orgsByPlan?.map((plan: any) => {
                        const total = stats.orgsByPlan.reduce((s: number, p: any) => s + p.count, 0);
                        const pct = total > 0 ? (plan.count / total) * 100 : 0;
                        return (
                          <div key={plan.plan} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-300">{plan.plan}</span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {plan.count} <span className="text-slate-600">({pct.toFixed(0)}%)</span>
                              </span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      }) || (
                        <p className="text-xs text-slate-600 text-center py-6">Sem dados disponíveis</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Organizations */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Organizações Recentes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Últimas imobiliárias cadastradas</p>
              </div>
              <Link href="/admin/organizations">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl">
                  Ver Todas <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {loading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : stats?.recentOrganizations?.length > 0 ? (
                <ResponsiveTable columns={orgColumns} data={stats.recentOrganizations} />
              ) : (
                <div className="p-12 text-center">
                  <Building2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Nenhuma organização encontrada</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-r from-emerald-500/5 to-transparent p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald-400">Todos os Sistemas Operacionais</p>
                  <p className="text-xs text-slate-500">API, banco de dados e autenticação funcionando normalmente</p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  {['API', 'DB', 'Auth'].map((s) => (
                    <div key={s} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
