"use client";

/**
 * Individual Chat Page - ImobWeb 2026
 * 
 * Interface de conversa direta que integra os WhatsApp Flows Avançados.
 * Permite ao corretor disparar automações e visualizar prévias.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MoreVertical,
  Phone,
  Video,
  Send,
  Plus,
  Zap,
  CheckCheck,
  X
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import FlowPreview from "@/components/whatsapp/FlowPreview";
import { sendPriceAdjustmentFlow, sendPhotoRequestFlow } from "@/lib/whatsapp/advanced-flows";
import { cn } from "@/lib/utils";

export default function DirectChatPage() {
  const params = useParams();
  const chatId = params?.chatId as string;
  const router = useRouter();
  const [showFlowMenu, setShowFlowMenu] = useState(false);
  const [activeFlow, setActiveFlow] = useState<{ text: string, buttons: any[] } | null>(null);
  const [message, setMessage] = useState("");

  const flows = [
    {
      id: 'price',
      label: 'Ajuste de Preço',
      description: 'Sugerir redução baseada em mercado',
      action: () => setActiveFlow({
        text: "Notei que imóveis similares no seu bairro baixaram o preço. Sugerimos um ajuste para R$ 850.000 para acelerar a venda. Aceita?",
        buttons: [
          { id: 'price_yes', title: 'Aceitar Ajuste' },
          { id: 'price_neg', title: 'Negociar' }
        ]
      })
    },
    {
      id: 'photos',
      label: 'Pedido de Fotos',
      description: 'Solicitar novas fotos do imóvel',
      action: () => setActiveFlow({
        text: "Seu imóvel está recebendo muitas buscas! Mas notamos que faltam fotos da cozinha. Pode nos enviar por aqui?",
        buttons: [
          { id: 'photo_yes', title: 'Enviar agora' },
          { id: 'photo_later', title: 'Mais tarde' }
        ]
      })
    }
  ];

  return (
    <main className="flex flex-col h-screen bg-[#efe7de] dark:bg-slate-950 max-h-screen overflow-hidden">
      {/* Header do Chat */}
      <header className="bg-white dark:bg-slate-900 p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 safe-top">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1"><ChevronLeft size={24} /></button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold">J</div>
            <div>
              <h3 className="text-sm font-bold">José Silva</h3>
              <p className="text-[10px] text-green-500 font-medium tracking-wide">Proprietário • Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
          <Video size={20} />
          <Phone size={20} />
          <MoreVertical size={20} />
        </div>
      </header>

      {/* Área de Mensagens (Scroll) */}
      <section className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col items-center mb-4">
          <span className="bg-white/50 dark:bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-500 uppercase">Hoje</span>
        </div>

        {/* Mensagem do Proprietário */}
        <div className="self-start max-w-[80%] bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none shadow-sm">
          <p className="text-sm">Olá! Alguma novidade sobre os interessados de ontem?</p>
          <div className="flex justify-end mt-1"><span className="text-[9px] text-slate-400">10:15</span></div>
        </div>

        {/* Mensagem do Corretor */}
        <div className="self-end ml-auto max-w-[80%] bg-[#dcf8c6] dark:bg-primary/20 p-3 rounded-2xl rounded-tr-none shadow-sm">
          <p className="text-sm">Estamos filtrando os perfis. Tenho um possível agendamento para sábado!</p>
          <div className="flex justify-end mt-1 items-center gap-1">
            <span className="text-[9px] text-slate-400">10:20</span>
            <CheckCheck size={12} className="text-blue-500" />
          </div>
        </div>
      </section>

      {/* Menu de Fluxos Ativo (Overlay) */}
      <AnimatePresence>
        {activeFlow && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex flex-col justify-end"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 relative">
              <button
                onClick={() => setActiveFlow(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800"
              >
                <X size={20} />
              </button>
              <FlowPreview
                text={activeFlow.text}
                buttons={activeFlow.buttons}
                onSend={() => {
                  console.log("Fluxo disparado via Cloud API");
                  setActiveFlow(null);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de Mensagem & Gatilhos de IA/Flow */}
      <footer className="bg-white dark:bg-slate-900 p-3 pb-[env(safe-area-inset-bottom,20px)] border-t border-slate-200 dark:border-slate-800">
        {showFlowMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2 mb-3"
          >
            {flows.map(flow => (
              <button
                key={flow.id}
                onClick={() => { flow.action(); setShowFlowMenu(false); }}
                className="flex flex-col items-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-primary" />
                  <span className="text-xs font-bold">{flow.label}</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">{flow.description}</p>
              </button>
            ))}
          </motion.div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFlowMenu(!showFlowMenu)}
            className={cn("p-2 rounded-full transition-all", showFlowMenu ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}
          >
            <Zap size={22} strokeWidth={2.5} />
          </button>
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-full py-2.5 px-4 text-sm border-none focus:ring-1 ring-primary"
            />
          </div>
          <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
            <Send size={20} />
          </button>
        </div>
      </footer>
    </main>
  );
}
