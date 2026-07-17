'use client';

import React from 'react';
import { FileText } from 'lucide-react';

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10"><FileText className="w-5 h-5 text-amber-400" /></div>
        <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Contratos</h1><p className="text-xs text-slate-500">Gerenciar contratos</p></div>
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 flex items-center justify-center"><p className="text-slate-500 text-sm">Página de contratos em desenvolvimento</p></div>
    </div>
  );
}
