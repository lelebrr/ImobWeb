'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function FinanceClosingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10"><FileText className="w-5 h-5 text-amber-400" /></div>
        <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Fechamento Mensal</h1><p className="text-xs text-slate-500">Relatórios de fechamento</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Receita do Mês', value: 'R$ 15.500' },
          { label: 'Despesas', value: 'R$ 3.200' },
          { label: 'Lucro Líquido', value: 'R$ 12.300' },
        ].map((m) => (
          <Card key={m.label} className="bg-white/[0.02] border-white/5 rounded-2xl">
            <CardContent className="p-5"><p className="text-2xl font-bold text-white">{m.value}</p><p className="text-xs text-slate-500 mt-1">{m.label}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
