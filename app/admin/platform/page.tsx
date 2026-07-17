'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function AdminPlatformPage() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center border border-indigo-500/10"><Globe className="w-5 h-5 text-indigo-400" /></div>
              <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Configurações da Plataforma</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar configurações globais do SaaS</p></div>
            </div>
            <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold"><Save className="w-3.5 h-3.5 mr-1" />{saved ? 'Salvo!' : 'Salvar'}</Button>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {[
            { label: 'Nome da Plataforma', value: 'imobWeb', key: 'name' },
            { label: 'URL Base', value: 'https://imobweb.com.br', key: 'url' },
            { label: 'Versão', value: '1.0.0', key: 'version' },
            { label: 'Ambiente', value: 'Produção', key: 'env' },
          ].map((f) => (
            <motion.div key={f.key} variants={itemVariants}>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">{f.label}</label>
              <Input defaultValue={f.value} className="h-11 rounded-xl bg-white/5 border-white/5 text-white" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
