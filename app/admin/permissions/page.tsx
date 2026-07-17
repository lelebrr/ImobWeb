'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Key, Shield, Users, Building2, CreditCard, Settings, Globe, Zap, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const permissions = [
  { resource: 'user', label: 'Usuários', actions: ['create', 'read', 'update', 'delete'], icon: Users, color: 'text-blue-400' },
  { resource: 'organization', label: 'Organizações', actions: ['create', 'read', 'update', 'delete'], icon: Building2, color: 'text-emerald-400' },
  { resource: 'role', label: 'Roles', actions: ['create', 'read', 'update', 'delete'], icon: Shield, color: 'text-purple-400' },
  { resource: 'permission', label: 'Permissões', actions: ['read', 'manage'], icon: Key, color: 'text-amber-400' },
  { resource: 'billing', label: 'Faturamento', actions: ['read', 'manage'], icon: CreditCard, color: 'text-cyan-400' },
  { resource: 'settings', label: 'Configurações', actions: ['read', 'update'], icon: Settings, color: 'text-slate-400' },
  { resource: 'platform', label: 'Plataforma', actions: ['manage'], icon: Globe, color: 'text-indigo-400' },
  { resource: 'property', label: 'Imóveis', actions: ['create', 'read', 'update', 'delete'], icon: Zap, color: 'text-rose-400' },
  { resource: 'contract', label: 'Contratos', actions: ['create', 'read', 'update', 'delete'], icon: FileText, color: 'text-orange-400' },
  { resource: 'report', label: 'Relatórios', actions: ['read', 'export'], icon: BarChart3, color: 'text-teal-400' },
];

export default function AdminPermissionsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center border border-amber-500/10"><Key className="w-5 h-5 text-amber-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Permissões</h1><p className="text-xs text-slate-500 hidden sm:block">Matriz de permissões do sistema</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissions.map((p) => (
            <motion.div key={p.resource} variants={itemVariants}>
              <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><p.icon className={`w-5 h-5 ${p.color}`} /></div>
                    <p className="font-semibold text-sm text-white">{p.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.actions.map(a => <Badge key={a} className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{a}</Badge>)}
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
