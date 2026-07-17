'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }
const formatDateTime = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const logs = [
  { id: '1', user: 'Admin Master', action: 'Alterou role do usuário', target: 'joao@imob.com', timestamp: '2026-07-17T14:30:00', ip: '191.52.10.1', severity: 'info' },
  { id: '2', user: 'Admin Master', action: 'Suspendeu imobiliária', target: 'Imobiliária Modelo', timestamp: '2026-07-17T13:15:00', ip: '191.52.10.1', severity: 'warning' },
  { id: '3', user: 'Sistema', action: 'Tentativa de login inválida', target: 'hacker@test.com', timestamp: '2026-07-17T12:00:00', ip: '45.33.32.156', severity: 'critical' },
  { id: '4', user: 'Admin Financeiro', action: 'Exportou relatório financeiro', target: 'relatorio-mensal.pdf', timestamp: '2026-07-16T10:45:00', ip: '191.52.10.2', severity: 'info' },
  { id: '5', user: 'Sistema', action: 'Backup automático concluído', target: 'backup-2026-07-16.sql', timestamp: '2026-07-16T03:00:00', ip: '—', severity: 'info' },
];

export default function SecurityLogsPage() {
  const [search, setSearch] = useState('');
  const filtered = logs.filter(l => l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'timestamp', header: 'Data/Hora', render: (row: any) => <span className="text-xs text-slate-500">{formatDateTime(row.timestamp)}</span> },
    { key: 'user', header: 'Usuário', render: (row: any) => <span className="text-sm text-white font-medium">{row.user}</span> },
    { key: 'action', header: 'Ação', render: (row: any) => <span className="text-sm text-slate-300">{row.action}</span> },
    { key: 'target', header: 'Alvo', render: (row: any) => <span className="text-xs text-slate-400">{row.target}</span> },
    { key: 'ip', header: 'IP', render: (row: any) => <span className="text-xs font-mono text-slate-500">{row.ip}</span> },
    { key: 'severity', header: '', render: (row: any) => (<Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', row.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : row.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>{row.severity}</Badge>) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-500/20 to-gray-500/10 flex items-center justify-center border border-slate-500/10"><Shield className="w-5 h-5 text-slate-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Logs de Auditoria</h1><p className="text-xs text-slate-500 hidden sm:block">Registro de todas as ações administrativas</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar logs..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"><ResponsiveTable columns={columns} data={filtered} /></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
