"use client";

/**
 * WhatsApp Mobile Chat List - ImobWeb 2026
 * 
 * Lista de conversas otimizada para o corretor gerir leads e proprietários.
 * Suporta estados offline e indicadores de flows.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, User, Search, Filter, Phone, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Gestures } from "@/components/mobile/Gestures";

const mockChats = [
  { id: "1", name: "José Silva", lastMsg: "Podemos confirmar a visita?", time: "10:30", unread: 2, type: "OWNER" },
  { id: "2", name: "Maria Oliveira", lastMsg: "Qual o valor do condomínio?", time: "09:45", unread: 0, type: "LEAD" },
  { id: "3", name: "Ricardo Santos", lastMsg: "Enviou uma foto 📷", time: "Ontem", unread: 0, type: "OWNER" },
];

export default function WhatsAppListPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header Focado em Pesquisa */}
      <header className="bg-white dark:bg-slate-900 px-4 pt-8 pb-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold tracking-tight">Conversas</h1>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"><Filter size={18} /></button>
            <button className="p-2 rounded-full bg-primary text-white"><MessageSquare size={18} /></button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm border-none focus:ring-2 ring-primary transition-all"
            placeholder="Buscar leads ou proprietários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Lista de Chats com Gestures */}
      <section className="p-4 space-y-3">
        {mockChats.map((chat, idx) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <SwipeableItem className="mb-2">
              <div className="flex items-center gap-4 p-4">
                {/* Avatar com status de tipo */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                    <User className="text-slate-500" size={28} />
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center",
                    chat.type === "OWNER" ? "bg-amber-500" : "bg-blue-500"
                  )}>
                    <span className="text-[8px] font-bold text-white">{chat.type === "OWNER" ? "P" : "L"}</span>
                  </div>
                </div>

                {/* Conteúdo do Chat */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-sm truncate">{chat.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate mr-2">{chat.lastMsg}</p>
                    {chat.unread > 0 ? (
                      <span className="bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                        {chat.unread}
                      </span>
                    ) : (
                      <CheckCheck size={14} className="text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            </SwipeableItem>
          </motion.div>
        ))}
      </section>

      {/* Sugestão de IA flutuante (Ex: "Falar com leads parados") */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="mx-4 p-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/20 flex items-center gap-3"
      >
        <div className="p-2 bg-white/20 rounded-xl"><MessageSquare size={20} /></div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Próxima Ação</p>
          <p className="text-xs font-medium">Você tem 5 leads aguardando resposta há mais de 2h.</p>
        </div>
      </motion.div>
    </main>
  );
}
