'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, TrendingUp, Globe, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const reports = [
  { id: 'financial', name: 'Financeiro Executivo', desc: 'MRR, churn, impostos', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/admin/reports/financial' },
  { id: 'usage', name: 'Uso da Plataforma', desc: 'Métricas de uso do sistema', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admin/reports/usage' },
  { id: 'portals', name: 'Eficiência de Portais', desc: 'Performance de portais imobiliários', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', href: '/admin/reports/portals' },
  { id: 'ai', name: 'Uso de IA & Tokens', desc: 'Consumo de inteligência artificial', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/admin/reports/ai' },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><BarChart3 className="w-5 h-5 text-indigo-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Relatórios & BI</h1><p className="text-xs text-slate-500 hidden sm:block">Análises e relatórios da plataforma</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((r) => (
            <motion.div key={r.id} variants={itemVariants}>
              <Link href={r.href}>
                <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center`}><r.icon className={`w-6 h-6 ${r.color}`} /></div>
                      <div><p className="font-semibold text-sm text-white">{r.name}</p><p className="text-xs text-slate-500 mt-0.5">{r.desc}</p></div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
