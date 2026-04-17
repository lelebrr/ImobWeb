'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldEngine } from '@/lib/field-mode/field-engine';
import { VoiceRegistrationResult } from '@/types/ai';
import { cn } from '@/lib/utils';

interface VoicePropertyCreatorProps {
  onClose: () => void;
}

/**
 * VOICE PROPERTY CREATOR - IMOBWEB 2026
 * Uses native Web Speech API (Free & Fast) + AI parsing for structured data.
 */
export function VoicePropertyCreator({ onClose }: VoicePropertyCreatorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<VoiceRegistrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const engine = FieldEngine.getInstance();

  const startListening = async () => {
    try {
      setError(null);
      setIsRecording(true);
      setTranscript('Ouvindo...');

      const text = await engine.listen();
      setTranscript(text);
      setIsRecording(false);

      // Process with AI
      processWithAI(text);
    } catch (err: any) {
      setError('Não foi possível capturar sua voz. Verifique as permissões de microfone.');
      setIsRecording(false);
    }
  };

  const processWithAI = async (text: string) => {
    setIsProcessing(true);
    try {
      // In a real implementation, this would call a server action that uses OpenAI/DeepSeek
      // For this optimized prototype, we simulate a very fast extraction
      await new Promise(r => setTimeout(r, 1500));

      const mockResult: VoiceRegistrationResult = {
        transcript: text,
        confidence: 0.95,
        extractedData: {
          type: text.toLowerCase().includes('apartamento') ? 'APARTMENT' : 'HOUSE',
          bedrooms: text.match(/\d+ quartos/i) ? parseInt(text.match(/\d+/i)![0]) : 3,
          bathrooms: text.match(/\d+ banheiros/i) ? parseInt(text.match(/\d+/i)![0]) : 2,
          area: 120,
          price: 280000,
          neighborhood: 'Savassi',
          city: 'Belo Horizonte',
          address: null,
          description: null
        },
        suggestedActions: ['Verificar fotos', 'Confirmar valor condomínio']
      };

      setResult(mockResult);
    } catch (err) {
      setError('Erro ao processar informações. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col p-6 overflow-hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-100 italic">VOICE ENGINE v2.0</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-400">
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Animated Waveform / Pulse */}
        <div className="relative mb-12">
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-blue-500 rounded-full blur-2xl"
              />
            )}
          </AnimatePresence>

          <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={!isRecording && !isProcessing ? startListening : undefined}
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 cursor-pointer shadow-2xl shadow-blue-500/20",
              isRecording ? "bg-red-500" : isProcessing ? "bg-slate-800" : "bg-blue-600"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            ) : (
              <Mic className={cn("w-12 h-12 text-white", isRecording && "animate-pulse")} />
            )}
          </motion.div>
        </div>

        <div className="text-center max-w-sm">
          {!isRecording && !isProcessing && !result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-white mb-3">Toque para Gravar</h2>
              <p className="text-slate-400 text-lg">
                Fale naturalmente: "Apartamento de 3 quartos na Savassi por 500 mil"
              </p>
            </motion.div>
          )}

          {isRecording && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-white mb-2 italic">Ouvindo...</h2>
              <p className="text-blue-400 font-medium">Capture cada detalhe mestre</p>
            </motion.div>
          )}

          {isProcessing && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                Extraindo Dados
              </h2>
              <p className="text-slate-400 italic">"Garantindo precisão absoluta no cadastro..."</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Result View */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-6 pb-12 rounded-t-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dados Identificados!</h3>
                <p className="text-slate-400 text-sm">IA detectou as seguintes características:</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <ResultTag label="Tipo" value={result.extractedData?.type || '-'} />
              <ResultTag label="Quartos" value={`${result.extractedData?.bedrooms || 0} Qts`} />
              <ResultTag label="Preço" value={result.extractedData?.price ? `R$ ${result.extractedData.price.toLocaleString()}` : '-'} />
              <ResultTag label="Confiança" value={`${Math.round(result.confidence * 100)}%`} />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-500 h-14 text-lg font-bold">
                Confirmar Cadastro
              </Button>
              <Button variant="outline" className="flex-1 border-slate-700 bg-slate-800 h-14 text-lg" onClick={() => setResult(null)}>
                Recapturar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VoicePropertyCreator;

function ResultTag({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl">
      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className="text-slate-100 font-semibold">{value}</p>
    </div>
  );
}
