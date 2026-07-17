'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const roles = [
  { id: 'PLATFORM_MASTER', label: 'Plataforma - Master', level: 'Platform', icon: ShieldAlert, color: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'Acesso total a todas as funcionalidades' },
  { id: 'PLATFORM_MARKETING', label: 'Plataforma - Marketing', level: 'Platform', icon: Shield, color: 'text-pink-400', bg: 'bg-pink-500/10', desc: 'Gerenciar campanhas e conteúdos' },
  { id: 'PLATFORM_FINANCE', label: 'Plataforma - Financeiro', level: 'Platform', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Gerenciar assinaturas e faturas' },
  { id: 'PLATFORM_SUPPORT', label: 'Plataforma - Suporte', level: 'Platform', icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/10', desc: 'Suporte aos usuários da plataforma' },
  { id: 'AGENCY_MASTER', label: 'Imobiliária - Master', level: 'Agency', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Administrador da imobiliária' },
  { id: 'AGENCY_SALES', label: 'Imobiliária - Vendas', level: 'Agency', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Acesso a leads e vendas' },
  { id: 'AGENCY_HR', label: 'Imobiliária - RH', level: 'Agency', icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10', desc: 'Gerenciar equipe' },
  { id: 'AGENCY_MARKETING', label: 'Imobiliária - Marketing', level: 'Agency', icon: ShieldCheck, color: 'text-pink-400', bg: 'bg-pink-500/10', desc: 'Campanhas e portais' },
  { id: 'AGENCY_FINANCE', label: 'Imobiliária - Financeiro', level: 'Agency', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Financeiro da imobiliária' },
  { id: 'AGENCY_SUPPORT', label: 'Imobiliária - Suporte', level: 'Agency', icon: ShieldCheck, color: 'text-slate-400', bg: 'bg-slate-500/10', desc: 'Suporte interno' },
];

export default function AdminRolesPage() {
  const platform = roles.filter(r => r.level === 'Platform');
  const agency = roles.filter(r => r.level === 'Agency');

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><Shield className="w-5 h-5 text-indigo-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Roles</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar papéis e permissões</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {[{ title: 'Platform Roles', data: platform }, { title: 'Agency Roles', data: agency }].map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{section.title}</h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.data.map((r) => (
                <motion.div key={r.id} variants={itemVariants}>
                  <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center`}><r.icon className={`w-5 h-5 ${r.color}`} /></div>
                        <div><p className="font-semibold text-sm text-white">{r.label}</p><p className="text-xs text-slate-500">{r.desc}</p></div>
                      </div>
                      <Badge className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{r.id}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
