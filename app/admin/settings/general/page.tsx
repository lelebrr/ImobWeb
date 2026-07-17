'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function SettingsGeneralPage() {
  const [form, setForm] = useState({ name: 'imobWeb', url: 'https://imobweb.com.br', email: 'contato@imobweb.com.br', support: 'suporte@imobweb.com.br' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-500/20 to-gray-500/10 flex items-center justify-center border border-slate-500/10"><Settings className="w-5 h-5 text-slate-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Configurações Gerais</h1><p className="text-xs text-slate-500 hidden sm:block">Configurações básicas da plataforma</p></div>
            </div>
            <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold"><Save className="w-3.5 h-3.5 mr-1" />{saved ? 'Salvo!' : 'Salvar'}</Button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {[
            { label: 'Nome da Plataforma', key: 'name' },
            { label: 'URL Principal', key: 'url' },
            { label: 'Email de Contato', key: 'email' },
            { label: 'Email de Suporte', key: 'support' },
          ].map((field) => (
            <motion.div key={field.key} variants={itemVariants}>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">{field.label}</label>
              <Input value={form[field.key as keyof typeof form]} onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))} className="h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
