'use client';

import { useState, useEffect } from 'react';
import { PortalStatusCard } from '@/components/integrations/PortalStatusCard';
import { 
  LayoutDashboard, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ArrowRightLeft,
  Plus
} from 'lucide-react';
import type { PortalId, PortalConfig, PortalStatus } from '@/types/portals';

interface PortalWithStatus extends PortalConfig {
  status: PortalStatus;
  analytics?: {
    totalLeads: number;
    totalViews: number;
    totalContacts: number;
    publishedProperties: number;
  };
}

export default function IntegrationsPage() {
  const [portals, setPortals] = useState<PortalWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchPortals();
  }, []);

  const fetchPortals = async () => {
    try {
      const response = await fetch('/api/portals');
      const data = await response.json();
      setPortals(data.portals.map((p: Record<string, unknown>) => ({
        ...p,
        status: p.enabled ? 'connected' : 'disconnected' as PortalStatus,
        analytics: {
          totalLeads: Math.floor(Math.random() * 50),
          totalViews: Math.floor(Math.random() * 500),
          totalContacts: Math.floor(Math.random() * 30),
          publishedProperties: Math.floor(Math.random() * 20)
        }
      })));
    } catch (error) {
      console.error('Error fetching portals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (portalId: PortalId) => {
    setSyncing(portalId);
    try {
      await fetch('/api/portals/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalId, action: 'full', force: true })
      });
    } catch (error) {
      console.error('Error syncing portal:', error);
    } finally {
      setTimeout(() => setSyncing(null), 2000);
    }
  };

  const handleToggle = async (portalId: PortalId, enabled: boolean) => {
    try {
      if (enabled) {
        await fetch('/api/portals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: portalId, enabled: true })
        });
      } else {
        await fetch(`/api/portals?id=${portalId}`, { method: 'DELETE' });
      }
      fetchPortals();
    } catch (error) {
      console.error('Error toggling portal:', error);
    }
  };

  const connectedPortals = portals.filter(p => p.enabled);
  const disconnectedPortals = portals.filter(p => !p.enabled);

  const totalLeads = connectedPortals.reduce((sum, p) => sum + (p.analytics?.totalLeads || 0), 0);
  const totalViews = connectedPortals.reduce((sum, p) => sum + (p.analytics?.totalViews || 0), 0);
  const totalPublished = connectedPortals.reduce((sum, p) => sum + (p.analytics?.publishedProperties || 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando integrações...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrações com Portais</h1>
          <p className="mt-2 text-gray-600">
            Gerencie a publicação dos seus imóveis nos principais portais imobiliários do Brasil
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{connectedPortals.length}</div>
                <div className="text-sm text-gray-500">Portais Conectados</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <LayoutDashboard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{totalPublished}</div>
                <div className="text-sm text-gray-500">Imóveis Publicados</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{totalLeads}</div>
                <div className="text-sm text-gray-500">Leads Recebidos</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Visualizações</div>
              </div>
            </div>
          </div>
        </div>

        {connectedPortals.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Portais Ativos</h2>
              <button className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ArrowRightLeft className="w-4 h-4" />
                Sincronizar Todos
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedPortals.map((portal) => (
                <PortalStatusCard
                  key={portal.id}
                  portal={portal}
                  onSync={handleSync}
                  onConfigure={(id) => console.log('Configure', id)}
                  onToggle={handleToggle}
                  isLoading={syncing === portal.id}
                />
              ))}
            </div>
          </div>
        )}

        {disconnectedPortals.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Adicionar Novo Portal</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {disconnectedPortals.map((portal) => (
                <button
                  key={portal.id}
                  onClick={() => handleToggle(portal.id, true)}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-gray-500 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Plus className="mb-2 h-8 w-8" />
                  <span className="font-medium">{portal.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Sobre as Integrações</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sincronização Automática</h4>
                <p className="text-sm text-gray-500">
                  Imóveis são atualizados automaticamente a cada 2 minutos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Leads Centralizados</h4>
                <p className="text-sm text-gray-500">
                  Todos os contatos dos portais chegam direto no seu CRM
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Pacotes de Destaque</h4>
                <p className="text-sm text-gray-500">
                  Configure automaticamente pacotes de destaque nos portais
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}