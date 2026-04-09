'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Info,
  Target,
  Clock
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
import { Badge } from '@/components/ui/badge';
import { PriceRecommendation } from '../../types/insights';

interface PriceRecommendationCardProps {
  recommendation: PriceRecommendation;
  propertyTitle?: string;
}

/**
 * Componente visual de Recomendação de Preço.
 * Design focado em dados e conversão.
 */
export const PriceRecommendationCard: React.FC<PriceRecommendationCardProps> = ({ 
  recommendation, 
  propertyTitle 
}) => {
  const { 
    suggestedPrice, 
    minPrice, 
    maxPrice, 
    confidence, 
    marketAverage, 
    reasoning,
    comparablesCount 
  } = recommendation;

  const currentPrice = suggestedPrice; // Simplificação para o mockup/exemplo

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <Card className="overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
      <div className="absolute top-0 right-0 p-4">
        <Badge variant={confidence > 0.8 ? "default" : "secondary"} className="bg-indigo-600">
          IA Confiança: {Math.round(confidence * 100)}%
        </Badge>
      </div>

      <CardHeader>
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <DollarSign className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Recomendação de Preço</span>
        </div>
        <CardTitle className="text-2xl font-bold">{propertyTitle || 'Análise de Precificação'}</CardTitle>
        <CardDescription className="text-slate-400">
          Baseado em {comparablesCount} imóveis similares no mesmo bairro.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preço Principal */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
          <span className="text-xs text-slate-500 uppercase font-semibold">Preço Ideal Sugerido</span>
          <h2 className="text-4xl font-black text-white mt-1">
            {formatCurrency(suggestedPrice)}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
            <span>Média do Mercado:</span>
            <span className="font-semibold">{formatCurrency(marketAverage)}</span>
          </div>
        </div>

        {/* Faixas de Preço */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Venda Rápida (Mín)</span>
            <p className="text-lg font-bold text-rose-400">{formatCurrency(minPrice)}</p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Limite Superior (Máx)</span>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(maxPrice)}</p>
          </div>
        </div>

        {/* Argumentação da IA */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            Por que este preço?
          </h4>
          <ul className="space-y-2">
            {reasoning.map((r, i) => (
              <li key={i} className="text-sm text-slate-400 flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-6 flex gap-3">
        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all hover:scale-[1.02]">
          Aplicar Novo Preço
        </Button>
        <Button variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300">
          Ver Comparativos
        </Button>
      </CardFooter>
    </Card>
  );
};

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
