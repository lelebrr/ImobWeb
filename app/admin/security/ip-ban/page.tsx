'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldOff, Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }
const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const blockedIPs = [
  { id: '1', ip: '45.33.32.156', reason: 'Múltiplas tentativas de login', blockedAt: '2026-07-15', blockedBy: 'Sistema', attempts: 47 },
  { id: '2', ip: '103.235.46.12', reason: 'Ataque de força bruta', blockedAt: '2026-07-10', blockedBy: 'Admin Master', attempts: 230 },
  { id: '3', ip: '78.46.89.201', reason: 'Bloqueio manual', blockedAt: '2026-06-28', blockedBy: 'Admin Master', attempts: 12 },
];

export default function SecurityIPBanPage() {
  const [search, setSearch] = useState('');
  const filtered = blockedIPs.filter(b => b.ip.includes(search));

  const columns = [
    { key: 'ip', header: 'IP', render: (row: any) => <span className="text-sm font-mono text-white font-medium">{row.ip}</span> },
    { key: 'reason', header: 'Motivo', render: (row: any) => <span className="text-sm text-slate-300">{row.reason}</span> },
    { key: 'attempts', header: 'Tentativas', render: (row: any) => <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-red-500/10 text-red-400 border-red-500/20">{row.attempts}</Badge> },
    { key: 'blockedAt', header: 'Bloqueado em', render: (row: any) => <span className="text-xs text-slate-500">{formatDate(row.blockedAt)}</span> },
    { key: 'blockedBy', header: 'Bloqueado por', render: (row: any) => <span className="text-xs text-slate-400">{row.blockedBy}</span> },
    { key: 'actions', header: '', render: (row: any) => (<Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 rounded-xl"><Trash2 className="w-3 h-3 mr-1" />Remover</Button>) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center border border-red-500/10"><ShieldOff className="w-5 h-5 text-red-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Bloqueio de IP</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar endereços IP bloqueados</p></div>
            </div>
            <Button size="sm" className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold"><Plus className="w-3.5 h-3.5 mr-1" />Bloquear IP</Button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar IP..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"><ResponsiveTable columns={columns} data={filtered} /></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
