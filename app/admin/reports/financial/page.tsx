'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const sections = [
  { name: 'MRR & Churn', desc: 'Receita recorrente e taxa de cancelamento', href: '/admin/reports/financial/mrr', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { name: 'Impostos & Fiscal', desc: 'Relatórios fiscais e tributários', href: '/admin/reports/financial/tax', icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

export default function ReportsFinancialPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Financeiro Executivo</h1><p className="text-xs text-slate-500 hidden sm:block">Relatórios financeiros da plataforma</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((s) => (
            <motion.div key={s.name} variants={itemVariants}>
              <Link href={s.href}>
                <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
                      <div><p className="font-semibold text-sm text-white">{s.name}</p><p className="text-xs text-slate-500 mt-0.5">{s.desc}</p></div>
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
