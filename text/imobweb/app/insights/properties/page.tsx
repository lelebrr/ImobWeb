'use client';

import React from 'react';
import { 
  BrainCircuit, 
  Search, 
  Filter, 
  Download,
  LayoutGrid,
  List,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PortfolioTable } from '@/components/insights/PortfolioTable';

/**
 * Página de Gestão de Portfólio com Insights.
 * Gerenciamento centralizado da saúde dos anúncios da imobiliária.
 */
export default function PropertyInsightsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">IA Preditiva 2026</span>
          </div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Gestão de Saúde do Portfólio
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-slate-400 mt-1">
             Monitore e otimize o desempenho de todos os imóveis da sua imobiliária em uma única tela.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-800 bg-slate-900/50">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500">
            Otimizar Todos os Anúncios
          </Button>
        </div>
      </header>

      {/* Toolbar de Filtros */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Buscar imóvel por título, código ou bairro..." 
            className="pl-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="ghost" size="icon" className="text-slate-400"><List className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-slate-600"><LayoutGrid className="w-5 h-5" /></Button>
          <div className="w-px h-6 bg-slate-800 mx-2" />
          <Button variant="outline" className="border-slate-800 gap-2">
            <Filter className="w-4 h-4" />
            Filtros Avançados
          </Button>
        </div>
      </section>

      {/* Tabela de Portfólio */}
      <section>
        <PortfolioTable />
      </section>

      {/* Footer / Resumo Rápido */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Média de Saúde</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-emerald-400">74%</h4>
            <span className="text-[10px] text-emerald-500 font-bold">+5% vs mês anterior</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Imóveis em Risco Crítico</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-rose-500">4</h4>
            <span className="text-[10px] text-rose-500 font-bold">Ação necessária imediata</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Insights Gerados Hoje</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-indigo-400">28</h4>
            <span className="text-[10px] text-indigo-500 font-bold">12 novos alertas de preço</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
