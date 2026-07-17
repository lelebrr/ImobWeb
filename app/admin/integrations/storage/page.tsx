'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, HardDrive, Database, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const storages = [
  { id: 's3', name: 'Amazon S3', type: 'Bucket S3', status: 'configured', used: '45.2 GB', total: '100 GB', icon: Cloud },
  { id: 'supabase', name: 'Supabase Storage', type: 'Bucket Supabase', status: 'configured', used: '12.8 GB', total: '50 GB', icon: Database },
  { id: 'local', name: 'Armazenamento Local', type: 'Disco do Servidor', status: 'active', used: '8.3 GB', total: '20 GB', icon: HardDrive },
];

export default function IntegrationsStoragePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/10"><Cloud className="w-5 h-5 text-blue-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Storage (S3/Supabase)</h1><p className="text-xs text-slate-500 hidden sm:block">Configurar armazenamento de arquivos</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {storages.map((s) => (
            <motion.div key={s.id} variants={itemVariants}>
              <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><s.icon className="w-5 h-5 text-slate-300" /></div>
                      <div><p className="font-semibold text-sm text-white">{s.name}</p><p className="text-xs text-slate-500">{s.type}</p></div>
                    </div>
                    {s.status === 'configured' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Usado</span><span className="text-slate-300 font-medium">{s.used}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Total</span><span className="text-slate-300 font-medium">{s.total}</span></div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${(parseFloat(s.used) / parseFloat(s.total)) * 100}%` }} /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
