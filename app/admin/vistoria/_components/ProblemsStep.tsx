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
import { AutocompleteInput } from './inputs';
import { ChecklistPanel } from './ChecklistPanel';

export function ProblemsStep({ rooms, setRooms, settings }: { rooms: RoomData[]; setRooms: React.Dispatch<React.SetStateAction<RoomData[]>>; settings: VistoriaSettings }) {
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
  const [problemInput, setProblemInput] = useState('');
  const [furnitureInput, setFurnitureInput] = useState('');
  const [subStep, setSubStep] = useState<'furniture' | 'damages' | 'problems' | 'checklist'>('furniture');
  const currentRoom = rooms[currentRoomIdx];
  const activeDefaultProblems = COMMON_PROBLEMS.filter(p => !(settings.deletedDefaultProblems || []).includes(p));
  const allProblems = [...activeDefaultProblems, ...settings.customProblems];

  // Load saved furniture from localStorage
  const [savedFurniture, setSavedFurniture] = useState<string[]>([]);
  useEffect(() => {
    try { const s = localStorage.getItem('vistoria_furniture'); if (s) setSavedFurniture(JSON.parse(s)); } catch {}
  }, []);

  const saveFurniture = (item: string) => {
    if (!savedFurniture.includes(item)) {
      const updated = [...savedFurniture, item];
      setSavedFurniture(updated);
      localStorage.setItem('vistoria_furniture', JSON.stringify(updated));
    }
  };

  const roomFurniture = currentRoom?.furniture || [];
  const roomDamages = currentRoom?.damages || [];
  const roomProblems = currentRoom?.items || [];

  const filteredFurniture = [...savedFurniture, ...['Porta', 'Janela', 'Persiana', 'Torneira', 'Luminária', 'Interruptor', 'Tomada', 'Armário', 'Gaveta', 'Espelho', 'Prateleira', 'Gabinete', 'Ralo', 'Sifão', 'Box', 'Chuveiro', 'Aquecedor']].filter(f => !roomFurniture.includes(f) && f.toLowerCase().includes(furnitureInput.toLowerCase())).slice(0, 12);

  const filteredProblems = allProblems.filter(p => !roomProblems.includes(p) && p.toLowerCase().includes(problemInput.toLowerCase())).slice(0, 12);

  const addFurniture = (item: string) => {
    if (!roomFurniture.includes(item)) {
      setRooms(rooms.map((r, i) => i === currentRoomIdx ? { ...r, furniture: [...r.furniture, item] } : r));
      saveFurniture(item);
    }
    setFurnitureInput('');
  };

  const removeFurniture = (idx: number) => {
    setRooms(rooms.map((r, i) => i === currentRoomIdx ? { ...r, furniture: r.furniture.filter((_, j) => j !== idx) } : r));
  };

  const addDamage = (item: string) => {
    if (!roomDamages.includes(item)) {
      setRooms(rooms.map((r, i) => i === currentRoomIdx ? { ...r, damages: [...r.damages, item] } : r));
    }
    setProblemInput('');
  };

  const removeDamage = (idx: number) => {
    setRooms(rooms.map((r, i) => i === currentRoomIdx ? { ...r, damages: r.damages.filter((_, j) => j !== idx) } : r));
  };

  const hasData = roomFurniture.length > 0 || roomDamages.length > 0 || roomProblems.length > 0;
  const completedRooms = rooms.filter(r => r.furniture.length > 0 || r.damages.length > 0 || r.items.length > 0 || Object.keys(r.checklist || {}).length > 0).length;

  // Photo prompts based on furniture and damages
  const photoPrompts = [
    ...roomFurniture.map(f => `Foto do ${f} no(a) ${currentRoom?.name || 'cômodo'}`),
    ...roomDamages.map(d => `Foto da avaria: ${d} no(a) ${currentRoom?.name || 'cômodo'}`),
  ];

  const subSteps = [
    { id: 'furniture', label: 'Móveis', icon: '🪑' },
    { id: 'damages', label: 'Avarias', icon: '⚠️' },
    { id: 'problems', label: 'Problemas', icon: '🔍' },
    { id: 'checklist', label: 'Conservação', icon: '✅' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Inventário do Cômodo</h2>
        </div>
        <p className="text-sm text-slate-500">Registre móveis, avarias e problemas de cada cômodo</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>{completedRooms}/{rooms.length} cômodo(s) inventariados</span>
        <span>{currentRoomIdx + 1}/{rooms.length}</span>
      </div>

      {/* Room Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {rooms.map((room, idx) => {
          const hasData = room.furniture.length > 0 || room.damages.length > 0 || room.items.length > 0 || Object.keys(room.checklist || {}).length > 0;
          return (
            <button key={room.id} onClick={() => { setCurrentRoomIdx(idx); setSubStep('furniture'); setProblemInput(''); setFurnitureInput(''); }}
              className={cn("flex items-center gap-1.5 px-3 py-2.5 min-h-10 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all shrink-0",
                idx === currentRoomIdx ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : hasData ? 'text-emerald-400 border border-emerald-500/20' : 'text-slate-500 border border-white/5 hover:bg-white/5')}>
              {hasData && <CheckCircle2 className="w-3 h-3" />}
              {room.name || `C${idx + 1}`}
            </button>
          );
        })}
      </div>

      {/* Sub-steps: Furniture, Damages, Problems */}
      <div className="flex gap-2">
        {subSteps.map(s => (
          <button key={s.id} onClick={() => setSubStep(s.id as typeof subStep)}
            className={cn("flex items-center gap-1.5 px-3 py-2.5 min-h-10 rounded-xl text-[11px] font-semibold transition-all",
              subStep === s.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 border border-white/5 hover:bg-white/5')}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Current Room Content */}
      {currentRoom && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{currentRoom.name || `Cômodo ${currentRoomIdx + 1}`}</h3>

          {/* FURNITURE SUB-STEP */}
          {subStep === 'furniture' && (
            <div className="space-y-4">
              <div className="relative">
                <Input placeholder="Adicionar móvel... (ex: Armário, Gaveta, Espelho)"
                  value={furnitureInput}
                  onChange={e => setFurnitureInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && furnitureInput.trim()) { addFurniture(furnitureInput.trim()); } }}
                  className="rounded-xl bg-white/5 border-white/5 text-white text-sm placeholder:text-slate-600 pr-10" />
                {furnitureInput && (
                  <button onClick={() => { if (furnitureInput.trim()) addFurniture(furnitureInput.trim()); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick suggestions */}
              {furnitureInput && filteredFurniture.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filteredFurniture.map((f, i) => (
                    <button key={i} onClick={() => addFurniture(f)}
                      className="text-[11px] px-2 py-1 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                      + {f}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected furniture */}
              {roomFurniture.length > 0 && (
                <div>
                  <p className="text-[11px] text-indigo-400 uppercase tracking-wider font-semibold mb-2">Móveis no cômodo ({roomFurniture.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roomFurniture.map((f, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 flex items-center gap-1.5">
                        🪑 {f}
                        <button onClick={() => removeFurniture(i)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick add saved furniture */}
              {!furnitureInput && roomFurniture.length === 0 && (
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Móveis comuns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Porta', 'Fechadura', 'Janela', 'Vidro', 'Persiana', 'Torneira', 'Registro', 'Luminária', 'Interruptor', 'Tomada', 'Armário', 'Gaveta', 'Espelho', 'Prateleira', 'Gabinete', 'Ralo', 'Sifão', 'Box', 'Chuveiro', 'Aquecedor', 'Ar condicionado', 'Controle remoto', 'Interfone', 'Campainha', 'Caixa de luz'].map((f, i) => (
                      <button key={i} onClick={() => addFurniture(f)}
                        className="text-[11px] px-2 py-1 rounded-lg border border-white/5 bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                        + {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DAMAGES SUB-STEP */}
          {subStep === 'damages' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-[11px] text-amber-400 font-semibold">Informe as avarias encontradas neste cômodo</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Ex: Lixeira oxidada, fechadura com desgaste, piso trincado</p>
              </div>

              <div className="relative">
                <Input placeholder="Descreva a avaria encontrada..."
                  value={problemInput}
                  onChange={e => setProblemInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && problemInput.trim()) { addDamage(problemInput.trim()); } }}
                  className="rounded-xl bg-white/5 border-white/5 text-white text-sm placeholder:text-slate-600 pr-10" />
                {problemInput && (
                  <button onClick={() => { if (problemInput.trim()) addDamage(problemInput.trim()); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick suggestions */}
              {problemInput && (
                <div className="flex flex-wrap gap-1.5">
                  {['Lixeira oxidada', 'Fechadura com desgaste', 'Piso trincado', 'Pintura descascando', 'Vazamento', 'Rachadura', 'Mancha de umidade', 'Metais oxidados'].filter(d => !roomDamages.includes(d) && d.toLowerCase().includes(problemInput.toLowerCase())).map((d, i) => (
                    <button key={i} onClick={() => addDamage(d)}
                      className="text-[11px] px-2 py-1 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">
                      + {d}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected damages */}
              {roomDamages.length > 0 && (
                <div>
                  <p className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold mb-2">Avarias encontradas ({roomDamages.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roomDamages.map((d, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 flex items-center gap-1.5">
                        ⚠️ {d}
                        <button onClick={() => removeDamage(i)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROBLEMS SUB-STEP */}
          {subStep === 'problems' && (
            <div className="space-y-4">
              <div className="relative">
                <Input placeholder="Digite ou selecione um problema..."
                  value={problemInput}
                  onChange={e => setProblemInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && problemInput.trim()) { if (!roomProblems.includes(problemInput.trim())) { setRooms(rooms.map((r, i) => i === currentRoomIdx ? { ...r, items: [...r.items, problemInput.trim()] } : r)); } setProblemInput(''); } }}
                  className="rounded-xl bg-white/5 border-white/5 text-white text-sm placeholder:text-slate-600 pr-10" />
                {problemInput && (
                  <button onClick={() => { if (problemInput.trim() && !roomProblems.includes(problemInput.trim())) { setRooms(rooms.map((r, i) => i === currentRoomIdx ? { ...r, items: [...r.items, problemInput.trim()] } : r)); setProblemInput(''); } }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {problemInput && filteredProblems.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filteredProblems.map((p, i) => (
                    <button key={i} onClick={() => { if (!roomProblems.includes(p)) setRooms(rooms.map((r, j) => j === currentRoomIdx ? { ...r, items: [...r.items, p] } : r)); setProblemInput(''); }}
                      className="text-[11px] px-2 py-1 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                      + {p}
                    </button>
                  ))}
                </div>
              )}

              {roomProblems.length > 0 && (
                <div>
                  <p className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold mb-2">Problemas ({roomProblems.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roomProblems.map((p, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                        {p}
                        <button onClick={() => setRooms(rooms.map((r, j) => j === currentRoomIdx ? { ...r, items: r.items.filter((_, k) => k !== i) } : r))} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!problemInput && roomProblems.length === 0 && (
                <div>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Problemas Comuns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_PROBLEMS.slice(0, 12).map((p, i) => (
                      <button key={i} onClick={() => { if (!roomProblems.includes(p)) setRooms(rooms.map((r, j) => j === currentRoomIdx ? { ...r, items: [...r.items, p] } : r)); }}
                        className="text-[11px] px-2 py-1 rounded-lg border border-white/5 bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                        + {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {subStep === 'checklist' && currentRoom && (
            <ChecklistPanel room={currentRoom} onChange={(patch) => setRooms(rooms.map((r, i) => (i === currentRoomIdx ? { ...r, ...patch } : r)))} />
          )}

          {/* Photo Prompts */}
          {photoPrompts.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
              <p className="text-[11px] text-cyan-400 uppercase tracking-wider font-semibold mb-2">📸 Fotos a solicitar neste cômodo</p>
              <div className="space-y-1">
                {photoPrompts.map((prompt, i) => (
                  <p key={i} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-cyan-400 shrink-0" /> {prompt}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

