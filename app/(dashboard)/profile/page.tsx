'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><User className="w-5 h-5 text-indigo-400" /></div>
          <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Meu Perfil</h1><p className="text-xs text-slate-500">Suas informações pessoais</p></div>
        </div>
        <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold"><Save className="w-3.5 h-3.5 mr-1" />{saved ? 'Salvo!' : 'Salvar'}</Button>
      </div>
      <div className="max-w-xl space-y-5">
        {[{ label: 'Nome', placeholder: 'Seu nome' }, { label: 'Email', placeholder: 'seu@email.com' }, { label: 'Telefone', placeholder: '(51) 99999-0000' }].map((f) => (
          <div key={f.label}><label className="text-sm font-medium text-slate-300 mb-1.5 block">{f.label}</label><Input placeholder={f.placeholder} className="h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" /></div>
        ))}
      </div>
    </div>
  );
}
