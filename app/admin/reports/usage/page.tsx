'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Home, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

export default function ReportsUsagePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/10"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Uso da Plataforma</h1><p className="text-xs text-slate-500 hidden sm:block">Métricas de uso do sistema</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Usuários Ativos (hoje)', value: '347', icon: Users, color: 'text-blue-400' },
            { label: 'Imóveis Publicados', value: '8.937', icon: Home, color: 'text-emerald-400' },
            { label: 'Leads Gerados (mês)', value: '2.541', icon: Activity, color: 'text-amber-400' },
            { label: 'Sessões (24h)', value: '1.203', icon: TrendingUp, color: 'text-purple-400' },
          ].map((m) => (
            <Card key={m.label} className="bg-white/[0.02] border-white/5 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3"><m.icon className={`w-5 h-5 ${m.color}`} /><span className="text-2xl font-bold text-white">{m.value}</span></div>
                <p className="text-xs text-slate-500">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
