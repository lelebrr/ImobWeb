'use client';

import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '../_lib/utils';

export interface StartTask { id: string; title: string; hint: string; done: boolean; action?: { label: string; run: () => void } }

/** Passo a passo de primeiros usos, calculado com os dados reais do usuário. Some quando tudo estiver concluído. */
export function GettingStarted({ tasks }: { tasks: StartTask[] }) {
  const done = tasks.filter((t) => t.done).length;
  if (done === tasks.length) return null;
  const next = tasks.find((t) => !t.done);
  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 sm:p-6" aria-label="Primeiros passos">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-bold text-white">Primeiros passos</h2>
          <p className="text-xs text-slate-500">{done} de {tasks.length} concluídos</p>
        </div>
        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={tasks.length}>
          <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all" style={{ width: `${(done / tasks.length) * 100}%` }} />
        </div>
      </div>
      <ul className="grid sm:grid-cols-2 gap-2">
        {tasks.map((t) => (
          <li key={t.id} className={cn('rounded-xl border p-3 flex items-start gap-3', t.done ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : t === next ? 'border-indigo-500/30 bg-indigo-500/[0.06]' : 'border-white/5')}>
            {t.done ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />}
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-semibold', t.done ? 'text-slate-400 line-through decoration-slate-600' : 'text-white')}>{t.title}</p>
              {!t.done && <p className="text-xs text-slate-500 mt-0.5">{t.hint}</p>}
              {!t.done && t.action && t === next && (
                <button type="button" onClick={t.action.run} className="mt-2 min-h-10 px-3 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30 inline-flex items-center gap-1.5">{t.action.label}<ArrowRight className="w-3.5 h-3.5" /></button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
