'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Search, ArrowRight, RefreshCw, Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };
const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

export default function AdminOrgsSuspendedPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrgs = useCallback(async () => {
    try { setLoading(true); const params = new URLSearchParams(); if (search) params.set('search', search); params.set('status', 'INATIVO'); const res = await fetch(`/api/admin/organizations?${params}`); if (res.ok) { const data = await res.json(); setOrgs(data.organizations || []); } } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [search]);
  useEffect(() => { const timer = setTimeout(fetchOrgs, 300); return () => clearTimeout(timer); }, [fetchOrgs]);

  const handleActivate = async (orgId: string) => {
    setActionLoading(true);
    try { const res = await fetch(`/api/admin/organizations/${orgId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ATIVO' }) }); if (res.ok) { setOrgs((prev) => prev.filter((o) => o.id !== orgId)); setSelectedOrg(null); setShowDetail(false); } } catch (err) { console.error(err); } finally { setActionLoading(false); }
  };

  const columns = [
    { key: 'name', header: 'Organização', render: (row: any) => (<div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center shrink-0 border border-red-500/10"><Building2 className="w-4 h-4 text-red-400" /></div><div className="min-w-0"><p className="font-semibold text-sm text-white truncate">{row.name}</p><p className="text-xs text-slate-500 truncate">{row.email || 'Sem email'}</p></div></div>) },
    { key: 'planType', header: 'Plano', render: (row: any) => <span className="text-sm text-slate-400">{row.planType || '—'}</span> },
    { key: 'userCount', header: 'Usuários', render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.userCount || 0}</span> },
    { key: 'createdAt', header: 'Suspenso em', render: (row: any) => <span className="text-xs text-slate-500">{row.updatedAt ? formatDate(row.updatedAt) : formatDate(row.createdAt)}</span> },
    { key: 'actions', header: '', render: (row: any) => (<div className="flex gap-1"><Button variant="ghost" size="sm" className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl" onClick={() => handleActivate(row.id)} disabled={actionLoading}>Reativar</Button><Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-xl" onClick={() => { setSelectedOrg(row); setShowDetail(true); }}>Detalhes</Button></div>) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center border border-red-500/10"><Ban className="w-5 h-5 text-red-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Suspender / Bloquear</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar imobiliárias suspensas ou bloquear acesso</p></div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchOrgs} className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline text-xs">Atualizar</span></Button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar por nome, CNPJ, email..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-red-500/30 focus:ring-red-500/20" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {loading ? (<div className="p-5 space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>) : orgs.length > 0 ? <ResponsiveTable columns={columns} data={orgs} /> : (<div className="p-12 text-center"><Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500 text-sm">Nenhuma imobiliária suspensa</p></div>)}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
