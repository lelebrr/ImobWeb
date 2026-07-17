'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }
const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const invoices = [
  { id: 'INV-2026-001', org: 'Imobiliária ABC', value: 'R$ 997', dueDate: '2026-07-15', status: 'paid', paidAt: '2026-07-14' },
  { id: 'INV-2026-002', org: 'Construtora XYZ', value: 'R$ 1.497', dueDate: '2026-08-01', status: 'pending', paidAt: '—' },
  { id: 'INV-2026-003', org: 'Imobiliária Modelo', value: 'R$ 597', dueDate: '2026-07-20', status: 'overdue', paidAt: '—' },
  { id: 'INV-2026-004', org: 'Grupo Lopes', value: 'R$ 197', dueDate: '2026-07-10', status: 'paid', paidAt: '2026-07-09' },
];

export default function BillingInvoicesPage() {
  const [search, setSearch] = useState('');
  const filtered = invoices.filter(i => i.org.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'id', header: 'Invoice', render: (row: any) => <span className="text-xs font-mono font-bold text-white">{row.id}</span> },
    { key: 'org', header: 'Imobiliária', render: (row: any) => <span className="text-sm text-slate-300">{row.org}</span> },
    { key: 'value', header: 'Valor', render: (row: any) => <span className="text-sm font-semibold text-white">{row.value}</span> },
    { key: 'dueDate', header: 'Vencimento', render: (row: any) => <span className="text-xs text-slate-500">{formatDate(row.dueDate)}</span> },
    { key: 'status', header: 'Status', render: (row: any) => (<Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', row.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : row.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>{row.status === 'paid' ? 'Pago' : row.status === 'pending' ? 'Pendente' : 'Vencido'}</Badge>) },
    { key: 'actions', header: '', render: () => (<Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white rounded-xl"><Download className="w-3 h-3 mr-1" />PDF</Button>) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 flex items-center justify-center border border-sky-500/10"><FileText className="w-5 h-5 text-sky-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Invoices & Notas</h1><p className="text-xs text-slate-500 hidden sm:block">Histórico de faturas emitidas</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar por invoice ou imobiliária..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"><ResponsiveTable columns={columns} data={filtered} /></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
