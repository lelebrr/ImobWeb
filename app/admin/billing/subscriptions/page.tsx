'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }
const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const subscriptions = [
  { id: '1', org: 'Imobiliária ABC', plan: 'Premium', status: 'active', value: 'R$ 997', since: '2025-01-15', nextBilling: '2026-08-15' },
  { id: '2', org: 'Construtora XYZ', plan: 'Corporativo', status: 'active', value: 'R$ 1.497', since: '2025-03-01', nextBilling: '2026-08-01' },
  { id: '3', org: 'Imobiliária Modelo', plan: 'Destaque', status: 'active', value: 'R$ 597', since: '2025-06-20', nextBilling: '2026-07-20' },
  { id: '4', org: 'Grupo Lopes', plan: 'Básico', status: 'canceled', value: 'R$ 197', since: '2024-09-10', nextBilling: '—' },
];

export default function BillingSubscriptionsPage() {
  const [search, setSearch] = useState('');
  const filtered = subscriptions.filter(s => s.org.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'org', header: 'Imobiliária', render: (row: any) => <span className="text-sm text-white font-medium">{row.org}</span> },
    { key: 'plan', header: 'Plano', render: (row: any) => <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{row.plan}</Badge> },
    { key: 'value', header: 'Valor', render: (row: any) => <span className="text-sm font-semibold text-white">{row.value}</span> },
    { key: 'status', header: 'Status', render: (row: any) => (<Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', row.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>{row.status === 'active' ? 'Ativa' : 'Cancelada'}</Badge>) },
    { key: 'since', header: 'Desde', render: (row: any) => <span className="text-xs text-slate-500">{formatDate(row.since)}</span> },
    { key: 'nextBilling', header: 'Próxima Cobrança', render: (row: any) => <span className="text-xs text-slate-500">{row.nextBilling !== '—' ? formatDate(row.nextBilling) : '—'}</span> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><CreditCard className="w-5 h-5 text-indigo-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Assinaturas Ativas</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar assinaturas das imobiliárias</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar por imobiliária..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <ResponsiveTable columns={columns} data={filtered} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
