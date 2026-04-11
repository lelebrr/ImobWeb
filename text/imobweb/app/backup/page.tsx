import React from 'react'
import { BackupStatusPanel } from '@/components/backup/BackupStatusPanel'
import { 
  Database, 
  History, 
  Settings, 
  Download, 
  RotateCcw, 
  MoreVertical,
  Table as TableIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

/**
 * Página de Gerenciamento de Backups e Disaster Recovery
 * Dashboard administrativo para controle total de resiliência
 */

export default function BackupPage() {
  // Mock de dados para demonstração UI
  const recentBackups = [
    { id: 'BK-9021', date: '2026-04-10 23:00', size: '2.4 GB', type: 'FULL', status: 'SUCCESS' },
    { id: 'BK-9020', date: '2026-04-10 12:00', size: '12 MB', type: 'INC', status: 'SUCCESS' },
    { id: 'BK-9019', date: '2026-04-09 23:00', size: '2.3 GB', type: 'FULL', status: 'SUCCESS' },
    { id: 'BK-9018', date: '2026-04-09 12:00', size: '9 MB', type: 'INC', status: 'FAILED' }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      {/* Header Secção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-500 mb-1">
            <Database className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Infraestrutura</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Backups & Disaster Recovery
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Gestão centralizada de resiliência de dados para propriedades, contratos e leads em todo o ecossistema imobWeb.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Settings className="w-4 h-4 mr-2" />
            Configuração de Retenção
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none translate-y-[2px] active:translate-y-[4px] transition-all">
            Exportar Logs (Audit)
          </Button>
        </div>
      </div>

      {/* Grid de Controle Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Painel de Status */}
        <div className="lg:col-span-2 space-y-6">
          <BackupStatusPanel />
          
          <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold uppercase">Histórico Recente</h3>
              </div>
              <TableIcon className="w-4 h-4 text-slate-300" />
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-100/30 dark:bg-slate-800/20">
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBackups.map((backup) => (
                    <TableRow key={backup.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold">{backup.id}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{backup.date}</TableCell>
                      <TableCell className="text-slate-500">{backup.size}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {backup.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "text-[10px] font-bold border-0",
                            backup.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                          )}
                        >
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-500">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-500">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Widget de HA & Saúde */}
        <div className="space-y-6">
          <Card className="border-slate-100 dark:border-slate-800 bg-emerald-50/10 dark:bg-emerald-500/5">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Integridade de Dados
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Supabase (Principal)</span>
                  <Badge className="bg-emerald-500 text-white border-0">ONLINE</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Vercel (Edge)</span>
                  <Badge className="bg-emerald-500 text-white border-0">ONLINE</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Storage Vault</span>
                  <Badge className="bg-emerald-500 text-white border-0">PROTEGIDO</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100 dark:border-rose-800/30 bg-rose-50/20 dark:bg-rose-500/5">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold uppercase mb-2 text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Disaster Recovery
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Em caso de falha crítica total do banco de dados, você pode restaurar o último snapshot estável.
              </p>
              <Button variant="destructive" size="sm" className="w-full font-bold shadow-lg shadow-rose-200 dark:shadow-none">
                Iniciar Wizard de Recuperação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
