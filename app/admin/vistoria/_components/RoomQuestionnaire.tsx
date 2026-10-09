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

export interface RoomQuestionnaireProps {
  rooms: RoomData[];
  setRooms: React.Dispatch<React.SetStateAction<RoomData[]>>;
  propertyInfo: PropertyInfo;
  addRoom: () => void;
  removeRoom: (idx: number) => void;
}

// Questions per property type
export function getQuestionsForType(tipo: string) {
  const base = [
    { key: 'entradas', label: 'Quantas entradas/acessos?', type: 'number' as const, min: 1, max: 5, icon: '🚪', group: 'Geral' },
  ];

  switch (tipo) {
    case 'APARTAMENTO':
    case 'COBERTURA':
      return [
        ...base,
        { key: 'quartos', label: 'Quantos quartos?', type: 'number' as const, min: 0, max: 10, icon: '🛏️', group: 'Dormitórios' },
        { key: 'suites', label: 'Desses, quantos são suítes?', type: 'number' as const, min: 0, max: 10, icon: '✨', group: 'Dormitórios' },
        { key: 'salas', label: 'Quantas salas (estar/jantar)?', type: 'number' as const, min: 1, max: 5, icon: '🛋️', group: 'Social' },
        { key: 'varanda', label: 'Tem varanda/sacada?', type: 'boolean' as const, icon: '🌿', group: 'Social' },
        { key: 'lavabo', label: 'Tem lavabo?', type: 'boolean' as const, icon: '🚽', group: 'Social' },
        { key: 'cozinha', label: 'Cozinha separada ou americana?', type: 'boolean' as const, icon: '🍳', group: 'Service' },
        { key: 'areaServico', label: 'Tem área de serviço?', type: 'boolean' as const, icon: '🧺', group: 'Service' },
        { key: 'escritório', label: 'Tem home office/escritório?', type: 'boolean' as const, icon: '💼', group: 'Extras' },
        ...(tipo === 'COBERTURA' ? [
          { key: 'terraço', label: 'Tem terraço/churrasqueira?', type: 'boolean' as const, icon: '🔥', group: 'Extras' },
          { key: 'piscina', label: 'Tem piscina?', type: 'boolean' as const, icon: '🏊', group: 'Extras' },
        ] : []),
        { key: 'despensa', label: 'Tem despensa?', type: 'boolean' as const, icon: '📦', group: 'Extras' },
      ];
    case 'CASA':
      return [
        ...base,
        { key: 'andares', label: 'Quantos andares?', type: 'number' as const, min: 1, max: 3, icon: '🏢', group: 'Geral' },
        { key: 'quartos', label: 'Quantos quartos?', type: 'number' as const, min: 0, max: 10, icon: '🛏️', group: 'Dormitórios' },
        { key: 'suites', label: 'Desses, quantos são suítes?', type: 'number' as const, min: 0, max: 10, icon: '✨', group: 'Dormitórios' },
        { key: 'salas', label: 'Quantas salas (estar/jantar)?', type: 'number' as const, min: 1, max: 5, icon: '🛋️', group: 'Social' },
        { key: 'lavabo', label: 'Tem lavabo?', type: 'boolean' as const, icon: '🚽', group: 'Social' },
        { key: 'cozinha', label: 'Cozinha separada?', type: 'boolean' as const, icon: '🍳', group: 'Service' },
        { key: 'areaServico', label: 'Tem área de serviço?', type: 'boolean' as const, icon: '🧺', group: 'Service' },
        { key: 'varanda', label: 'Tem varanda/sacada?', type: 'boolean' as const, icon: '🌿', group: 'Externo' },
        { key: 'garagem', label: 'Quantas vagas de garagem?', type: 'number' as const, min: 0, max: 20, icon: '🚗', group: 'Externo' },
        { key: 'quintal', label: 'Tem quintal/jardim?', type: 'boolean' as const, icon: '🌳', group: 'Externo' },
        { key: 'churrasqueira', label: 'Tem churrasqueira?', type: 'boolean' as const, icon: '🔥', group: 'Externo' },
        { key: 'piscina', label: 'Tem piscina?', type: 'boolean' as const, icon: '🏊', group: 'Externo' },
        { key: 'escritório', label: 'Tem home office?', type: 'boolean' as const, icon: '💼', group: 'Extras' },
        { key: 'despensa', label: 'Tem despensa?', type: 'boolean' as const, icon: '📦', group: 'Extras' },
      ];
    case 'SALA':
    case 'COMERCIAL':
      return [
        ...base,
        { key: 'salas', label: 'Quantas salas/espacos?', type: 'number' as const, min: 1, max: 10, icon: '🏢', group: 'Principal' },
        { key: 'salaReuniao', label: 'Tem sala de reunião?', type: 'boolean' as const, icon: '🤝', group: 'Principal' },
        { key: 'banheiro', label: 'Tem banheiro?', type: 'boolean' as const, icon: '🚿', group: 'Service' },
        { key: 'cozinhete', label: 'Tem copa/cozinhete?', type: 'boolean' as const, icon: '☕', group: 'Service' },
        { key: 'deposito', label: 'Tem depósito/arquivo?', type: 'boolean' as const, icon: '📦', group: 'Service' },
        { key: 'vitrine', label: 'Tem vitrine/fachada?', type: 'boolean' as const, icon: '🏪', group: 'Externo' },
        { key: 'estacionamento', label: 'Tem vagas de estacionamento?', type: 'boolean' as const, icon: '🅿️', group: 'Externo' },
      ];
    default:
      return [
        ...base,
        { key: 'quartos', label: 'Quantos quartos?', type: 'number' as const, min: 0, max: 10, icon: '🛏️', group: 'Dormitórios' },
        { key: 'suites', label: 'Desses, quantos são suítes?', type: 'number' as const, min: 0, max: 10, icon: '✨', group: 'Dormitórios' },
        { key: 'salas', label: 'Quantas salas?', type: 'number' as const, min: 1, max: 5, icon: '🛋️', group: 'Social' },
        { key: 'banheiro', label: 'Tem banheiro?', type: 'boolean' as const, icon: '🚿', group: 'Service' },
        { key: 'cozinha', label: 'Tem cozinha?', type: 'boolean' as const, icon: '🍳', group: 'Service' },
      ];
  }
}

