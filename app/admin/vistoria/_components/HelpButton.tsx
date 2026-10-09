'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { FAQ, GLOSSARY } from '../_lib/help';

/** Botão “Ajuda” com janela de perguntas frequentes e glossário. */
export function HelpButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Ajuda"
        className="min-h-10 px-3 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-colors">
        <HelpCircle className="w-4 h-4" />{!compact && <span className="hidden sm:inline">Ajuda</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Central de ajuda" onClick={(e) => e.stopPropagation()}
            className="bg-[#12121a] border border-white/10 sm:rounded-2xl w-full max-w-2xl max-h-dvh sm:max-h-[88dvh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4 border-b border-white/5 pt-[max(1rem,env(safe-area-inset-top))]">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-300" />Central de ajuda</h2>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="w-10 h-10 grid place-items-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-5 space-y-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Perguntas frequentes</h3>
                <div className="space-y-2">
                  {FAQ.map((f) => (
                    <details key={f.q} className="group rounded-xl border border-white/5 bg-white/[0.02]">
                      <summary className="cursor-pointer list-none px-4 py-3 min-h-11 text-sm font-semibold text-slate-200 flex items-center justify-between gap-2">{f.q}<span className="text-slate-500 group-open:rotate-45 transition-transform text-lg leading-none">+</span></summary>
                      <p className="px-4 pb-3 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Glossário</h3>
                <dl className="grid sm:grid-cols-2 gap-2">
                  {GLOSSARY.map((g) => (
                    <div key={g.term} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <dt className="text-sm font-semibold text-slate-200">{g.term}</dt>
                      <dd className="text-xs text-slate-400 mt-0.5">{g.meaning}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
