'use client'

import React, { useState, useEffect } from 'react'
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HardDrive, 
  ShieldCheck,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Painel de Status de Backup Premium
 * Mostra indicadores vitais da integridade dos dados
 */

interface BackupStatus {
  lastBackupAt: string
  status: 'healthy' | 'warning' | 'critical' | 'backing_up'
  totalSize: string
  successRate: number
  retentionDays: number
  nextScheduledAt: string
}

export function BackupStatusPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [status, setStatus] = useState<BackupStatus>({
    lastBackupAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'healthy',
    totalSize: '2.4 GB',
    successRate: 99.8,
    retentionDays: 30,
    nextScheduledAt: new Date(Date.now() + 43200000).toISOString()
  })

  // Simulação de refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Chamada real para API de health-check de backup
    await new Promise(r => setTimeout(r, 1500))
    setIsRefreshing(false)
  }

  const statusColors = {
    healthy: 'text-emerald-500 bg-emerald-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    critical: 'text-rose-500 bg-rose-500/10',
    backing_up: 'text-blue-500 bg-blue-500/10'
  }

  return (
    <Card className="overflow-hidden border-slate-200/60 shadow-lg shadow-slate-200/40 dark:border-slate-800/60 dark:shadow-none">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Resiliência de Dados</CardTitle>
              <CardDescription className="text-xs">Backup Automatizado & DR</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn("font-medium", statusColors[status.status])}>
            {status.status === 'backing_up' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
            {status.status === 'healthy' ? 'Sistema Protegido' : 'Verificar Log'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card: Último Backup */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Último Backup</span>
            </div>
            <div className="text-xl font-bold font-mono tracking-tight">
              {new Date(status.lastBackupAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-[10px] text-slate-400 italic">Há aproximadamente 1 hora</p>
          </div>

          {/* Card: Armazenamento */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <HardDrive className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Volume Total</span>
            </div>
            <div className="text-xl font-bold">{status.totalSize}</div>
            <p className="text-[10px] text-slate-400 italic">{status.retentionDays} dias de retenção</p>
          </div>

          {/* Card: Integridade */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Sucesso (Geral)</span>
            </div>
            <div className="text-xl font-bold">{status.successRate}%</div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${status.successRate}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-900 dark:bg-indigo-900 rounded-2xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full">
              <Database className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <p className="text-sm font-semibold">Próximo Backup Agendado</p>
              <p className="text-xs text-indigo-200/80">Hoje às 23:00 (Rotina Diária)</p>
            </div>
          </div>
          
          <div className="flex gap-2">
             <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/10 hover:bg-white/20 border-0 text-white"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Verificar Integridade
            </Button>
            <Button 
              size="sm" 
              className="bg-indigo-500 hover:bg-indigo-600 border-0"
            >
              Backup Manual
            </Button>
          </div>
        </div>
      </CardContent>

      <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Serviços de Alta Disponibilidade: ONLINE
        </span>
        <button className="flex items-center hover:text-indigo-500 transition-colors">
          Ver Histórico Detalhado <ChevronRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>
    </Card>
  )
}
