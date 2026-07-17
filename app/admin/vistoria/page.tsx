'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Camera,
  Sparkles,
  FileText,
  Loader2,
  CheckCircle2,
  Building2,
  ArrowRight,
  ArrowLeft,
  X,
  MessageCircle,
  Circle,
  MapPin,
  Edit3,
  Settings,
  Eye,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreatableSelect } from '@/components/ui/creatable-select';

// Default options for creatable selects
const TIPO_IMOVEL_OPTIONS = ['APARTAMENTO', 'SALA', 'CASA', 'COMERCIAL', 'COBERTURA'];
const FINALIDADE_OPTIONS = ['RESIDENCIAL', 'COMERCIAL'];
const MOBILIADO_OPTIONS = ['NÃO', 'SIM', 'PARCIALMENTE'];

// Photo tips per room type
const ROOM_PHOTO_TIPS: Record<string, string[]> = {
  ENTRADA: ['Porta de entrada e fechadura', 'Interfone e campainha', 'Piso e rodapé', 'Parede e teto', 'Quadro de luz'],
  SALA: ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas e persianas', 'Teto e luminárias', 'Tomadas e interruptores', 'Ar condicionado', 'Porta de entrada'],
  'SALA DE ESTAR': ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas e persianas', 'Teto e luminárias', 'Tomadas e interruptores'],
  COZINHA: ['Bancada e pia', 'Armários (superior e inferior)', 'Torneira e registros', 'Piso e parede', 'Fogão/forno', 'Tomadas e interruptores', 'Teto'],
  'ÁREA DE SERVIÇO': ['Pia e torneira', 'Registro de água', 'Piso e parede', 'Linha de roupas', 'Tomadas para máquinas'],
  BANHEIRO: ['Vaso sanitário e caixa acoplada', 'Pia e espelho', 'Torneira e registros', 'Chuveiro/ducha', 'Piso e parede', 'Louças e metais', 'Ventilação'],
  'BANHEIRO SOCIAL': ['Vaso sanitário e caixa acoplada', 'Pia e espelho', 'Torneira e registros', 'Chuveiro/ducha', 'Piso e parede'],
  QUARTO: ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas e persianas', 'Teto e luminárias', 'Tomadas e interruptores', 'Armários'],
  SUÍTE: ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas e persianas', 'Teto e luminárias', 'Tomadas e interruptores', 'Armários'],
  'BANHEIRO SUÍTE': ['Vaso sanitário', 'Pia e espelho', 'Torneira e registros', 'Chuveiro/ducha', 'Piso e parede'],
  VARANDA: ['Piso e paredes', 'Grade/vidraça', 'Teto', 'Luminária', 'Porta de acesso'],
  ESCRITÓRIO: ['Parede geral', 'Piso e rodapé', 'Janelas', 'Teto e luminárias', 'Tomadas e interruptores'],
  GARAGEM: ['Piso (concreto/lajota)', 'Parede e teto', 'Portão', 'Iluminação', 'Vaga demarcada'],
};

const DEFAULT_PHOTO_TIPS = ['Parede geral (4 faces)', 'Piso e rodapé', 'Janelas', 'Teto e luminárias', 'Tomadas e interruptores', 'Portas'];

