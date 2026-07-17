'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Zap, Cloud, MessageSquare, BarChart3, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const apps = [
  { id: 'ai-assistant', name: 'Assistente IA', desc: 'Chat inteligente para atendimento', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', status: 'installed', price: 'Grátis' },
  { id: 'cloud-backup', name: 'Cloud Backup', desc: 'Backup automático na nuvem', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-500/10', status: 'installed', price: 'R$ 19/mês' },
  { id: 'whatsapp-pro', name: 'WhatsApp Pro', desc: 'Integração avançada com WhatsApp', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', status: 'available', price: 'R$ 29/mês' },
  { id: 'advanced-bi', name: 'BI Avançado', desc: 'Relatórios e dashboards personalizados', icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10', status: 'available', price: 'R$ 39/mês' },
  { id: 'security-plus', name: 'Security Plus', desc: 'Auditoria e compliance LGPD', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', status: 'available', price: 'R$ 49/mês' },
  { id: 'multi-portal', name: 'Multi Portal Sync', desc: 'Sincronização com múltiplos portais', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', status: 'installed', price: 'Grátis' },
];

export default function MarketplaceAppsPage() {
  const [search, setSearch] = useState('');
  const filtered = apps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/10"><Package className="w-5 h-5 text-emerald-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Gerenciar Aplicativos</h1><p className="text-xs text-slate-500 hidden sm:block">Marketplace de apps e add-ons da plataforma</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input placeholder="Buscar aplicativos..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((app) => (
              <Card key={app.id} className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${app.bg} flex items-center justify-center`}><app.icon className={`w-5 h-5 ${app.color}`} /></div>
                    <Badge className={`text-[10px] font-bold px-2.5 py-0.5 ${app.status === 'installed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{app.status === 'installed' ? 'Instalado' : 'Disponível'}</Badge>
                  </div>
                  <p className="font-semibold text-sm text-white">{app.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{app.desc}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="text-xs text-slate-400">{app.price}</span>
                    <Button variant="ghost" size="sm" className="text-xs rounded-xl text-indigo-400 hover:text-indigo-300">{app.status === 'installed' ? 'Gerenciar' : 'Instalar'}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
