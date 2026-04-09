'use client';

import React from 'react';
import { HelpCircle, ExternalLink } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCenterEngine } from '@/lib/help/help-center';

interface ContextualHelpProps {
  slug: string;
  label?: string;
  className?: string;
}

/**
 * Gatilho de Ajuda Contextual.
 * Um pequeno ícone de interrogação que abre um resumo do guia e links para a documentação.
 */
export const ContextualHelp: React.FC<ContextualHelpProps> = ({ slug, label, className }) => {
  const article = HelpCenterEngine.getBySlug(slug);

  if (!article) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors group ${className}`}>
          <HelpCircle className="w-4 h-4" />
          {label && <span className="text-xs font-bold uppercase tracking-tighter">{label}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-slate-800 text-slate-100 shadow-2xl p-6 rounded-2xl">
        <div className="space-y-4">
          <div className="space-y-1">
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Dica Rápida</p>
             <h4 className="font-bold text-white leading-tight">{article.title}</h4>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed">
            {article.excerpt}
          </p>

          <div className="pt-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-slate-950 border-slate-800 hover:bg-slate-800 gap-2 h-9 text-xs"
                onClick={() => window.open(`/help/articles/${slug}`, '_blank')}
            >
              Ler Guia Completo
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
