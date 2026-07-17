'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const links = [
  { name: 'Meus Imóveis', desc: 'Acompanhe seus imóveis no portal', href: '/portal/properties', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'Extratos', desc: 'Visualize extratos e relatórios', href: '/portal/statements', icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { name: 'Suporte', desc: 'Central de atendimento', href: '/portal/support', icon: Building2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/10"><Building2 className="w-5 h-5 text-indigo-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Portal do Cliente</h1><p className="text-xs text-slate-500 hidden sm:block">Acompanhe seus imóveis e documentos</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {links.map((l) => (
            <motion.div key={l.name} variants={itemVariants}>
              <Link href={l.href}>
                <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div><p className="font-semibold text-sm text-white">{l.name}</p><p className="text-xs text-slate-500 mt-0.5">{l.desc}</p></div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
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
