"use client";

/**
 * Campo (Field Mode) - ImobWeb 2026
 * 
 * Interface simplificada para corretores que estão visitando imóveis.
 * Foco em leitura rápida, botões grandes e suporte offline.
 */

import React from "react";
import { motion } from "framer-motion";
import { Camera, MapPin, ClipboardCheck, MessageCircle, Navigation, Info } from "lucide-react";
import BottomNav from "@/components/mobile/BottomNav";
import SyncIndicator from "@/components/offline/SyncIndicator";

export default function CampoPage() {
  // Simulação de dados (Em produção viriam do IndexedDB via hooks do Dexie)
  const currentProperty = {
    title: "Apartamento Luxo Belvedere",
    address: "Rua das Flores, 123 - Belo Horizonte",
    visitTime: "10:30 AM",
    owner: "José Silva",
  };

  const actions = [
    { icon: Camera, label: "Novas Fotos", color: "bg-blue-500" },
    { icon: ClipboardCheck, label: "Check-in", color: "bg-green-500" },
    { icon: MessageCircle, label: "Falar c/ Dono", color: "bg-teal-500" },
    { icon: Navigation, label: "Waze / Mapas", color: "bg-amber-500" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 p-4 touch-none">
      <SyncIndicator />
      
      {/* Header Focado */}
      <header className="pt-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <span className="text-primary text-xs font-bold uppercase tracking-wider">Visita em Andamento</span>
          <h1 className="text-2xl font-extrabold tracking-tight">{currentProperty.title}</h1>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin size={14} />
            <span className="truncate">{currentProperty.address}</span>
          </div>
        </motion.div>
      </header>

      {/* Grid de Ações "Fat Finger Friendly" */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        {actions.map((action, idx) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:shadow-inner"
          >
            <div className={`p-4 rounded-2xl ${action.color} text-white shadow-lg`}>
              <action.icon size={28} />
            </div>
            <span className="font-bold text-sm">{action.label}</span>
          </motion.button>
        ))}
      </section>

      {/* Card de Informações Rápidas */}
      <section className="bg-primary/5 rounded-3xl p-6 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Info size={80} strokeWidth={1} />
        </div>
        
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          Detalhes do Proprietário
        </h3>
        <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Responsável</span>
            <span className="font-semibold">{currentProperty.owner}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Agendamento</span>
            <span className="font-semibold text-primary">{currentProperty.visitTime}</span>
          </div>
        </div>
      </section>

      {/* Bottom Nav Mobile */}
      <BottomNav />
    </main>
  );
}
