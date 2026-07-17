'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  Fingerprint,
  AlertTriangle,
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

const formatDateTime = (d: string | Date) =>
  new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminUsersSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const activeUsers = (data.users || [])
          .filter((u: any) => u.lastLogin)
          .sort((a: any, b: any) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
          .slice(0, 50)
          .map((u: any) => ({
            ...u,
            sessionId: `sess_${u.id}`,
            ip: '***.***.***.***',
            device: 'Desconhecido',
            browser: '—',
            location: '—',
            isActive: new Date(u.lastLogin).getTime() > Date.now() - 30 * 60 * 1000,
          }));
        setSessions(activeUsers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const columns = [
    {
      key: 'name',
      header: 'Usuário',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0 border border-cyan-500/10">
            <span className="text-xs font-bold text-cyan-400">
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
      key: 'lastLogin',
      header: 'Última Atividade',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-400">{formatDateTime(row.lastLogin)}</span>
        </div>
      ),
    },
    {
      key: 'device',
      header: 'Dispositivo',
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-400">{row.device}</span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Localização',
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs text-slate-400">{row.location}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            row.isActive ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-600'
          )} />
          <span className="text-xs font-medium text-slate-400">
            {row.isActive ? 'Ativo agora' : 'Inativo'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl"
          onClick={() => { setSelectedSession(row); setShowDetail(true); }}>
          Detalhes
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
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/10">
                <Fingerprint className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Sessões Ativas</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Monitorar sessões de usuários em tempo real</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchSessions} className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
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
                className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/30 focus:ring-cyan-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
              ) : sessions.length > 0 ? (
                <ResponsiveTable columns={columns} data={sessions} />
              ) : (
                <div className="p-12 text-center">
                  <Fingerprint className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Nenhuma sessão ativa encontrada</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AdaptiveModal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedSession(null); }}
        title={selectedSession?.name || 'Detalhes da Sessão'}
      >
        {selectedSession && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/10">
                <span className="text-lg font-bold text-cyan-400">
                  {(selectedSession.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-lg">{selectedSession.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSession.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sessão</p>
                <p className="text-xs font-mono font-bold mt-1 truncate">{selectedSession.sessionId}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dispositivo</p>
                <p className="text-sm font-bold mt-1">{selectedSession.device}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Última Atividade</p>
                <p className="text-sm font-bold mt-1">{formatDateTime(selectedSession.lastLogin)}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                <Badge className={cn(
                  'text-[10px] font-bold px-2.5 py-0.5 mt-1',
                  selectedSession.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                )}>
                  {selectedSession.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Localização</p>
                <p className="text-sm font-bold mt-1">{selectedSession.location}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/70">
                Os dados de sessão são aproximados com base no último login. Para monitoramento preciso em tempo real, integre um serviço de sessões como Redis ou Supabase Realtime.
              </p>
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
