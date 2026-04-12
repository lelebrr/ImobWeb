"use client";

import React from "react";
import { 
  Building2, 
  Settings, 
  ExternalLink, 
  Activity, 
  MoreHorizontal,
  ChevronRight
} from "lucide-react";

/**
 * GERENCIADOR DE SUB-CONTAS - imobWeb
 * 2026 - Visão do Parceiro sobre sua Rede
 */

export const SubAccountManager: React.FC = () => {
  const subAccounts = [
    { 
      id: "ten_1", 
      name: "Imobiliária Pinheiros", 
      users: "12/20", 
      properties: "450/500", 
      status: "active",
      plan: "Pro"
    },
    { 
      id: "ten_2", 
      name: "Moriah Brokers", 
      users: "3/5", 
      properties: "88/100", 
      status: "active",
      plan: "Starter"
    },
    { 
      id: "ten_3", 
      name: "Alpha Exclusive", 
      users: "18/50", 
      properties: "1.200/5.000", 
      status: "pending_payment",
      plan: "Enterprise"
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gerenciamento de Rede</h2>
          <p className="text-sm text-slate-500">Controle total sobre as instâncias de seus clientes.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {subAccounts.map((account) => (
          <div key={account.id} className="group relative flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/30 p-5 transition-all hover:border-indigo-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-700">
                <Building2 className="text-slate-400 group-hover:text-indigo-500 transition-colors" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{account.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{account.plan}</span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      account.status === 'active' ? "bg-emerald-500" : "bg-amber-500"
                    }`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {account.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 lg:flex lg:items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Usuários</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{account.users}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-indigo-500" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Imóveis</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{account.properties}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-indigo-500" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 lg:border-none lg:pt-0">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white">
                <Settings size={18} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white">
                <Activity size={18} />
              </button>
              <button className="flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-xs font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
                Acessar Painel <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-400 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-500 dark:border-slate-800 dark:hover:bg-indigo-900/10">
        Cadastrar nova imobiliária cliente
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
