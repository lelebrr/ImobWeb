'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  MessageSquare, 
  Video, 
  HelpCircle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Settings,
  Layout
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { HelpCenterEngine } from '@/lib/help/help-center';

const categories = [
  { name: 'Primeiros Passos', icon: TrendingUp, slug: 'inicio', count: 12 },
  { name: 'Gestão de Imóveis', icon: Layout, slug: 'imoveis', count: 24 },
  { name: 'WhatsApp IA', icon: MessageSquare, slug: 'whatsapp', count: 8 },
  { name: 'Finanças', icon: Settings, slug: 'financeiro', count: 15 },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length > 2) {
        const results = await HelpCenterEngine.search(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    fetchResults();
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-12">
      {/* Search Hero */}
      <section className="flex flex-col items-center text-center space-y-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="p-2 bg-indigo-600 rounded-lg">
                <BrainCircuit className="w-5 h-5 text-white" />
             </div>
             <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Suporte Inteligente</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Como podemos te ajudar hoje?</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Explore nossa base de conhecimento ou fale com nossa IA para resolver suas dúvidas instantaneamente.
          </p>
        </motion.div>

        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Busque por 'como cadastrar imóvel' ou 'conectar whatsapp'..."
            className="w-full h-16 pl-12 pr-4 bg-slate-900 border-slate-800 text-white rounded-2xl text-lg focus:ring-2 ring-indigo-500 shadow-2xl transition-all"
          />
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-18 left-0 w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden z-20 shadow-2xl"
            >
              {searchResults.map((result) => (
                <div 
                  key={result.id}
                  className="p-4 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 transition-colors flex items-center justify-between group"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">{result.title}</span>
                    <span className="text-xs text-slate-500">{result.excerpt}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Categories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group">
              <CardHeader>
                <cat.icon className="w-8 h-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">{cat.name}</CardTitle>
                <p className="text-xs text-slate-500">{cat.count} artigos disponíveis</p>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Recommended Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Recém Adicionados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl hover:bg-slate-900/50 transition-colors cursor-pointer flex items-center justify-between">
                  <span className="text-sm font-medium">Guia de Customização White Label</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6 text-rose-400" />
            Video Tutoriais
          </h2>
          <div className="space-y-4">
            <Card className="bg-slate-900 overflow-hidden border-slate-800 border-2">
               <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
                  <Video className="w-12 h-12 text-slate-700" />
                  <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold">1:45</div>
               </div>
               <div className="p-3">
                  <p className="text-sm font-bold">Tour pelo Novo Dashboard</p>
               </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-3xl p-12 text-center space-y-6">
        <h2 className="text-3xl font-black text-white">Não encontrou o que precisava?</h2>
        <p className="text-slate-400">Nossa equipe de suporte e nossa IA estão prontas para te ajudar.</p>
        <div className="flex justify-center gap-4">
          <Button className="bg-indigo-600 hover:bg-indigo-500 px-8 h-12 font-bold">
            Abrir Chamado (Ticket)
          </Button>
          <Button variant="outline" className="border-slate-700 h-12 font-bold px-8">
            Falar com a IA
          </Button>
        </div>
      </section>
    </div>
  );
}
