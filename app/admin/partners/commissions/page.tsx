'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }
const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const commissions = [
  { partner: 'Partner Sul Ltda', client: 'Imobiliária ABC', value: 'R$ 149,55', rate: '15%', period: 'Jul/2026', paidAt: '—', status: 'pending' },
  { partner: 'Conecta Imóveis', client: 'Construtora XYZ', value: 'R$ 179,64', rate: '12%', period: 'Jul/2026', paidAt: '2026-07-10', status: 'paid' },
  { partner: 'Rede ImobNet', client: 'Imobiliária Modelo', value: 'R$ 59,70', rate: '10%', period: 'Jun/2026', paidAt: '2026-06-15', status: 'paid' },
];

export default function PartnersCommissionsPage() {
  const [search, setSearch] = useState('');
  const filtered = commissions.filter(c => c.partner.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'partner', header: 'Parceiro', render: (row: any) => <span className="text-sm text-white font-medium">{row.partner}</span> },
    { key: 'client', header: 'Cliente', render: (row: any) => <span className="text-sm text-slate-400">{row.client}</span> },
    { key: 'value', header: 'Valor', render: (row: any) => <span className="text-sm font-semibold text-white">{row.value}</span> },
    { key: 'rate', header: 'Taxa', render: (row: any) => <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{row.rate}</Badge> },
    { key: 'period', header: 'Período', render: (row: any) => <span className="text-xs text-slate-500">{row.period}</span> },
    { key: 'status', header: 'Status', render: (row: any) => (<Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', row.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')}>{row.status === 'paid' ? 'Pago' : 'Pendente'}</Badge>) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Comissões & Royalties</h1><p className="text-xs text-slate-500 hidden sm:block">Comissões pagas e pendentes por parceiro</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar parceiro..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"><ResponsiveTable columns={columns} data={filtered} /></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
