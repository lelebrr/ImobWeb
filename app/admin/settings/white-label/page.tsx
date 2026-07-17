'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function SettingsWhiteLabelPage() {
  const [form, setForm] = useState({ logo: '', primaryColor: '#6366f1', secondaryColor: '#8b5cf6', companyName: 'imobWeb' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center border border-pink-500/10"><Palette className="w-5 h-5 text-pink-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Padrões White Label</h1><p className="text-xs text-slate-500 hidden sm:block">Personalizar aparência da plataforma</p></div>
            </div>
            <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold"><Save className="w-3.5 h-3.5 mr-1" />{saved ? 'Salvo!' : 'Salvar'}</Button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">URL da Logo</label>
            <Input value={form.logo} onChange={(e) => setForm(p => ({ ...p, logo: e.target.value }))} placeholder="https://..." className="h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Nome da Empresa</label>
            <Input value={form.companyName} onChange={(e) => setForm(p => ({ ...p, companyName: e.target.value }))} className="h-11 rounded-xl bg-white/5 border-white/5 text-white" />
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">Cor Primária</label><div className="flex gap-2 items-center"><input type="color" value={form.primaryColor} onChange={(e) => setForm(p => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent" /><span className="text-xs text-slate-500">{form.primaryColor}</span></div></div>
            <div><label className="text-sm font-medium text-slate-300 mb-1.5 block">Cor Secundária</label><div className="flex gap-2 items-center"><input type="color" value={form.secondaryColor} onChange={(e) => setForm(p => ({ ...p, secondaryColor: e.target.value }))} className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent" /><span className="text-xs text-slate-500">{form.secondaryColor}</span></div></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
