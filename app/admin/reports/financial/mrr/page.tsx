'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

export default function ReportsMRRPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">MRR & Churn</h1><p className="text-xs text-slate-500 hidden sm:block">Receita recorrente mensal e taxa de cancelamento</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'MRR Atual', value: 'R$ 84.720', change: '+12%' },
            { label: 'Churn Rate', value: '2.4%', change: '-0.3%' },
            { label: 'ARR', value: 'R$ 1.016.640', change: '+15%' },
          ].map((m) => (
            <Card key={m.label} className="bg-white/[0.02] border-white/5 rounded-2xl">
              <CardContent className="p-5">
                <p className="text-2xl font-bold text-white">{m.value}</p>
                <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                <p className="text-xs font-medium text-emerald-400 mt-1">{m.change}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
        <div className="mt-6 p-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Gráfico de MRR será exibido aqui (integração com Recharts)</p>
        </div>
      </div>
    </div>
  );
}
