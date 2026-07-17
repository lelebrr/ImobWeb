'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Search, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const partners = [
  { id: '1', name: 'Partner Sul Ltda', email: 'contato@partnersul.com.br', phone: '(51) 99999-0001', clients: 12, status: 'active', commission: '15%' },
  { id: '2', name: 'Conecta Imóveis', email: 'admin@conectaimoveis.com', phone: '(21) 98888-0002', clients: 8, status: 'active', commission: '12%' },
  { id: '3', name: 'Rede ImobNet', email: 'suporte@imobnet.com.br', phone: '(11) 97777-0003', clients: 5, status: 'inactive', commission: '10%' },
];

export default function PartnersPage() {
  const [search, setSearch] = useState('');
  const filtered = partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'name', header: 'Parceiro', render: (row: any) => <span className="text-sm text-white font-medium">{row.name}</span> },
    { key: 'email', header: 'Email', render: (row: any) => (<div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-500" /><span className="text-xs text-slate-400">{row.email}</span></div>) },
    { key: 'clients', header: 'Clientes', render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.clients}</span> },
    { key: 'commission', header: 'Comissão', render: (row: any) => <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{row.commission}</Badge> },
    { key: 'status', header: 'Status', render: (row: any) => (<Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', row.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>{row.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><Handshake className="w-5 h-5 text-indigo-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Lista de Parceiros</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar parceiros e revendas</p></div>
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
