'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  MessageSquare, 
  UserMinus, 
  ArrowRight,
  ExternalLink 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChurnRisk } from '../../types/insights';

interface ChurnAlertCardProps {
  churnData: ChurnRisk;
  itemName?: string;
}

/**
 * Card de Alerta de Churn Profissional.
 * Focado em ação imediata para retenção.
 */
export const ChurnAlertCard: React.FC<ChurnAlertCardProps> = ({ churnData, itemName }) => {
  const { probability, riskLevel, factors, suggestedActions } = churnData;

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'CRITICAL': return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-500', icon: 'text-rose-400' };
      case 'HIGH': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500', icon: 'text-orange-400' };
      default: return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', icon: 'text-amber-400' };
    }
  };

  const styles = getRiskStyles(riskLevel);

  return (
    <Card className={`overflow-hidden border-2 ${styles.border} ${styles.bg} backdrop-blur-md`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${styles.icon}`} />
            <CardTitle className={`text-lg font-bold ${styles.text}`}>Risco de Churn: {riskLevel}</CardTitle>
          </div>
          <span className="text-2xl font-black opacity-40">{Math.round(probability * 100)}%</span>
        </div>
        <CardDescription className="text-slate-400">
          Anomalia detectada em: <span className="text-slate-100 font-medium">{itemName || 'Entidade'}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Fatores Detetados */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Por que o risco subiu?</p>
          <ul className="space-y-1">
            {factors.map((f, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-slate-600 mt-1">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Sugestões de Ação */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Ação Recomendada pela IA</p>
          <div className="space-y-2">
            {suggestedActions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white font-medium bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                {action}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 bg-slate-950/20 pt-4">
        <Button className="flex-1 bg-white text-black hover:bg-slate-200 font-bold group">
          <MessageSquare className="w-4 h-4 mr-2" />
          Falar via WhatsApp
          <motion.span 
            className="inline-block ml-1"
            whileHover={{ x: 5 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </Button>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
