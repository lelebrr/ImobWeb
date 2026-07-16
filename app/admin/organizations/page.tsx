'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Search,
  ArrowRight,
  RefreshCw,
  Users,
  Home,
  MapPin,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { AdaptiveModal } from '@/components/ui/AdaptiveModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const planColors: Record<string, string> = {
  PREMIUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CORPORATIVO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DESTAQUE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  BASICO: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrgs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/organizations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.organizations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchOrgs, 300);
    return () => clearTimeout(timer);
  }, [fetchOrgs]);

  const handleStatusChange = async (orgId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrgs((prev) => prev.map((o) => (o.id === orgId ? { ...o, status: newStatus } : o)));
        if (selectedOrg?.id === orgId) setSelectedOrg((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Organização',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-indigo-500/10">
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{row.name}</p>
            <p className="text-xs text-slate-500 truncate">{row.email || 'Sem email'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'planType',
      header: 'Plano',
      render: (row: any) => (
        <Badge className={cn('text-[10px] font-bold border px-2.5 py-0.5', planColors[row.planType] || 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
          {row.planType || 'SEM PLANO'}
        </Badge>
      ),
    },
    {
      key: 'userCount',
      header: 'Usuários',
      render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.userCount || 0}</span>,
    },
    {
      key: 'propertyCount',
      header: 'Imóveis',
      render: (row: any) => <span className="text-sm font-medium text-slate-300">{row.propertyCount || 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => (
        <Badge className={cn(
          'text-[10px] font-bold border px-2.5 py-0.5',
          row.status === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        )}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Criado',
      render: (row: any) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl"
          onClick={() => { setSelectedOrg(row); setShowDetail(true); }}>
          Detalhes <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Organizações</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Gerenciar todas as imobiliárias da plataforma</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchOrgs} className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-xs">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar por nome, CNPJ, email ou cidade..."
                className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/30 focus:ring-indigo-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['', 'ATIVO', 'INATIVO'].map((s) => (
                <Button
                  key={s}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-xl text-xs border transition-all',
                    statusFilter === s
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'text-slate-400 border-white/5 hover:bg-white/5'
                  )}
                  onClick={() => setStatusFilter(s)}
                >
                  {s || 'Todos'}
                </Button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {loading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : orgs.length > 0 ? (
                <ResponsiveTable columns={columns} data={orgs} />
              ) : (
                <div className="p-12 text-center">
                  <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Nenhuma organização encontrada</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AdaptiveModal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedOrg(null); }}
        title={selectedOrg?.name || 'Detalhes'}
      >
        {selectedOrg && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/10">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-lg">{selectedOrg.name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrg.email || 'Sem email'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Plano', value: selectedOrg.planType || 'Sem plano' },
                { label: 'Status', value: selectedOrg.status },
                { label: 'Usuários', value: selectedOrg.userCount || 0 },
                { label: 'Imóveis', value: selectedOrg.propertyCount || 0 },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.label}</p>
                  <p className="text-sm font-bold mt-1">{item.value}</p>
                </div>
              ))}
              {selectedOrg.city && (
                <div className="p-3 rounded-xl bg-muted/30 col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Localização</p>
                  <p className="text-sm font-bold mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {selectedOrg.city}{selectedOrg.state ? `, ${selectedOrg.state}` : ''}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              {selectedOrg.status === 'ATIVO' ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs text-red-400 border-red-500/20 hover:bg-red-500/10"
                  onClick={() => handleStatusChange(selectedOrg.id, 'INATIVO')}
                  disabled={actionLoading}
                >
                  Suspender
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                  onClick={() => handleStatusChange(selectedOrg.id, 'ATIVO')}
                  disabled={actionLoading}
                >
                  Ativar
                </Button>
              )}
              <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => setShowDetail(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </AdaptiveModal>
    </div>
  );
}
