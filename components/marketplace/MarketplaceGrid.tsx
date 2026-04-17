"use client";

import React, { useState } from "react";
import {
  Zap,
  Search,
  Filter,
  Star,
  CheckCircle2,
  LayoutGrid,
  List,
  ArrowRight,
  ShieldCheck,
  MousePointer2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

/**
 * MARKETPLACE GRID - imobWeb 2026
 * Loja interna de extensões com instalação em 1-clique.
 */

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "ia", label: "Inteligência Artificial" },
  { id: "marketing", label: "Marketing" },
  { id: "portals", label: "Portais" },
  { id: "reports", label: "Relatórios" },
];

import { MOCK_ADDONS } from "@/lib/data/mock-addons";

export const MarketplaceGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [installing, setInstalling] = useState<string | null>(null);

  const addons = MOCK_ADDONS;

  const handleInstall = (addonId: string, name: string) => {
    setInstalling(addonId);
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
    toast.promise(promise, {
      loading: `Instalando ${name}...`,
      success: `${name} instalado com sucesso em seu dashboard!`,
      error: `Erro ao instalar ${name}.`,
    });
    promise.finally(() => setInstalling(null));
  };

  const handleContact = () => {
    toast.info("Abrindo chat com especialista imobWeb...");
    window.open("https://wa.me/5511999999999", "_blank");
  };

  return (
    <div className="space-y-8 p-1">
      {/* Search and Filters */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Pesquisar extensões..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none ring-indigo-500/10 transition-all focus:border-indigo-500 focus:ring-4 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className="group relative flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/50"
          >
            {addon.badge && (
              <span className="absolute right-6 top-6 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                {addon.badge}
              </span>
            )}

            <div className="mb-6 h-16 w-16 text-4xl flex items-center justify-center rounded-3xl bg-slate-50 transition-all group-hover:scale-110 group-hover:bg-indigo-50 dark:bg-slate-800 dark:group-hover:bg-indigo-950/30">
              {addon.icon}
            </div>

            <h3 className="mb-2 text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {addon.name}
            </h3>

            <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {addon.desc}
            </p>

            <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    A partir de
                  </div>
                  <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      R$
                    </span>
                    <span className="text-2xl font-black">
                      {addon.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      /mês
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all group-hover:bg-emerald-50 group-hover:text-emerald-500 dark:bg-slate-800">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <button
                onClick={() => handleInstall(addon.id, addon.name)}
                disabled={installing === addon.id}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-indigo-500/10 transition-all hover:bg-slate-900 hover:shadow-indigo-500/0 dark:hover:bg-white dark:hover:text-slate-900 disabled:opacity-50"
              >
                {installing === addon.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MousePointer2 size={16} />
                )}
                {installing === addon.id ? "INSTALANDO..." : "INSTALAR AGORA"}
              </button>
            </div>
          </div>
        ))}

        {/* Custom Solution Card */}
        <div className="flex flex-col rounded-[2.5rem] border-2 border-dashed border-slate-200 p-8 transition-all hover:border-indigo-400 dark:border-slate-800">
          <div className="mb-6 h-16 w-16 flex items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Zap size={24} />
          </div>
          <h3 className="mb-2 text-xl font-black text-slate-400 uppercase tracking-tighter">
            Precisa de algo sob medida?
          </h3>
          <p className="mb-8 text-sm text-slate-400">
            Nossa equipe de engenharia pode desenvolver módulos exclusivos para
            sua franquia.
          </p>
          <button
            onClick={handleContact}
            className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-4 text-sm font-bold text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            Falar com Especialista
          </button>
        </div>
      </div>
    </div>
  );
};
