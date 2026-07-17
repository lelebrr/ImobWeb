'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const installations = [
  { org: 'Imobiliária ABC', apps: ['Assistente IA', 'Cloud Backup', 'Multi Portal Sync'], count: 3, total: 'R$ 19/mês' },
  { org: 'Construtora XYZ', apps: ['Assistente IA', 'Multi Portal Sync'], count: 2, total: 'Grátis' },
  { org: 'Imobiliária Modelo', apps: ['Assistente IA', 'Cloud Backup', 'WhatsApp Pro', 'BI Avançado'], count: 4, total: 'R$ 87/mês' },
  { org: 'Grupo Lopes', apps: ['Assistente IA'], count: 1, total: 'Grátis' },
];

export default function MarketplaceInstallationsPage() {
  const [search, setSearch] = useState('');
  const filtered = installations.filter(i => i.org.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'org', header: 'Imobiliária', render: (row: any) => (<div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-500" /><span className="text-sm text-white font-medium">{row.org}</span></div>) },
    { key: 'count', header: 'Apps Instalados', render: (row: any) => <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{row.count}</Badge> },
    { key: 'apps', header: 'Aplicativos', render: (row: any) => <span className="text-xs text-slate-400">{row.apps.join(', ')}</span> },
    { key: 'total', header: 'Custo Total', render: (row: any) => <span className="text-sm font-semibold text-white">{row.total}</span> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center border border-orange-500/10"><Package className="w-5 h-5 text-orange-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Instalações por Tenant</h1><p className="text-xs text-slate-500 hidden sm:block">Apps instalados por imobiliária</p></div>
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
