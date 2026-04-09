'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Camera, 
  FileText, 
  MapPin 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HealthScore } from '../../types/insights';

interface HealthScoreCardProps {
  scoreData: HealthScore;
  propertyName?: string;
}

/**
 * Componente visual de Score de Saúde do Anúncio.
 * Design premium com micro-interações e cores semânticas.
 */
export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ scoreData, propertyName }) => {
  const { score, factors, recommendations } = scoreData;

  // Determinar cor baseada no score
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getProgressColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-slate-900/50 backdrop-blur-xl group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white tracking-tight">
              Saúde do Anúncio
            </CardTitle>
            <CardDescription className="text-slate-400">
              {propertyName || 'Imóvel em análise'}
            </CardDescription>
          </div>
          <div className={`text-3xl font-black ${getScoreColor(score)}`}>
            {score}%
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Barra de Progresso Animada */}
        <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`absolute h-full ${getProgressColor(score)}`}
          />
        </div>

        {/* Fatores de Impacto */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Principais Fatores</h4>
          {factors.map((factor, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
            >
              {factor.impact < 0 ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{factor.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{factor.description}</p>
              </div>
              <span className={`text-xs font-mono ${factor.impact < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {factor.impact > 0 ? '+' : ''}{factor.impact}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Recomendações Acionáveis */}
        {recommendations.length > 0 && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              Como melhorar seu score:
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2">
                  <span className="text-indigo-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
