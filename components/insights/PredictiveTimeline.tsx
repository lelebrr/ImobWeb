'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Flag, 
  Zap,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { SalesProbability } from '../../types/insights';

interface PredictiveTimelineProps {
  data: SalesProbability;
}

/**
 * Componente visual de Timeline Preditiva.
 * Mostra a estimativa de fechamento baseada no funil de leads.
 */
export const PredictiveTimeline: React.FC<PredictiveTimelineProps> = ({ data }) => {
  const { expectedDays, probability, engagementScore } = data;

  const milestones = [
    { label: 'Publicação', icon: Zap, status: 'completed' },
    { label: 'Maturação', icon: Clock, status: 'current' },
    { label: 'Fechamento', icon: Flag, status: 'future' }
  ];

  return (
    <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Venda Prevista
          </CardTitle>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Expectativa</span>
            <span className="text-2xl font-black text-indigo-400">~{expectedDays} dias</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        {/* Progress Timeline */}
        <div className="relative flex items-center justify-between px-2">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2" />
          
          {milestones.map((m, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className={`p-3 rounded-full border-2 ${
                  m.status === 'completed' ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' :
                  m.status === 'current' ? 'bg-slate-900 border-indigo-500 animate-pulse' :
                  'bg-slate-900 border-slate-700'
                }`}
              >
                <m.icon className={`w-4 h-4 ${m.status === 'future' ? 'text-slate-600' : 'text-white'}`} />
              </motion.div>
              <span className={`text-[10px] uppercase font-bold tracking-tighter ${
                m.status === 'future' ? 'text-slate-600' : 'text-slate-300'
              }`}>
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Escore de Engajamento */}
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Escore de Engajamento
            </div>
            <span className="text-sm font-black text-emerald-400">{engagementScore}/100</span>
          </div>
          
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${engagementScore}%` }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic leading-relaxed">
            * Baseado na taxa de conversão entre visualizações e leads reais nos últimos 15 dias.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-600 group cursor-pointer transition-all hover:bg-indigo-500">
          <div className="flex flex-col">
            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Probabilidade de Fechamento</span>
            <span className="text-lg font-black text-white">{Math.round(probability * 100)}%</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
};