function getRoomPhotoTips(roomName: string): string[] {
  const upper = roomName.toUpperCase().trim();
  // Exact match
  if (ROOM_PHOTO_TIPS[upper]) return ROOM_PHOTO_TIPS[upper];
  // Partial match
  for (const [key, tips] of Object.entries(ROOM_PHOTO_TIPS)) {
    if (upper.includes(key) || key.includes(upper)) return tips;
  }
  return DEFAULT_PHOTO_TIPS;
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

// Types
interface PhotoAnnotation {
  x: number;
  y: number;
  label: string;
}

interface PhotoData {
  dataUrl: string;
  name: string;
  annotations: PhotoAnnotation[];
}

interface RoomData {
  id: string;
  name: string;
  photos: PhotoData[];
  items: string[];
  analyzing: boolean;
  analyzed: boolean;
}

interface PropertyInfo {
  condominio: string;
  endereco: string;
  numero: string;
  conjApto: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipoImovel: string;
  finalidade: string;
  metragem: string;
  mobiliado: string;
  locadora: string;
  locadoraCpf: string;
  locatario: string;
  locatarioCpf: string;
  vistoriadora: string;
  dataFotografia: string;
  dataLaudo: string;
  solicitante: string;
  consideracoes: string;
  totalComodos: number;
}

const defaultPropertyInfo: PropertyInfo = {
  condominio: '',
  endereco: '',
  numero: '',
  conjApto: '',
  cep: '',
  bairro: '',
  cidade: 'São Paulo',
  estado: 'SP',
  tipoImovel: 'APARTAMENTO',
  finalidade: 'RESIDENCIAL',
  metragem: '',
  mobiliado: 'NÃO',
  locadora: '',
  locadoraCpf: '',
  locatario: '',
  locatarioCpf: '',
  vistoriadora: '',
  dataFotografia: new Date().toLocaleDateString('pt-BR'),
  dataLaudo: new Date().toLocaleDateString('pt-BR'),
  solicitante: '',
  consideracoes: '',
  totalComodos: 0,
};

// Wizard Steps
const WIZARD_STEPS = [
  { id: 'property', title: 'Dados do Imóvel', icon: Building2 },
  { id: 'parties', title: 'Partes Envolvidas', icon: Edit3 },
  { id: 'rooms', title: 'Cômodos', icon: ClipboardCheck },
  { id: 'photos', title: 'Fotos e Anotações', icon: Camera },
  { id: 'review', title: 'Observações e PDF', icon: FileText },
];

// Photo Annotation Modal
// Common problems for quick selection
const COMMON_PROBLEMS = [
  'Rachadura na parede',
  'Mancha de umidade',
  'Desgaste no piso',
  'Vazamento',
  'Infiltração',
  'Pintura descascando',
  'Furo na parede',
  'Serragem/trincas',
  'Metais oxidados',
  'Louça quebrada',
  'Tomada com defeito',
  'Interruptor com defeito',
  'Porta com desajuste',
  'Janela emperrando',
  'Mofo',
  'Barulho',
];

function PhotoAnnotator({
  photo,
  onClose,
  onSave,
}: {
  photo: PhotoData;
  onClose: () => void;
  onSave: (annotations: PhotoAnnotation[]) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [annotations, setAnnotations] = useState<PhotoAnnotation[]>(photo.annotations);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPos({ x, y });
    setEditingIdx(null);
    setNewAnnotation('');
  };

  const addAnnotation = (label?: string) => {
    const text = label || newAnnotation.trim();
    if (pendingPos && text) {
      setAnnotations([...annotations, { ...pendingPos, label: text }]);
      setNewAnnotation('');
      setPendingPos(null);
    }
  };

  const updateAnnotation = (idx: number, label: string) => {
    setAnnotations(annotations.map((a, i) => i === idx ? { ...a, label } : a));
  };

  const removeAnnotation = (idx: number) => {
    setAnnotations(annotations.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const handleSave = () => {
    onSave(annotations);
    onClose();
  };

  // Calculate callout line position for each annotation
  const getCalloutStyle = (ann: PhotoAnnotation, idx: number) => {
    const goRight = ann.x < 60;
    const lineLength = 60;
    const endX = goRight ? Math.min(ann.x + lineLength / 3, 95) : Math.max(ann.x - lineLength / 3, 5);
    return { endX, goRight };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#12121a] rounded-2xl border border-white/10 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">Anotações na Foto</span>
            <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[9px] font-bold">
              {annotations.length} pontos
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl text-xs text-slate-400">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} className="rounded-xl text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              Salvar {annotations.length > 0 && `(${annotations.length})`}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Image with annotations and callout lines */}
            <div className="lg:col-span-2">
              <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/5">
                <img
                  ref={imgRef}
                  src={photo.dataUrl}
                  alt="Foto para anotação"
                  className="w-full h-auto cursor-crosshair"
                  onClick={handleImageClick}
                />

                {/* SVG overlay for callout lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {annotations.map((ann, idx) => {
                    const { endX, goRight } = getCalloutStyle(ann, idx);
                    return (
                      <g key={idx}>
                        {/* Dashed line from point to label area */}
                        <line
                          x1={ann.x}
                          y1={ann.y}
                          x2={endX}
                          y2={ann.y}
                          stroke="#ef4444"
                          strokeWidth="0.3"
                          strokeDasharray="1,0.5"
                          opacity="0.7"
                        />
                        {/* End dot */}
                        <circle cx={endX} cy={ann.y} r="0.5" fill="#ef4444" />
                      </g>
                    );
                  })}
                </svg>

                {/* Annotation markers */}
                {annotations.map((ann, idx) => (
                  <div
                    key={idx}
                    className="absolute -ml-3 -mt-3"
                    style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                  >
                    {/* Marker circle */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white cursor-pointer transition-all ${
                        editingIdx === idx ? 'bg-amber-500 scale-125' : 'bg-red-500 hover:scale-110'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingIdx(editingIdx === idx ? null : idx);
                        setPendingPos(null);
                        setNewAnnotation(ann.label);
                      }}
                    >
                      {idx + 1}
                    </div>
                    {/* Label with background */}
                    <div className={`absolute top-7 whitespace-nowrap text-[9px] font-semibold px-2 py-1 rounded-md shadow-lg ${
                      editingIdx === idx
                        ? 'bg-amber-500 text-black left-0'
                        : 'bg-black/80 text-white left-1/2 -translate-x-1/2'
                    }`}>
                      {ann.label}
                    </div>
                  </div>
                ))}

                {/* Pending annotation marker */}
                {pendingPos && (
                  <div
                    className="absolute w-6 h-6 -ml-3 -mt-3 animate-pulse"
                    style={{ left: `${pendingPos.x}%`, top: `${pendingPos.y}%` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Clique na foto para marcar um ponto · Clique num marcador para editar
              </p>
            </div>

            {/* Annotations Panel */}
            <div className="space-y-4">
              {/* Quick problems */}
              {!pendingPos && !editingIdx && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Problemas comuns</p>
                  <p className="text-[10px] text-slate-600 mb-2">Clique num marcador depois selecione:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {COMMON_PROBLEMS.map((problem) => (
                      <button
                        key={problem}
                        onClick={() => {
                          if (editingIdx !== null) {
                            updateAnnotation(editingIdx, problem);
                            setEditingIdx(null);
                            setNewAnnotation('');
                          }
                        }}
                        className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                          editingIdx !== null
                            ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer'
                            : 'border-white/5 bg-white/5 text-slate-500 cursor-default opacity-50'
                        }`}
                      >
                        {problem}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* New annotation input */}
              {(pendingPos || editingIdx !== null) && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2">
                    {editingIdx !== null ? `Editando ponto ${editingIdx + 1}` : 'Novo ponto'}
                  </p>
                  <Input
                    placeholder="Ex: Rachadura na parede"
                    className="rounded-xl bg-white/5 border-white/5 text-white text-sm mb-2"
                    value={newAnnotation}
                    onChange={(e) => {
                      setNewAnnotation(e.target.value);
                      if (editingIdx !== null) updateAnnotation(editingIdx, e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingIdx !== null) { setEditingIdx(null); setNewAnnotation(''); }
                        else addAnnotation();
                      }
                      if (e.key === 'Escape') { setPendingPos(null); setEditingIdx(null); setNewAnnotation(''); }
                    }}
                    autoFocus
                  />
                  {editingIdx === null && (
                    <Button size="sm" onClick={() => addAnnotation()} disabled={!newAnnotation.trim()} className="w-full rounded-xl text-xs bg-amber-500 text-black font-bold">
                      Adicionar
                    </Button>
                  )}
                  {editingIdx !== null && (
                    <Button size="sm" onClick={() => { setEditingIdx(null); setNewAnnotation(''); }} className="w-full rounded-xl text-xs bg-amber-500/20 text-amber-400 font-bold">
                      Concluído
                    </Button>
                  )}
                </div>
              )}

              {/* Annotations list */}
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Pontos marcados</p>
                {annotations.length === 0 ? (
                  <p className="text-xs text-slate-600">Nenhuma anotação ainda</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {annotations.map((ann, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setEditingIdx(editingIdx === idx ? null : idx);
                          setNewAnnotation(ann.label);
                          setPendingPos(null);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          editingIdx === idx
                            ? 'bg-amber-500/10 border-amber-500/20'
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 ${
                          editingIdx === idx ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-xs text-slate-300 flex-1 truncate">{ann.label}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeAnnotation(idx); }}
                          className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
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

// Main Page
export default function AdminVistoriaPage() {
  const [view, setView] = useState<'home' | 'wizard'>('home');
  const [wizardStep, setWizardStep] = useState(0);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo>(defaultPropertyInfo);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
  const [annotatingPhoto, setAnnotatingPhoto] = useState<{ roomIdx: number; photoIdx: number } | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ dataUrl: string; name: string; annotations: PhotoAnnotation[] } | null>(null);
  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  const startWizard = () => {
    setPropertyInfo(defaultPropertyInfo);
    setRooms([]);
    setCurrentRoomIdx(0);
    setWizardStep(0);
    setView('wizard');
  };

  const canProceed = () => {
    switch (wizardStep) {
      case 0: return propertyInfo.condominio.trim() !== '';
      case 1: return propertyInfo.locadora.trim() !== '' && propertyInfo.locatario.trim() !== '';
      case 2: return rooms.length > 0;
      case 3: return true;
      case 4: return true;
      default: return true;
    }
  };

  const addRoom = () => {
    setRooms([...rooms, {
      id: Date.now().toString(),
      name: '',
      photos: [],
      items: [],
      analyzing: false,
      analyzed: false,
    }]);
  };

  const removeRoom = (idx: number) => {
    setRooms(rooms.filter((_, i) => i !== idx));
    if (currentRoomIdx >= rooms.length - 1) setCurrentRoomIdx(Math.max(0, rooms.length - 2));
  };

  const handlePhotoUpload = (roomIdx: number, files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRooms((prev) => prev.map((r, i) =>
          i === roomIdx
            ? { ...r, photos: [...r.photos, { dataUrl: e.target?.result as string, name: file.name, annotations: [] }] }
            : r
        ));
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => setDraggedPhotoIdx(idx);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (targetIdx: number) => {
    if (draggedPhotoIdx === null || draggedPhotoIdx === targetIdx) return;
    setRooms((prev) => prev.map((r, i) => {
      if (i !== currentRoomIdx) return r;
      const newPhotos = [...r.photos];
      const [moved] = newPhotos.splice(draggedPhotoIdx, 1);
      newPhotos.splice(targetIdx, 0, moved);
      return { ...r, photos: newPhotos };
    }));
    setDraggedPhotoIdx(null);
  };

  const analyzeRoom = async (roomIdx: number) => {
    const room = rooms[roomIdx];
    if (!room || room.photos.length === 0) return;

    setRooms((prev) => prev.map((r, i) => i === roomIdx ? { ...r, analyzing: true } : r));

    try {
      const res = await fetch('/api/admin/vistoria/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rooms: [{ name: room.name || `Cômodo ${roomIdx + 1}`, photos: room.photos.map((p) => p.dataUrl) }],
          propertyType: propertyInfo.tipoImovel,
          finality: propertyInfo.finalidade,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const roomName = room.name || `Cômodo ${roomIdx + 1}`;
        setRooms((prev) => prev.map((r, i) => i === roomIdx ? { ...r, items: data.results[roomName] || [], analyzing: false, analyzed: true } : r));
        toast.success('Análise concluída!');
      } else {
        throw new Error(data.error);
      }
    } catch {
      setRooms((prev) => prev.map((r, i) => i === roomIdx ? { ...r, analyzing: false } : r));
      toast.error('Erro ao analisar');
    }
  };

  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const generatePdf = async () => {
    setGenerating(true);
    setGenerationStep('Preparando dados...');
    try {
      await new Promise((r) => setTimeout(r, 300));
      setGenerationStep('Gerando HTML do laudo...');

      const res = await fetch('/api/admin/vistoria/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propertyInfo,
          rooms: rooms.map((r, i) => ({
            name: r.name || `Cômodo ${i + 1}`,
            items: r.items.length > 0 ? r.items : [`✓ Cômodo "${r.name || 'Sem nome'}" - sem análise automática`],
            photos: r.photos.map((p) => ({
              dataUrl: p.dataUrl,
              name: p.name,
              annotations: p.annotations || [],
            })),
          })),
        }),
      });
      const data = await res.json();
      if (data.success && data.html) {
        setPdfHtml(data.html);
        setGenerationStep('Laudo pronto!');
        setShowPdfPreview(true);
        toast.success('Laudo gerado com sucesso!');
      }
    } catch { toast.error('Erro ao gerar laudo'); setGenerationStep(''); }
    finally { setGenerating(false); }
  };

  const totalPhotos = rooms.reduce((s, r) => s + r.photos.length, 0);

  // === HOME VIEW ===
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/10">
                <ClipboardCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Vistoria</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Gestão de laudos de vistoria com IA</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h2 className="text-3xl font-black text-white tracking-tight mb-3">O que deseja fazer?</h2>
              <p className="text-slate-500 text-sm">Selecione uma opção para começar</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: 'Criar',
                  desc: 'Novo laudo de vistoria do zero com assistência da IA',
                  icon: Sparkles,
                  gradient: 'from-indigo-600/20 to-purple-600/20',
                  borderColor: 'border-indigo-500/20 hover:border-indigo-500/40',
                  iconColor: 'text-indigo-400',
                  action: startWizard,
                },
                {
                  title: 'Editar',
                  desc: 'Continuar ou modificar um laudo salvo anteriormente',
                  icon: Edit3,
                  gradient: 'from-amber-600/20 to-orange-600/20',
                  borderColor: 'border-amber-500/20 hover:border-amber-500/40',
                  iconColor: 'text-amber-400',
                  action: () => toast.info('Em breve - listagem de laudos salvos'),
                },
                {
                  title: 'Configurar',
                  desc: 'Ajustar padrões, templates e configurações da vistoria',
                  icon: Settings,
                  gradient: 'from-emerald-600/20 to-teal-600/20',
                  borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
                  iconColor: 'text-emerald-400',
                  action: () => toast.info('Em breve - configurações de vistoria'),
                },
              ].map((card, idx) => (
                <motion.button
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  onClick={card.action}
                  className={`relative p-8 rounded-3xl bg-gradient-to-br ${card.gradient} border ${card.borderColor} text-left transition-all group overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                  <div className={`w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                  <ArrowRight className="w-4 h-4 text-slate-600 mt-4 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === WIZARD VIEW ===
  const currentRoom = rooms[currentRoomIdx];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('home')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Voltar
            </button>
            <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[9px] font-bold">
              Passo {wizardStep + 1} de {WIZARD_STEPS.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto overflow-x-auto scrollbar-hide pb-2">
          {WIZARD_STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => idx <= wizardStep && setWizardStep(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                  idx === wizardStep
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : idx < wizardStep
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer'
                    : 'text-slate-600 border border-white/5'
                }`}
              >
                {idx < wizardStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {idx < WIZARD_STEPS.length - 1 && <div className="w-6 h-[1px] bg-white/5 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={wizardStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              {/* STEP 0: Property Info */}
              {wizardStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Dados do Imóvel</h2>
                    <p className="text-sm text-slate-500">Preencha as informações básicas do imóvel</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Nome do Condomínio', key: 'condominio', placeholder: 'EX: EDIFÍCIO COLUMBUS TOWER', required: true },
                      { label: 'Endereço (Rua/Avenida)', key: 'endereco', placeholder: 'Avenida Guilherme Dumont Villares' },
                      { label: 'Número', key: 'numero', placeholder: '1.410' },
                      { label: 'Conjunto / Apartamento', key: 'conjApto', placeholder: 'EX: conj. 103 / APTO 182' },
                      { label: 'CEP', key: 'cep', placeholder: '05640-003' },
                      { label: 'Bairro', key: 'bairro', placeholder: 'Vila Suzana' },
                      { label: 'Cidade', key: 'cidade', placeholder: 'São Paulo' },
                      { label: 'Estado', key: 'estado', placeholder: 'SP', short: true },
                      { label: 'Metragem', key: 'metragem', placeholder: 'EX: 87m²' },
                    ].map((field) => (
                      <div key={field.key} className={`space-y-1.5 ${field.short ? 'w-24' : ''}`}>
                        <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </Label>
                        <Input
                          placeholder={field.placeholder}
                          className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm"
                          value={(propertyInfo as any)[field.key]}
                          onChange={(e) => setPropertyInfo({ ...propertyInfo, [field.key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tipo do Imóvel</Label>
                      <CreatableSelect
                        options={TIPO_IMOVEL_OPTIONS}
                        value={propertyInfo.tipoImovel}
                        onChange={(v) => setPropertyInfo({ ...propertyInfo, tipoImovel: v })}
                        storageKey="vistoria_tipo_imovel"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Finalidade</Label>
                      <CreatableSelect
                        options={FINALIDADE_OPTIONS}
                        value={propertyInfo.finalidade}
                        onChange={(v) => setPropertyInfo({ ...propertyInfo, finalidade: v })}
                        storageKey="vistoria_finalidade"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mobiliado</Label>
                      <CreatableSelect
                        options={MOBILIADO_OPTIONS}
                        value={propertyInfo.mobiliado}
                        onChange={(v) => setPropertyInfo({ ...propertyInfo, mobiliado: v })}
                        storageKey="vistoria_mobiliado"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Data da Vistoria</Label>
                      <Input className="rounded-xl bg-white/5 border-white/5 text-white text-sm" value={propertyInfo.dataLaudo} onChange={(e) => setPropertyInfo({ ...propertyInfo, dataLaudo: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Parties */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Partes Envolvidas</h2>
                    <p className="text-sm text-slate-500">Dados do locador, locatário e vistoriadora</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Nome da Locadora', key: 'locadora', placeholder: 'Nome completo', required: true },
                      { label: 'CPF da Locadora', key: 'locadoraCpf', placeholder: '000.000.000-00' },
                      { label: 'Nome do(a) Locatário(a)', key: 'locatario', placeholder: 'Nome completo', required: true },
                      { label: 'CPF do(a) Locatário(a)', key: 'locatarioCpf', placeholder: '000.000.000-00' },
                      { label: 'Vistoriadora', key: 'vistoriadora', placeholder: 'Nome da vistoriadora' },
                      { label: 'Solicitante', key: 'solicitante', placeholder: 'EX: ARTIMOB NEGÓCIOS IMOBILIÁRIOS' },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </Label>
                        <Input
                          placeholder={field.placeholder}
                          className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm"
                          value={(propertyInfo as any)[field.key]}
                          onChange={(e) => setPropertyInfo({ ...propertyInfo, [field.key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Rooms */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Cômodos</h2>
                      <p className="text-sm text-slate-500">Adicione os cômodos que serão vistoriados</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={addRoom} className="rounded-xl text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {rooms.map((room, idx) => (
                      <motion.div key={room.id} layout className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          {idx + 1}
                        </div>
                        <Input
                          placeholder={`Cômodo ${idx + 1} (ex: SALA, COZINHA, QUARTO, BANHEIRO)`}
                          className="rounded-xl bg-transparent border-none text-white placeholder:text-slate-600 text-sm font-semibold p-0 h-auto focus-visible:ring-0 flex-1"
                          value={room.name}
                          onChange={(e) => setRooms(rooms.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))}
                        />
                        <button onClick={() => removeRoom(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {rooms.length === 0 && (
                    <div className="text-center py-12">
                      <ClipboardCheck className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm mb-4">Nenhum cômodo adicionado</p>
                      <Button variant="ghost" size="sm" onClick={addRoom} className="rounded-xl text-xs text-indigo-400">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Cômodo
                      </Button>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <p className="text-xs text-indigo-400 font-semibold">
                      Dica: Cômodos comuns incluem: Entrada, Sala, Cozinha, Área de Serviço, Banheiro, Quarto, Suíte, Varanda, Escritório
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Photos */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Fotos e Anotações</h2>
                    <p className="text-sm text-slate-500">Adicione fotos de cada cômodo e marque problemas clicando na foto</p>
                  </div>

                  {/* Room Tabs with Progress */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {rooms.map((room, idx) => {
                      const photoCount = room.photos.length;
                      const annotationCount = room.photos.reduce((s, p) => s + p.annotations.length, 0);
                      const hasPhotos = photoCount > 0;
                      return (
                        <button
                          key={room.id}
                          onClick={() => setCurrentRoomIdx(idx)}
                          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-w-[100px] ${
                            idx === currentRoomIdx
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : hasPhotos
                              ? 'text-slate-300 border border-white/5 hover:bg-white/5'
                              : 'text-slate-500 border border-white/5 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {room.analyzed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            <span>{room.name || `Cômodo ${idx + 1}`}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px]">
                            <span className={photoCount > 0 ? 'text-cyan-400' : 'text-slate-600'}>{photoCount} fotos</span>
                            {annotationCount > 0 && <span className="text-amber-400">{annotationCount} pts</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Current Room */}
                  {currentRoom && (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                      {/* Room Header */}
                      <div className="p-5 border-b border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-white">{currentRoom.name || `Cômodo ${currentRoomIdx + 1}`}</h3>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => analyzeRoom(currentRoomIdx)} disabled={currentRoom.analyzing || currentRoom.photos.length === 0} className="rounded-xl text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
                              {currentRoom.analyzing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                              {currentRoom.analyzing ? 'Analisando...' : 'Analisar com IA'}
                            </Button>
                          </div>
                        </div>

                        {/* Photo Tips - Guided */}
                        <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                          <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold mb-2">Dicas de fotos para este cômodo</p>
                          <div className="flex flex-wrap gap-1.5">
                            {getRoomPhotoTips(currentRoom.name).map((tip, i) => (
                              <span key={i} className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                {tip}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        {/* Photo Grid - Drag and Drop */}
                        {currentRoom.photos.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                            {currentRoom.photos.map((photo, pIdx) => (
                              <div
                                key={pIdx}
                                draggable
                                onDragStart={() => handleDragStart(pIdx)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(pIdx)}
                                className={`relative group aspect-square rounded-xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                                  draggedPhotoIdx === pIdx
                                    ? 'border-indigo-500 scale-95 opacity-50'
                                    : 'border-white/5 hover:border-white/10'
                                }`}
                              >
                                <img src={photo.dataUrl} alt={photo.name} className="w-full h-full object-cover" />

                                {/* Photo number */}
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-black/60 flex items-center justify-center text-[9px] font-bold text-white backdrop-blur-sm">
                                  {pIdx + 1}
                                </div>

                                {/* Annotation indicators */}
                                {photo.annotations.length > 0 && (
                                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-500/90 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-sm">
                                    <MapPin className="w-2.5 h-2.5" /> {photo.annotations.length}
                                  </div>
                                )}

                                {/* Actions overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                  <button onClick={(e) => { e.stopPropagation(); setPreviewPhoto(photo); }} className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm">
                                    <Eye className="w-4 h-4 text-white" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setAnnotatingPhoto({ roomIdx: currentRoomIdx, photoIdx: pIdx }); }} className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm">
                                    <MapPin className="w-4 h-4 text-white" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setRooms((prev) => prev.map((r, i) => i === currentRoomIdx ? { ...r, photos: r.photos.filter((_, pi) => pi !== pIdx) } : r)); }} className="p-2.5 bg-red-500/30 rounded-xl hover:bg-red-500/50 transition-colors backdrop-blur-sm">
                                    <Trash2 className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <Camera className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 mb-1">Nenhuma foto adicionada</p>
                            <p className="text-xs text-slate-600">Clique no botão abaixo para adicionar fotos deste cômodo</p>
                          </div>
                        )}

                        {/* Upload */}
                        <label>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(currentRoomIdx, e.target.files)} />
                          <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors text-slate-400 hover:text-white">
                            <Camera className="w-4 h-4" />
                            <span className="text-xs font-medium">Adicionar Fotos</span>
                            <span className="text-[10px] text-slate-600">· aceita múltiplas</span>
                          </div>
                        </label>

                        {/* Items detected */}
                        {currentRoom.items.length > 0 && (
                          <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mb-2">Itens detectados ({currentRoom.items.length})</p>
                            <div className="text-xs text-slate-400 space-y-1 max-h-24 overflow-y-auto">
                              {currentRoom.items.slice(0, 5).map((item, i) => <p key={i} className="truncate">{item}</p>)}
                              {currentRoom.items.length > 5 && <p className="text-slate-500">+{currentRoom.items.length - 5} mais...</p>}
                            </div>
                          </div>
                        )}

                        {/* Annotations summary */}
                        {currentRoom.photos.some((p) => p.annotations.length > 0) && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold mb-2">Anotações nesta sala</p>
                            <div className="text-xs text-slate-400 space-y-1">
                              {currentRoom.photos.flatMap((p, pi) => p.annotations.map((a, ai) => (
                                <p key={`${pi}-${ai}`}>Foto {pi + 1}: {a.label}</p>
                              )))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Review + Observations */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Revisão e Observações</h2>
                    <p className="text-sm text-slate-500">Revise os dados, adicione observações e gere o laudo</p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Imóvel</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-white font-semibold">{propertyInfo.condominio || 'Sem nome'}</p>
                        <p className="text-slate-400">{propertyInfo.endereco} {propertyInfo.numero} {propertyInfo.conjApto}</p>
                        <p className="text-slate-500 text-xs">{propertyInfo.bairro} – {propertyInfo.cidade}/{propertyInfo.estado}</p>
                        <div className="flex gap-2 pt-2">
                          <Badge className="bg-white/5 text-slate-400 border-0 text-[9px]">{propertyInfo.tipoImovel}</Badge>
                          <Badge className="bg-white/5 text-slate-400 border-0 text-[9px]">{propertyInfo.finalidade}</Badge>
                          <Badge className="bg-white/5 text-slate-400 border-0 text-[9px]">{propertyInfo.metragem}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Partes</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-white"><span className="text-slate-500">Locadora:</span> {propertyInfo.locadora}</p>
                        <p className="text-white"><span className="text-slate-500">Locatário:</span> {propertyInfo.locatario}</p>
                        <p className="text-white"><span className="text-slate-500">Vistoriadora:</span> {propertyInfo.vistoriadora}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rooms Summary */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cômodos ({rooms.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {rooms.map((room, idx) => (
                        <div key={room.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                          <p className="text-sm font-semibold text-white mb-1">{room.name || `Cômodo ${idx + 1}`}</p>
                          <p className="text-[10px] text-slate-500">{room.photos.length} fotos · {room.items.length} itens{room.photos.some((p) => p.annotations.length > 0) ? ` · ${room.photos.reduce((s, p) => s + p.annotations.length, 0)} anotações` : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-generated summary from annotations */}
                  {rooms.some((r) => r.photos.some((p) => p.annotations.length > 0)) && (
                    <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Resumo das Anotações</h3>
                      <div className="space-y-2">
                        {rooms.map((room, idx) => {
                          const roomAnnotations = room.photos.flatMap((p, pi) =>
                            p.annotations.map((a) => ({ room: room.name || `Cômodo ${idx + 1}`, photo: pi + 1, label: a.label }))
                          );
                          if (roomAnnotations.length === 0) return null;
                          return (
                            <div key={room.id}>
                              <p className="text-xs font-semibold text-white mb-1">{room.name || `Cômodo ${idx + 1}`}</p>
                              {roomAnnotations.map((a, i) => (
                                <p key={i} className="text-[11px] text-slate-400 pl-3">· {a.label}</p>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Observations Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white">Observações</h3>

                    {/* Quick Templates */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">Templates rápidos</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Imóvel entregue com pintura nova',
                          'Parte hidráulica em funcionamento',
                          'Parte elétrica em funcionamento',
                          'Ar condicionado testado e funcionando',
                          'Todos os interruptores testados',
                          'Torneiras e registros testados',
                          'Imóvel sem móveis',
                          'Vagas de garagem demarcadas',
                          'Portaria 24h',
                          'Área de lazer disponível',
                        ].map((template) => (
                          <button
                            key={template}
                            onClick={() => {
                              const current = propertyInfo.consideracoes;
                              const separator = current ? '\n' : '';
                              setPropertyInfo({ ...propertyInfo, consideracoes: current + separator + '· ' + template });
                            }}
                            className="text-[10px] px-2.5 py-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all"
                          >
                            + {template}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Main textarea */}
                    <textarea
                      className="w-full h-36 px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Escreva observações adicionais sobre o estado do imóvel...&#10;&#10;Cada linha será um parágrafo no laudo."
                      value={propertyInfo.consideracoes}
                      onChange={(e) => setPropertyInfo({ ...propertyInfo, consideracoes: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-600">
                      {propertyInfo.consideracoes.split('\n').filter(Boolean).length} linha(s) · {propertyInfo.consideracoes.length} caracteres
                    </p>
                  </div>

                  {/* Generate Button */}
                  <Button onClick={generatePdf} disabled={generating} className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 h-12 text-sm font-bold">
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                    {generating ? generationStep || 'Gerando...' : 'Gerar Laudo PDF'}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
              disabled={wizardStep === 0}
              className="rounded-xl text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Anterior
            </Button>
            {wizardStep < WIZARD_STEPS.length - 1 && (
              <Button
                onClick={() => setWizardStep(wizardStep + 1)}
                disabled={!canProceed()}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
              >
                Próximo <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Annotator Modal */}
      <AnimatePresence>
        {annotatingPhoto && currentRoom && (
          <PhotoAnnotator
            photo={currentRoom.photos[annotatingPhoto.photoIdx]}
            onClose={() => setAnnotatingPhoto(null)}
            onSave={(annotations) => {
              setRooms((prev) => prev.map((r, i) =>
                i === annotatingPhoto.roomIdx
                  ? { ...r, photos: r.photos.map((p, pi) => pi === annotatingPhoto.photoIdx ? { ...p, annotations } : p) }
                  : r
              ));
              toast.success(`${annotations.length} anotações salvas`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewPhoto.dataUrl}
                alt={previewPhoto.name}
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
              />
              {/* Annotation markers on preview */}
              {previewPhoto.annotations.length > 0 && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-xl p-3 max-w-xs">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-2">Anotações</p>
                  <div className="space-y-1.5">
                    {previewPhoto.annotations.map((ann, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">{i + 1}</div>
                        <span className="text-xs text-white">{ann.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Close button */}
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 left-4 p-2 bg-black/50 rounded-xl hover:bg-black/70 transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {showPdfPreview && pdfHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex flex-col p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white">Preview do Laudo</span>
                <Badge className="bg-cyan-500/10 text-cyan-400 border-0 text-[9px] font-bold">
                  {rooms.length} cômodos · {rooms.reduce((s, r) => s + r.photos.length, 0)} fotos
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const w = window.open('', '_blank');
                    if (w) { w.document.write(pdfHtml); w.document.close(); toast.success('Ctrl+P → Salvar como PDF'); }
                    else toast.error('Permita popups');
                  }}
                  className="rounded-xl text-xs bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" /> Imprimir / Salvar PDF
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([pdfHtml], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `laudo-vistoria-${propertyInfo.condominio || 'imovel'}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('HTML baixado!');
                  }}
                  variant="ghost"
                  className="rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Baixar HTML
                </Button>
                <button
                  onClick={() => { setShowPdfPreview(false); setPdfHtml(null); }}
                  className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* iframe preview */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-white">
              <iframe
                srcDoc={pdfHtml}
                className="w-full h-full border-0"
                title="Preview do Laudo"
              />
            </div>

            {/* Footer hint */}
            <p className="text-center text-[10px] text-slate-500 mt-2 shrink-0">
              Use "Imprimir / Salvar PDF" para gerar o PDF · ou fecha e gere novamente
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
