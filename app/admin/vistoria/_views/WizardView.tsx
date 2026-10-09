'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Plus, Trash2, Camera, Sparkles, FileText, Loader2,
  CheckCircle2, Building2, ArrowRight, ArrowLeft, X, MapPin, Edit3,
  Settings, Eye, Download, BarChart3, Clock, Hash, Star, Copy,
  Share2, MessageCircle, Image as ImageIcon, Layers, Zap, Target, Award,
  TrendingUp, Calendar, HardDrive, AlertTriangle, Search, User, ScanSearch,
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
import { SignaturePad } from '../_components/SignaturePad';
import { DictationButton } from '../_components/DictationButton';
import { AuditPanel } from '../_components/AuditPanel';
import { StepGuide } from '../_components/StepGuide';
import { CameraAssistant } from '../_components/CameraAssistant';
import { InspectionOverlay, InspectionList } from '../_components/InspectionView';
import { DetectionsReview } from '../_components/DetectionsReview';
import { inspectionSummary } from '../_lib/inspection';
import { HelpButton } from '../_components/HelpButton';
import { MetersKeysCard } from '../_components/MetersKeysCard';
import { RepairsPanel } from '../_components/RepairsPanel';
import { auditLaudo } from '../_lib/audit';
import { TIPO_VISTORIA_OPTIONS } from '../_lib/constants';

