'use client';

import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck, Plus, Camera, Sparkles, FileText, Building2, ArrowRight, MapPin, Settings,
  BarChart3, Library, GitCompareArrows, Upload, DatabaseBackup, HardDrive, Zap, PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VistoriaController } from '../_lib/useVistoriaController';
import { LAUDO_TEMPLATES } from '../_lib/constants';
import { cn } from '../_lib/utils';
import { summarize, formatSaved } from '../_lib/laudo-stats';
import { formatBytes } from '../_lib/image';
import { PageHeader, Thumb, ProgressRing } from '../_components/PageHeader';
import { HelpButton } from '../_components/HelpButton';
import { GettingStarted, type StartTask } from '../_components/GettingStarted';

export function HomeView({ v }: { v: VistoriaController }) {
  const { loaded, sortedLaudos, settings, selectedTemplate, setSelectedTemplate, startWizard, setView, loadLaudo, exportAll, importFromFile, storageUsage, aiStatus } = v;
  const fileRef = useRef<HTMLInputElement>(null);

  const totals = useMemo(() => sortedLaudos.reduce(
    (acc, l) => {
      const s = summarize(l);
      acc.rooms += s.rooms; acc.photos += s.photos; acc.annotations += s.annotations;
      return acc;
    }, { rooms: 0, photos: 0, annotations: 0 }), [sortedLaudos]);

  const mine = sortedLaudos.filter((l) => !l.isExample);
  const resume = mine[0];
  const recent = sortedLaudos.slice(0, 6);
  const tpl = LAUDO_TEMPLATES.find((t) => t.id === selectedTemplate) || LAUDO_TEMPLATES[0];
  const usagePct = storageUsage && storageUsage.quota ? Math.min(100, (storageUsage.usage / storageUsage.quota) * 100) : 0;

  const startTasks: StartTask[] = [
    { id: 'config', title: 'Personalizar com seus dados', hint: 'Informe o nome da empresa e o padrão da vistoriadora: eles saem prontos em todo laudo.',
      done: !!(settings.empresaNome?.trim() || settings.defaultVistoriadora?.trim()), action: { label: 'Abrir Configurações', run: () => setView('config') } },
    { id: 'ai', title: 'Conectar a inteligência artificial', hint: 'Com a IA, as fotos viram descrição de itens e avarias automaticamente.',
      done: !!aiStatus?.configured, action: { label: 'Configurar IA', run: () => setView('config') } },
    { id: 'first', title: 'Criar sua primeira vistoria', hint: 'Escolha um modelo e preencha os dados do imóvel. Salva sozinha.',
      done: mine.length > 0, action: { label: `Iniciar com “${tpl.name}”`, run: () => startWizard(tpl) } },
    { id: 'photos', title: 'Adicionar fotos aos cômodos', hint: 'Abra sua vistoria, vá ao passo “Fotos” e envie imagens de cada cômodo.',
      done: mine.some((l) => summarize(l).photos > 0), action: resume ? { label: 'Continuar vistoria', run: () => loadLaudo(resume) } : undefined },
  ];

  const kpis = [
    { label: 'Laudos', value: sortedLaudos.length, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Cômodos', value: totals.rooms, icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Fotos', value: totals.photos, icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Anotações', value: totals.annotations, icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-dvh bg-[#0a0a0f]">
      <PageHeader
        icon={<ClipboardCheck className="w-5 h-5 text-cyan-400" />}
        title="Vistoria"
        subtitle="Laudos de vistoria com fotos, anotações e IA"
        actions={
          <>
            <HelpButton />
            <Button variant="ghost" size="sm" onClick={() => setView('library')} className="rounded-xl text-xs text-slate-400 hover:text-white"><Library className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Biblioteca</span></Button>
            <Button variant="ghost" size="sm" onClick={() => setView('compare')} className="rounded-xl text-xs text-slate-400 hover:text-white"><GitCompareArrows className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Entrada x Saída</span></Button>
            <Button variant="ghost" size="sm" onClick={() => setView('stats')} className="rounded-xl text-xs text-slate-400 hover:text-white"><BarChart3 className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Estatísticas</span></Button>
            <Button variant="ghost" size="sm" onClick={() => setView('config')} aria-label="Configurações" className="rounded-xl text-xs text-slate-400 hover:text-white"><Settings className="w-3.5 h-3.5" /></Button>
          </>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero: nova vistoria */}
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-cyan-600/10 p-6 sm:p-8">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
            <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300/80 mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Nova vistoria</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Do celular ao laudo em minutos</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-md">Escolha um modelo, fotografe os cômodos e deixe a IA descrever itens e avarias. O PDF sai pronto, com anotações nas fotos.</p>
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <Button onClick={() => startWizard(tpl)} className="rounded-xl h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-900/30">
                    <Plus className="w-4 h-4 mr-1.5" /> Iniciar com “{tpl.name}”
                  </Button>
                  {resume && (
                    <Button variant="ghost" onClick={() => loadLaudo(resume)} className="rounded-xl h-11 text-slate-300 hover:text-white">
                      <PlayCircle className="w-4 h-4 mr-1.5" /> Continuar “{resume.name}”
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5 flex-wrap"><Zap className={cn('w-3 h-3', settings.aiAnalysisEnabled && aiStatus?.configured ? 'text-amber-400' : 'text-slate-600')} /> {!settings.aiAnalysisEnabled ? 'IA desligada' : aiStatus == null ? 'Verificando IA…' : aiStatus.configured ? `IA conectada (${aiStatus.model})` : 'IA sem chave — configure em Configurações'} · {tpl.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Modelo de laudo">
                {LAUDO_TEMPLATES.map((t) => {
                  const active = t.id === tpl.id;
                  return (
                    <button key={t.id} role="radio" aria-checked={active} onClick={() => setSelectedTemplate(t.id)}
                      className={cn('rounded-2xl border p-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                        active ? 'border-indigo-400/60 bg-indigo-500/15 shadow-lg shadow-indigo-900/20' : 'border-white/5 bg-white/[0.03] hover:border-white/15')}>
                      <span className="text-2xl block mb-1">{t.icon}</span>
                      <span className="text-xs font-bold text-white block">{t.name}</span>
                      <span className="text-[11px] text-slate-500">{t.rooms.length ? `${t.rooms.length} cômodos` : 'Em branco'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {loaded && <GettingStarted tasks={startTasks} />}

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {!loaded
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />)
              : kpis.map((k, i) => (
                <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', k.bg)}><k.icon className={cn('w-4 h-4', k.color)} /></div>
                  <p className="text-2xl font-black text-white tabular-nums">{k.value}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-1">{k.label}</p>
                </motion.div>
              ))}
          </div>

          {/* Recentes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Laudos recentes</h2>
              {sortedLaudos.length > 0 && <Button variant="ghost" size="sm" onClick={() => setView('library')} className="text-xs text-slate-400 hover:text-white">Ver todos <ArrowRight className="w-3 h-3 ml-1" /></Button>}
            </div>
            {!loaded ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>
            ) : recent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Nenhum laudo ainda. Escolha um modelo acima e comece sua primeira vistoria.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recent.map((l, i) => {
                  const s = summarize(l);
                  return (
                    <motion.button key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                      onClick={() => loadLaudo(l)} className="group text-left rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                      <div className="relative h-32">
                        <Thumb src={s.thumb} className="w-full h-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent" />
                        <div className="absolute top-2 right-2 rounded-full bg-black/50 backdrop-blur p-0.5"><ProgressRing value={s.completeness} /></div>
                        {l.isExample && <span className="absolute top-2 left-2 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Exemplo</span>}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-bold text-white truncate">{l.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{[l.propertyInfo?.endereco, l.propertyInfo?.bairro].filter(Boolean).join(' · ') || l.propertyInfo?.tipoImovel || '—'}</p>
                        <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{s.rooms}</span>
                          <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{s.photos}</span>
                          <span className="ml-auto">{formatSaved(l.savedAt)}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Backup e armazenamento */}
          <section className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><DatabaseBackup className="w-4 h-4 text-slate-400" /> Backup dos laudos</h3>
              <p className="text-[11px] text-slate-500 mt-1">Os laudos ficam salvos neste navegador. Exporte um backup para guardar ou levar a outro aparelho.</p>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={() => void exportAll()} disabled={sortedLaudos.length === 0} className="rounded-xl text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10"><DatabaseBackup className="w-3.5 h-3.5 mr-1.5" /> Exportar</Button>
                <Button size="sm" onClick={() => fileRef.current?.click()} className="rounded-xl text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10"><Upload className="w-3.5 h-3.5 mr-1.5" /> Importar</Button>
                <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importFromFile(f); e.target.value = ''; }} />
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><HardDrive className="w-4 h-4 text-slate-400" /> Armazenamento</h3>
              {storageUsage ? (
                <>
                  <p className="text-[11px] text-slate-500 mt-1">{formatBytes(storageUsage.usage)} usados de {formatBytes(storageUsage.quota)} disponíveis no navegador</p>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden mt-4"><div className={cn('h-full rounded-full', usagePct > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500')} style={{ width: `${Math.max(2, usagePct)}%` }} /></div>
                </>
              ) : <p className="text-[11px] text-slate-500 mt-1">Indisponível neste navegador.</p>}
              <p className="text-[11px] text-slate-600 mt-3">Fotos são comprimidas automaticamente (máx. 1600 px) para economizar espaço.</p>
            </div>
          </section>

          <p className="text-[11px] text-slate-600 text-center">
            Atalhos no editor: <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-slate-400">Ctrl+S</kbd> salvar · <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-slate-400">Ctrl+G</kbd> gerar laudo · <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-slate-400">Esc</kbd> voltar · salvamento automático ativo
          </p>
        </div>
      </div>
    </div>
  );
}
