'use client';

import React from 'react';
import { Users } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><Users className="w-5 h-5 text-indigo-400" /></div>
        <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Equipe</h1><p className="text-xs text-slate-500">Gerenciar membros da equipe</p></div>
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 flex items-center justify-center"><p className="text-slate-500 text-sm">Página de equipe em desenvolvimento</p></div>
    </div>
  );
}
