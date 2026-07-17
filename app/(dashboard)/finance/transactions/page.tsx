'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

const transactions = [
  { id: '1', desc: 'Comissão Venda Apt 123', type: 'income', value: 'R$ 12.000', date: '15/07/2026', status: 'completed' },
  { id: '2', desc: 'Assinatura Mensal', type: 'expense', value: 'R$ 997', date: '10/07/2026', status: 'completed' },
  { id: '3', desc: 'Comissão Locação Casa', type: 'income', value: 'R$ 3.500', date: '08/07/2026', status: 'pending' },
];

export default function FinanceTransactionsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><ArrowUpRight className="w-5 h-5 text-emerald-400" /></div>
        <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Transações</h1><p className="text-xs text-slate-500">Histórico de transações</p></div>
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <ResponsiveTable columns={[
          { key: 'desc', header: 'Descrição', render: (r: any) => <span className="text-sm text-white font-medium">{r.desc}</span> },
          { key: 'type', header: 'Tipo', render: (r: any) => r.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" /> },
          { key: 'value', header: 'Valor', render: (r: any) => <span className="text-sm font-semibold text-white">{r.value}</span> },
          { key: 'date', header: 'Data', render: (r: any) => <span className="text-xs text-slate-500">{r.date}</span> },
          { key: 'status', header: 'Status', render: (r: any) => <span className="text-xs text-slate-500">{r.status === 'completed' ? 'Concluído' : 'Pendente'}</span> },
        ]} data={transactions} />
      </div>
    </div>
  );
}
