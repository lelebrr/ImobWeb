'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  ArrowRight,
  RefreshCw,
  Building2,
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

const ALL_ROLES = [
  'PLATFORM_MASTER', 'PLATFORM_FINANCE', 'PLATFORM_MARKETING', 'PLATFORM_SUPPORT',
  'AGENCY_MASTER', 'AGENCY_SALES', 'AGENCY_HR', 'AGENCY_MARKETING',
  'AGENCY_FINANCE', 'AGENCY_SUPPORT',
  'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE',
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        if (selectedUser?.id === userId) setSelectedUser((prev: any) => ({ ...prev, role: newRole }));
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
      key: 'lastLogin',
      header: 'Último Login',
      render: (row: any) => (
        <span className="text-xs text-slate-500">{row.lastLogin ? formatDate(row.lastLogin) : 'Nunca'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl"
          onClick={() => { setSelectedUser(row); setShowDetail(true); }}>
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
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/10">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Usuários</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Gerenciar todos os usuários da plataforma</p>
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
              {ALL_ROLES.map((r) => (
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
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedUser(null); }}
        title={selectedUser?.name || 'Detalhes do Usuário'}
      >
        {selectedUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/10">
                <span className="text-lg font-bold text-indigo-400">
                  {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-lg">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Role</p>
                <p className="text-sm font-bold mt-1">{selectedUser.role}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                <p className="text-sm font-bold mt-1">{selectedUser.status}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Organização</p>
                <p className="text-sm font-bold mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {selectedUser.organization?.name || '—'}
                </p>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Alterar Role</p>
              <select
                value={selectedUser.role}
                onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                disabled={actionLoading}
                className="w-full h-11 px-4 rounded-xl border bg-background text-sm"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <Button variant="ghost" size="sm" className="rounded-xl text-xs w-full" onClick={() => setShowDetail(false)}>
              Fechar
            </Button>
          </div>
        )}
      </AdaptiveModal>
    </div>
  );
}
