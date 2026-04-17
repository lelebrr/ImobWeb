'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  Zap,
  Target,
  Clock,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { 
  SaleProbabilityScore as SaleProbabilityType, 
  PROBABILITY_COLORS, 
  PROBABILITY_LABELS 
} from '@/types/ai';
import { cn } from '@/lib/utils';
import { Button } from '@/components/design-system/button';

interface SaleProbabilityScoreProps {
  propertyId?: string;
  initialData?: SaleProbabilityType;
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * COMPONENTE DE SCORE DE PROBABILIDADE DE VENDA (REFEITO PARA FUNCIONALIDADE REAL)
 * Design premium, dinâmico e focado em insights.
 */

const CustomTooltip = ({ children, content }: { children: React.ReactNode, content: React.ReactNode }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-slate-950 border border-slate-800 text-white rounded-[1.5rem] shadow-2xl z-[100] w-[280px]"
          >
            {content}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 border-r border-b border-slate-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SaleProbabilityScore: React.FC<SaleProbabilityScoreProps> = ({ 
  propertyId,
  initialData, 
  variant = 'compact',
  className 
}) => {
  const [data, setData] = useState<SaleProbabilityType | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData && !!propertyId);
  const [error, setError] = useState<string | null>(null);

  const calculateScore = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/sale-probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });
      
      if (!response.ok) throw new Error('Falha ao calcular score');
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData && propertyId) {
      calculateScore();
    }
  }, [propertyId, initialData]);

  if (isLoading && variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-2xl border bg-slate-900/50 animate-pulse w-32", className)}>
        <div className="w-8 h-8 rounded-full bg-slate-800" />
        <div className="h-4 bg-slate-800 rounded w-16" />
      </div>
    );
  }

  if (error && variant === 'compact') {
    return (
      <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold uppercase">
        <AlertCircle size={10} /> Erro IA
      </div>
    );
  }

  if (!data) return null;

  const { score, level, trend, aiInsight, predictedDaysToSale, factors } = data;
  const color = PROBABILITY_COLORS[level];

  if (variant === 'compact') {
    return (
      <CustomTooltip
        content={
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest leading-none">Insight da IA</span>
            </div>
            <p className="text-xs font-medium leading-relaxed italic text-indigo-200">
              "{aiInsight}"
            </p>
            <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 uppercase font-black">Previsão:</span>
              <span className="text-[9px] font-black text-emerald-400 uppercase">~{predictedDaysToSale} dias para vender</span>
            </div>
          </div>
        }
      >
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-2xl border bg-slate-900/50 backdrop-blur-md cursor-help transition-all hover:bg-slate-900 group/score",
          className
        )} style={{ borderColor: `${color}40` }}>
          <div className="relative flex items-center justify-center">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                className="text-slate-800"
              />
              <motion.circle
                cx="16"
                cy="16"
                r="14"
                stroke={color}
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={88}
                initial={{ strokeDashoffset: 88 }}
                animate={{ strokeDashoffset: 88 - (88 * score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-[10px] font-black text-white">{score}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 leading-none mb-1">Chance</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-white whitespace-nowrap leading-none">
                {level.split('_')[0]}
              </span>
              {trend === 'up' ? <TrendingUp size={10} className="text-emerald-400" /> : 
               trend === 'down' ? <TrendingDown size={10} className="text-rose-400" /> : 
               <Minus size={10} className="text-slate-500" />}
            </div>
          </div>
        </div>
      </CustomTooltip>
    );
  }

  return (
    <div className={cn(
      "p-6 rounded-[2.5rem] bg-slate-950 border border-slate-800 relative overflow-hidden group",
      className,
      isLoading && "opacity-70"
    )}>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors" />
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm rounded-[2.5rem]">
          <RefreshCcw className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">IA Analisando...</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-600/20 border border-indigo-500/30">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tighter text-white">Chance de Venda</h3>
            <p className="text-xs font-medium text-slate-500">Probabilidade nos próximos 60 dias</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-white tracking-tighter">{score}%</span>
          <div className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase" style={{ color }}>
            {PROBABILITY_LABELS[level]}
            {trend === 'up' && <TrendingUp size={12} />}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 relative cursor-default">
          <Sparkles className="absolute top-4 right-4 w-4 h-4 text-indigo-400 opacity-50" />
          <p className="text-sm font-bold text-indigo-100 italic pr-6 leading-relaxed">
            "{aiInsight}"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-1">
              <Clock size={10} /> Previsão Fast
            </span>
            <span className="text-lg font-black text-white">{predictedDaysToSale} dias</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors" onClick={calculateScore}>
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-1">
              <RefreshCcw size={10} className={isLoading ? "animate-spin" : ""} /> Recalcular
            </span>
            <span className="text-lg font-black text-white" style={{ color }}>{level.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Análise de Fatores</h4>
          <div className="space-y-2">
            {factors.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{f.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${f.score}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={cn(
                        "h-full rounded-full",
                        f.impact === 'positive' ? 'bg-emerald-500' : 
                        f.impact === 'negative' ? 'bg-rose-500' : 'bg-amber-500'
                      )} 
                    />
                  </div>
                  <span className={cn(
                    "font-bold min-w-[30px] text-right",
                    f.impact === 'positive' ? 'text-emerald-400' : 
                    f.impact === 'negative' ? 'text-rose-400' : 'text-amber-400'
                  )}>{f.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
