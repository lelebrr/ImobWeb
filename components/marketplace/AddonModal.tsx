"use client";

import React from "react";
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  CreditCard 
} from "lucide-react";
import { Addon } from "../../types/partner";

/**
 * MODAL DE DETALHES DO ADD-ON - imobWeb
 * 2026 - UX de Marketplace Premium
 */

interface AddonModalProps {
  addon: Addon;
  isOpen: boolean;
  onClose: () => void;
  onInstall: (id: string) => void;
  isInstalling?: boolean;
}

export const AddonModal: React.FC<AddonModalProps> = ({ addon, isOpen, onClose, onInstall, isInstalling }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-950 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-6">
          <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
            <Cpu size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{addon.name}</h2>
            <p className="text-slate-500">{addon.developer}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Sobre a Extensão</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {addon.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">O que você ganha</h3>
              <ul className="space-y-2">
                {['Ativação Instantânea', 'Suporte Prioritário', 'Atualizações Vitalícias'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="text-emerald-500" size={14} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Valor Assinatura</span>
                <span className="font-bold text-slate-900 dark:text-white">R$ {addon.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Ciclo</span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-800 uppercase tracking-tighter">
                  {addon.billingType === 'monthly' ? "Mensal" : "Uso"}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
                <ShieldCheck size={12} /> Cobrança processada via Stripe por imobWeb Labs.
              </div>
            </div>

            <button 
              onClick={() => onInstall(addon.id)}
              disabled={isInstalling}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-50"
            >
              {isInstalling ? "Instalando..." : <><Zap size={18} /> Confirmar Instalação</>}
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-[10px] text-amber-700 dark:bg-amber-900/10 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
          <CreditCard size={14} />
          <span>Ao confirmar, o valor será adicionado à sua próxima fatura mensal. Você pode cancelar a qualquer momento.</span>
        </div>
      </div>
    </div>
  );
};
