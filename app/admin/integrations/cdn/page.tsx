'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const cdnStatus = [
  { region: 'Brasil - São Paulo', status: 'operational', latency: '12ms', uptime: '99.99%' },
  { region: 'Brasil - Rio de Janeiro', status: 'operational', latency: '15ms', uptime: '99.97%' },
  { region: 'EUA - Virginia', status: 'operational', latency: '98ms', uptime: '99.95%' },
  { region: 'Europa - Frankfurt', status: 'operational', latency: '112ms', uptime: '99.92%' },
  { region: 'Ásia - Tóquio', status: 'degraded', latency: '245ms', uptime: '98.50%' },
];

export default function IntegrationsCDNPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10"><Activity className="w-5 h-5 text-amber-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Status da CDN</h1><p className="text-xs text-slate-500 hidden sm:block">Monitorar performance da rede de distribuição</p></div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl text-slate-400 hover:text-white"><RefreshCw className="w-4 h-4 mr-1.5" />Verificar</Button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cdnStatus.map((r) => (
            <motion.div key={r.region} variants={itemVariants}>
              <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-500" /><p className="text-sm text-white font-medium">{r.region}</p></div>
                    <div className={cn('w-2.5 h-2.5 rounded-full', r.status === 'operational' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 shadow-sm shadow-amber-400/50')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold">Latência</p><p className="text-sm font-bold text-white mt-0.5">{r.latency}</p></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold">Uptime</p><p className="text-sm font-bold text-white mt-0.5">{r.uptime}</p></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
