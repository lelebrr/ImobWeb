'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../design-system/card';
import { Button } from '../design-system/button';
import { Badge } from '@radix-ui/react-badge'; // Fallback if internal Badge not found
import { Activity, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { SyncStatus } from '../../types/portals';

interface PortalStatusCardProps {
  name: string;
  type: string;
  status: SyncStatus;
  lastSync?: string;
  activeAnnouncements: number;
  errorCount: number;
  onSync: () => void;
}

/**
 * Componente Premium para exibir o status de integração de um portal
 * Design inspirado em dashboards SaaS de alta performance.
 */
export const PortalStatusCard: React.FC<PortalStatusCardProps> = ({
  name,
  type,
  status,
  lastSync,
  activeAnnouncements,
  errorCount,
  onSync
}) => {
  const isSyncing = status === 'SYNCING';

  return (
    <Card className="relative overflow-hidden border-2 transition-all hover:border-primary/50">
      {isSyncing && (
        <motion.div
          className="absolute top-0 left-0 h-1 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
          <CardDescription className="text-xs uppercase tracking-wider">{type}</CardDescription>
        </div>
        <div className="flex flex-col items-end">
          {status === 'SUCCESS' && (
            <div className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 size={16} />
              <span className="text-xs font-semibold">Conectado</span>
            </div>
          )}
          {status === 'ERROR' && (
            <div className="flex items-center gap-1 text-red-500">
              <AlertCircle size={16} />
              <span className="text-xs font-semibold">Erro de Sync</span>
            </div>
          )}
          {isSyncing && (
            <div className="flex items-center gap-1 text-blue-500">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-xs font-semibold">Sincronizando...</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col p-3 rounded-lg bg-secondary/30">
            <span className="text-xs text-muted-foreground uppercase font-medium">Anúncios Ativos</span>
            <span className="text-2xl font-bold">{activeAnnouncements}</span>
          </div>
          <div className="flex flex-col p-3 rounded-lg bg-secondary/30">
            <span className="text-xs text-muted-foreground uppercase font-medium">Erros</span>
            <span className="text-2xl font-bold text-red-400">{errorCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity size={14} />
            <span>Última sync: {lastSync || 'Nunca'}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <ExternalLink size={14} />
              Ver no Portal
            </Button>
            <Button 
              onClick={onSync} 
              disabled={isSyncing} 
              size="sm" 
              className="h-8 gap-1 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              Forçar Sync
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
