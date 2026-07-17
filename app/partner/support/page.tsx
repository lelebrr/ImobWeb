'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeadphonesIcon, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

export default function PartnerSupportPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/10"><HeadphonesIcon className="w-5 h-5 text-cyan-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Suporte</h1><p className="text-xs text-slate-500 hidden sm:block">Central de suporte para parceiros</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: 'Email', value: 'parceiros@imobweb.com.br', action: 'Enviar Email', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Phone, label: 'Telefone', value: '(51) 3000-0000', action: 'Ligar Agora', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: HeadphonesIcon, label: 'Atendimento', value: 'Seg-Sex, 8h-18h', action: 'Abrir Ticket', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((item) => (
            <Card key={item.label} className="bg-white/[0.02] border-white/5 rounded-2xl">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}><item.icon className={`w-5 h-5 ${item.color}`} /></div>
                <p className="font-semibold text-sm text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">{item.value}</p>
                <Button variant="ghost" size="sm" className="text-xs rounded-xl text-indigo-400 hover:text-indigo-300">{item.action}</Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
