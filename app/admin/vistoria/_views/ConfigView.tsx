'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Plus, Trash2, Camera, Sparkles, FileText, Loader2,
  CheckCircle2, Building2, ArrowRight, ArrowLeft, X, MapPin, Edit3,
  Settings, Eye, Download, BarChart3, Clock, Hash, Star, Copy,
  Share2, MessageCircle, Image as ImageIcon, Layers, Zap, Target, Award,
  TrendingUp, Calendar, HardDrive, AlertTriangle, Search, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreatableSelect } from '@/components/ui/creatable-select';
import type { PhotoAnnotation, PhotoData, RoomData, PropertyInfo, SavedLaudo, VistoriaSettings } from '../_lib/types';
import { defaultPropertyInfo, defaultSettings } from '../_lib/types';
import {
  TIPO_IMOVEL_OPTIONS, FINALIDADE_OPTIONS, MOBILIADO_OPTIONS, ROOM_PHOTO_TIPS, DEFAULT_PHOTO_TIPS,
  COMMON_PROBLEMS, LAUDO_TEMPLATES, getRoomPhotoTips, CONDOMINIO_TYPES, WIZARD_STEPS, itemVariants,
} from '../_lib/constants';
import { cn, lookupCep, validateCpfCnpj, formatCpfCnpj, formatPhone, formatCep } from '../_lib/utils';
import type { VistoriaController } from '../_lib/useVistoriaController';
import { RoomQuestionnaire } from '../_components/RoomQuestionnaire';
import { ProblemsStep } from '../_components/ProblemsStep';
import { PropertyStep } from '../_components/PropertyStep';
import { PhotoAnnotator } from '../_components/PhotoAnnotator';
import { AutocompleteInput, CpfCnpjInput, PhoneInput } from '../_components/inputs';

