'use client';

import React from 'react';
import { Gauge, KeyRound, Plus, Minus, X, Droplets, Zap, Flame } from 'lucide-react';
import type { PropertyInfo, Medidores, MedidorKey } from '../_lib/types';
import { MEDIDORES, CHAVE_PRESETS, emptyMedidores, consumption, parseReading } from '../_lib/meters';
import { uid } from '../_lib/utils';

const ICON: Record<MedidorKey, typeof Droplets> = { agua: Droplets, luz: Zap, gas: Flame };
const fieldCls = 'w-full h-11 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-base sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

export function MetersKeysCard({ info, setInfo }: { info: PropertyInfo; setInfo: (p: PropertyInfo) => void }) {
  const m: Medidores = info.medidores || emptyMedidores();
  const prev = info.medidoresEntrada;
  const chaves = info.chaves || [];
  const setMed = (k: MedidorKey, patch: Partial<Medidores[MedidorKey]>) => setInfo({ ...info, medidores: { ...m, [k]: { ...m[k], ...patch } } });
  const setChaves = (c: typeof chaves) => setInfo({ ...info, chaves: c });
  const addChave = (descricao: string) => {
    const d = descricao.trim();
    if (!d) return;
    const ex = chaves.find((c) => c.descricao.toLowerCase() === d.toLowerCase());
    setChaves(ex ? chaves.map((c) => (c === ex ? { ...c, quantidade: c.quantidade + 1 } : c)) : [...chaves, { id: uid(), descricao: d, quantidade: 1 }]);
  };
  const [custom, setCustom] = React.useState('');

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5" aria-label="Leitura dos medidores">
        <div className="flex items-center gap-2 mb-1"><Gauge className="w-4 h-4 text-cyan-300" /><h3 className="text-sm font-bold text-white">Medidores</h3></div>
        <p className="text-[11px] text-slate-500 mb-4">Registre a leitura no dia da vistoria. Na saída, o consumo do período é calculado e vai para o laudo.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MEDIDORES.map(({ key, label, unit }) => {
            const Icon = ICON[key];
            const used = prev ? consumption(prev[key]?.leitura, m[key].leitura) : null;
            const bad = !!m[key].leitura && parseReading(m[key].leitura) == null;
            return (
              <div key={key} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-cyan-300" />{label} <span className="text-slate-600 font-normal">({unit})</span></p>
                <input className={fieldCls} inputMode="decimal" placeholder="Leitura" aria-label={`Leitura de ${label}`} value={m[key].leitura} onChange={(e) => setMed(key, { leitura: e.target.value })} />
                <input className={fieldCls} placeholder="Nº do medidor" aria-label={`Número do medidor de ${label}`} value={m[key].numero} onChange={(e) => setMed(key, { numero: e.target.value })} />
                {bad && <p className="text-[11px] text-amber-300">Use apenas números (ex.: 1234,5).</p>}
                {prev?.[key]?.leitura && <p className="text-[11px] text-slate-500">Entrada: <span className="text-slate-300">{prev[key].leitura}</span>{used != null && <> · consumo <span className="text-cyan-300 font-semibold">{used.toLocaleString('pt-BR')} {unit}</span></>}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5" aria-label="Chaves e controles">
        <div className="flex items-center gap-2 mb-1"><KeyRound className="w-4 h-4 text-amber-300" /><h3 className="text-sm font-bold text-white">Chaves, controles e acessos</h3></div>
        <p className="text-[11px] text-slate-500 mb-3">O que foi entregue. Na vistoria de saída, confira se tudo foi devolvido.</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CHAVE_PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => addChave(p)} className="text-[11px] min-h-9 px-3 rounded-lg border border-white/5 bg-white/5 text-slate-300 hover:bg-amber-500/10 hover:text-amber-200 transition-colors">+ {p}</button>
          ))}
        </div>
        <form className="flex gap-2 mb-3" onSubmit={(e) => { e.preventDefault(); addChave(custom); setCustom(''); }}>
          <input className={fieldCls} placeholder="Outro item (ex.: chave do depósito)" aria-label="Outro item entregue" value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={80} />
          <button type="submit" disabled={!custom.trim()} className="shrink-0 h-11 px-4 rounded-xl bg-amber-500/15 text-amber-200 border border-amber-500/30 text-xs font-semibold disabled:opacity-40">Adicionar</button>
        </form>
        {chaves.length === 0 ? <p className="text-xs text-slate-600">Nenhum item registrado.</p> : (
          <ul className="space-y-1.5">
            {chaves.map((c) => (
              <li key={c.id} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] pl-3 pr-1 py-1">
                <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">{c.descricao}</span>
                <button type="button" aria-label="Diminuir" onClick={() => setChaves(chaves.map((x) => (x.id === c.id ? { ...x, quantidade: Math.max(1, x.quantidade - 1) } : x)))} className="w-10 h-10 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Minus className="w-4 h-4" /></button>
                <span className="w-6 text-center text-sm font-bold text-white tabular-nums">{c.quantidade}</span>
                <button type="button" aria-label="Aumentar" onClick={() => setChaves(chaves.map((x) => (x.id === c.id ? { ...x, quantidade: Math.min(99, x.quantidade + 1) } : x)))} className="w-10 h-10 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Plus className="w-4 h-4" /></button>
                <button type="button" aria-label={`Remover ${c.descricao}`} onClick={() => setChaves(chaves.filter((x) => x.id !== c.id))} className="w-10 h-10 grid place-items-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10"><X className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
