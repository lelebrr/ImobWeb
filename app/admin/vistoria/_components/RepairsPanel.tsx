'use client';

import React from 'react';
import { Wrench, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import type { PropertyInfo, Reparo } from '../_lib/types';
import { formatBRL, sumReparos } from '../_lib/meters';
import { uid } from '../_lib/utils';

const num = (v: string) => { const n = Number(v.replace(/[^\d]/g, '')); return Number.isFinite(n) ? Math.min(n, 500_000) : 0; };
const cell = 'h-11 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

export function RepairsPanel({ info, setInfo, onEstimate, busy, canEstimate, damageCount }: {
  info: PropertyInfo; setInfo: (p: PropertyInfo) => void; onEstimate: () => void; busy: boolean; canEstimate: boolean; damageCount: number;
}) {
  const list = info.reparos || [];
  const total = sumReparos(list);
  const set = (l: Reparo[]) => setInfo({ ...info, reparos: l });
  const patch = (id: string, p: Partial<Reparo>) => set(list.map((r) => (r.id === id ? { ...r, ...p, origem: p.min !== undefined || p.max !== undefined || p.descricao !== undefined ? 'manual' : r.origem } : r)));

  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5" aria-label="Estimativa de reparos">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-orange-300" /><h3 className="text-sm font-bold text-white">Estimativa de reparos</h3></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => set([...list, { id: uid(), comodo: '', descricao: '', min: 0, max: 0, origem: 'manual' }])} className="min-h-10 px-3 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Item</button>
          <button type="button" onClick={onEstimate} disabled={busy || !canEstimate || damageCount === 0} title={!canEstimate ? 'IA não configurada' : damageCount === 0 ? 'Registre avarias primeiro' : 'Estimar com IA'}
            className="min-h-10 px-3 rounded-xl text-xs font-semibold border border-orange-500/30 bg-orange-500/15 text-orange-200 hover:bg-orange-500/25 disabled:opacity-40 flex items-center gap-1.5">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}{busy ? 'Estimando…' : `Estimar com IA (${damageCount})`}
          </button>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">Valores referenciais para negociação, não substituem orçamento. Edite à vontade; entram no laudo se houver itens.</p>
      {list.length === 0 ? <p className="text-xs text-slate-600">Nenhum item. Use a IA a partir das avarias registradas ou adicione manualmente.</p> : (
        <ul className="space-y-2">
          {list.map((r) => (
            <li key={r.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 grid gap-2 sm:grid-cols-[9rem_1fr_7rem_7rem_auto] items-start">
              <input className={cell} placeholder="Cômodo" aria-label="Cômodo" value={r.comodo} maxLength={60} onChange={(e) => patch(r.id, { comodo: e.target.value })} />
              <div className="min-w-0">
                <input className={cell + ' w-full'} placeholder="Descrição do reparo" aria-label="Descrição" value={r.descricao} maxLength={160} onChange={(e) => patch(r.id, { descricao: e.target.value })} />
                {r.nota && <p className="text-[11px] text-slate-500 mt-1">{r.origem === 'ia' && <span className="text-orange-300">IA · </span>}{r.nota}</p>}
              </div>
              <input className={cell} inputMode="numeric" placeholder="Mín. R$" aria-label="Valor mínimo" value={r.min || ''} onChange={(e) => patch(r.id, { min: num(e.target.value) })} />
              <input className={cell} inputMode="numeric" placeholder="Máx. R$" aria-label="Valor máximo" value={r.max || ''} onChange={(e) => patch(r.id, { max: num(e.target.value) })} />
              <button type="button" aria-label="Remover item" onClick={() => set(list.filter((x) => x.id !== r.id))} className="w-11 h-11 grid place-items-center rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 justify-self-end"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
      {list.length > 0 && <p className="mt-3 text-sm text-slate-300">Total estimado: <span className="font-bold text-white">{formatBRL(total.min)}</span> a <span className="font-bold text-white">{formatBRL(total.max)}</span></p>}
    </section>
  );
}
