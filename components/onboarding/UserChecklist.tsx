'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles,
  Building2,
  Users,
  Layout,
  MessageSquare
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  actionUrl: string;
}

const initialItems: ChecklistItem[] = [
  { 
    id: '1', 
    title: 'Completar Perfil', 
    description: 'Adicione o logo e as cores da sua imobiliária.', 
    icon: Building2, 
    completed: true,
    actionUrl: '/settings'
  },
  { 
    id: '2', 
    title: 'Conectar WhatsApp', 
    description: 'Ative a IA para responder leads 24/7.', 
    icon: MessageSquare, 
    completed: false,
    actionUrl: '/integrations'
  },
  { 
    id: '3', 
    title: 'Convidar Equipe', 
    description: 'Traga seus primeiros 3 corretores.', 
    icon: Users, 
    completed: false,
    actionUrl: '/team'
  },
  { 
    id: '4', 
    title: 'Cadastrar Imóvel', 
    description: 'Suba seu primeiro anúncio teste.', 
    icon: Layout, 
    completed: false,
    actionUrl: '/properties/new'
  },
];

/**
 * Checklist Interativo de Adoção.
 * Mostra o progresso do usuário e incentiva a ativação de features chave.
 */
export const UserChecklist: React.FC = () => {
  const [items, setItems] = useState(initialItems);
  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -z-10" />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-black text-white">Seus Primeiros Passos</h3>
          </div>
          <p className="text-sm text-slate-500">Complete as tarefas para desbloquear o poder total do imobWeb.</p>
        </div>
        <Badge variant="outline" className="border-indigo-500/50 text-indigo-400 font-bold px-3">
          {completedCount} de {items.length} concluintes
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
           <span>Progresso de Ativação</span>
           <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              item.completed 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-slate-950/40 border-slate-800/60 hover:border-indigo-500/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl ${
                item.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${item.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {item.title}
                  </span>
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                {!item.completed && (
                  <div className="pt-2 flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-tighter group-hover:gap-1 transition-all">
                    Começar Agora
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
