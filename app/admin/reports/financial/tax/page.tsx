'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

const taxData = [
  { period: 'Jul/2026', receita: 'R$ 84.720', imposto: 'R$ 16.944', aliquota: '20%', status: 'pending' },
  { period: 'Jun/2026', receita: 'R$ 79.500', imposto: 'R$ 15.900', aliquota: '20%', status: 'filed' },
  { period: 'Mai/2026', receita: 'R$ 72.300', imposto: 'R$ 14.460', aliquota: '20%', status: 'filed' },
];

export default function ReportsTaxPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10"><FileText className="w-5 h-5 text-amber-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Impostos & Fiscal</h1><p className="text-xs text-slate-500 hidden sm:block">Relatórios fiscais e tributários</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <ResponsiveTable columns={[
              { key: 'period', header: 'Período', render: (r: any) => <span className="text-sm text-white font-medium">{r.period}</span> },
              { key: 'receita', header: 'Receita', render: (r: any) => <span className="text-sm text-slate-300">{r.receita}</span> },
              { key: 'imposto', header: 'Imposto', render: (r: any) => <span className="text-sm text-slate-300">{r.imposto}</span> },
              { key: 'aliquota', header: 'Alíquota', render: (r: any) => <span className="text-xs text-slate-500">{r.aliquota}</span> },
              { key: 'status', header: 'Status', render: (r: any) => <span className="text-xs text-slate-500">{r.status === 'filed' ? 'Declarado' : 'Pendente'}</span> },
            ]} data={taxData} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
