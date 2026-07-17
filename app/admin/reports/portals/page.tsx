'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

const portalData = [
  { portal: 'Viva Real', properties: '2.847', leads: '847', conversion: '29.7%', trend: 'up' },
  { portal: 'Zap Imóveis', properties: '2.541', leads: '694', conversion: '27.3%', trend: 'up' },
  { portal: 'OLX', properties: '1.923', leads: '512', conversion: '26.6%', trend: 'down' },
  { portal: 'Imovelweb', properties: '1.626', leads: '488', conversion: '30.0%', trend: 'up' },
];

export default function ReportsPortalsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/10"><Globe className="w-5 h-5 text-cyan-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Eficiência de Portais</h1><p className="text-xs text-slate-500 hidden sm:block">Performance de portais imobiliários</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <ResponsiveTable columns={[
              { key: 'portal', header: 'Portal', render: (r: any) => <span className="text-sm text-white font-medium">{r.portal}</span> },
              { key: 'properties', header: 'Imóveis', render: (r: any) => <span className="text-sm text-slate-300">{r.properties}</span> },
              { key: 'leads', header: 'Leads', render: (r: any) => <span className="text-sm text-slate-300">{r.leads}</span> },
              { key: 'conversion', header: 'Conversão', render: (r: any) => <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{r.conversion}</Badge> },
              { key: 'trend', header: 'Tendência', render: (r: any) => r.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" /> },
            ]} data={portalData} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
