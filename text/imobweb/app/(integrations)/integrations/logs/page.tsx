'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import Link from 'next/link';

interface Log {
  id: string;
  action: string;
  entityId: string;
  description: string;
  timestamp: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: any;
  user?: {
    name: string;
    email: string;
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const resp = await fetch('/api/portals/logs');
      const data = await resp.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.description.toLowerCase().includes(filter.toLowerCase()) ||
    log.metadata?.portalId?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans selection:bg-purple-500/30">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Link href="/integrations" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Portais
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-500">Logs de Atividade</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Auditoria de Sincronização
            </h1>
            <p className="text-zinc-400">Histórico completo de eventos e comunicações com os portais imobiliários.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Filtrar logs..." 
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all w-64 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
              <Filter className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Real-time Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <History className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium tracking-wide border-b border-zinc-800 pb-1 mb-1">Última Sincro</p>
                <div className="text-xl font-mono text-blue-400">Há 5 min</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckCircle2 className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                 <p className="text-sm text-zinc-400 font-medium tracking-wide border-b border-zinc-800 pb-1 mb-1">Sucesso (24h)</p>
                <div className="text-xl font-mono text-emerald-400">99.8%</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertCircle className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium tracking-wide border-b border-zinc-800 pb-1 mb-1">Alertas Ativos</p>
                <div className="text-xl font-mono text-rose-400">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/50 bg-zinc-900/50">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Evento / Portal</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ação</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 bg-zinc-900/10"></td>
                    </tr>
                  ))
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${log.riskLevel === 'LOW' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                            <Database className={`w-4 h-4 ${log.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-rose-400'}`} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-200">{log.metadata?.portalType || 'Portal Feed'}</div>
                            <div className="text-xs text-zinc-500">ID: {log.entityId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-300">{log.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Sucesso</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500 tabular-nums">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors opacity-0 group-hover:opacity-100">
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-zinc-500">Nenhum log encontrado nos últimos 30 dias.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-zinc-800/50 bg-zinc-900/50 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Mostrando {filteredLogs.length} eventos recentes</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400 hover:text-white transition-colors">Anterior</button>
              <button className="px-3 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400 hover:text-white transition-colors">Próximo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
