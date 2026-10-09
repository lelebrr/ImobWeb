'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, ArrowLeft, Search, Plus, Camera, Building2, MapPin, Edit3, Eye, Download, Trash2, Copy, Star,
  FileText, DatabaseBackup, LayoutGrid, List as ListIcon, User, DoorOpen, GitCompareArrows,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VistoriaController } from '../_lib/useVistoriaController';
import { cn } from '../_lib/utils';
import { summarize, formatSaved } from '../_lib/laudo-stats';
import { PageHeader, Thumb, ProgressRing } from '../_components/PageHeader';

type Sort = 'recent' | 'oldest' | 'name' | 'photos';

export function LibraryView({ v }: { v: VistoriaController }) {
  const { sortedLaudos, loaded, setView, loadLaudo, deleteLaudo, duplicateLaudo, toggleFavorite, createExitFrom, openCompare, openLaudoHtml, downloadLaudoHtml, exportAll, startWizard, searchEdit, setSearchEdit } = v;
  const [tipo, setTipo] = useState('TODOS');
  const [sort, setSort] = useState<Sort>('recent');
  const [onlyFav, setOnlyFav] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const tipos = useMemo(() => ['TODOS', ...Array.from(new Set(sortedLaudos.map((l) => l.propertyInfo?.tipoImovel).filter(Boolean)))], [sortedLaudos]);

  const items = useMemo(() => {
    const q = searchEdit.trim().toLowerCase();
    const list = sortedLaudos.filter((l) => {
      if (onlyFav && !l.favorite) return false;
      if (tipo !== 'TODOS' && l.propertyInfo?.tipoImovel !== tipo) return false;
      if (!q) return true;
      const i = l.propertyInfo;
      return [l.name, i?.condominio, i?.endereco, i?.cidade, i?.bairro, i?.locadora, i?.locatario, i?.cep]
        .some((f) => (f || '').toLowerCase().includes(q));
    });
    const withSum = list.map((l) => ({ l, s: summarize(l) }));
    withSum.sort((a, b) => {
      if (sort === 'oldest') return new Date(a.l.savedAt).getTime() - new Date(b.l.savedAt).getTime();
      if (sort === 'name') return (a.l.name || '').localeCompare(b.l.name || '', 'pt-BR');
      if (sort === 'photos') return b.s.photos - a.s.photos;
      return new Date(b.l.savedAt).getTime() - new Date(a.l.savedAt).getTime();
    });
    return withSum;
  }, [sortedLaudos, searchEdit, tipo, sort, onlyFav]);

  return (
    <div className="min-h-dvh bg-[#0a0a0f]">
      <PageHeader
        icon={<Library className="w-5 h-5 text-cyan-400" />}
        title="Biblioteca de laudos"
        subtitle={`${sortedLaudos.length} laudo(s) · ${items.length} exibido(s)`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => openCompare()} className="rounded-xl text-xs text-slate-400 hover:text-white"><GitCompareArrows className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Comparar</span></Button>
            <Button variant="ghost" size="sm" onClick={() => void exportAll()} disabled={!sortedLaudos.length} className="rounded-xl text-xs text-slate-400 hover:text-white"><DatabaseBackup className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Backup</span></Button>
            <Button variant="ghost" size="sm" onClick={() => setView('home')} className="rounded-xl text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar</Button>
          </>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* Filtros */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="search" aria-label="Buscar laudos" placeholder="Buscar por nome, endereço, cidade, locadora, locatário, CEP..." value={searchEdit} onChange={(e) => setSearchEdit(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
            </div>
            <div className="flex items-center gap-2">
              <select aria-label="Ordenar" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 rounded-xl bg-white/5 border border-white/5 text-slate-300 text-xs px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/30">
                <option value="recent">Mais recentes</option><option value="oldest">Mais antigos</option><option value="name">Nome (A–Z)</option><option value="photos">Mais fotos</option>
              </select>
              <button onClick={() => setOnlyFav(!onlyFav)} aria-pressed={onlyFav} aria-label="Somente favoritos" className={cn('h-11 w-11 rounded-xl border flex items-center justify-center transition-colors', onlyFav ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white')}><Star className={cn('w-4 h-4', onlyFav && 'fill-amber-300')} /></button>
              <div className="flex rounded-xl border border-white/5 overflow-hidden">
                <button onClick={() => setLayout('grid')} aria-label="Grade" aria-pressed={layout === 'grid'} className={cn('h-11 w-11 flex items-center justify-center', layout === 'grid' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500')}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setLayout('list')} aria-label="Lista" aria-pressed={layout === 'list'} className={cn('h-11 w-11 flex items-center justify-center', layout === 'list' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500')}><ListIcon className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          {tipos.length > 2 && (
            <div className="flex flex-wrap gap-1.5">
              {tipos.map((t) => <button key={t} onClick={() => setTipo(t as string)} className={cn('px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors', tipo === t ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' : 'bg-white/[0.03] border-white/5 text-slate-500 hover:text-white')}>{t}</button>)}
            </div>
          )}

          {/* Lista */}
          {!loaded ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-60 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
          ) : sortedLaudos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white mb-2">Nenhum laudo salvo</h2>
              <p className="text-sm text-slate-500 mb-4">Crie um laudo — ele é salvo automaticamente enquanto você edita.</p>
              <Button onClick={() => startWizard()} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold"><Plus className="w-3.5 h-3.5 mr-1" /> Criar primeiro laudo</Button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center"><Search className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-500">Nenhum laudo corresponde aos filtros.</p></div>
          ) : (
            <div className={layout === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              <AnimatePresence initial={false}>
                {items.map(({ l, s }, i) => (
                  <motion.article key={l.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: Math.min(i, 8) * 0.02 }}
                    className={cn('group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-cyan-500/25 transition-colors', layout === 'list' && 'flex')}>
                    <div className={cn('relative cursor-pointer shrink-0', layout === 'grid' ? 'h-36' : 'w-40 sm:w-52')} onClick={() => loadLaudo(l)}>
                      <Thumb src={s.thumb} className="w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 via-transparent" />
                      <div className="absolute top-2 right-2 rounded-full bg-black/50 backdrop-blur p-0.5"><ProgressRing value={s.completeness} /></div>
                      {l.isExample && <span className="absolute top-2 left-2 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Exemplo</span>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="p-4 pb-3 cursor-pointer flex-1" onClick={() => loadLaudo(l)}>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{l.name || 'Sem nome'}</h3>
                          <span className="flex gap-1 shrink-0">
                            {l.propertyInfo?.tipoVistoria && l.propertyInfo.tipoVistoria !== 'ENTRADA' && <span className="text-[11px] font-bold text-violet-300 bg-violet-500/10 rounded px-1.5 py-0.5">{l.propertyInfo.tipoVistoria === 'SAIDA' ? 'SAÍDA' : 'PERIÓDICA'}</span>}
                            <span className="text-[11px] font-bold text-slate-400 bg-white/5 rounded px-1.5 py-0.5">{l.propertyInfo?.tipoImovel || '—'}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{[l.propertyInfo?.endereco, l.propertyInfo?.numero, l.propertyInfo?.conjApto].filter(Boolean).join(' ') || 'Endereço não informado'}</p>
                        <p className="text-[11px] text-slate-600 truncate">{[l.propertyInfo?.bairro, l.propertyInfo?.cidade && `${l.propertyInfo.cidade}${l.propertyInfo.estado ? '/' + l.propertyInfo.estado : ''}`].filter(Boolean).join(', ')}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{s.rooms} cômodos</span>
                          <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{s.photos} fotos</span>
                          {s.annotations > 0 && <span className="flex items-center gap-1 text-amber-400"><MapPin className="w-3 h-3" />{s.annotations}</span>}
                          {l.propertyInfo?.locatario && <span className="hidden sm:flex items-center gap-1 truncate"><User className="w-3 h-3" />{l.propertyInfo.locatario}</span>}
                          <span className="ml-auto">{formatSaved(l.savedAt)}</span>
                        </div>
                      </div>
                      <div className="px-3 py-2 border-t border-white/5 flex flex-wrap items-center gap-1 bg-white/[0.01]">
                        {confirmId === l.id ? (
                          <>
                            <span className="text-[11px] text-red-300 mr-auto pl-1">Excluir este laudo?</span>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)} className="h-9 text-[11px] text-slate-400">Cancelar</Button>
                            <Button size="sm" onClick={() => { setConfirmId(null); void deleteLaudo(l.id); }} className="h-9 text-[11px] bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30">Excluir</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => loadLaudo(l)} className="h-9 px-2.5 text-[11px] bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20"><Edit3 className="w-3 h-3 mr-1" />Editar</Button>
                            <button title="Visualizar" aria-label="Visualizar laudo" onClick={() => void openLaudoHtml(l)} className="p-2.5 sm:p-2 rounded-lg text-slate-500 hover:text-emerald-300 hover:bg-emerald-500/10"><Eye className="w-3.5 h-3.5" /></button>
                            <button title="Baixar HTML" aria-label="Baixar laudo" onClick={() => void downloadLaudoHtml(l)} className="p-2.5 sm:p-2 rounded-lg text-slate-500 hover:text-blue-300 hover:bg-blue-500/10"><Download className="w-3.5 h-3.5" /></button>
                            <button title="Duplicar" aria-label="Duplicar laudo" onClick={() => void duplicateLaudo(l)} className="p-2.5 sm:p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10"><Copy className="w-3.5 h-3.5" /></button>
                            {!l.isExample && l.propertyInfo?.tipoVistoria !== 'SAIDA' && <button title="Criar vistoria de saída a partir desta" aria-label="Criar vistoria de saída" onClick={() => void createExitFrom(l)} className="p-2.5 sm:p-2 rounded-lg text-slate-500 hover:text-violet-300 hover:bg-violet-500/10"><DoorOpen className="w-3.5 h-3.5" /></button>}
                            {l.linkedId && <button title="Comparar com a entrada" aria-label="Comparar com a entrada" onClick={() => openCompare({ entrada: l.linkedId, saida: l.id })} className="p-2.5 sm:p-2 rounded-lg text-slate-500 hover:text-violet-300 hover:bg-violet-500/10"><GitCompareArrows className="w-3.5 h-3.5" /></button>}
                            <button title="Exportar backup deste laudo" aria-label="Exportar laudo" onClick={() => void exportAll([l.id])} className="p-2.5 sm:p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10"><DatabaseBackup className="w-3.5 h-3.5" /></button>
                            <button title="Favoritar" aria-label="Favoritar" aria-pressed={!!l.favorite} onClick={() => void toggleFavorite(l)} className="p-2.5 sm:p-2 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 ml-auto"><Star className={cn('w-3.5 h-3.5', l.favorite && 'fill-amber-300 text-amber-300')} /></button>
                            <button title="Excluir" aria-label="Excluir laudo" onClick={() => setConfirmId(l.id)} className="p-2.5 sm:p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
