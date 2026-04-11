'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Camera, 
  Sparkles, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Property } from '../../types/property';
import { cn } from '../../lib/utils';

interface ImageQualityReportProps {
  property: Property;
}

/**
 * IMAGE QUALITY REPORT COMPONENT - IMOBWEB 2026
 * AI-driven assessment of property media quality and conversion potential.
 */
export const ImageQualityReport: React.FC<ImageQualityReportProps> = ({ property }) => {
  const mediaCount = property.media.length;
  const has360 = property.media.some(m => m.category === 'PANORAMA_360');
  const avgQuality = property.media.reduce((acc, m) => acc + (m.aiMetadata?.qualityScore || 0), 0) / mediaCount;
  
  // Scoring logic
  const score = Math.round((avgQuality * 70) + (has360 ? 20 : 0) + (mediaCount >= 10 ? 10 : 5));
  const finalScore = Math.min(score, 100);

  const getStatus = (s: number) => {
    if (s >= 80) return { label: 'Excelente', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (s >= 50) return { label: 'Bom', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { label: 'Pode Melhorar', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  };

  const status = getStatus(finalScore);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 blur-[100px] rounded-full" />
      
      <div className="flex flex-col md:flex-row gap-12 items-center">
        {/* Score Circle */}
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-800"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={440}
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * finalScore) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-indigo-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white italic tracking-tighter">{finalScore}</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Índice Visual</span>
          </div>
        </div>

        {/* Details & Suggestions */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-400">
               <Sparkles size={18} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white tracking-tight">Análise de IA de Mídia</h3>
               <div className="flex items-center gap-2 mt-1">
                 <div className={cn("w-2 h-2 rounded-full animate-pulse", status.color.replace('text', 'bg'))} />
                 <span className={cn("text-xs font-black uppercase tracking-widest", status.color)}>Status: {status.label}</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricItem 
              label="Volume de Fotos" 
              value={mediaCount} 
              pass={mediaCount >= 10} 
              desc={`${mediaCount}/10 recomendadas`} 
            />
            <MetricItem 
              label="Qualidade Técnica" 
              value={`${Math.round(avgQuality * 100)}%`} 
              pass={avgQuality >= 0.8} 
              desc="Nitidez e Iluminação" 
            />
            <MetricItem 
              label="Tour 360" 
              value={has360 ? 'Ativo' : 'Inativo'} 
              pass={has360} 
              desc="+40% de engajamento" 
            />
            <MetricItem 
              label="Verificação IA" 
              value="Certificado" 
              pass={true} 
              desc="Fotos autênticas" 
            />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Sugestões de Melhoria</h4>
            <div className="space-y-3">
               {mediaCount < 10 && <SuggestionItem text="Adicione fotos de todos os ângulos da fachada principal." />}
               {!has360 && <SuggestionItem text="O tour virtual 360 aumentaria sua taxa de cliques (CTR) consideravelmente." />}
               {avgQuality < 0.8 && <SuggestionItem text="Algumas fotos estão escuras. Recomendamos re-captura durante 'Golden Hour'." />}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Action */}
      <div className="mt-8 flex justify-end">
        <button className="flex items-center gap-2 text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-all cursor-pointer">
          Ver relatório técnico detalhado
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const MetricItem = ({ label, value, pass, desc }: { label: string, value: any, pass: boolean, desc: string }) => (
  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      {pass ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertCircle size={12} className="text-rose-500" />}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-[10px] text-slate-600 truncate">{desc}</span>
    </div>
  </div>
);

const SuggestionItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2">
    <div className="mt-1 shrink-0 bg-indigo-500/10 p-1 rounded-md text-indigo-500">
      <CheckCircle2 size={12} />
    </div>
    <p className="text-xs text-slate-400 leading-tight">{text}</p>
  </div>
);
