'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Plus, Trash2, Camera, Sparkles, FileText, Loader2,
  CheckCircle2, Building2, ArrowRight, ArrowLeft, X, MapPin, Edit3,
  Settings, Eye, Download, BarChart3, Clock, Hash, Star, Copy,
  Share2, MessageCircle, Image, Layers, Zap, Target, Award,
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
import { summarize } from '../_lib/laudo-stats';
import type { VistoriaController } from '../_lib/useVistoriaController';
import { RoomQuestionnaire } from '../_components/RoomQuestionnaire';
import { ProblemsStep } from '../_components/ProblemsStep';
import { PropertyStep } from '../_components/PropertyStep';
import { PhotoAnnotator } from '../_components/PhotoAnnotator';
import { AutocompleteInput, CpfCnpjInput, PhoneInput } from '../_components/inputs';

export function StatsView({ v }: { v: VistoriaController }) {
  const {
    aiStatus, aiWriting, generateConsiderations, view, setView, wizardStep, setWizardStep, propertyInfo, setPropertyInfo, rooms, setRooms,
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
    const laudosByMonth = savedLaudos.reduce((acc, l) => { const m = new Date(l.savedAt).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }); acc[m] = (acc[m] || 0) + 1; return acc; }, {} as Record<string, number>);
    const countBy = (pick: (r: import('../_lib/types').RoomData) => string[]) => {
      const m: Record<string, number> = {};
      savedLaudos.filter((l) => !l.isExample).forEach((l) => l.rooms?.forEach((r) => pick(r).forEach((x) => { const k = x.trim(); if (k) m[k] = (m[k] || 0) + 1; })));
      return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
    };
    const topDamages = countBy((r) => r.damages || []);
    const topFurniture = countBy((r) => r.furniture || []);
    const own = savedLaudos.filter((l) => !l.isExample);
    const exits = own.filter((l) => l.propertyInfo?.tipoVistoria === 'SAIDA').length;
    const avgCompleteness = own.length ? Math.round(own.reduce((s, l) => s + summarize(l).completeness, 0) / own.length) : 0;
    const tipoDistribution = savedLaudos.reduce((acc, l) => { const t = l.propertyInfo?.tipoImovel || 'N/A'; acc[t] = (acc[t] || 0) + 1; return acc; }, {} as Record<string, number>);

    return (
      <div className="min-h-dvh bg-[#0a0a0f]">
        <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center border border-violet-500/10"><BarChart3 className="w-5 h-5 text-violet-400" /></div>
                <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Estatísticas</h1><p className="text-xs text-slate-500">Métricas dos seus laudos de vistoria</p></div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setView('home')} className="rounded-xl text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar</Button>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total de Laudos', value: savedLaudos.length, icon: FileText, color: 'text-indigo-400' },
                { label: 'Total de Cômodos', value: savedLaudos.reduce((s, l) => s + (l.rooms?.length || 0), 0), icon: Building2, color: 'text-blue-400' },
                { label: 'Total de Fotos', value: savedLaudos.reduce((s, l) => s + (l.rooms?.reduce((s2, r) => s2 + (r.photos?.length || 0), 0) || 0), 0), icon: Camera, color: 'text-emerald-400' },
                { label: 'Total Anotações', value: savedLaudos.reduce((s, l) => s + (l.rooms?.reduce((s2, r) => s2 + (r.photos?.reduce((s3, p) => s3 + (p.annotations?.length || 0), 0) || 0), 0) || 0), 0), icon: MapPin, color: 'text-amber-400' },
              ].map((stat, idx) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 text-center">
                  <stat.icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {Object.keys(laudosByMonth).length > 0 && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                <h3 className="text-sm font-bold text-white mb-4">Laudos por Mês</h3>
                <div className="flex items-end gap-2 h-32">
                  {Object.entries(laudosByMonth).map(([month, count], idx) => {
                    const max = Math.max(...Object.values(laudosByMonth));
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[11px] text-slate-400 font-bold">{count}</span>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(count / max) * 100}%` }} transition={{ delay: idx * 0.1 }}
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg min-h-[4px]" />
                        <span className="text-[11px] text-slate-500">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Object.keys(tipoDistribution).length > 0 && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                <h3 className="text-sm font-bold text-white mb-4">Distribuição por Tipo</h3>
                <div className="space-y-3">
                  {Object.entries(tipoDistribution).sort((a, b) => b[1] - a[1]).map(([tipo, count]) => {
                    const total = Object.values(tipoDistribution).reduce((s, v) => s + v, 0);
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={tipo} className="space-y-1">
                        <div className="flex items-center justify-between text-xs"><span className="text-slate-300 font-medium">{tipo}</span><span className="text-slate-500">{count} ({pct.toFixed(0)}%)</span></div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 text-center"><p className="text-3xl font-black text-white tabular-nums">{avgCompleteness}%</p><p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Completude média dos laudos</p></div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 text-center"><p className="text-3xl font-black text-white tabular-nums">{exits}</p><p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Vistorias de saída</p></div>
            </div>

            {[['Avarias mais frequentes', topDamages, 'from-red-500 to-orange-500'], ['Móveis/equipamentos mais inventariados', topFurniture, 'from-cyan-500 to-indigo-500']].map(([title, rows, grad]) => {
              const list = rows as [string, number][];
              if (list.length === 0) return null;
              const max = list[0][1];
              return (
                <div key={title as string} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                  <h3 className="text-sm font-bold text-white mb-4">{title as string}</h3>
                  <div className="space-y-2.5">
                    {list.map(([name, count]) => (
                      <div key={name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs"><span className="text-slate-300 truncate pr-2">{name}</span><span className="text-slate-500 tabular-nums">{count}</span></div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${grad as string}`} style={{ width: `${(count / max) * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
}
