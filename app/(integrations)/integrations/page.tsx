'use client';

import React, { useState, useEffect } from 'react';
import { PortalStatusCard } from '@/components/integrations/PortalStatusCard';
import { 
  LayoutDashboard, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  Activity
} from 'lucide-react';
import { SyncStatus } from '@/types/portals';
import Link from 'next/link';

interface Portal {
  id: string;
  name: string;
  type: string;
  status: string;
  enabled: boolean;
  lastSync?: string;
  announcementsCount?: number;
  errorCount?: number;
}

export default function IntegrationsPage() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    fetchPortals();
  }, []);

  const fetchPortals = async () => {
    try {
      const response = await fetch('/api/portals');
      const data = await response.json();
      setPortals(data.portals || []);
    } catch (error) {
      console.error('Error fetching portals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (portalId: string) => {
    try {
      await fetch('/api/portals/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId, syncAll: true })
      });
      fetchPortals();
    } catch (error) {
      console.error('Error syncing portal:', error);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    // Simulação de sync em série para todos os portais conectos
    const connected = portals.filter(p => p.status === 'ATIVO');
    for (const p of connected) {
      await handleSync(p.id);
    }
    setSyncingAll(false);
  };

  const activePortals = portals.filter(p => p.status === 'ATIVO');
  const availablePortals = portals.filter(p => p.status !== 'ATIVO');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-medium animate-pulse">Carregando painel de integrações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
              Portais Imobiliários
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
              Gerencie a publicação automática em tempo real para os maiores portais do Brasil a partir de um único lugar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/integrations/logs">
              <button className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Activity size={18} className="text-muted-foreground" />
                Logs
              </button>
            </Link>
            <button 
              onClick={handleSyncAll}
              disabled={syncingAll || activePortals.length === 0}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <ArrowRightLeft className={syncingAll ? 'animate-spin' : ''} size={20} />
              Sincronizar Tudo
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            label="Portais Ativos" 
            value={activePortals.length} 
            description="Integrações saudáveis"
          />
          <StatCard 
            icon={<LayoutDashboard className="text-blue-500" />} 
            label="Anúncios Publicados" 
            value={activePortals.reduce((acc, p) => acc + (p.announcementsCount || 0), 0)} 
            description="Sincronizados agora"
          />
          <StatCard 
            icon={<TrendingUp className="text-purple-500" />} 
            label="Leads (Mês)" 
            value={142} // Mocked constant for demo
            description="+12% que mês passado"
          />
          <StatCard 
            icon={<AlertCircle className="text-amber-500" />} 
            label="Erros de Sync" 
            value={activePortals.reduce((acc, p) => acc + (p.errorCount || 0), 0)} 
            description="Requerem atenção"
          />
        </div>

        {/* Portal Grid */}
        <div className="space-y-12">
          {/* Active Portals */}
          <section>
            <h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="text-primary" size={24} />
              Conexões Ativas
            </h2>
            {activePortals.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activePortals.map((portal) => (
                  <div 
                    key={portal.id} 
                    className="group relative bg-zinc-900/10 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-1 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-500"
                  >
                    {/* Sync Pulse Animation */}
                    {portal.status === 'ATIVO' && (
                      <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest leading-none">Live Sync</span>
                      </div>
                    )}
                    <PortalStatusCard
                      name={portal.name}
                      type={portal.type}
                      status={portal.status === 'ATIVO' ? 'SUCCESS' : 'ERROR'}
                      lastSync={portal.lastSync}
                      activeAnnouncements={portal.announcementsCount || 0}
                      errorCount={portal.errorCount || 0}
                      onSync={() => handleSync(portal.id)}
                    />
                  </div>
                ))}
              </div>

            ) : (
              <div className="rounded-2xl border-2 border-dashed p-12 text-center">
                <p className="text-muted-foreground">Nenhuma integração ativa no momento.</p>
              </div>
            )}
          </section>

          {/* Available Portals */}
          <section>
            <h3 className="mb-6 text-xl font-bold flex items-center gap-2 opacity-70">
              <Plus size={20} />
              Disponíveis para Conectar
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {['Zap Imóveis', 'Viva Real', 'OLX', 'ImovelWeb', 'Chaves na Mão', 'VRSync'].map((portalName) => (
                <button
                  key={portalName}
                  className="group flex flex-col items-center justify-center rounded-2xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
                    <Plus className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{portalName}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, description }: { icon: React.ReactNode, label: string, value: number | string, description: string }) {
  return (
    <div className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-tight">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{value}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
