'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Zap } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function AdminMarketplacePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center border border-purple-500/10">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Marketplace</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Gerenciar add-ons e extensões da plataforma</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center mx-auto mb-5 border border-purple-500/10">
                <Package className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Marketplace de Extensões</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                Gerencie os add-ons disponíveis para as imobiliárias. Os add-ons são instalados individualmente por tenant.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
