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

export function PhotoAnnotator({ photo, onClose, onSave }: { photo: PhotoData; onClose: () => void; onSave: (a: PhotoAnnotation[]) => void }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [annotations, setAnnotations] = useState<PhotoAnnotation[]>(photo.annotations);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setPendingPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
    setEditingIdx(null); setNewAnnotation('');
  };

  const addAnnotation = (label?: string) => {
    const text = label || newAnnotation.trim();
    if (pendingPos && text) { setAnnotations([...annotations, { ...pendingPos, label: text }]); setNewAnnotation(''); setPendingPos(null); }
  };

  const updateAnnotation = (idx: number, label: string) => setAnnotations(annotations.map((a, i) => i === idx ? { ...a, label } : a));
  const removeAnnotation = (idx: number) => { setAnnotations(annotations.filter((_, i) => i !== idx)); if (editingIdx === idx) setEditingIdx(null); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-stretch sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#12121a] rounded-2xl border border-white/10 max-w-5xl w-full max-h-dvh sm:max-h-[92dvh] sm:rounded-2xl rounded-none overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-3 sm:p-4 border-b border-white/5 flex items-center justify-between gap-2 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">Anotações na Foto</span>
            <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[11px] font-bold">{annotations.length} pontos</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl text-xs text-slate-400 min-h-10">Cancelar</Button>
            <Button size="sm" onClick={() => { onSave(annotations); onClose(); }} className="rounded-xl text-xs min-h-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              Salvar {annotations.length > 0 && `(${annotations.length})`}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-3 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/5">
                <img ref={imgRef} src={photo.dataUrl} alt="Foto" className="w-full h-auto cursor-crosshair select-none" draggable={false} onClick={handleImageClick} />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {annotations.map((ann, idx) => {
                    const goRight = ann.x < 60; const endX = goRight ? Math.min(ann.x + 20, 95) : Math.max(ann.x - 20, 5);
                    return <g key={idx}><line x1={ann.x} y1={ann.y} x2={endX} y2={ann.y} stroke="#ef4444" strokeWidth="0.3" strokeDasharray="1,0.5" opacity="0.7" /><circle cx={endX} cy={ann.y} r="0.5" fill="#ef4444" /></g>;
                  })}
                </svg>
                {annotations.map((ann, idx) => (
                  <div key={idx} className="absolute -ml-3.5 -mt-3.5" style={{ left: `${ann.x}%`, top: `${ann.y}%` }}>
                    <div className={cn("w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[11px] font-bold text-white cursor-pointer transition-all", editingIdx === idx ? 'bg-amber-500 scale-125' : 'bg-red-500 hover:scale-110')}
                      onClick={e => { e.stopPropagation(); setEditingIdx(editingIdx === idx ? null : idx); setPendingPos(null); setNewAnnotation(ann.label); }}>{idx + 1}</div>
                    <div className={cn("absolute top-7 whitespace-nowrap text-[11px] font-semibold px-2 py-1 rounded-md shadow-lg", editingIdx === idx ? 'bg-amber-500 text-black left-0' : 'bg-black/80 text-white left-1/2 -translate-x-1/2')}>{ann.label}</div>
                  </div>
                ))}
                {pendingPos && <div className="absolute w-6 h-6 -ml-3 -mt-3 animate-pulse" style={{ left: `${pendingPos.x}%`, top: `${pendingPos.y}%` }}><div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg" /></div>}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">Toque na foto para marcar · Toque num marcador para editar</p>
            </div>
            <div className="space-y-4">
              {!pendingPos && editingIdx === null && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Problemas comuns</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {COMMON_PROBLEMS.map(p => (
                      <button key={p} onClick={() => editingIdx !== null && updateAnnotation(editingIdx, p)}
                        className={cn("text-[11px] px-2.5 py-1.5 rounded-md border transition-colors", editingIdx !== null ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer' : 'border-white/5 bg-white/5 text-slate-500 cursor-default opacity-50')}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {(pendingPos || editingIdx !== null) && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-2">{editingIdx !== null ? `Editando ponto ${editingIdx + 1}` : 'Novo ponto'}</p>
                  <Input placeholder="Ex: Rachadura na parede" className="rounded-xl h-11 bg-white/5 border-white/5 text-white text-base sm:text-sm mb-2" value={newAnnotation}
                    onChange={e => { setNewAnnotation(e.target.value); if (editingIdx !== null) updateAnnotation(editingIdx, e.target.value); }}
                    onKeyDown={e => { if (e.key === 'Enter') { editingIdx !== null ? (setEditingIdx(null), setNewAnnotation('')) : addAnnotation(); } if (e.key === 'Escape') { setPendingPos(null); setEditingIdx(null); setNewAnnotation(''); } }} autoFocus />
                  {editingIdx === null ? <Button size="sm" onClick={() => addAnnotation()} disabled={!newAnnotation.trim()} className="w-full rounded-xl text-xs bg-amber-500 text-black font-bold">Adicionar</Button>
                    : <Button size="sm" onClick={() => { setEditingIdx(null); setNewAnnotation(''); }} className="w-full rounded-xl text-xs bg-amber-500/20 text-amber-400 font-bold">Concluído</Button>}
                </div>
              )}
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Pontos marcados</p>
                {annotations.length === 0 ? <p className="text-xs text-slate-600">Nenhuma anotação ainda</p> : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {annotations.map((ann, idx) => (
                      <div key={idx} onClick={() => { setEditingIdx(editingIdx === idx ? null : idx); setNewAnnotation(ann.label); setPendingPos(null); }}
                        className={cn("flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all", editingIdx === idx ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]')}>
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0", editingIdx === idx ? 'bg-amber-500' : 'bg-red-500')}>{idx + 1}</div>
                        <span className="text-xs text-slate-300 flex-1 truncate">{ann.label}</span>
                        <button onClick={e => { e.stopPropagation(); removeAnnotation(idx); }} aria-label="Remover ponto" className="p-2.5 -m-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

