'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

export default function AdminDesignPage() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center border border-pink-500/10"><Palette className="w-5 h-5 text-pink-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Design</h1><p className="text-xs text-slate-500 hidden sm:block">Personalizar aparência da plataforma</p></div>
            </div>
            <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold"><Save className="w-3.5 h-3.5 mr-1" />{saved ? 'Salvo!' : 'Salvar'}</Button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Configurações de design e branding serão implementadas em breve.</p>
        </motion.div>
      </div>
    </div>
  );
}
