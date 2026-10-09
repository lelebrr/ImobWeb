'use client';

import React, { useEffect, useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { STEP_HELP } from '../_lib/help';
import { cn } from '../_lib/utils';

const KEY = 'vistoria:guides-hidden';

/** Cartão “como fazer” no topo de cada passo. Pode ser recolhido; a escolha fica salva neste aparelho. */
export function StepGuide({ step }: { step: number }) {
  const h = STEP_HELP[step];
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { setHidden(localStorage.getItem(KEY) === '1'); } catch { /* sem storage */ } }, []);
  if (!h) return null;
  const toggle = () => {
    const next = !hidden;
    setHidden(next);
    try { localStorage.setItem(KEY, next ? '1' : '0'); } catch { /* ignore */ }
  };
  return (
    <aside className="mb-5 rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.05]" aria-label={`Como fazer: ${h.title}`}>
      <button type="button" onClick={toggle} aria-expanded={!hidden}
        className="w-full min-h-12 px-4 py-3 flex items-center gap-3 text-left">
        <Lightbulb className="w-4 h-4 text-amber-300 shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-white">{h.goal}</span>
          {hidden && <span className="block text-[11px] text-slate-500">Toque para ver como fazer</span>}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 shrink-0 transition-transform', !hidden && 'rotate-180')} />
      </button>
      {!hidden && (
        <div className="px-4 pb-4 -mt-1">
          <ol className="space-y-1.5 text-sm text-slate-300 list-decimal pl-5 marker:text-indigo-300">
            {h.how.map((t) => <li key={t}>{t}</li>)}
          </ol>
          <p className="mt-3 text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">💡 {h.tip}</p>
        </div>
      )}
    </aside>
  );
}
