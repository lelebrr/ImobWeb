'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

const commissions = [
  { period: 'Jul/2026', clients: 3, revenue: 'R$ 3.091', commission: 'R$ 388,89', status: 'pending' },
  { period: 'Jun/2026', clients: 3, revenue: 'R$ 2.794', commission: 'R$ 359,28', status: 'paid' },
  { period: 'Mai/2026', clients: 2, revenue: 'R$ 1.794', commission: 'R$ 239,40', status: 'paid' },
];

export default function PartnerBillingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Financeiro</h1><p className="text-xs text-slate-500 hidden sm:block">Comissões e royalties</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Comissão a Receber', value: 'R$ 388,89' },
              { label: 'Total Recebido', value: 'R$ 598,68' },
              { label: 'Comissão (média)', value: '12,5%' },
            ].map((m) => (
              <Card key={m.label} className="bg-white/[0.02] border-white/5 rounded-2xl">
                <CardContent className="p-5"><p className="text-2xl font-bold text-white">{m.value}</p><p className="text-xs text-slate-500 mt-1">{m.label}</p></CardContent>
              </Card>
            ))}
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <ResponsiveTable columns={[
              { key: 'period', header: 'Período', render: (r: any) => <span className="text-sm text-white font-medium">{r.period}</span> },
              { key: 'clients', header: 'Clientes', render: (r: any) => <span className="text-sm text-slate-300">{r.clients}</span> },
              { key: 'revenue', header: 'Receita', render: (r: any) => <span className="text-sm text-slate-300">{r.revenue}</span> },
              { key: 'commission', header: 'Comissão', render: (r: any) => <span className="text-sm font-semibold text-white">{r.commission}</span> },
              { key: 'status', header: 'Status', render: (r: any) => <span className="text-xs text-slate-500">{r.status === 'paid' ? 'Pago' : 'Pendente'}</span> },
            ]} data={commissions} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
