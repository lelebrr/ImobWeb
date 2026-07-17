'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const features = [
  { id: 'ai-assistant', name: 'Assistente IA', desc: 'Chat inteligente para corretores', enabled: true, scope: 'Global' },
  { id: 'whatsapp-integration', name: 'Integração WhatsApp', desc: 'Envio e recebimento de mensagens', enabled: true, scope: 'Global' },
  { id: 'advanced-reports', name: 'Relatórios Avançados', desc: 'BI e dashboards personalizados', enabled: false, scope: 'Premium' },
  { id: 'multi-currency', name: 'Multi Moeda', desc: 'Suporte a múltiplas moedas', enabled: false, scope: 'Beta' },
  { id: 'property-vr', name: 'Visita Virtual 3D', desc: 'Tour virtual em 360°', enabled: true, scope: 'Destaque' },
  { id: 'blockchain-sign', name: 'Assinatura Blockchain', desc: 'Contratos com validade blockchain', enabled: false, scope: 'Beta' },
];

export default function SecurityFeatureFlagsPage() {
  const [search, setSearch] = useState('');
  const [flagState, setFlagState] = useState<Record<string, boolean>>(Object.fromEntries(features.map(f => [f.id, f.enabled])));
  const filtered = features.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => setFlagState(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 flex items-center justify-center border border-purple-500/10"><ToggleLeft className="w-5 h-5 text-purple-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Feature Flags</h1><p className="text-xs text-slate-500 hidden sm:block">Ativar/desativar funcionalidades da plataforma</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar feature..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-purple-500/30" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f) => (
              <Card key={f.id} className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm text-white">{f.name}</p>
                    <button onClick={() => toggle(f.id)} className={cn('w-10 h-5 rounded-full transition-colors relative', flagState[f.id] ? 'bg-indigo-500' : 'bg-white/10')}>
                      <div className={cn('w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm', flagState[f.id] ? 'left-5.5' : 'left-0.5')} style={{ left: flagState[f.id] ? '22px' : '2px' }} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{f.desc}</p>
                  <Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', flagState[f.id] ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>{flagState[f.id] ? 'Ativo' : 'Inativo'}</Badge>
                  <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 ml-1">{f.scope}</Badge>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
