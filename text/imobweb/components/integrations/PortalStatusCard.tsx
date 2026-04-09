'use client';

import { useState } from 'react';
import { 
  RefreshCw, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  TrendingUp,
  Eye,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortalId, PortalStatus } from '@/types/portals';

interface PortalStatusCardProps {
  portal: {
    id: PortalId;
    name: string;
    enabled: boolean;
    status?: PortalStatus;
    lastSync?: Date;
    lastError?: string;
    syncInterval?: number;
    syncDirection?: string;
    syncFields?: string[];
    autoPublish?: boolean;
    autoDepublish?: boolean;
    supportedFeatures?: {
      highlights: boolean;
      video: boolean;
      '360': boolean;
      leads: boolean;
      analytics: boolean;
    };
    analytics?: {
      totalLeads: number;
      totalViews: number;
      totalContacts: number;
      publishedProperties: number;
    };
  };
  onSync?: (portalId: PortalId) => void;
  onConfigure?: (portalId: PortalId) => void;
  onToggle?: (portalId: PortalId, enabled: boolean) => void;
  isLoading?: boolean;
}

export function PortalStatusCard({
  portal,
  onSync,
  onConfigure,
  onToggle,
  isLoading = false
}: PortalStatusCardProps) {
  const [syncing, setSyncing] = useState(false);

  const getStatusIcon = () => {
    if (syncing || isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    if (!portal.enabled) {
      return <XCircle className="w-5 h-5 text-gray-400" />;
    }
    if (portal.lastError) {
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
    return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (syncing || isLoading) return 'Sincronizando...';
    if (!portal.enabled) return 'Desconectado';
    if (portal.lastError) return 'Erro na sincronização';
    if (portal.lastSync) {
      const minutes = Math.floor((Date.now() - new Date(portal.lastSync).getTime()) / 60000);
      if (minutes < 1) return 'Sincronizado agora';
      if (minutes < 60) return `Há ${minutes}min`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `Há ${hours}h`;
      return `Há ${Math.floor(hours / 24)}d`;
    }
    return 'Aguardando sincronização';
  };

  const getStatusColor = () => {
    if (syncing || isLoading) return 'bg-blue-50 border-blue-200';
    if (!portal.enabled) return 'bg-gray-50 border-gray-200';
    if (portal.lastError) return 'bg-amber-50 border-amber-200';
    return 'bg-green-50 border-green-200';
  };

  const handleSync = async () => {
    setSyncing(true);
    onSync?.(portal.id);
    setTimeout(() => setSyncing(false), 3000);
  };

  const portalLogos: Record<PortalId, string> = {
    zap: '⚡',
    viva: '🏠',
    olx: '📦',
    imovelweb: '🔑',
    chaves: '🏘️',
    meta: '📘',
    vrsync: '🔄'
  };

  return (
    <div className={cn(
      'relative rounded-lg border p-4 transition-all',
      getStatusColor()
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border text-xl">
            {portalLogos[portal.id]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{portal.name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle?.(portal.id, !portal.enabled)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              portal.enabled ? 'bg-green-500' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                portal.enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {portal.enabled && portal.analytics && (
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <div className="rounded bg-white p-2">
            <div className="text-lg font-semibold text-gray-900">
              {portal.analytics.publishedProperties}
            </div>
            <div className="text-xs text-gray-500">Publicados</div>
          </div>
          <div className="rounded bg-white p-2">
            <div className="text-lg font-semibold text-blue-600">
              <Eye className="inline w-3.5 h-3.5 mr-1" />
              {portal.analytics.totalViews}
            </div>
            <div className="text-xs text-gray-500">Visualizações</div>
          </div>
          <div className="rounded bg-white p-2">
            <div className="text-lg font-semibold text-green-600">
              <MessageCircle className="inline w-3.5 h-3.5 mr-1" />
              {portal.analytics.totalLeads}
            </div>
            <div className="text-xs text-gray-500">Leads</div>
          </div>
          <div className="rounded bg-white p-2">
            <div className="text-lg font-semibold text-purple-600">
              <TrendingUp className="inline w-3.5 h-3.5 mr-1" />
              {portal.analytics.totalContacts}
            </div>
            <div className="text-xs text-gray-500">Contatos</div>
          </div>
        </div>
      )}

      {portal.enabled && portal.supportedFeatures && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {portal.supportedFeatures.highlights && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
              Destaques
            </span>
          )}
          {portal.supportedFeatures.video && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              Vídeo
            </span>
          )}
          {portal.supportedFeatures['360'] && (
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
              Tour 360°
            </span>
          )}
        </div>
      )}

      {portal.lastError && (
        <div className="mt-3 rounded bg-red-50 p-2 text-sm text-red-600">
          {portal.lastError}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleSync}
          disabled={syncing || !portal.enabled}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            portal.enabled 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', syncing && 'animate-spin')} />
          Sincronizar
        </button>
        
        <button
          onClick={() => onConfigure?.(portal.id)}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
          Configurar
        </button>
      </div>
    </div>
  );
}