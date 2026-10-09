'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '../_lib/utils';

type SR = { new (): { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null } };

/** Ditado por voz (Web Speech API, pt-BR). Some se o navegador não suportar. */
export function DictationButton({ onText, className }: { onText: (text: string) => void; className?: string }) {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const rec = useRef<InstanceType<SR> | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => { try { rec.current?.stop(); } catch { /* ignore */ } };
  }, []);

  if (!supported) return null;

  const toggle = () => {
    if (on) { rec.current?.stop(); return; }
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition)!;
    const r = new Ctor();
    r.lang = 'pt-BR';
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      if (last?.isFinal) onText(String(last[0].transcript).trim());
    };
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r;
    r.start();
    setOn(true);
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={on} aria-label={on ? 'Parar ditado' : 'Ditar por voz'}
      className={cn('inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border text-xs font-semibold transition-colors',
        on ? 'bg-red-500/20 border-red-500/40 text-red-200 animate-pulse' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white', className)}>
      {on ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}{on ? 'Ouvindo… toque para parar' : 'Ditar'}
    </button>
  );
}
