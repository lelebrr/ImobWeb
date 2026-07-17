'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Search, ArrowRight, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };
const formatDate = (d: string | Date) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
const planColors: Record<string, string> = { PREMIUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20', CORPORATIVO: 'bg-blue-500/10 text-blue-400 border-blue-500/20', DESTAQUE: 'bg-amber-500/10 text-amber-400 border-amber-500/20', BASICO: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

export default function AdminOrgsActivePage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const fetchOrgs = useCallback(async () => {
    try { setLoading(true); const params = new URLSearchParams(); if (search) params.set('search', search); params.set('status', 'ATIVO'); const res = await fetch(`/api/admin/organizations?${params}`); if (res.ok) { const data = await res.json(); setOrgs(data.organizations || []); } } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [search]);
  useEffect(() => { const timer = setTimeout(fetchOrgs, 300); return () => clearTimeout(timer); }, [fetchOrgs]);

  const columns = [
    { key: 'name', header: 'Organização', render: (row: any) => (<div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center shrink-0 border border-emerald-500/10"><Building2 className="w-4 h-4 text-emerald-400" /></div><div className="min-w-0"><p className="font-semibold text-sm text-white truncate">{row.name}</p><p className="text-xs text-slate-500 truncate">{row.email || 'Sem email'}</p></div></div>) },
    { key: 'planType', header: 'Plano', render: (row: any) => (<Badge className={cn('text-[10px] font-bold border px-2.5 py-0.5', planColors[row.planType] || 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>{row.planType || 'SEM PLANO'}</Badge>) },
    { key: 'userCount', header: 'Usuários', render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.userCount || 0}</span> },
    { key: 'propertyCount', header: 'Imóveis', render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.propertyCount || 0}</span> },
    { key: 'createdAt', header: 'Criado', render: (row: any) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Imobiliárias Ativas</h1><p className="text-xs text-slate-500 hidden sm:block">Imobiliárias com status ativo na plataforma</p></div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchOrgs} className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5"><RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline text-xs">Atualizar</span></Button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar por nome, CNPJ, email..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-emerald-500/30 focus:ring-emerald-500/20" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {loading ? (<div className="p-5 space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />)}</div>) : orgs.length > 0 ? <ResponsiveTable columns={columns} data={orgs} /> : (<div className="p-12 text-center"><Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" /><p className="text-slate-500 text-sm">Nenhuma imobiliária ativa encontrada</p></div>)}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
