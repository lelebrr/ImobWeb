'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, GitCompareArrows, ArrowLeft, AlertTriangle, CheckCircle2, PackageX, Printer, Loader2, TrendingDown, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { VistoriaController } from '../_lib/useVistoriaController';
import type { SavedLaudo } from '../_lib/types';
import { compareLaudos, buildCompareHtml, stateLabel, AI_DIFF_LABEL, type RoomComparison, type AiCompare } from '../_lib/compare';
import { downscaleDataUrl } from '../_lib/image';
import { cn } from '../_lib/utils';
import { openHtmlDocument, openedHint } from '../_lib/native';
import { PageHeader } from '../_components/PageHeader';

const STATUS_STYLE: Record<RoomComparison['status'], { label: string; cls: string }> = {
  'sem-alteracao': { label: 'Sem alterações', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  alterado: { label: 'Alterações menores', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  piorou: { label: 'Deterioração', cls: 'bg-red-500/10 text-red-300 border-red-500/20' },
  'sem-saida': { label: 'Sem registro de saída', cls: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
  novo: { label: 'Cômodo novo', cls: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
};

const stateCls = (s?: string) => (s === 'ok' ? 'text-emerald-300' : s === 'regular' ? 'text-amber-300' : s === 'ruim' ? 'text-red-300' : 'text-slate-500');

export function CompareView({ v }: { v: VistoriaController }) {
  const { sortedLaudos, compareIds, loadFull, setView, aiFetch, aiStatus, settings } = v;
  const mine = useMemo(() => sortedLaudos.filter((l) => !l.isExample), [sortedLaudos]);
  const [entradaId, setEntradaId] = useState(compareIds.entrada || '');
  const [saidaId, setSaidaId] = useState(compareIds.saida || '');
  const [pair, setPair] = useState<{ e: SavedLaudo; s: SavedLaudo } | null>(null);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<AiCompare | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const aiEnabled = settings.aiAnalysisEnabled && aiStatus?.configured !== false;

  // Sugere o par vinculado ao escolher a saída
  useEffect(() => {
    if (!saidaId || entradaId) return;
    const s = mine.find((l) => l.id === saidaId);
    if (s?.linkedId) setEntradaId(s.linkedId);
  }, [saidaId, entradaId, mine]);

  useEffect(() => {
    let cancelled = false;
    setPair(null);
    setAi(null);
    if (!entradaId || !saidaId || entradaId === saidaId) return;
    setBusy(true);
    Promise.all([loadFull(entradaId), loadFull(saidaId)])
      .then(([e, s]) => { if (!cancelled && e && s) setPair({ e, s }); })
      .catch(() => toast.error('Não foi possível carregar os laudos'))
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [entradaId, saidaId, loadFull]);

  const cmp = useMemo(() => (pair ? compareLaudos(pair.e, pair.s) : null), [pair]);

  const analyzeWithAi = async () => {
    if (!pair || !cmp || aiBusy) return;
    const rooms: AiCompare['rooms'] = {};
    const targets = cmp.rooms.filter((r) => r.entrada && r.saida);
    if (!targets.length) { toast.info('Nenhum cômodo presente nas duas vistorias'); return; }
    let failed = 0;
    try {
      for (let i = 0; i < targets.length; i++) {
        const r = targets[i];
        setAiBusy(`Analisando ${r.name} (${i + 1}/${targets.length})…`);
        const pick = async (room: typeof r.entrada) => Promise.all((room?.photos || []).filter((p) => p.dataUrl).slice(0, 3).map((p) => downscaleDataUrl(p.dataUrl, 900, 0.65)));
        const brief = (room: typeof r.entrada) => ({ items: room?.items, furniture: room?.furniture, damages: room?.damages, checklist: room?.checklist, observations: room?.observations });
        try {
          const d = await aiFetch('/api/admin/vistoria/compare', { body: { name: r.name, entradaPhotos: await pick(r.entrada), saidaPhotos: await pick(r.saida), entrada: brief(r.entrada), saida: brief(r.saida) } });
          rooms[r.name] = { summary: String(d.summary || ''), differences: (d.differences as AiCompare['rooms'][string]['differences']) || [] };
        } catch (e) {
          failed++;
          if (failed === 1) toast.error(e instanceof Error ? e.message : 'Falha na análise por IA');
          if (/chave|key|configur/i.test(String((e as Error)?.message))) break;
        }
      }
      let summary: string | undefined; let attention: string[] | undefined;
      if (Object.keys(rooms).length) {
        setAiBusy('Resumindo…');
        try {
          const d = await aiFetch('/api/admin/vistoria/compare', { body: { mode: 'summary', rooms: Object.entries(rooms).map(([name, x]) => ({ name, ...x })) } });
          summary = String(d.summary || ''); attention = (d.attention as string[]) || [];
        } catch { /* resumo é opcional */ }
        setAi({ rooms, summary, attention });
        toast.success(failed ? `Análise concluída (${failed} cômodo(s) falharam)` : 'Análise por IA concluída');
      }
    } finally { setAiBusy(null); }
  };

  const printReport = async () => {
    if (!pair || !cmp) return;
    try {
      const kind = await openHtmlDocument(buildCompareHtml(pair.e, pair.s, cmp, ai), 'comparativo-vistoria');
      toast.success(openedHint(kind));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao abrir relatório');
    }
  };

  const label = (l: SavedLaudo) => `${l.name} · ${l.propertyInfo?.tipoVistoria === 'SAIDA' ? 'Saída' : l.propertyInfo?.tipoVistoria === 'PERIODICA' ? 'Periódica' : 'Entrada'} · ${l.propertyInfo?.dataLaudo || ''}`;
  const selectCls = 'w-full h-11 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/30';

  const kpis = cmp ? [
    { label: 'Novas avarias', value: cmp.totals.newDamages, icon: AlertTriangle, tone: cmp.totals.newDamages ? 'text-red-300 bg-red-500/10' : 'text-emerald-300 bg-emerald-500/10' },
    { label: 'Itens que pioraram', value: cmp.totals.worsened, icon: TrendingDown, tone: cmp.totals.worsened ? 'text-red-300 bg-red-500/10' : 'text-emerald-300 bg-emerald-500/10' },
    { label: 'Itens não encontrados', value: cmp.totals.missingFurniture, icon: PackageX, tone: cmp.totals.missingFurniture ? 'text-amber-300 bg-amber-500/10' : 'text-emerald-300 bg-emerald-500/10' },
    { label: 'Cômodos sem saída', value: cmp.totals.roomsMissingExit, icon: DoorOpen, tone: cmp.totals.roomsMissingExit ? 'text-slate-300 bg-slate-500/10' : 'text-emerald-300 bg-emerald-500/10' },
  ] : [];

  return (
    <div className="min-h-dvh bg-[#0a0a0f]">
      <PageHeader
        icon={<GitCompareArrows className="w-5 h-5 text-violet-300" />}
        tone="from-violet-500/20 to-fuchsia-500/10 border-violet-500/10"
        title="Entrada x Saída"
        subtitle="Compare duas vistorias e veja o que mudou"
        actions={
          <>
            {cmp && aiEnabled && <Button size="sm" onClick={analyzeWithAi} disabled={!!aiBusy} className="rounded-xl text-xs min-h-10 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 border border-indigo-500/30">{aiBusy ? <Loader2 className="w-3.5 h-3.5 sm:mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 sm:mr-1" />}<span className="hidden sm:inline">{ai ? 'Reanalisar com IA' : 'Analisar com IA'}</span></Button>}
            {cmp && <Button size="sm" onClick={printReport} className="rounded-xl text-xs bg-violet-500/15 text-violet-200 hover:bg-violet-500/25 border border-violet-500/30"><Printer className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Relatório / PDF</span></Button>}
            <Button variant="ghost" size="sm" onClick={() => setView('library')} className="rounded-xl text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar</Button>
          </>
        }
      />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5"><span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Vistoria de entrada</span>
              <select value={entradaId} onChange={(e) => setEntradaId(e.target.value)} className={selectCls}><option value="">Selecione…</option>{mine.map((l) => <option key={l.id} value={l.id}>{label(l)}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Vistoria de saída</span>
              <select value={saidaId} onChange={(e) => setSaidaId(e.target.value)} className={selectCls}><option value="">Selecione…</option>{mine.map((l) => <option key={l.id} value={l.id}>{label(l)}</option>)}</select></label>
          </div>

          {mine.length < 2 && <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">Você precisa de ao menos duas vistorias. Na Biblioteca, use “Criar saída” em uma vistoria de entrada.</div>}
          {entradaId && entradaId === saidaId && <p className="text-sm text-amber-300">Escolha duas vistorias diferentes.</p>}
          {busy && <div className="flex items-center justify-center py-12 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando fotos…</div>}

          {aiBusy && <p className="text-xs text-indigo-300 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />{aiBusy}</p>}
          {ai?.summary && (
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3 h-3" />Resumo da IA</p>
              <p className="text-sm text-slate-200">{ai.summary}</p>
              {!!ai.attention?.length && <ul className="mt-2 text-xs text-slate-300 list-disc pl-4 space-y-0.5">{ai.attention.map((a, i) => <li key={i}>{a}</li>)}</ul>}
              <p className="text-[11px] text-slate-500 mt-2">Gerado por IA — confira as fotos antes de qualquer conclusão.</p>
            </div>
          )}
          {cmp && pair && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kpis.map((k, i) => (
                  <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', k.tone)}><k.icon className="w-4 h-4" /></div>
                    <p className="text-2xl font-black text-white tabular-nums">{k.value}</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-1">{k.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                {cmp.rooms.map((r) => {
                  const st = STATUS_STYLE[r.status];
                  const ph = (room?: typeof r.entrada) => (room?.photos || []).filter((p) => p.dataUrl).slice(0, 4);
                  return (
                    <section key={r.name} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                      <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/5">
                        <h3 className="text-sm font-bold text-white">{r.name}</h3>
                        <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full border', st.cls)}>{st.label}</span>
                      </header>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {([['Entrada', r.entrada], ['Saída', r.saida]] as const).map(([t, room]) => (
                            <div key={t}>
                              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">{t}</p>
                              {ph(room).length ? (
                                <div className="grid grid-cols-2 gap-1.5">{ph(room).map((p, i) => <img key={i} src={p.dataUrl} alt={`${t} — ${r.name}`} loading="lazy" className="w-full h-24 sm:h-32 object-cover rounded-lg border border-white/5" />)}</div>
                              ) : <div className="h-24 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-[11px] text-slate-600">{room ? 'Sem fotos' : 'Cômodo não registrado'}</div>}
                            </div>
                          ))}
                        </div>
                        {r.newDamages.length > 0 && <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3"><p className="text-[11px] text-red-300 uppercase tracking-wider font-bold mb-1.5">Novas avarias na saída</p><ul className="text-xs text-slate-300 space-y-0.5 list-disc pl-4">{r.newDamages.map((d) => <li key={d}>{d}</li>)}</ul></div>}
                        {r.missingFurniture.length > 0 && <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3"><p className="text-[11px] text-amber-300 uppercase tracking-wider font-bold mb-1.5">Não encontrados na saída</p><div className="flex flex-wrap gap-1.5">{r.missingFurniture.map((d) => <span key={d} className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-200">{d}</span>)}</div></div>}
                        {r.resolvedDamages.length > 0 && <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3"><p className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Avarias resolvidas</p><ul className="text-xs text-slate-300 list-disc pl-4">{r.resolvedDamages.map((d) => <li key={d}>{d}</li>)}</ul></div>}
                        {r.checklist.length > 0 && (
                          <div className="rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-xs">
                              <thead><tr className="bg-white/[0.03] text-slate-500 text-[11px] uppercase tracking-wider"><th className="text-left px-3 py-2">Elemento</th><th className="px-3 py-2">Entrada</th><th className="px-3 py-2">Saída</th></tr></thead>
                              <tbody>{r.checklist.map((c) => (
                                <tr key={c.item} className={cn('border-t border-white/5', c.worsened && 'bg-red-500/5', c.improved && 'bg-emerald-500/5')}>
                                  <td className="px-3 py-2 text-slate-300">{c.item}</td>
                                  <td className={cn('px-3 py-2 text-center font-semibold', stateCls(c.before))}>{stateLabel(c.before)}</td>
                                  <td className={cn('px-3 py-2 text-center font-semibold', stateCls(c.after))}>{stateLabel(c.after)}{c.worsened && ' ▼'}{c.improved && ' ▲'}</td>
                                </tr>))}</tbody>
                            </table>
                          </div>
                        )}
                        {ai?.rooms[r.name] && (ai.rooms[r.name].summary || ai.rooms[r.name].differences.length > 0) && (
                          <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/20 p-3">
                            <p className="text-[11px] text-indigo-300 uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" />Análise por IA</p>
                            {ai.rooms[r.name].summary && <p className="text-xs text-slate-300 mb-1.5">{ai.rooms[r.name].summary}</p>}
                            <ul className="text-xs text-slate-300 space-y-1">{ai.rooms[r.name].differences.map((d, i) => (
                              <li key={i}><span className="font-semibold text-indigo-200">{AI_DIFF_LABEL[d.type] || d.type}</span> <span className="text-slate-500">· {d.severity} · {Math.round(d.confidence * 100)}%</span> — {d.description}</li>
                            ))}</ul>
                          </div>
                        )}
                        {r.saida?.observations && <p className="text-xs text-slate-400"><span className="text-slate-500">Obs. da saída:</span> {r.saida.observations}</p>}
                      </div>
                    </section>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-600 text-center">Os cômodos são pareados pelo nome. Este comparativo é auxiliar e não substitui os laudos originais.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
