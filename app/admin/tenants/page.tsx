'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function AdminTenantsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrgs = useCallback(async () => {
    try { setLoading(true); const params = new URLSearchParams(); if (search) params.set('search', search); const res = await fetch(`/api/admin/organizations?${params}`); if (res.ok) { const data = await res.json(); setOrgs(data.organizations || []); } } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  const columns = [
    { key: 'name', header: 'Imobiliária', render: (row: any) => <span className="text-sm text-white font-medium">{row.name}</span> },
    { key: 'planType', header: 'Plano', render: (row: any) => <span className="text-sm text-slate-400">{row.planType || '—'}</span> },
    { key: 'userCount', header: 'Usuários', render: (row: any) => <span className="text-sm text-slate-300">{row.userCount || 0}</span> },
    { key: 'status', header: 'Status', render: (row: any) => <span className="text-xs text-slate-500">{row.status}</span> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><Building2 className="w-5 h-5 text-indigo-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Tenants</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar tenants da plataforma</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar tenant..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {loading ? <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />)}</div> : <ResponsiveTable columns={columns} data={orgs} />}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
