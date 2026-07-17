'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

const statements = [
  { id: 'EXT-001', period: 'Jul/2026', properties: 3, leads: 20, views: 1.470, revenue: 'R$ 0' },
  { id: 'EXT-002', period: 'Jun/2026', properties: 3, leads: 15, views: 1.203, revenue: 'R$ 0' },
  { id: 'EXT-003', period: 'Mai/2026', properties: 2, leads: 12, views: 987, revenue: 'R$ 0' },
];

export default function PortalStatementsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><FileText className="w-5 h-5 text-emerald-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Extratos</h1><p className="text-xs text-slate-500 hidden sm:block">Extratos mensais de desempenho</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <ResponsiveTable columns={[
              { key: 'period', header: 'Período', render: (r: any) => <span className="text-sm text-white font-medium">{r.period}</span> },
              { key: 'properties', header: 'Imóveis', render: (r: any) => <span className="text-sm text-slate-300">{r.properties}</span> },
              { key: 'leads', header: 'Leads', render: (r: any) => <span className="text-sm text-slate-300">{r.leads}</span> },
              { key: 'views', header: 'Visualizações', render: (r: any) => <span className="text-sm text-slate-300">{r.views}</span> },
              { key: 'revenue', header: 'Receita', render: (r: any) => <span className="text-sm font-semibold text-white">{r.revenue}</span> },
            ]} data={statements} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
