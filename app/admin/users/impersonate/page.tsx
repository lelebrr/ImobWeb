'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  ArrowRight,
  RefreshCw,
  Key,
  Building2,
  AlertTriangle,
  UserCheck,
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
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const roleColors: Record<string, string> = {
  PLATFORM_MASTER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  PLATFORM_FINANCE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PLATFORM_MARKETING: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  PLATFORM_SUPPORT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  AGENCY_MASTER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  AGENCY_SALES: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CORRETOR: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminUsersImpersonatePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleImpersonate = async () => {
    if (!selectedUser) return;
    setImpersonating(true);
    try {
      const res = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url || '/dashboard';
      } else {
        alert('Erro ao iniciar impersonificação. Verifique as permissões.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao tentar impersonificar.');
    } finally {
      setImpersonating(false);
      setShowConfirm(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Usuário',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-indigo-500/10">
            <span className="text-xs font-bold text-indigo-400">
              {(row.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{row.name}</p>
            <p className="text-xs text-slate-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: any) => (
        <Badge className={cn('text-[10px] font-bold border px-2.5 py-0.5', roleColors[row.role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: 'organization',
      header: 'Organização',
      render: (row: any) => (
        <span className="text-sm text-slate-400">{row.organization?.name || '—'}</span>
      ),
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
      key: 'actions',
      header: '',
      render: (row: any) => (
        <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl"
          onClick={() => { setSelectedUser(row); setShowConfirm(true); }}>
          <Key className="w-3 h-3 mr-1" /> Acessar
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
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Acessar como Usuário</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Impersonificar usuários para suporte e auditoria</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchUsers} className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-xs">Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Atenção</p>
              <p className="text-xs text-amber-300/60 mt-0.5">
                Você está prestes a acessar o sistema como outro usuário. Todas as ações realizadas serão registradas em log de auditoria. Use este recurso apenas para suporte e diagnóstico.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/30 focus:ring-indigo-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-11 px-4 rounded-xl border border-white/5 bg-white/5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="" className="bg-[#12121a]">Todas as roles</option>
              {['PLATFORM_MASTER', 'PLATFORM_FINANCE', 'PLATFORM_MARKETING', 'PLATFORM_SUPPORT',
                'AGENCY_MASTER', 'AGENCY_SALES', 'AGENCY_HR', 'AGENCY_MARKETING',
                'AGENCY_FINANCE', 'AGENCY_SUPPORT',
                'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE',
              ].map((r) => (
                <option key={r} value={r} className="bg-[#12121a]">{r}</option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              {loading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : users.length > 0 ? (
                <ResponsiveTable columns={columns} data={users} />
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AdaptiveModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setSelectedUser(null); }}
        title="Confirmar Acesso"
      >
        {selectedUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/10">
                <UserCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-lg">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <Badge className={cn('mt-1 text-[10px] font-bold border px-2.5 py-0.5', roleColors[selectedUser.role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
                  {selectedUser.role}
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/70">
                Você acessará o sistema como <strong>{selectedUser.name}</strong> com todas as permissões e restrições desse usuário. Para retornar à sua conta, faça logout.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
                onClick={handleImpersonate}
                disabled={impersonating}
              >
                {impersonating ? 'Acessando...' : 'Acessar como este usuário'}
              </Button>
              <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => setShowConfirm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </AdaptiveModal>
    </div>
  );
}
