'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

const gateways = [
  { id: 'stripe', name: 'Stripe', status: 'connected', type: 'Cartão de Crédito', fee: '2.9% + R$ 0,49', icon: CreditCard },
  { id: 'pix', name: 'Pix (Banco Central)', status: 'connected', type: 'Pix', fee: '0%', icon: CreditCard },
  { id: 'boleto', name: 'Boleto Bancário', status: 'pending', type: 'Boleto', fee: 'R$ 2,50', icon: CreditCard },
  { id: 'mercado-pago', name: 'Mercado Pago', status: 'disconnected', type: 'Carteira Digital', fee: '3.2% + R$ 0,50', icon: CreditCard },
];

export default function BillingGatewaysPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 flex items-center justify-center border border-teal-500/10"><CreditCard className="w-5 h-5 text-teal-400" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Gateways de Pagamento</h1><p className="text-xs text-slate-500 hidden sm:block">Configurar provedores de pagamento</p></div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gateways.map((g) => (
            <motion.div key={g.id} variants={itemVariants}>
              <Card className="bg-white/[0.02] border-white/5 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><g.icon className="w-5 h-5 text-slate-300" /></div>
                      <div><p className="font-semibold text-sm text-white">{g.name}</p><p className="text-xs text-slate-500">{g.type}</p></div>
                    </div>
                    {g.status === 'connected' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : g.status === 'pending' ? <Settings className="w-5 h-5 text-amber-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Taxa: <strong className="text-slate-300">{g.fee}</strong></span>
                    <Button variant="ghost" size="sm" className="text-xs rounded-xl text-indigo-400 hover:text-indigo-300">{g.status === 'connected' ? 'Configurar' : g.status === 'pending' ? 'Ativar' : 'Reconectar'}</Button>
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
