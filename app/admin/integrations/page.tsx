'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MessageSquare, Cloud, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const integrations = [
  { id: 'whatsapp', name: 'Nodes de WhatsApp', desc: 'Gerenciar conexões WhatsApp', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/admin/integrations/whatsapp' },
  { id: 'storage', name: 'Storage (S3/Supabase)', desc: 'Configurar armazenamento de arquivos', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admin/integrations/storage' },
  { id: 'cdn', name: 'Status da CDN', desc: 'Monitorar performance da CDN', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', href: '/admin/integrations/cdn' },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 flex items-center justify-center border border-sky-500/10"><Globe className="w-5 h-5 text-sky-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Infra & Integrações</h1><p className="text-xs text-slate-500 hidden sm:block">Gerenciar integrações do sistema</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Link href={item.href}>
                <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}><item.icon className={`w-5 h-5 ${item.color}`} /></div>
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="font-semibold text-sm text-white">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
