'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Palette, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-500/20 to-gray-500/10 flex items-center justify-center border border-slate-500/10">
              <Settings className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Configurações do SaaS</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Configurações gerais da plataforma</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
          {/* General */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Geral</h3>
                    <p className="text-xs text-slate-500">Configurações básicas da plataforma</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nome da Plataforma</Label>
                  <Input defaultValue="imobWeb" className="rounded-xl bg-white/5 border-white/5 text-white focus:border-indigo-500/30 focus:ring-indigo-500/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">URL da Plataforma</Label>
                  <Input defaultValue="https://imobweb.com.br" className="rounded-xl bg-white/5 border-white/5 text-white focus:border-indigo-500/30 focus:ring-indigo-500/20" />
                </div>
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </motion.div>

          {/* White Label */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/10">
                    <Palette className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">White Label Defaults</h3>
                    <p className="text-xs text-slate-500">Cores padrão para novas organizações</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input defaultValue="#0b5bd3" className="rounded-xl bg-white/5 border-white/5 text-white focus:border-indigo-500/30 focus:ring-indigo-500/20" />
                      <div className="w-11 h-11 rounded-xl bg-[#0b5bd3] border border-white/10 shrink-0 shadow-lg" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input defaultValue="#667eea" className="rounded-xl bg-white/5 border-white/5 text-white focus:border-indigo-500/30 focus:ring-indigo-500/20" />
                      <div className="w-11 h-11 rounded-xl bg-[#667eea] border border-white/10 shrink-0 shadow-lg" />
                    </div>
                  </div>
                </div>
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Email Templates */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
                    <Mail className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Templates de Email</h3>
                    <p className="text-xs text-slate-500">Gerenciar templates de email enviados pela plataforma</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-400 mb-4">
                  Gerencie os templates de email enviados pela plataforma (boas-vindas, fatura, notificação).
                </p>
                <Button variant="outline" size="sm" className="rounded-xl border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                  Gerenciar Templates
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