export function WizardView({ v }: { v: VistoriaController }) {
  const {
    aiStatus, estimateRepairs, repairsBusy, reviewRoomIdx, setReviewRoomIdx, resolveProposals, inspectOne, inspectRoom, inspectPhoto, inspectingIds, aiWriting, generateConsiderations, view, setView, wizardStep, setWizardStep, propertyInfo, setPropertyInfo, rooms, setRooms,
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
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const audit = auditLaudo(propertyInfo, rooms, signatures, !!linkedId);
  return (
    <div className="min-h-dvh bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => void goHome()} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors min-h-10 pr-3"><ArrowLeft className="w-3 h-3" /> Voltar</button>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[11px] text-slate-500" aria-live="polite">{dirty ? 'Alterações pendentes…' : lastSavedAt ? `Salvo às ${new Date(lastSavedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Ainda não salvo'}</span>
              <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[11px] font-bold">Passo {wizardStep + 1}/{WIZARD_STEPS.length}</Badge>
              <HelpButton compact />
              <Button variant="ghost" size="sm" onClick={() => saveLaudo()} className="rounded-xl text-xs min-h-10 text-slate-400 hover:text-white"><FileText className="w-3 h-3 mr-1" /> Salvar</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto overflow-x-auto scrollbar-hide pb-2">
          {WIZARD_STEPS.map((step, idx) => (
            <button key={step.id} onClick={() => setWizardStep(idx)} aria-label={step.title} aria-current={idx === wizardStep ? 'step' : undefined}
              className={cn("flex items-center gap-2 px-3.5 py-2.5 min-h-10 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all shrink-0",
                idx === wizardStep ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : idx < wizardStep ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer' : 'text-slate-600 border border-white/5')}>
              {idx < wizardStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          ))}
        </div>
        <p className="sm:hidden max-w-4xl mx-auto mt-1 text-sm font-bold text-white" aria-live="polite">{WIZARD_STEPS[wizardStep]?.title}</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={wizardStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StepGuide step={wizardStep} />

              {/* STEP 0: Property */}
              {wizardStep === 0 && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Tipo de vistoria</p>
                    <div className="inline-flex rounded-xl border border-white/10 overflow-hidden" role="radiogroup" aria-label="Tipo de vistoria">
                      {TIPO_VISTORIA_OPTIONS.map((o) => (
                        <button key={o.id} type="button" role="radio" aria-checked={(propertyInfo.tipoVistoria || 'ENTRADA') === o.id}
                          onClick={() => setPropertyInfo({ ...propertyInfo, tipoVistoria: o.id })}
                          className={cn('px-4 py-2.5 min-h-10 text-xs font-semibold transition-colors', (propertyInfo.tipoVistoria || 'ENTRADA') === o.id ? 'bg-indigo-500/20 text-indigo-200' : 'bg-white/[0.02] text-slate-500 hover:text-white')}>{o.label}</button>
                      ))}
                    </div>
                    {linkedId && <p className="text-[11px] text-cyan-300 mt-2">Vinculada à vistoria de entrada. <button type="button" onClick={() => openCompare({ entrada: linkedId, saida: editingLaudoId || undefined })} className="underline hover:text-white">Comparar entrada x saída</button></p>}
                  </div>
                  <PropertyStep propertyInfo={propertyInfo} setPropertyInfo={setPropertyInfo} />
                  <MetersKeysCard info={propertyInfo} setInfo={setPropertyInfo} />
                </div>
              )}

              {/* STEP 1: Parties */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div><h2 className="text-xl font-bold text-white mb-1">Partes Envolvidas</h2><p className="text-sm text-slate-500">Dados do locador, locatário e vistoriadora</p></div>

                  {/* Locadora */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Locadora (Proprietário)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AutocompleteInput label="Nome da Locadora" value={propertyInfo.locadora} onChange={v => setPropertyInfo({ ...propertyInfo, locadora: v })}
                        suggestions={['Pessoa Física', 'Imobiliária', 'Construtora']} placeholder="Nome completo" storageKey="vistoria_locadoras" />
                      <CpfCnpjInput label="CPF / CNPJ" value={propertyInfo.locadoraCpf} onChange={v => setPropertyInfo({ ...propertyInfo, locadoraCpf: v })} />
                      <PhoneInput label="Telefone" value={propertyInfo.locadoraTelefone} onChange={v => setPropertyInfo({ ...propertyInfo, locadoraTelefone: v })} />
                    </div>
                  </div>

                  {/* Locatário */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Locatário(a) (Inquilino)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AutocompleteInput label="Nome do Locatário" value={propertyInfo.locatario} onChange={v => setPropertyInfo({ ...propertyInfo, locatario: v })}
                        suggestions={[]} placeholder="Nome completo" storageKey="vistoria_locatarios" />
                      <CpfCnpjInput label="CPF / CNPJ" value={propertyInfo.locatarioCpf} onChange={v => setPropertyInfo({ ...propertyInfo, locatarioCpf: v })} />
                      <PhoneInput label="Telefone" value={propertyInfo.locatarioTelefone} onChange={v => setPropertyInfo({ ...propertyInfo, locatarioTelefone: v })} />
                    </div>
                  </div>

                  {/* Vistoriadora & Solicitante */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Vistoria</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AutocompleteInput label="Vistoriadora" value={propertyInfo.vistoriadora} onChange={v => setPropertyInfo({ ...propertyInfo, vistoriadora: v })}
                        suggestions={settings.defaultVistoriadora ? [settings.defaultVistoriadora] : []} placeholder="Nome da vistoriadora" storageKey="vistoria_vistoriadoras" />
                      <AutocompleteInput label="Solicitante" value={propertyInfo.solicitante} onChange={v => setPropertyInfo({ ...propertyInfo, solicitante: v })}
                        suggestions={settings.defaultSolicitante ? [settings.defaultSolicitante] : []} placeholder="Ex: ARTIMOB" storageKey="vistoria_solicitantes" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Rooms - Guided Questionnaire */}
              {wizardStep === 2 && (
                <RoomQuestionnaire
                  rooms={rooms}
                  setRooms={setRooms}
                  propertyInfo={propertyInfo}
                  addRoom={addRoom}
                  removeRoom={removeRoom}
                />
              )}

              {/* STEP 3: Problems per Room */}
              {wizardStep === 3 && (
                <ProblemsStep rooms={rooms} setRooms={setRooms} settings={settings} />
              )}

              {/* STEP 4: Photos */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-white mb-1">Fotos e Anotações</h2><p className="text-sm text-slate-500">{totalPhotos} fotos · {totalAnnotations} anotações · {analyzedRooms}/{rooms.length} analisados</p></div>
                    <Button size="sm" onClick={analyzeAllRooms} disabled={batchAnalyzing || rooms.every(r => r.analyzed || r.photos.length === 0)} className="rounded-xl text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      {batchAnalyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                      {batchAnalyzing ? 'Analisando...' : 'Analisar Todos'}
                    </Button></div>

                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {rooms.map((room, idx) => {
                      const ann = room.photos.reduce((s, p) => s + p.annotations.length, 0);
                      return (
                        <button key={room.id} onClick={() => setCurrentRoomIdx(idx)}
                          className={cn("flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all min-w-[90px]",
                            idx === currentRoomIdx ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : room.photos.length > 0 ? 'text-slate-300 border border-white/5 hover:bg-white/5' : 'text-slate-600 border border-white/5')}>
                          <div className="flex items-center gap-1">{room.analyzed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}<span>{room.name || `C${idx + 1}`}</span></div>
                          <div className="flex gap-1.5 text-[11px]"><span className={room.photos.length > 0 ? 'text-cyan-400' : ''}>{room.photos.length}f</span>{ann > 0 && <span className="text-amber-400">{ann}a</span>}</div>
                        </button>
                      );
                    })}
                  </div>

                  {currentRoom && (() => {
                    const roomKey = currentRoom.id;
                    const roomProblems = currentRoom.photoProblems || [];
                    const activeDefaultProblems = COMMON_PROBLEMS.filter(p => !(settings.deletedDefaultProblems || []).includes(p));
  const allProblems = [...activeDefaultProblems, ...settings.customProblems];
                    const toggleProblem = (problem: string) => {
                      const current = currentRoom.photoProblems || [];
                      patchRoom(roomKey, { photoProblems: current.includes(problem) ? current.filter(p => p !== problem) : [...current, problem] });
                    };

                    return (
                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                        <div className="p-4 border-b border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-white">{currentRoom.name || `Cômodo ${currentRoomIdx + 1}`}</h3>
                            <Button variant="ghost" size="sm" onClick={() => analyzeRoom(currentRoomIdx)} disabled={currentRoom.analyzing || currentRoom.photos.length === 0} className="rounded-xl text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                              {currentRoom.analyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                              {currentRoom.analyzing ? 'Analisando...' : 'Analisar'}
                            </Button>
                            {aiStatus?.configured && (
                              <Button variant="ghost" size="sm" onClick={() => inspectRoom(currentRoomIdx)} disabled={currentRoom.photos.length === 0 || currentRoom.photos.some(p => p.id && inspectingIds.includes(p.id))} className="rounded-xl text-xs min-h-10 text-orange-300 hover:text-orange-200 hover:bg-orange-500/10">
                                {currentRoom.photos.some(p => p.id && inspectingIds.includes(p.id)) ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ScanSearch className="w-3.5 h-3.5 mr-1" />}Detectar defeitos
                              </Button>
                            )}
                          </div>
                          <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <p className="text-[11px] text-indigo-400 uppercase tracking-wider font-semibold mb-1.5">Dicas de fotos</p>
                            <div className="flex flex-wrap gap-1">{getRoomPhotoTips(currentRoom.name).map((tip, i) => <span key={i} className="text-[11px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{tip}</span>)}</div>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          {/* Problem Checklist */}
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold">Problemas para Documentar</p>
                              {roomProblems.length > 0 && <span className="text-[11px] text-amber-400 font-bold">{roomProblems.length} selecionado(s)</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 mb-2">Clique para marcar problemas encontrados neste cômodo</p>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                              {allProblems.map((problem) => {
                                const isSelected = roomProblems.includes(problem);
                                return (
                                  <button key={problem} onClick={() => toggleProblem(problem)}
                                    className={cn("text-[11px] px-2 py-1 rounded-lg border transition-all",
                                      isSelected ? 'border-amber-500/40 bg-amber-500/20 text-amber-300 font-bold' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300')}>
                                    {isSelected && '✓ '}{problem}
                                  </button>
                                );
                              })}
                            </div>
                            {roomProblems.length > 0 && (
                              <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-[11px] text-amber-400 font-bold mb-1">Tirar fotos de:</p>
                                <div className="flex flex-wrap gap-1">{roomProblems.map((p, i) => (
                                  <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1">
                                    <Camera className="w-2 h-2" /> {p}
                                  </span>
                                ))}</div>
                              </div>
                            )}
                          </div>

                          {/* Photo Grid */}
                          {currentRoom.photos.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {currentRoom.photos.map((photo, pIdx) => (
                                <div key={pIdx} draggable onDragStart={() => handleDragStart(pIdx)} onDragOver={handleDragOver} onDrop={() => handleDrop(pIdx)}
                                  className={cn("relative group aspect-square rounded-xl overflow-hidden border transition-all cursor-grab", draggedPhotoIdx === pIdx ? 'border-indigo-500 scale-95 opacity-50' : 'border-white/5 hover:border-white/10')}>
                                  <img src={photo.dataUrl} alt={photo.name} className="w-full h-full object-cover" />
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded bg-black/60 flex items-center justify-center text-[8px] font-bold text-white">{pIdx + 1}</div>
                                  {photo.annotations.length > 0 && <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-red-500/90 text-white px-1 py-0.5 rounded text-[8px] font-bold"><MapPin className="w-2 h-2" /> {photo.annotations.length}</div>}
                                  {photo.id && inspectingIds.includes(photo.id) && <div className="absolute inset-0 bg-black/50 grid place-items-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                                  {inspectionSummary(photo.inspection).defects > 0 && <div className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-orange-500/95 text-black px-1 py-0.5 rounded text-[11px] font-bold"><ScanSearch className="w-2.5 h-2.5" /> {inspectionSummary(photo.inspection).defects}</div>}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                                    <button onClick={e => { e.stopPropagation(); setPreviewPhoto(photo); }} className="p-1.5 bg-white/20 rounded-lg"><Eye className="w-3 h-3 text-white" /></button>
                                    {aiStatus?.configured && <button aria-label="Detectar defeitos nesta foto" onClick={e => { e.stopPropagation(); inspectPhoto(currentRoomIdx, pIdx); }} className="p-1.5 bg-orange-500/40 rounded-lg"><ScanSearch className="w-3 h-3 text-white" /></button>}
                                    <button onClick={e => { e.stopPropagation(); setAnnotatingPhoto({ roomIdx: currentRoomIdx, photoIdx: pIdx }); }} className="p-1.5 bg-white/20 rounded-lg"><MapPin className="w-3 h-3 text-white" /></button>
                                    <button onClick={e => { e.stopPropagation(); setRooms(prev => prev.map((r, i) => i === currentRoomIdx ? { ...r, photos: r.photos.filter((_, pi) => pi !== pIdx) } : r)); }} className="p-1.5 bg-red-500/30 rounded-lg"><Trash2 className="w-3 h-3 text-white" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : <div className="text-center py-6"><Camera className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-xs text-slate-500">Nenhuma foto ainda</p>{roomProblems.length > 0 && <p className="text-[11px] text-amber-400 mt-1">Tire fotos dos problemas selecionados acima</p>}</div>}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button type="button" onClick={() => setCameraOpen(true)}
                              className="flex items-center justify-center gap-2 min-h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-900/30">
                              <Camera className="w-5 h-5" />Abrir câmera guiada
                            </button>
                            <label className="block"><input type="file" accept="image/*" multiple className="hidden" onChange={e => { void handlePhotoUpload(currentRoomIdx, e.target.files); e.target.value = ''; }} />
                              <div className="flex items-center justify-center gap-2 min-h-14 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors text-slate-300 hover:text-white">
                                <ImageIcon className="w-4 h-4" /><span className="text-sm font-medium">{uploading ? 'Otimizando fotos…' : 'Escolher da galeria'}</span>
                              </div></label>
                          </div>
                          <p className="text-[11px] text-slate-500 -mt-2">A câmera guiada avisa se falta luz, se está tremendo ou torto, e mostra o que fotografar neste cômodo.</p>

                          {(currentRoom.proposals?.length || 0) > 0 && (
                            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-400/30 flex flex-wrap items-center gap-3" role="status">
                              <Sparkles className="w-4 h-4 text-violet-300 shrink-0" />
                              <p className="flex-1 min-w-[10rem] text-sm text-violet-100"><b>{currentRoom.proposals!.length} sugestão(ões) da IA</b> aguardando a sua revisão. Nada foi gravado no laudo ainda.</p>
                              <Button size="sm" onClick={() => setReviewRoomIdx(currentRoomIdx)} className="rounded-xl min-h-10 bg-violet-500 hover:bg-violet-400 text-white font-semibold">Revisar agora</Button>
                            </div>
                          )}

                          {currentRoom.aiAdvice && (currentRoom.aiAdvice.missingShots.length > 0 || currentRoom.aiAdvice.photoNotes.length > 0) && (
                            <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 space-y-2">
                              <p className="text-[11px] text-violet-300 uppercase tracking-wider font-semibold flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Sugestões da IA</p>
                              {currentRoom.aiAdvice.photoNotes.map((n, i) => (
                                <p key={i} className="text-xs text-amber-200 flex gap-2"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span><b>Foto {n.photo + 1}:</b> {n.issue}{n.advice ? ` — ${n.advice}` : ''}</span></p>
                              ))}
                              {currentRoom.aiAdvice.missingShots.length > 0 && (
                                <div>
                                  <p className="text-[11px] text-slate-400 mb-1">Faltam fotos de:</p>
                                  <div className="flex flex-wrap gap-1.5">{currentRoom.aiAdvice.missingShots.map((m, i) => <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-violet-500/10 text-violet-200 border border-violet-500/20">{m}</span>)}</div>
                                </div>
                              )}
                            </div>
                          )}

                          {currentRoom.items.length > 0 && (
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                              <p className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold mb-1.5">Itens detectados ({currentRoom.items.length})</p>
                              <div className="text-[11px] text-slate-400 space-y-0.5 max-h-20 overflow-y-auto">{currentRoom.items.slice(0, 5).map((item, i) => <p key={i} className="truncate">{item}</p>)}{currentRoom.items.length > 5 && <p className="text-slate-500">+{currentRoom.items.length - 5} mais</p>}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* STEP 5: Review */}
              {wizardStep === 5 && (
                <div className="space-y-6">
                  <div><h2 className="text-xl font-bold text-white mb-1">Revisão e Observações</h2><p className="text-sm text-slate-500">Revise, adicione observações e gere o laudo</p></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Imóvel</h3>
                      <p className="text-sm font-bold text-white">{propertyInfo.condominio || 'Sem nome'}</p>
                      <p className="text-xs text-slate-400">{propertyInfo.endereco} {propertyInfo.numero} {propertyInfo.conjApto}</p>
                      <div className="flex gap-1.5 mt-2">{[propertyInfo.tipoImovel, propertyInfo.finalidade, propertyInfo.metragem].filter(Boolean).map((v, i) => <Badge key={i} className="bg-white/5 text-slate-400 border-0 text-[11px]">{v}</Badge>)}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resumo</h3>
                      <div className="space-y-1 text-xs"><p className="text-slate-400">Cômodos: <span className="text-white font-bold">{rooms.length}</span></p><p className="text-slate-400">Fotos: <span className="text-white font-bold">{totalPhotos}</span></p><p className="text-slate-400">Anotações: <span className="text-white font-bold">{totalAnnotations}</span></p></div>
                    </div>
                  </div>

                  <AuditPanel audit={audit} onGoto={(step, roomId) => { setWizardStep(step); if (roomId) { const i = rooms.findIndex(r => r.id === roomId); if (i >= 0) setCurrentRoomIdx(i); } }} />

                  <RepairsPanel info={propertyInfo} setInfo={setPropertyInfo} onEstimate={() => void estimateRepairs()} busy={repairsBusy}
                    canEstimate={!!aiStatus?.configured} damageCount={rooms.reduce((n, r) => n + new Set([...(r.damages || []), ...r.photos.flatMap(p => p.annotations.map(x => x.label))]).size, 0)} />

                  {rooms.some(r => r.photos.some(p => p.annotations.length > 0)) && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Anotações</h3>
                      {rooms.map((room, idx) => {
                        const anns = room.photos.flatMap((p, pi) => p.annotations.map(a => ({ room: room.name || `Cômodo ${idx + 1}`, label: a.label })));
                        if (anns.length === 0) return null;
                        return <div key={room.id} className="mb-2"><p className="text-xs font-semibold text-white mb-0.5">{room.name || `Cômodo ${idx + 1}`}</p>{anns.map((a, i) => <p key={i} className="text-[11px] text-slate-400 pl-2">· {a.label}</p>)}</div>;
                      })}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Considerações finais</Label>
                      <div className="flex flex-wrap gap-2">
                        <DictationButton onText={(t) => setPropertyInfo({ ...propertyInfo, consideracoes: (propertyInfo.consideracoes ? propertyInfo.consideracoes + ' ' : '') + t })} />
                        {settings.aiConsiderationsEnabled && (
                          <Button type="button" size="sm" disabled={aiWriting || !aiStatus?.configured} onClick={() => void generateConsiderations()} title={aiStatus?.configured ? 'Redige com base nos dados reais do laudo' : 'IA não configurada'}
                            className="rounded-xl min-h-[40px] text-xs bg-violet-500/15 text-violet-200 hover:bg-violet-500/25 border border-violet-500/30">
                            {aiWriting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}{aiWriting ? 'Redigindo…' : 'Redigir com IA'}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {['Imóvel entregue com pintura nova', 'Hidráulica OK', 'Elétrica OK', 'Ar condicionado funcionando', 'Todos interruptores testados'].map(t => (
                        <button key={t} onClick={() => setPropertyInfo({ ...propertyInfo, consideracoes: propertyInfo.consideracoes + (propertyInfo.consideracoes ? '\n' : '') + '· ' + t })}
                          className="text-[11px] px-2 py-1 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500/10 transition-all">+ {t}</button>
                      ))}
                    </div>
                    <textarea className="w-full h-28 px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Observações adicionais..."
                      value={propertyInfo.consideracoes} onChange={e => setPropertyInfo({ ...propertyInfo, consideracoes: e.target.value })} />
                    <p className="text-[11px] text-slate-600">{propertyInfo.consideracoes.split('\n').filter(Boolean).length} linha(s)</p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assinaturas</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Opcional. As assinaturas aparecem no laudo; use o dedo, a caneta ou o mouse.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SignaturePad label={`Locadora${propertyInfo.locadora ? ' · ' + propertyInfo.locadora : ''}`} value={signatures.locadora} onChange={(d) => setSignatures({ ...signatures, locadora: d })} />
                      <SignaturePad label={`Locatário(a)${propertyInfo.locatario ? ' · ' + propertyInfo.locatario : ''}`} value={signatures.locatario} onChange={(d) => setSignatures({ ...signatures, locatario: d })} />
                      <SignaturePad label={`Vistoriadora${propertyInfo.vistoriadora ? ' · ' + propertyInfo.vistoriadora : ''}`} value={signatures.vistoriadora} onChange={(d) => setSignatures({ ...signatures, vistoriadora: d })} />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={generatePdf} disabled={generating} className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 h-12 text-sm font-bold">
                      {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}{generating ? generationStep || 'Gerando...' : 'Gerar Laudo PDF'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {!canProceed() && wizardStep === 2 && <p className="mt-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3" role="status">Adicione pelo menos um cômodo para continuar.</p>}
          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-white/5 max-sm:sticky max-sm:bottom-0 max-sm:z-20 max-sm:-mx-4 max-sm:px-4 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:bg-[#0a0a0f]/90 max-sm:backdrop-blur-xl">
            <Button variant="ghost" onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0} className="rounded-xl text-xs min-h-11 px-4 text-slate-400 hover:text-white"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Anterior</Button>
            {wizardStep < WIZARD_STEPS.length - 1 && (
              <Button onClick={handleNext} disabled={!canProceed()} className="rounded-xl min-h-11 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20">Próximo <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
            )}
          </div>
        </div>
      </div>

      {reviewRoomIdx != null && rooms[reviewRoomIdx] && (
        <DetectionsReview key={`${rooms[reviewRoomIdx].id}-${rooms[reviewRoomIdx].proposals?.length || 0}`} room={rooms[reviewRoomIdx]} onClose={() => setReviewRoomIdx(null)}
          onResolve={(acc, ids) => { resolveProposals(reviewRoomIdx, acc, ids); setReviewRoomIdx(null); }} />
      )}

      {cameraOpen && currentRoom && (
        <CameraAssistant roomName={currentRoom.name || `Cômodo ${currentRoomIdx + 1}`}
          tips={[...new Set([...(currentRoom.aiAdvice?.missingShots || []).map(m => `Faltava: ${m}`), ...(currentRoom.photoProblems || []).map(p => `Detalhe: ${p}`), ...getRoomPhotoTips(currentRoom.name)])]}
          inspect={settings.aiAutoInspect && settings.aiAnalysisEnabled && aiStatus?.configured ? (url) => inspectOne(url, currentRoom.name || `Cômodo ${currentRoomIdx + 1}`) : undefined}
          onClose={() => setCameraOpen(false)}
          onDone={(files, insps) => { setCameraOpen(false); const dt = new DataTransfer(); files.forEach((f) => dt.items.add(f)); void handlePhotoUpload(currentRoomIdx, dt.files, insps); }} />
      )}

      {/* Photo Annotator Modal */}
      <AnimatePresence>{annotatingPhoto && currentRoom && (
        <PhotoAnnotator photo={currentRoom.photos[annotatingPhoto.photoIdx]} onClose={() => setAnnotatingPhoto(null)}
          onSave={annotations => { setRooms(prev => prev.map((r, i) => i === annotatingPhoto.roomIdx ? { ...r, photos: r.photos.map((p, pi) => pi === annotatingPhoto.photoIdx ? { ...p, annotations } : p) } : r)); toast.success(`${annotations.length} anotações salvas`); }} />
      )}</AnimatePresence>

      {/* Photo Preview */}
      <AnimatePresence>{previewPhoto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-w-5xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <div className="relative w-fit max-w-full mx-auto">
              <img src={previewPhoto.dataUrl} alt={previewPhoto.name} className="block max-w-full w-auto h-auto max-h-[80dvh] rounded-2xl" />
              <InspectionOverlay inspection={previewPhoto.inspection} />
            </div>
            {previewPhoto.inspection && (
              <div className="mt-3 mx-auto max-w-2xl rounded-xl bg-black/60 backdrop-blur-md p-3 max-h-40 overflow-y-auto">
                <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mb-2">Detectado pela IA</p>
                <InspectionList inspection={previewPhoto.inspection} />
              </div>
            )}
            {previewPhoto.annotations.length > 0 && (
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-xl p-3 max-w-xs">
                <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mb-2">Anotações</p>
                <div className="space-y-1">{previewPhoto.annotations.map((ann, i) => <div key={i} className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">{i + 1}</div><span className="text-xs text-white">{ann.label}</span></div>)}</div>
              </div>
            )}
            <button onClick={() => setPreviewPhoto(null)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-xl hover:bg-black/70 transition-colors"><X className="w-5 h-5 text-white" /></button>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* PDF Preview */}
      <AnimatePresence>{showPdfPreview && pdfHtml && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex flex-col p-4">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-cyan-400" /><span className="text-sm font-bold text-white">Preview do Laudo</span></div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={openPdfInTab} className="rounded-xl text-xs bg-gradient-to-r from-cyan-600 to-blue-600 text-white"><FileText className="w-3 h-3 mr-1" /> Imprimir</Button>
              <Button size="sm" onClick={exportHtml} variant="ghost" className="rounded-xl text-xs text-slate-400 hover:text-white"><Download className="w-3 h-3 mr-1" /> Baixar</Button>
              <Button size="sm" onClick={shareWhatsApp} variant="ghost" className="rounded-xl text-xs text-emerald-400 hover:text-emerald-300"><MessageCircle className="w-3 h-3 mr-1" /> WhatsApp</Button>
              <button onClick={() => { setShowPdfPreview(false); setPdfHtml(null); }} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-white"><iframe srcDoc={pdfHtml} className="w-full h-full border-0" title="Preview" /></div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
