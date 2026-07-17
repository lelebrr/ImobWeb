'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }
const formatDateTime = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const auditLogs = [
  { id: '1', user: 'Admin Master', action: 'Alterou configuração global', target: 'Feature Flags', timestamp: '2026-07-17T15:00:00', severity: 'warning' },
  { id: '2', user: 'Admin Master', action: 'Excluiu usuário', target: 'fulano@test.com', timestamp: '2026-07-17T14:00:00', severity: 'critical' },
  { id: '3', user: 'Sistema', action: 'Backup automático', target: 'backup-diario.sql', timestamp: '2026-07-17T03:00:00', severity: 'info' },
];

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const filtered = auditLogs.filter(l => l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'timestamp', header: 'Data', render: (r: any) => <span className="text-xs text-slate-500">{formatDateTime(r.timestamp)}</span> },
    { key: 'user', header: 'Usuário', render: (r: any) => <span className="text-sm text-white font-medium">{r.user}</span> },
    { key: 'action', header: 'Ação', render: (r: any) => <span className="text-sm text-slate-300">{r.action}</span> },
    { key: 'target', header: 'Alvo', render: (r: any) => <span className="text-xs text-slate-400">{r.target}</span> },
    { key: 'severity', header: '', render: (r: any) => (<Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', r.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : r.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>{r.severity}</Badge>) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center border border-red-500/10"><Shield className="w-5 h-5 text-red-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Auditoria</h1><p className="text-xs text-slate-500 hidden sm:block">Registro completo de auditoria</p></div>
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
