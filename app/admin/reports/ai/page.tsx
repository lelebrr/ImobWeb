'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Cpu, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

export default function ReportsAIPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 flex items-center justify-center border border-purple-500/10"><Zap className="w-5 h-5 text-purple-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Uso de IA & Tokens</h1><p className="text-xs text-slate-500 hidden sm:block">Consumo de inteligência artificial</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Tokens Usados (mês)', value: '1.247.532', icon: Cpu, color: 'text-purple-400' },
            { label: 'Requisições de IA', value: '89.421', icon: Zap, color: 'text-amber-400' },
            { label: 'Custo Estimado', value: 'R$ 124,75', icon: DollarSign, color: 'text-emerald-400' },
          ].map((m) => (
            <Card key={m.label} className="bg-white/[0.02] border-white/5 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><m.icon className={`w-5 h-5 ${m.color}`} /></div>
                  <p className="text-2xl font-bold text-white">{m.value}</p>
                </div>
                <p className="text-xs text-slate-500">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
