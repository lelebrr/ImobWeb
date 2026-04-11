"use client";

import React, { useState } from "react";
import { Copy, Key, ShieldCheck, RefreshCw, Trash2, Eye, EyeOff, Plus } from "lucide-react";

/**
 * ApiKeyManager - Interface Premium para Gestão de Chaves de API
 * Foca em Developer Experience (DX) e Segurança
 */

interface ApiKey {
  id: string;
  name: string;
  preview: string;
  lastUsedAt: string | null;
  enabled: boolean;
  scopes: string[];
}

export const ApiKeyManager: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Produção - Zapier",
      preview: "iw_abc123...789x",
      lastUsedAt: "2026-04-10T20:00:00Z",
      enabled: true,
      scopes: ["properties:read", "leads:write"],
    },
  ]);

  const [showToken, setShowToken] = useState<string | null>(null);

  const handleCreate = () => {
    // Mock create logic
    const newKey: ApiKey = {
      id: Math.random().toString(),
      name: "Nova Chave",
      preview: "iw_newkey...0000",
      lastUsedAt: null,
      enabled: true,
      scopes: ["properties:read"],
    };
    setKeys([...keys, newKey]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">API Keys</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gerencie suas chaves de acesso para integrações externas e scripts.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/20"
        >
          <Plus size={18} />
          Criar Nova Chave
        </button>
      </div>

      <div className="grid gap-4">
        {keys.map((key) => (
          <div
            key={key.id}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Key size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">{key.name}</h3>
                  <div className="flex items-center gap-2 font-mono text-sm text-slate-500">
                    <span>{key.preview}</span>
                    <button className="hover:text-indigo-500"><Copy size={14} /></button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <RefreshCw size={16} />
                </button>
                <button className="rounded-md p-2 hover:bg-red-50 text-red-500 dark:hover:bg-red-950/20">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {key.scopes.map((scope) => (
                <span
                  key={scope}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  {scope}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
              <div className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${key.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {key.enabled ? 'Ativa' : 'Desativada'}
              </div>
              <div className="flex items-center gap-4">
                  <span>Último uso: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Nunca usado'}</span>
                  <div className="flex items-center gap-1 text-indigo-500 font-medium cursor-pointer hover:underline">
                    <ShieldCheck size={14} />
                    Ver permissões
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
        <div className="flex gap-3">
          <ShieldCheck className="text-amber-600 dark:text-amber-500" />
          <div className="text-sm text-amber-800 dark:text-amber-400">
            <p className="font-semibold">Lembrete de Segurança</p>
            <p>Nunca compartilhe suas chaves privadas. Elas dão acesso total à sua conta conforme os scopes definidos. Use chaves com scopes limitados para scripts específicos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
