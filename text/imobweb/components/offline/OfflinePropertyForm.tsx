"use client";

/**
 * OfflinePropertyForm - ImobWeb 2026
 * 
 * Formulário otimizado para cadastro de imóveis SEM INTERNET.
 * Salva no IndexedDB e enfileira para sincronização futura.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Camera, WifiOff, CheckCircle2, Sparkles } from "lucide-react";
import { db, addToSyncQueue } from "../../lib/offline-db";
import { cn } from "@/lib/utils";
import { useAI } from "../../providers/ai-provider";

export default function OfflinePropertyForm() {
  const { generateDescription, isReady } = useAI();
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    address: "",
    description: ""
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const propertyId = crypto.randomUUID();
      
      // 1. Salva no banco local (IndexedDB)
      await db.properties.add({
        id: propertyId,
        title: formData.title,
        price: Number(formData.price),
        address: formData.address,
        mainImage: "", // Mock
        status: 'active',
        updatedAt: Date.now()
      });

      // 2. Adiciona à fila de sincronização
      await addToSyncQueue({
        type: 'CREATE_LEAD', // Reusando tipo ou criando novo
        payload: { ...formData, id: propertyId }
      });

      // 3. Feedback visual
      setIsSaving(false);
      setIsDone(true);
      
      // Reset após 3 segundos
      setTimeout(() => setIsDone(false), 3000);
    } catch (error) {
      console.error("Falha ao salvar offline:", error);
      setIsSaving(false);
    }
  };

  const handleAICompose = async () => {
    if (!isReady || !formData.title) return;
    try {
      const desc = await generateDescription({
        title: formData.title,
        price: formData.price,
        type: "Residencial",
        businessType: "Venda"
      });
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (err) {
      console.error("IA falhou (provavelmente offline):", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Novo Imóvel</h2>
        {!navigator.onLine && (
          <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold uppercase tracking-tighter bg-amber-500/10 px-2 py-1 rounded-full">
            <WifiOff size={10} />
            Offline Mode
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase">Título do Anúncio</label>
          <input
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-4 focus:ring-2 ring-primary transition-all text-sm"
            placeholder="Ex: Apartamento Vista Mar"
            value={formData.title}
            onChange={e => setFormData({ ...prev => ({ ...prev, title: e.target.value }) })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase">Preço (R$)</label>
            <input
              type="number"
              className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-4 focus:ring-2 ring-primary transition-all text-sm"
              placeholder="0.00"
              value={formData.price}
              onChange={e => setFormData({ ...prev => ({ ...prev, price: e.target.value }) })}
              required
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-[52px] rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
            >
              <Camera size={18} />
              Fotos
            </button>
          </div>
        </div>

        <div className="relative">
          <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase flex justify-between">
            Descrição
            {isReady && (
              <button 
                type="button"
                onClick={handleAICompose}
                className="text-primary flex items-center gap-1 hover:underline"
              >
                <Sparkles size={12} /> Sugerir com IA
              </button>
            )}
          </label>
          <textarea
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-4 focus:ring-2 ring-primary transition-all text-sm min-h-[100px]"
            placeholder="Detalhes do imóvel..."
            value={formData.description}
            onChange={e => setFormData({ ...prev => ({ ...prev, description: e.target.value }) })}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={isSaving || isDone}
          className={cn(
            "w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
            isDone ? "bg-green-500 text-white" : "bg-primary text-primary-foreground shadow-primary/20"
          )}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isDone ? (
            <>
              <CheckCircle2 size={20} />
              Salvo no Dispositivo
            </>
          ) : (
            <>
              <Save size={20} />
              Salvar Imóvel
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
