'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

const properties = [
  { id: '1', title: 'Apartamento 3 dorm. Centro', status: 'published', views: 847, leads: 12, portal: 'Viva Real' },
  { id: '2', title: 'Casa 4 suítes Jardins', status: 'published', views: 623, leads: 8, portal: 'Zap Imóveis' },
  { id: '3', title: 'Sala Comercial 80m²', status: 'draft', views: 0, leads: 0, portal: '—' },
];

export default function PortalPropertiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/10"><Home className="w-5 h-5 text-blue-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Meus Imóveis</h1><p className="text-xs text-slate-500 hidden sm:block">Imóveis publicados nos portais</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Card key={p.id} className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="w-full h-32 rounded-xl bg-white/[0.02] mb-3 flex items-center justify-center"><Home className="w-8 h-8 text-slate-600" /></div>
                <p className="font-semibold text-sm text-white">{p.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`text-[10px] font-bold px-2.5 py-0.5 ${p.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{p.status === 'published' ? 'Publicado' : 'Rascunho'}</Badge>
                  <span className="text-xs text-slate-500">{p.views} visualizações</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
