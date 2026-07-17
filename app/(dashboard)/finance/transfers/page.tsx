'use client';

import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

export default function FinanceTransfersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/10"><ArrowLeftRight className="w-5 h-5 text-blue-400" /></div>
        <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Transferências</h1><p className="text-xs text-slate-500">Transferências entre contas</p></div>
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 flex items-center justify-center"><p className="text-slate-500 text-sm">Página de transferências em desenvolvimento</p></div>
    </div>
  );
}
