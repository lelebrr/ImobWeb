'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Check, Loader2, MessageSquare, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldEngine } from '@/lib/field-mode/field-engine';
import { cn } from '@/lib/utils';

interface VisitNotesProps {
  onClose: () => void;
  visitId?: string;
}

/**
 * VISIT NOTES ENGINE - IMOBWEB 2026
 * Voice-to-text reporting for property visits.
 */
export function VisitNotes({ onClose, visitId }: VisitNotesProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const engine = FieldEngine.getInstance();

  const handleRecord = async () => {
    setIsRecording(true);
    try {
      const text = await engine.listen();
      setNote(prev => prev ? `${prev} ${text}` : text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulation of saving to local Dexie
    await new Promise(r => setTimeout(r, 800));
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Relatório da Visita</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-500">
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Toque no microfone para descrever como foi a visita..."
          className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-white text-lg resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
        />

        <div className="flex flex-col items-center py-8">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleRecord}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl shadow-indigo-500/20 mb-4",
              isRecording ? "bg-red-500 animate-pulse scale-110" : "bg-indigo-600"
            )}
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.button>
          <p className="text-slate-400 font-medium">
            {isRecording ? "Gravando nota..." : "Adicionar nota por voz"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-14 bg-indigo-600 hover:bg-indigo-500 font-bold text-lg rounded-2xl"
            onClick={handleSave}
            disabled={!note || isSaving}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Nota"}
          </Button>
          <Button 
            variant="outline" 
            className="h-14 border-slate-800 bg-slate-900/50 text-slate-100 font-bold text-lg rounded-2xl"
            onClick={onClose}
          >
            Pular
          </Button>
        </div>
      </div>

      {/* History Mini Preview */}
      <div className="mt-6 flex items-center justify-center gap-4 text-slate-600">
        <History className="w-4 h-4" />
        <span className="text-xs uppercase font-black tracking-widest">Ver notas anteriores</span>
      </div>
    </div>
  );
}
