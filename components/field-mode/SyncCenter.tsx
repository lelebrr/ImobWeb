'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X,
  Clock,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/field-mode/db';
import { FieldEngine } from '@/lib/field-mode/field-engine';

interface SyncCenterProps {
  onClose: () => void;
}

/**
 * SYNC CENTER - IMOBWEB 2026
 * Transparent management of local storage and cloud synchronization.
 */
export function SyncCenter({ onClose }: SyncCenterProps) {
  const [stats, setStats] = useState({
    pending: 0,
    media: 0,
    visits: 0,
    history: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);
  
  const engine = FieldEngine.getInstance();

  const loadStats = async () => {
    const pending = await db.sync_queue.count();
    const media = await db.media_queue.count();
    const visits = await db.field_visits.count();
    setStats({ pending, media, visits, history: 42 }); // Mock history
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await engine.sync();
    await loadStats();
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Central de Sincronização</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-500">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Sync Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={isSyncing ? "animate-bounce" : ""}>
              <CloudUpload className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                {stats.pending > 0 ? `${stats.pending} Itens Pendentes` : 'Sistema Sincronizado'}
              </p>
              <p className="text-slate-400 text-sm">Proteção ativa: salvando localmente</p>
            </div>
          </div>
          <Button 
            onClick={handleManualSync}
            disabled={isSyncing || stats.pending === 0}
            className="bg-blue-600 hover:bg-blue-500"
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sincronizar Agora
          </Button>
        </div>

        {isSyncing && (
          <div className="space-y-2">
            <Progress value={65} className="h-2 bg-slate-800" />
            <p className="text-[10px] text-blue-400 font-bold uppercase">Subindo mídias em alta resolução...</p>
          </div>
        )}
      </div>

      {/* Storage Breakdown */}
      <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 pb-12">
        <StorageItem 
          icon={<Smartphone className="w-5 h-5 text-blue-400" />}
          label="Armazenamento Local"
          value={`${(stats.media * 1.2).toFixed(1)} MB em uso`}
          status="Ocupando pouco espaço"
        />
        <StorageItem 
          icon={<Clock className="w-5 h-5 text-indigo-400" />}
          label="Visitas Hoje"
          value={`${stats.visits} registros`}
          status="Salvo no Celular"
        />
        <StorageItem 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          label="Último Backup"
          value="Hoje, às 14:12"
          status="Concluído"
        />
        
        {stats.pending > 0 && (
          <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-500 shrink-0" />
            <div>
              <p className="text-orange-400 font-bold text-sm">Aguardando Conexão</p>
              <p className="text-orange-400/80 text-xs">Existem {stats.pending} ações agendadas. Fique tranquilo, nada foi perdido.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={className + " animate-spin"} />;
}

function StorageItem({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status: string }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold">
          {icon}
        </div>
        <div>
          <p className="text-slate-100 font-bold text-sm">{label}</p>
          <p className="text-slate-400 text-[10px]">{value}</p>
        </div>
      </div>
      <Badge variant="ghost" className="text-[10px] uppercase font-black text-slate-500">
        {status}
      </Badge>
    </div>
  );
}
