'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><CreditCard className="w-5 h-5 text-indigo-400" /></div>
        <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Faturamento</h1><p className="text-xs text-slate-500">Gerenciar assinatura e pagamentos</p></div>
      </div>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Plano Atual', value: 'Premium' },
          { label: 'Próxima Cobrança', value: '15/08/2026' },
          { label: 'Valor Mensal', value: 'R$ 997' },
        ].map((m) => (
          <Card key={m.label} className="bg-white/[0.02] border-white/5 rounded-2xl">
            <CardContent className="p-5"><p className="text-2xl font-bold text-white">{m.value}</p><p className="text-xs text-slate-500 mt-1">{m.label}</p></CardContent>
          </Card>
        ))}
      </motion.div>
      <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold">Gerenciar Assinatura</Button>
    </div>
  );
}
