'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, TrendingUp, TrendingDown, Users, Home, DollarSign, Activity,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const metrics = [
  { label: 'Total Imobiliárias', value: '127', change: '+12%', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 'up' },
  { label: 'Usuários Ativos', value: '1.452', change: '+8%', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 'up' },
  { label: 'Imóveis Cadastrados', value: '8.937', change: '+23%', icon: Home, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 'up' },
  { label: 'Faturamento Mensal', value: 'R$ 84.720', change: '+15%', icon: DollarSign, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: 'up' },
  { label: 'Churn Rate', value: '2.4%', change: '-0.3%', icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', trend: 'down' },
  { label: 'Ticket Médio', value: 'R$ 667', change: '+5%', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: 'up' },
];

export default function AdminOrgsMetricsPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10"><TrendingUp className="w-5 h-5 text-amber-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Métricas por Tenant</h1><p className="text-xs text-slate-500 hidden sm:block">Indicadores de desempenho da plataforma</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <motion.div key={m.label} variants={itemVariants}>
              <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}><m.icon className={`w-5 h-5 ${m.color}`} /></div>
                    <span className={`text-xs font-bold ${m.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>{m.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{m.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
