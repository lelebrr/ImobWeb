'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

const tenants = [
  { id: '1', name: 'Imobiliária ABC', plan: 'Premium', status: 'active', users: 12, since: 'Jan/2025' },
  { id: '2', name: 'Construtora XYZ', plan: 'Corporativo', status: 'active', users: 8, since: 'Mar/2025' },
  { id: '3', name: 'Imobiliária Modelo', plan: 'Destaque', status: 'active', users: 5, since: 'Jun/2025' },
];

export default function PartnerTenantsPage() {
  const columns = [
    { key: 'name', header: 'Cliente', render: (r: any) => <span className="text-sm text-white font-medium">{r.name}</span> },
    { key: 'plan', header: 'Plano', render: (r: any) => <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{r.plan}</Badge> },
    { key: 'users', header: 'Usuários', render: (r: any) => <span className="text-sm text-slate-300">{r.users}</span> },
    { key: 'since', header: 'Cliente desde', render: (r: any) => <span className="text-xs text-slate-500">{r.since}</span> },
    { key: 'status', header: 'Status', render: (r: any) => <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Ativo</Badge> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><Building2 className="w-5 h-5 text-indigo-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Meus Clientes</h1><p className="text-xs text-slate-500 hidden sm:block">Clientes indicados por você</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden"><ResponsiveTable columns={columns} data={tenants} /></motion.div>
      </div>
    </div>
  );
}