export function RoomQuestionnaire({ rooms, setRooms, propertyInfo, addRoom, removeRoom }: RoomQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [generated, setGenerated] = useState(false);

  const questions = React.useMemo(() => getQuestionsForType(propertyInfo.tipoImovel || 'APARTAMENTO'), [propertyInfo.tipoImovel]);
  const currentQ = questions[step];
  const isLastQuestion = step >= questions.length - 1;

  // Initialize defaults on mount
  useEffect(() => {
    const defaults: Record<string, any> = {};
    questions.forEach(q => {
      defaults[q.key] = q.type === 'number' ? (q.key === 'entradas' ? 1 : q.key === 'salas' ? 1 : 0) : false;
    });
    setAnswers(defaults);
    setStep(0);
    setGenerated(false);
  }, [questions]);

  const updateAnswer = (key: string, value: any) => {
    setAnswers(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'quartos' && next.suites > value) next.suites = value;
      if (key === 'suites' && value > (next.quartos || 0)) next.suites = next.quartos || 0;
      return next;
    });
  };

  const generateRooms = () => {
    const r: RoomData[] = [];
    let id = Date.now();
    const mk = (name: string): RoomData => ({ id: (id++).toString(), name, photos: [], items: [], furniture: [], damages: [], analyzing: false, analyzed: false });

    const tipo = propertyInfo.tipoImovel || 'APARTAMENTO';

    if (tipo === 'SALA' || tipo === 'COMERCIAL') {
      // Commercial rooms
      for (let i = 0; i < (answers.entradas || 1); i++) r.push(mk(answers.entradas > 1 ? `ENTRADA ${i + 1}` : 'ENTRADA'));
      for (let i = 0; i < (answers.salas || 1); i++) r.push(mk(answers.salas > 1 ? `SALA ${i + 1}` : 'SALA PRINCIPAL'));
      if (answers.salaReuniao) r.push(mk('SALA DE REUNIÃO'));
      if (answers.banheiro) r.push(mk('BANHEIRO'));
      if (answers.cozinhete) r.push(mk('COPA/COZINHETE'));
      if (answers.deposito) r.push(mk('DEPÓSITO'));
      if (answers.vitrine) r.push(mk('VITRINE/FACHADA'));
      if (answers.estacionamento) r.push(mk('ESTACIONAMENTO'));
    } else {
      // Residential rooms
      for (let i = 0; i < (answers.entradas || 1); i++) r.push(mk(answers.entradas > 1 ? `ENTRADA ${i + 1}` : 'ENTRADA'));
      if (answers.salas >= 3) { r.push(mk('SALA DE ESTAR')); r.push(mk('SALA DE JANTAR')); r.push(mk('SALA DE TV')); }
      else if (answers.salas === 2) { r.push(mk('SALA DE ESTAR')); r.push(mk('SALA DE JANTAR')); }
      else if (answers.salas >= 1) r.push(mk('SALA'));
      if (answers.cozinha) r.push(mk(tipo === 'APARTAMENTO' ? 'COZINHA' : 'COZINHA'));
      if (answers.areaServico) r.push(mk('ÁREA DE SERVIÇO'));
      if (answers.lavabo) r.push(mk('LAVABO'));
      const nonSuite = (answers.quartos || 0) - (answers.suites || 0);
      for (let i = 0; i < nonSuite; i++) r.push(mk(nonSuite > 1 ? `QUARTO ${i + 1}` : 'QUARTO'));
      for (let i = 0; i < (answers.suites || 0); i++) {
        r.push(mk(answers.suites > 1 ? `SUÍTE ${i + 1}` : 'SUÍTE'));
        r.push(mk(answers.suites > 1 ? `BANHEIRO SUÍTE ${i + 1}` : 'BANHEIRO SUÍTE'));
      }
      const banheirosSociais = (answers.banheiros || answers.banheiro ? 1 : 0) - (answers.suites || 0) - (answers.lavabo ? 1 : 0);
      for (let i = 0; i < Math.max(0, banheirosSociais); i++) r.push(mk(banheirosSociais > 1 ? `BANHEIRO SOCIAL ${i + 1}` : 'BANHEIRO SOCIAL'));
      if (answers.banheiro && !answers.banheiros) r.push(mk('BANHEIRO'));
      if (answers.escritório) r.push(mk('ESCRITÓRIO'));
      if (answers.varanda) r.push(mk('VARANDA'));
      if (answers.quintal) r.push(mk('QUINTAL'));
      if (answers.garagem && answers.garagem > 0) {
        if (answers.garagem === 1) r.push(mk('GARAGEM'));
        else r.push(mk(`GARAGEM (${answers.garagem} VAGAS)`));
      }
      if (answers.churrasqueira) { r.push(mk('CHURRASQUEIRA')); }
      if (answers.terraço) r.push(mk('TERRAÇO'));
      if (answers.piscina) r.push(mk('PISCINA'));
      if (answers.despensa) r.push(mk('DESPENSA'));
      if (tipo === 'COBERTURA' && answers.terraço) r.push(mk('TERRAÇO'));
    }

    setRooms(r);
    setGenerated(true);
  };

  // After generation - show results
  if (generated) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><h2 className="text-xl font-bold text-white">{rooms.length} Cômodos Gerados</h2></div>
          <p className="text-sm text-slate-500">Revise, edite ou adicione cômodos extras</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {rooms.length > 0 && <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center"><p className="text-lg font-bold text-indigo-400">{rooms.length}</p><p className="text-[11px] text-indigo-400 uppercase">Total</p></div>}
          {answers.quartos > 0 && <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center"><p className="text-lg font-bold text-white">{answers.quartos}</p><p className="text-[11px] text-slate-500 uppercase">Quartos</p></div>}
          {answers.suites > 0 && <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center"><p className="text-lg font-bold text-amber-400">{answers.suites}</p><p className="text-[11px] text-slate-500 uppercase">Suítes</p></div>}
          {answers.andares > 1 && <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center"><p className="text-lg font-bold text-white">{answers.andares}</p><p className="text-[11px] text-slate-500 uppercase">Andares</p></div>}
        </div>

        <div className="space-y-1.5">{rooms.map((room, idx) => (
          <div key={room.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-colors">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">{idx + 1}</div>
            <Input placeholder={`Cômodo ${idx + 1}`} className="rounded-xl bg-transparent border-none text-white placeholder:text-slate-600 text-sm font-semibold p-0 h-auto focus-visible:ring-0 flex-1" value={room.name} onChange={e => setRooms(rooms.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))} />
            <span className="text-[11px] text-slate-600 shrink-0">{room.photos.length}f</span>
            <button onClick={() => removeRoom(idx)} className="p-2.5 -m-1 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}</div>

        <div className="flex gap-2">
          <Input placeholder="Adicionar cômodo extra..." className="rounded-xl bg-white/5 border-white/5 text-white text-sm placeholder:text-slate-600" onKeyDown={e => {
            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
              setRooms([...rooms, { id: Date.now().toString(), name: (e.target as HTMLInputElement).value.trim().toUpperCase(), photos: [], items: [], furniture: [], damages: [], analyzing: false, analyzed: false }]);
              (e.target as HTMLInputElement).value = '';
            }
          }} />
          <Button variant="ghost" size="sm" onClick={addRoom} className="rounded-xl text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 shrink-0"><Plus className="w-3.5 h-3.5 mr-1" /> Add</Button>
        </div>

        <Button variant="ghost" size="sm" onClick={() => { setGenerated(false); setStep(0); }} className="rounded-xl text-xs text-slate-500 hover:text-white w-full">Refazer Questionário</Button>
      </div>
    );
  }

  // Questionnaire Flow
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{propertyInfo.tipoImovel === 'SALA' || propertyInfo.tipoImovel === 'COMERCIAL' ? '🏬' : propertyInfo.tipoImovel === 'CASA' ? '🏠' : propertyInfo.tipoImovel === 'COBERTURA' ? '🏙️' : '🏢'}</span>
          <h2 className="text-xl font-bold text-white">Configure o {propertyInfo.tipoImovel || 'Imóvel'}</h2>
        </div>
        <p className="text-sm text-slate-500">{questions.length} perguntas para gerar os cômodos</p>
      </div>

      <div className="flex gap-1">{questions.map((_, idx) => <div key={idx} className={cn("h-1 flex-1 rounded-full transition-all", idx <= step ? 'bg-indigo-500' : 'bg-white/5')} />)}</div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-3xl">{currentQ.icon}</span>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{currentQ.group} · {step + 1}/{questions.length}</p>
            <h3 className="text-lg font-bold text-white">{currentQ.label}</h3>
          </div>
        </div>

        {currentQ.type === 'number' ? (
          <div className="flex items-center justify-center gap-6">
            <button onClick={() => updateAnswer(currentQ.key, Math.max(currentQ.min || 0, (answers[currentQ.key] || 0) - 1))} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white hover:bg-white/10 transition-all active:scale-95">−</button>
            <span className="text-5xl font-black text-white w-20 text-center">{answers[currentQ.key] || 0}</span>
            <button onClick={() => updateAnswer(currentQ.key, Math.min(currentQ.max || 20, (answers[currentQ.key] || 0) + 1))} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white hover:bg-white/10 transition-all active:scale-95">+</button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button onClick={() => updateAnswer(currentQ.key, true)} className={cn("flex-1 py-5 rounded-2xl border-2 text-base font-bold transition-all active:scale-[0.98]", answers[currentQ.key] === true ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10')}>
              Sim ✓
            </button>
            <button onClick={() => updateAnswer(currentQ.key, false)} className={cn("flex-1 py-5 rounded-2xl border-2 text-base font-bold transition-all active:scale-[0.98]", answers[currentQ.key] === false ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-lg shadow-red-500/10' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10')}>
              Não ✗
            </button>
          </div>
        )}
      </motion.div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-xl text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Anterior</Button>
        {isLastQuestion ? (
          <Button onClick={generateRooms} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 px-6 py-2.5"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Gerar Cômodos</Button>
        ) : (
          <Button onClick={() => setStep(step + 1)} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20">Próximo <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
        )}
      </div>
    </div>
  );
}

