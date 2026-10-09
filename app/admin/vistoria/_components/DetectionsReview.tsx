'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Sparkles, MapPin, Package, AlertTriangle, Trash2 } from 'lucide-react';
import type { Proposal, RoomData } from '../_lib/types';
import { isPreselected } from '../_lib/inspection';
import { cn } from '../_lib/utils';

type Edited = Proposal & { applyMark?: boolean };

interface Props {
  room: RoomData;
  onResolve: (accepted: Edited[], decidedIds: string[]) => void;
  onClose: () => void;
}

/**
 * Tela de revisão: tudo que a IA encontrou aparece aqui para ACEITAR ou DESCARTAR,
 * com o texto editável. Só o que for aceito entra no laudo.
 */
export function DetectionsReview({ room, onResolve, onClose }: Props) {
  const initial = room.proposals || [];
  const [items, setItems] = useState<Edited[]>(() => initial.map((p) => ({ ...p, applyMark: true })));
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initial.filter(isPreselected).map((p) => p.id)));
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const photoUrl = (id?: string) => (id ? room.photos.find((p) => p.id === id)?.dataUrl : undefined);
  const groups = useMemo(() => ({
    damage: items.filter((i) => i.kind === 'damage'),
    furniture: items.filter((i) => i.kind === 'furniture'),
  }), [items]);

  const toggle = (id: string) => setChecked((c) => { const n = new Set(c); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const edit = (id: string, patch: Partial<Edited>) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => { setItems((l) => l.filter((i) => i.id !== id)); setChecked((c) => { const n = new Set(c); n.delete(id); return n; }); };

  const accepted = items.filter((i) => checked.has(i.id) && i.text.trim());
  const decidedIds = items.map((i) => i.id);
  const allOn = items.length > 0 && items.every((i) => checked.has(i.id));

  const row = (p: Edited) => {
    const url = photoUrl(p.photoId);
    const on = checked.has(p.id);
    return (
      <li key={p.id} className={cn('rounded-xl border p-3 flex gap-3 items-start', on ? 'border-emerald-400/40 bg-emerald-500/[0.06]' : 'border-white/10 bg-white/[0.02]')}>
        <input type="checkbox" checked={on} onChange={() => toggle(p.id)} aria-label="Aceitar esta sugestão" className="mt-2.5 w-5 h-5 shrink-0 accent-emerald-500" />
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10" />
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <input value={p.text} onChange={(e) => edit(p.id, { text: e.target.value })} maxLength={200} aria-label="Texto que será gravado no laudo"
            className="w-full h-11 px-3 rounded-xl border border-white/10 bg-white/5 text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <span className={cn(p.confidence >= 0.75 ? 'text-emerald-300' : 'text-amber-300')}>{p.confidence >= 0.75 ? 'Alta confiança' : 'Confiança média'} · {Math.round(p.confidence * 100)}%</span>
            <span>{p.source === 'inspecao' ? 'Inspeção da foto' : 'Análise do cômodo'}</span>
            {p.mark && (
              <label className="inline-flex items-center gap-1.5 min-h-8 cursor-pointer">
                <input type="checkbox" checked={p.applyMark !== false} onChange={(e) => edit(p.id, { applyMark: e.target.checked })} className="w-4 h-4 accent-red-500" />
                <MapPin className="w-3 h-3" />marcar na foto
              </label>
            )}
          </div>
        </div>
        <button type="button" onClick={() => remove(p.id)} aria-label="Descartar esta sugestão" className="w-10 h-10 -mr-1 grid place-items-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"><Trash2 className="w-4 h-4" /></button>
      </li>
    );
  };

  return (
    <div className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Revisar sugestões da IA" onClick={(e) => e.stopPropagation()}
        className="bg-[#12121a] border border-white/10 sm:rounded-2xl w-full max-w-3xl max-h-dvh sm:max-h-[90dvh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-3 p-4 border-b border-white/5 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-300" />Revisar o que a IA encontrou</h2>
            <p className="text-xs text-slate-400 mt-0.5">{room.name || 'Cômodo'} · marque o que vale, edite o texto se precisar. <b className="text-slate-200">Nada entra no laudo sem o seu aceite.</b></p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Decidir depois" className="w-10 h-10 grid place-items-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-4 space-y-5 flex-1">
          {items.length === 0 && <p className="text-sm text-slate-400 text-center py-10">Nenhuma sugestão pendente.</p>}
          {groups.damage.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-300 flex items-center gap-1.5 mb-2"><AlertTriangle className="w-3.5 h-3.5" />Possíveis avarias ({groups.damage.length})</h3>
              <ul className="space-y-2">{groups.damage.map(row)}</ul>
            </section>
          )}
          {groups.furniture.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 mb-2"><Package className="w-3.5 h-3.5" />Móveis e equipamentos ({groups.furniture.length})</h3>
              <ul className="space-y-2">{groups.furniture.map(row)}</ul>
            </section>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#12121a] flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={() => setChecked(allOn ? new Set() : new Set(items.map((i) => i.id)))} disabled={items.length === 0} className="min-h-11 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 text-left sm:text-center">{allOn ? 'Desmarcar todos' : 'Marcar todos'}</button>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button type="button" onClick={() => onResolve([], decidedIds)} disabled={items.length === 0} className="min-h-12 px-4 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-40">Descartar tudo</button>
            <button type="button" onClick={onClose} className="min-h-12 px-4 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15">Decidir depois</button>
            <button type="button" onClick={() => onResolve(accepted, decidedIds)} disabled={items.length === 0} className="min-h-12 px-5 rounded-xl text-sm font-bold bg-emerald-500 text-black disabled:opacity-40">
              {accepted.length > 0 ? `Aceitar ${accepted.length} e descartar o resto` : 'Descartar sem aceitar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
