'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const nodes = [
  { id: 'wa-1', org: 'Imobiliária ABC', phone: '(51) 99999-0001', status: 'connected', messages: '12.450', lastSync: '2026-07-17 14:30' },
  { id: 'wa-2', org: 'Construtora XYZ', phone: '(21) 98888-0002', status: 'disconnected', messages: '3.210', lastSync: '2026-07-15 09:12' },
  { id: 'wa-3', org: 'Imobiliária Modelo', phone: '(11) 97777-0003', status: 'connecting', messages: '0', lastSync: '—' },
];

export default function IntegrationsWhatsAppPage() {
  const [search, setSearch] = useState('');
  const filtered = nodes.filter(n => n.org.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'org', header: 'Imobiliária', render: (row: any) => <span className="text-sm text-white font-medium">{row.org}</span> },
    { key: 'phone', header: 'Telefone', render: (row: any) => <span className="text-xs text-slate-400">{row.phone}</span> },
    { key: 'messages', header: 'Mensagens', render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.messages}</span> },
    { key: 'lastSync', header: 'Última Sincronia', render: (row: any) => <span className="text-xs text-slate-500">{row.lastSync}</span> },
    { key: 'status', header: 'Status', render: (row: any) => (<Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', row.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : row.status === 'connecting' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>{row.status === 'connected' ? 'Conectado' : row.status === 'connecting' ? 'Conectando' : 'Desconectado'}</Badge>) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><MessageSquare className="w-5 h-5 text-emerald-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Nodes de WhatsApp</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar conexões WhatsApp das imobiliárias</p></div>
            </div>
            <Button size="sm" className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-semibold"><Plus className="w-3.5 h-3.5 mr-1" />Novo Node</Button>
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
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"><ResponsiveTable columns={columns} data={filtered} /></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
