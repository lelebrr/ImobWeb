"use client";

/**
 * FlowPreview - ImobWeb 2026
 * 
 * Componente premium de pré-visualização de mensagens do WhatsApp.
 * Permite que o corretor veja exatamente como os botões e templates
 * aparecerão para o proprietário antes de disparar o fluxo.
 */

import React from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck, User, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowPreviewProps {
  text: string;
  buttons: { id: string, title: string }[];
  userName?: string;
  onSend?: () => void;
  className?: string;
}

export default function FlowPreview({
  text,
  buttons,
  userName = "Proprietário",
  onSend,
  className
}: FlowPreviewProps) {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="text-xs font-bold text-muted-foreground uppercase ml-1">Pré-visualização do WhatsApp</div>
      
      {/* Container simulando tela de chat */}
      <div className="rounded-3xl bg-[#e5ddd5] dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 shadow-inner min-h-[300px] flex flex-col justify-end">
        
        {/* Balão de Mensagem Estilo WhatsApp */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="self-start max-w-[85%] bg-white dark:bg-slate-900 rounded-t-xl rounded-br-xl rounded-bl-none p-3 shadow-md relative"
        >
          {/* Texto da Mensagem */}
          <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
            {text}
          </p>
          
          {/* Rodapé do Balão com Hora e Status */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] text-slate-400">{currentTime}</span>
            <CheckCheck size={12} className="text-blue-500" />
          </div>

          {/* Botões Interativos (Meta Cloud API style) */}
          <div className="mt-3 flex flex-col border-t border-slate-100 dark:border-slate-800">
            {buttons.map((btn, idx) => (
              <div 
                key={btn.id}
                className={cn(
                  "py-2.5 text-center text-sm font-semibold text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer",
                  idx !== buttons.length - 1 && "border-b border-slate-100 dark:border-slate-800"
                )}
              >
                {btn.title}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Input Simulado */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-10 flex-1 bg-white dark:bg-slate-900 rounded-full px-4 flex items-center text-slate-400 text-sm">
            Mensagem interativa...
          </div>
          <div className="w-10 h-10 bg-[#128c7e] text-white rounded-full flex items-center justify-center">
            <Send size={18} />
          </div>
        </div>
      </div>

      {/* Ação de Disparo Real */}
      <button
        onClick={onSend}
        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]"
      >
        <Send size={20} />
        Enviar para o Proprietário
      </button>
    </div>
  );
}
