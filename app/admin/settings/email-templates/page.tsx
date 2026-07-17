'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Search, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const templates = [
  { id: 'welcome', name: 'Boas-vindas', desc: 'Email enviado ao cadastrar novo usuário', subject: 'Bem-vindo ao imobWeb!', active: true },
  { id: 'reset-password', name: 'Redefinição de Senha', desc: 'Link para redefinir a senha', subject: 'Redefina sua senha', active: true },
  { id: 'invite-user', name: 'Convite de Usuário', desc: 'Convidar novo membro para a equipe', subject: 'Você foi convidado para {org}', active: true },
  { id: 'payment-confirmed', name: 'Pagamento Confirmado', desc: 'Confirmação de pagamento recebido', subject: 'Pagamento confirmado - {plan}', active: true },
  { id: 'payment-overdue', name: 'Pagamento Vencido', desc: 'Aviso de fatura em atraso', subject: 'Fatura vencida - regularize agora', active: false },
];

export default function SettingsEmailTemplatesPage() {
  const [search, setSearch] = useState('');
  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-sky-500/10 flex items-center justify-center border border-blue-500/10"><Mail className="w-5 h-5 text-blue-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Templates de Email</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar templates de email transacional</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar template..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((t) => (
              <Card key={t.id} className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm text-white">{t.name}</p>
                    <Badge className={cn('text-[10px] font-bold px-2.5 py-0.5', t.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>{t.active ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{t.desc}</p>
                  <p className="text-xs text-slate-400 font-mono">Assunto: {t.subject}</p>
                  <div className="mt-3 pt-3 border-t border-white/5"><Button variant="ghost" size="sm" className="text-xs rounded-xl text-indigo-400 hover:text-indigo-300"><Edit3 className="w-3 h-3 mr-1" />Editar</Button></div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
