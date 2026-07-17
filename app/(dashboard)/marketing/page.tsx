'use client';

import React from 'react';
import { Megaphone } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center border border-pink-500/10"><Megaphone className="w-5 h-5 text-pink-400" /></div>
        <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Marketing</h1><p className="text-xs text-slate-500">Campanhas de marketing</p></div>
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 flex items-center justify-center"><p className="text-slate-500 text-sm">Página de marketing em desenvolvimento</p></div>
    </div>
  );
}
