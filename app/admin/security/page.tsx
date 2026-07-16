'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, AlertTriangle, FileText } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminSecurityPage() {
  const statusCards = [
    { label: 'LGPD Compliance', status: 'Ativo', icon: ShieldCheck, gradient: 'from-emerald-600/30 to-emerald-900/30' },
    { label: 'Auditoria de Acessos', status: 'Ativo', icon: FileText, gradient: 'from-blue-600/30 to-blue-900/30' },
    { label: 'Bloqueio de IP', status: 'Configurado', icon: AlertTriangle, gradient: 'from-amber-600/30 to-amber-900/30' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center border border-red-500/10">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Segurança & Auditoria</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Logs de auditoria, bloqueio de IP e feature flags</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statusCards.map((item) => (
              <motion.div key={item.label} variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
                <div className={cn('relative rounded-2xl p-5 overflow-hidden border border-white/5', item.gradient)}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-white/90" />
                    </div>
                    <p className="text-[11px] text-white/50 uppercase tracking-[0.15em] font-semibold mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-white">{item.status}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center mx-auto mb-5 border border-red-500/10">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Centro de Segurança</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                Logs de auditoria em tempo real, gerenciamento de bloqueio de IP e feature flags da plataforma.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
