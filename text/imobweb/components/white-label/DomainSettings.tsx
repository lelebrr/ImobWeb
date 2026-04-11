"use client";

import React, { useState } from "react";
import { 
  Globe, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Copy, 
  AlertCircle,
  ExternalLink
} from "lucide-react";

/**
 * CONFIGURAÇÃO DE DOMÍNIO CUSTOMIZADO - imobWeb
 * 2026 - Gestão de DNS para White Label
 */

export const DomainSettings: React.FC = () => {
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

  const verifyDomain = () => {
    setStatus('checking');
    setTimeout(() => setStatus('valid'), 1500); // Mock delay
  };

  const records = [
    { type: 'CNAME', host: '@', value: 'cname.imobweb.app', status: 'valid' },
    { type: 'TXT', host: '_imobweb-verification', value: 'v=verify_abc123', status: 'pending' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-start justify-between border-b border-slate-100 pb-6 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="text-indigo-500" size={24} />
            Domínio Customizado
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Aponte seu próprio domínio para a plataforma e use-o em toda a experiência do cliente.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* Input Area */}
        <div className="grid gap-6 lg:grid-cols-3 lg:items-end">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Seu Domínio</label>
            <div className="relative">
              <input 
                type="text" 
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="ex: crm.suaimobiliaria.com.br"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
              />
              {status === 'valid' && (
                <div className="absolute right-4 top-3 text-emerald-500">
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={verifyDomain}
            disabled={!domain || status === 'checking'}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
          >
            {status === 'checking' ? <RefreshCw className="animate-spin" size={18} /> : "Verificar DNS"}
          </button>
        </div>

        {/* DNS Records Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Registros DNS Necessários</h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Host</th>
                  <th className="px-4 py-3 font-semibold">Valor</th>
                  <th className="px-4 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((record, idx) => (
                  <tr key={idx} className="group">
                    <td className="px-4 py-4 font-mono font-bold text-indigo-600">{record.type}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{record.host}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 max-w-[200px] sm:max-w-none">
                        <code className="truncate rounded bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-slate-800">
                          {record.value}
                        </code>
                        <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {record.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 uppercase">
                          <CheckCircle2 size={10} /> Conectado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 uppercase">
                          <AlertCircle size={10} /> Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning/Help Box */}
        <div className="flex gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <AlertCircle className="text-slate-400 flex-shrink-0" size={20} />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-900 dark:text-white">Dica de Propagação</p>
            <p className="mt-1">
              Alterações de DNS podem levar de 5 minutos a 24 horas para propagar globalmente. 
              Garantimos a geração automática de certificados SSL gratuitos via Let's Encrypt após a conexão.
            </p>
            <a href="#" className="mt-2 inline-flex items-center gap-1 text-indigo-500 font-semibold hover:underline">
              Ver tutorial detalhado <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