export function ConfigView({ v }: { v: VistoriaController }) {
  const {
    aiStatus, refreshAiStatus, aiWriting, generateConsiderations, view, setView, wizardStep, setWizardStep, propertyInfo, setPropertyInfo, rooms, setRooms,
    signatures, setSignatures, linkedId, compareIds, patchRoom, createExitFrom, openCompare, loadFull,
    currentRoomIdx, setCurrentRoomIdx, annotatingPhoto, setAnnotatingPhoto, previewPhoto, setPreviewPhoto,
    draggedPhotoIdx, generating, savedLaudos, sortedLaudos, editingLaudoId, settings, setSettings,
    selectedTemplate, setSelectedTemplate, pdfHtml, setPdfHtml, showPdfPreview, setShowPdfPreview,
    generationStep, batchAnalyzing, searchEdit, setSearchEdit,
    uploading, lastSavedAt, dirty, storageUsage,
    saveLaudo, loadLaudo, deleteLaudo, clearAllLaudos, duplicateLaudo, toggleFavorite, exportAll, importFromFile,
    saveSettings, startWizard, addRoom, removeRoom, handlePhotoUpload, handleDragStart, handleDragOver, handleDrop,
    analyzeRoom, analyzeAllRooms, generatePdf, exportHtml, openPdfInTab, shareWhatsApp, openLaudoHtml, downloadLaudoHtml,
    totalPhotos, totalAnnotations, analyzedRooms, currentRoom, canProceed, handleNext, goHome,
  } = v;
    return (
      <div className="min-h-dvh bg-[#0a0a0f]">
        <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center border border-emerald-500/10"><Settings className="w-5 h-5 text-emerald-400" /></div>
                <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Configurações</h1><p className="text-xs text-slate-500">Padrões e preferências</p></div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setView('home')} className="rounded-xl text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar</Button>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white">Valores Padrão</h3><p className="text-[11px] text-slate-500">Preenchidos automaticamente ao criar novo laudo</p></div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Vistoriadora', key: 'defaultVistoriadora' as const, placeholder: 'Nome da vistoriadora' },
                  { label: 'Solicitante', key: 'defaultSolicitante' as const, placeholder: 'Ex: ARTIMOB' },
                  { label: 'Cidade', key: 'defaultCidade' as const, placeholder: 'São Paulo' },
                  { label: 'Estado', key: 'defaultEstado' as const, placeholder: 'SP', short: true },
                ].map(field => (
                  <div key={field.key} className={cn("space-y-1.5", field.short && 'w-24')}>
                    <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{field.label}</Label>
                    <Input className="rounded-xl bg-white/5 border-white/5 text-white text-sm" value={settings[field.key]} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>

            {/* Watermark */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white">Marca d'Água</h3><p className="text-[11px] text-slate-500">Imagem ou texto que aparece nas fotos do laudo</p></div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-white">Ativar Marca d'Água</p><p className="text-[11px] text-slate-500">Adicionar marca d'água nas fotos</p></div>
                  <button onClick={() => setSettings({ ...settings, watermarkEnabled: !settings.watermarkEnabled })} className={cn("w-12 h-6 rounded-full transition-colors", settings.watermarkEnabled ? 'bg-indigo-500' : 'bg-white/10')}>
                    <div className={cn("w-5 h-5 rounded-full bg-white shadow transition-transform", settings.watermarkEnabled ? 'translate-x-6' : 'translate-x-0.5')} />
                  </button>
                </div>
                {settings.watermarkEnabled && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Texto da Marca d'Água</Label>
                      <Input className="rounded-xl bg-white/5 border-white/5 text-white text-sm" value={settings.watermarkText} onChange={e => setSettings({ ...settings, watermarkText: e.target.value })} placeholder="imobWeb Vistoria" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Imagem da Marca d'Água</Label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1">
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => setSettings({ ...settings, watermarkImage: ev.target?.result as string });
                              reader.readAsDataURL(file);
                            }
                          }} />
                          <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors text-slate-400 hover:text-white">
                            <ImageIcon className="w-4 h-4" aria-hidden="true" />
                            <span className="text-xs font-medium">{settings.watermarkImage ? 'Trocar Imagem' : 'Selecionar Imagem'}</span>
                          </div>
                        </label>
                        {settings.watermarkImage && (
                          <div className="relative">
                            <img src={settings.watermarkImage} alt="Marca d'água" className="w-16 h-16 object-contain rounded-xl border border-white/10 bg-white/5" />
                            <button onClick={() => setSettings({ ...settings, watermarkImage: '' })} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white"><X className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Empresa */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h3 className="text-sm font-bold text-white">Empresa e contestação</h3>
                <p className="text-[11px] text-slate-500 mt-1">Aparece no rodapé do laudo e no aviso de contestação</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Nome da empresa</Label>
                  <Input className="h-11 rounded-xl bg-white/5 border-white/5 text-white text-sm" value={settings.empresaNome || ''} onChange={e => setSettings({ ...settings, empresaNome: e.target.value })} placeholder="Sua imobiliária" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">E-mail para contestação</Label>
                  <Input type="email" inputMode="email" className="h-11 rounded-xl bg-white/5 border-white/5 text-white text-sm" value={settings.emailContestacao || ''} onChange={e => setSettings({ ...settings, emailContestacao: e.target.value })} placeholder="vistoria@suaempresa.com" />
                </div>
              </div>
            </div>

            {/* Inteligência artificial */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Inteligência artificial (Google Gemini)</h3>
                  </div>
                  <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border',
                    aiStatus?.configured ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-300 border-amber-500/30 bg-amber-500/10')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', aiStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400')} />
                    {aiStatus == null ? 'Verificando…' : aiStatus.configured ? `Conectada · ${aiStatus.model}` : 'Sem chave configurada'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">A IA analisa fotos, preenche o checklist, sugere marcações, compara entrada x saída e redige as considerações.</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Chave própria do Google Gemini (opcional)</Label>
                  <input
                    type="password"
                    autoComplete="off"
                    placeholder="AIzaSy... (aistudio.google.com)"
                    value={settings.geminiApiKey}
                    onChange={e => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <p className="text-[11px] text-slate-600">Usada somente quando o servidor não possui GEMINI_API_KEY. Fica guardada apenas neste navegador.</p>
                  <button type="button" onClick={() => refreshAiStatus()} className="text-[11px] text-indigo-300 hover:text-indigo-200 underline underline-offset-2 min-h-[32px]">Testar conexão</button>
                </div>

                {([
                  ['aiAnalysisEnabled', 'Análise de fotos com IA', 'Descreve móveis, avarias e estado de cada cômodo'],
                  ['autoAnalyze', 'Analisar ao enviar fotos', 'Dispara a análise assim que as fotos são adicionadas'],
                  ['aiAutoInspect', 'Detectar objetos e defeitos em cada foto', 'Localiza mesa, fogão, cama… e riscos, trincas, descascados e mais. Tudo vai para a sua revisão antes de entrar no laudo'],
                    ['aiAutoChecklist', 'Preencher checklist automaticamente', 'Marca o estado de itens como piso, paredes, tomadas e janelas'],
                  ['aiAutoAnnotate', 'Sugerir marcações nas fotos', 'Cada avaria sugerida pode vir com o ponto marcado na foto (você aceita ou não)'],
                  ['aiConsiderationsEnabled', 'Redigir considerações finais', 'Habilita o botão “Redigir com IA” na revisão'],
                ] as const).map(([key, title, desc]) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="text-[11px] text-slate-500">{desc}</p>
                    </div>
                    <button type="button" role="switch" aria-checked={!!settings[key]} aria-label={title}
                      onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
                      className={cn('shrink-0 w-12 h-7 rounded-full transition-colors relative', settings[key] ? 'bg-indigo-500' : 'bg-white/10')}>
                      <span className={cn('absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform', settings[key] ? 'translate-x-5' : 'translate-x-0')} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Problems Management */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white">Gerenciar Problemas</h3><p className="text-[11px] text-slate-500">Problemas disponíveis para seleção nos cômodos</p></div>
              <div className="p-5 space-y-4">
                <textarea
                  placeholder={"Adicione novos problemas, um por linha:\nPortão com ruído\nVazamento na torneira\nParede com mancha"}
                  className="w-full h-24 px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  id="customProblemsInput"
                />
                <Button size="sm" onClick={() => {
                  const textarea = document.getElementById('customProblemsInput') as HTMLTextAreaElement;
                  if (textarea && textarea.value.trim()) {
                    const lines = textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
                    const newProblems = [...settings.customProblems];
                    lines.forEach(line => { if (!newProblems.includes(line)) newProblems.push(line); });
                    setSettings({ ...settings, customProblems: newProblems });
                    textarea.value = '';
                    toast.success(`${lines.length} problema(s) adicionado(s)`);
                  }
                }} className="rounded-xl text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-semibold">
                  <Plus className="w-3 h-3 mr-1" /> Adicionar Todos
                </Button>

                {/* Custom Problems List */}
                {settings.customProblems.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Problemas Personalizados ({settings.customProblems.length})</p>
                    <div className="flex flex-wrap gap-1.5">{settings.customProblems.map((p, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5 cursor-default">{p}<button onClick={() => setSettings({ ...settings, customProblems: settings.customProblems.filter((_, j) => j !== i) })} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button></span>
                    ))}</div>
                  </div>
                )}

                {/* Default Problems List - Deletable */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Problemas Padrão ({settings.deletedDefaultProblems ? COMMON_PROBLEMS.length - settings.deletedDefaultProblems.length : COMMON_PROBLEMS.length})</p>
                    {settings.deletedDefaultProblems && settings.deletedDefaultProblems.length > 0 && (
                      <button onClick={() => setSettings({ ...settings, deletedDefaultProblems: [] })} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold">Restaurar todos</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">{COMMON_PROBLEMS.filter(p => !(settings.deletedDefaultProblems || []).includes(p)).map((p, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1.5 rounded-lg border border-white/5 bg-white/[0.03] text-slate-400 flex items-center gap-1.5 cursor-default group">
                      {p}
                      <button onClick={() => setSettings({ ...settings, deletedDefaultProblems: [...(settings.deletedDefaultProblems || []), p] })} className="hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                    </span>
                  ))}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white">Dados Salvos</h3></div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between"><p className="text-sm text-white">Laudos salvos</p><Badge className="bg-white/5 text-slate-400 border-0 text-[11px]">{savedLaudos.length}</Badge></div>
                <Button variant="outline" size="sm" className="rounded-xl text-xs text-red-400 border-red-500/20 hover:bg-red-500/10" onClick={() => { if (confirm('Remover todos os laudos? Esta ação não pode ser desfeita.')) void clearAllLaudos(); }}><Trash2 className="w-3 h-3 mr-1" /> Limpar Tudo</Button>
              </div>
            </div>

            <Button onClick={() => void saveSettings()} className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 h-11 text-sm font-bold"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Salvar Configurações</Button>
          </div>
        </div>
      </div>
    );
}
