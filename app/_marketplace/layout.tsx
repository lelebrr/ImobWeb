"use client";

import React from "react";
import { ShoppingBag, Star, Zap, ShieldCheck } from "lucide-react";

/**
 * LAYOUT DO MARKETPLACE - imobWeb 2026
 * Interface de loja focada em conversão para Add-ons.
 */

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Marketplace Top Bar */}
      <div className="bg-indigo-600 py-3 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
        Promoção de Lançamento: 20% OFF em Add-ons de IA para Parceiros Platinum
      </div>

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Add-on <span className="text-indigo-600">Store</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Powered by imobWeb Ecosystem</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-4 lg:flex">
               <div className="flex items-center gap-1 text-amber-500"><Star size={14} fill="currentColor" /> <span className="text-xs font-bold text-slate-600">4.9/5</span></div>
               <div className="flex items-center gap-1 text-emerald-500"><ShieldCheck size={14} /> <span className="text-xs font-bold text-slate-600">Verificado</span></div>
            </div>
            <button className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50">
              Minhas Instalações
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 flex flex-col gap-4">
           <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 w-fit">
             <Zap size={12} fill="currentColor" /> Marketplace de Extensões
           </div>
           <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Turbine seu CRM com <span className="text-indigo-600">Add-ons Premium</span></h2>
           <p className="max-w-xl text-slate-500">Expanda as funcionalidades do imobWeb em segundos. De automações de IA a integrações portais globais.</p>
        </div>
        
        {children}
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 text-center text-slate-400 text-xs">
          © 2026 imobWeb Marketplace • Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
