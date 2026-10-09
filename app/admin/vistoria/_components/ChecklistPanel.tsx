'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ChecklistState, RoomData } from '../_lib/types';
import { CHECKLIST_ITEMS, CHECKLIST_STATES } from '../_lib/constants';
import { cn } from '../_lib/utils';

export function checklistScore(room: RoomData): { filled: number; total: number; bad: number } {
  const cl = room.checklist || {};
  const filled = CHECKLIST_ITEMS.filter((i) => cl[i]).length;
  const bad = CHECKLIST_ITEMS.filter((i) => cl[i] === 'ruim').length;
  return { filled, total: CHECKLIST_ITEMS.length, bad };
}

/** Estado de conservação de cada elemento do cômodo (Bom / Regular / Ruim / N.A.) */
export function ChecklistPanel({ room, onChange }: { room: RoomData; onChange: (patch: Partial<RoomData>) => void }) {
  const cl = room.checklist || {};
  const { filled, total, bad } = checklistScore(room);

  const set = (item: string, state: ChecklistState) => {
    const next = { ...cl };
    if (next[item] === state) delete next[item]; else next[item] = state;
    onChange({ checklist: next });
  };
  const markAll = (state: ChecklistState) => onChange({ checklist: Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i, state])) });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">{filled}/{total} itens avaliados{bad > 0 && <span className="text-red-300"> · {bad} em estado ruim</span>}</p>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => markAll('ok')} className="text-[11px] px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20">Tudo bom</button>
          <button type="button" onClick={() => onChange({ checklist: {} })} className="text-[11px] px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white">Limpar</button>
        </div>
      </div>

      <div className="divide-y divide-white/5 rounded-xl border border-white/5 overflow-hidden">
        {CHECKLIST_ITEMS.map((item) => (
          <div key={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5 bg-white/[0.02]">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">{cl[item] && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}{item}</span>
            <div className="flex gap-1" role="radiogroup" aria-label={item}>
              {CHECKLIST_STATES.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={cl[item] === s.id} onClick={() => set(item, s.id)}
                  className={cn('px-2.5 py-1 rounded-lg border text-[11px] font-bold min-w-[46px] transition-colors',
                    cl[item] === s.id ? s.cls : 'border-white/5 bg-white/5 text-slate-500 hover:text-slate-200')}>
                  {s.short}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`obs-${room.id}`} className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Observações do cômodo</label>
        <textarea id={`obs-${room.id}`} value={room.observations || ''} onChange={(e) => onChange({ observations: e.target.value })} rows={3}
          placeholder="Ex.: mancha de umidade no canto superior esquerdo, já existente na entrada…"
          className="w-full px-3 py-2.5 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
      </div>
    </div>
  );
}
