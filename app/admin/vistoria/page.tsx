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

// ==================== CONSTANTS ====================
const TIPO_IMOVEL_OPTIONS = ['APARTAMENTO', 'SALA', 'CASA', 'COMERCIAL', 'COBERTURA', 'LOFT', 'COBERTURA'];
const FINALIDADE_OPTIONS = ['RESIDENCIAL', 'COMERCIAL'];
const MOBILIADO_OPTIONS = ['NÃO', 'SIM', 'PARCIALMENTE'];

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

const COMMON_PROBLEMS = [
  'Rachadura na parede', 'Mancha de umidade', 'Desgaste no piso', 'Vazamento',
  'Infiltração', 'Pintura descascando', 'Furo na parede', 'Serragem/trincas',
  'Metais oxidados', 'Louça quebrada', 'Tomada com defeito', 'Interruptor com defeito',
  'Porta com desajuste', 'Janela emperrando', 'Mofo', 'Barulho',
];

const LAUDO_TEMPLATES = [
  {
    id: 'apartamento-residencial',
    name: 'Apartamento',
    icon: '🏢',
    tipoImovel: 'APARTAMENTO',
    finalidade: 'RESIDENCIAL',
    rooms: ['ENTRADA', 'SALA', 'COZINHA', 'ÁREA DE SERVIÇO', 'BANHEIRO SOCIAL', 'QUARTO 1', 'QUARTO 2', 'SUÍTE', 'BANHEIRO SUÍTE', 'VARANDA'],
    description: '10 cômodos · Padrão apartamento 2 quartos',
  },
  {
    id: 'casa-residencial',
    name: 'Casa',
    icon: '🏠',
    tipoImovel: 'CASA',
    finalidade: 'RESIDENCIAL',
    rooms: ['ENTRADA', 'SALA DE ESTAR', 'SALA DE JANTAR', 'COZINHA', 'ÁREA DE SERVIÇO', 'BANHEIRO SOCIAL', 'QUARTO 1', 'QUARTO 2', 'QUARTO 3', 'SUÍTE', 'BANHEIRO SUÍTE', 'GARAGEM', 'QUINTAL'],
    description: '13 cômodos · Padrão casa 3 quartos',
  },
  {
    id: 'sala-comercial',
    name: 'Sala Comercial',
    icon: '🏬',
    tipoImovel: 'SALA',
    finalidade: 'COMERCIAL',
    rooms: ['ENTRADA', 'SALA PRINCIPAL', 'SALA DE REUNIÃO', 'BANHEIRO', 'COZINHETE', 'DEPÓSITO'],
    description: '6 cômodos · Padrão sala empresarial',
  },
  {
    id: 'cobertura',
    name: 'Cobertura',
    icon: '🏙️',
    tipoImovel: 'COBERTURA',
    finalidade: 'RESIDENCIAL',
    rooms: ['ENTRADA', 'SALA DE ESTAR', 'SALA DE JANTAR', 'COZINHA', 'ÁREA DE SERVIÇO', 'BANHEIRO SOCIAL', 'QUARTO 1', 'QUARTO 2', 'QUARTO 3', 'SUÍTE', 'BANHEIRO SUÍTE', 'SUÍTE MASTER', 'BANHEIRO MASTER', 'VARANDA GOURMET', 'TERRAÇO', 'CHURRASQUEIRA'],
    description: '16 cômodos · Padrão cobertura alto padrão',
  },
  {
    id: 'studio',
    name: 'Studio / Flat',
    icon: '🛏️',
    tipoImovel: 'APARTAMENTO',
    finalidade: 'RESIDENCIAL',
    rooms: ['SALA/QUARTO', 'COZINHA AMERICANA', 'BANHEIRO'],
    description: '3 cômodos · Padrão compacto',
  },
  {
    id: 'personalizado',
    name: 'Personalizado',
    icon: '✏️',
    tipoImovel: '',
    finalidade: '',
    rooms: [],
    description: 'Defina seus próprios cômodos',
  },
];

// ==================== HELPER FUNCTIONS ====================
function getRoomPhotoTips(roomName: string): string[] {
  const upper = roomName.toUpperCase().trim();
  if (ROOM_PHOTO_TIPS[upper]) return ROOM_PHOTO_TIPS[upper];
  for (const [key, tips] of Object.entries(ROOM_PHOTO_TIPS)) {
    if (upper.includes(key) || key.includes(upper)) return tips;
  }
  return DEFAULT_PHOTO_TIPS;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// CEP lookup via ViaCEP
async function lookupCep(cep: string): Promise<{ endereco: string; bairro: string; cidade: string; estado: string } | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return { endereco: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' };
  } catch { return null; }
}

// CPF/CNPJ validation
function validateCpfCnpj(value: string): { valid: boolean; type: 'CPF' | 'CNPJ' | 'invalid' } {
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) {
    // CPF validation
    if (/^(\d)\1{10}$/.test(clean)) return { valid: false, type: 'invalid' };
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean[9])) return { valid: false, type: 'invalid' };
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean[10])) return { valid: false, type: 'invalid' };
    return { valid: true, type: 'CPF' };
  }
  if (clean.length === 14) {
    // CNPJ validation
    if (/^(\d)\1{13}$/.test(clean)) return { valid: false, type: 'invalid' };
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(clean[i]) * weights1[i];
    let rev = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (rev !== parseInt(clean[12])) return { valid: false, type: 'invalid' };
    sum = 0;
    for (let i = 0; i < 13; i++) sum += parseInt(clean[i]) * weights2[i];
    rev = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (rev !== parseInt(clean[13])) return { valid: false, type: 'invalid' };
    return { valid: true, type: 'CNPJ' };
  }
  return { valid: false, type: 'invalid' };
}

// Format CPF/CNPJ
function formatCpfCnpj(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 11) {
    return clean.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return clean.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// Format phone
function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 10) {
    return clean.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return clean.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

// Property types that have condominiums
const CONDOMINIO_TYPES = ['APARTAMENTO', 'COBERTURA', 'LOFT'];

// ==================== AUTOCOMPLETE INPUT ====================
function AutocompleteInput({ label, value, onChange, suggestions, placeholder, required, storageKey }: {
  label: string; value: string; onChange: (v: string) => void; suggestions: string[];
  placeholder?: string; required?: boolean; storageKey?: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storageKey) {
      try { const s = localStorage.getItem(storageKey); if (s) setSaved(JSON.parse(s)); } catch {}
    }
  }, [storageKey]);

  const allSuggestions = [...new Set([...saved, ...suggestions])].filter(s =>
    s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()
  ).slice(0, 8);

  const handleSelect = (v: string) => {
    onChange(v);
    setShowSuggestions(false);
    if (storageKey && !saved.includes(v)) {
      const updated = [...saved, v];
      setSaved(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-1.5 relative">
      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label} {required && <span className="text-red-400">*</span>}</Label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setShowSuggestions(true); }}
        onFocus={() => value.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
      {showSuggestions && allSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden max-h-48 overflow-y-auto">
          {allSuggestions.map((s, i) => (
            <button key={i} onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-colors flex items-center gap-2">
              <span className="text-slate-600">📝</span> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== CPF/CNPJ INPUT ====================
function CpfCnpjInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const validation = value ? validateCpfCnpj(value) : null;

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</Label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(formatCpfCnpj(e.target.value))}
          placeholder={placeholder || '000.000.000-00 ou 00.000.000/0000-00'}
          maxLength={18}
          className={cn(
            "w-full h-10 px-3 rounded-xl border bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all",
            validation?.valid ? 'border-emerald-500/30 focus:ring-emerald-500/30' :
            validation && !validation.valid ? 'border-red-500/30 focus:ring-red-500/30' :
            'border-white/5 focus:ring-indigo-500/30'
          )}
        />
        {validation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validation.valid ? (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{validation.type}</span>
            ) : (
              <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Inválido</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PHONE INPUT ====================
function PhoneInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</Label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(formatPhone(e.target.value))}
        placeholder="(11) 99999-9999"
        maxLength={15}
        className="w-full h-10 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
    </div>
  );
}

// ==================== PROPERTY STEP ====================
function PropertyStep({ propertyInfo, setPropertyInfo }: { propertyInfo: PropertyInfo; setPropertyInfo: (v: PropertyInfo) => void }) {
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepChange = async (cep: string) => {
    setPropertyInfo({ ...propertyInfo, cep });
    const clean = cep.replace(/\D/g, '');
    if (clean.length === 8) {
      setCepLoading(true);
      const result = await lookupCep(clean);
      if (result) {
        setPropertyInfo({
          ...propertyInfo,
          cep,
          endereco: result.endereco,
          bairro: result.bairro,
          cidade: result.cidade,
          estado: result.estado,
        });
        toast.success('Endereço preenchido automaticamente!');
      }
      setCepLoading(false);
    }
  };

  const showCondominio = CONDOMINIO_TYPES.includes(propertyInfo.tipoImovel);
  const showConjApto = CONDOMINIO_TYPES.includes(propertyInfo.tipoImovel);

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-white mb-1">Dados do Imóvel</h2><p className="text-sm text-slate-500">Informações básicas do imóvel</p></div>

      {/* Property Type - First Question */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3 block">O que é o imóvel? *</Label>
        <CreatableSelect options={TIPO_IMOVEL_OPTIONS} value={propertyInfo.tipoImovel} onChange={v => setPropertyInfo({ ...propertyInfo, tipoImovel: v })} storageKey="vistoria_tipo_imovel" />
      </div>

      {/* CEP with Auto-fill */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3 block">CEP do Imóvel</Label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="00000-000"
              value={propertyInfo.cep}
              onChange={e => handleCepChange(e.target.value)}
              maxLength={9}
              className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm"
            />
            {cepLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 text-indigo-400 animate-spin" /></div>}
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5">Digite o CEP para preencher endereço, bairro, cidade e estado automaticamente</p>
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AutocompleteInput label="Endereço" value={propertyInfo.endereco} onChange={v => setPropertyInfo({ ...propertyInfo, endereco: v })}
          suggestions={['Avenida', 'Rua', 'Alameda', 'Travessa', 'Praça']} placeholder="Rua/Avenida..." />
        <div className="space-y-1.5">
          <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Número</Label>
          <Input placeholder="1410" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm" value={propertyInfo.numero} onChange={e => setPropertyInfo({ ...propertyInfo, numero: e.target.value })} />
        </div>
        {showConjApto && (
          <div className="space-y-1.5">
            <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Conjunto / Apto</Label>
            <Input placeholder="conj. 103 / APTO 182" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm" value={propertyInfo.conjApto} onChange={e => setPropertyInfo({ ...propertyInfo, conjApto: e.target.value })} />
          </div>
        )}
        <AutocompleteInput label="Bairro" value={propertyInfo.bairro} onChange={v => setPropertyInfo({ ...propertyInfo, bairro: v })}
          suggestions={['Vila Suzana', 'Vila Mariana', 'Moema', 'Pinheiros', 'Itaim Bibi', 'Jardins', 'Brooklin', 'Morumbi', 'Vila Olímpia', 'Campo Belo']} placeholder="Bairro" />
        <AutocompleteInput label="Cidade" value={propertyInfo.cidade} onChange={v => setPropertyInfo({ ...propertyInfo, cidade: v })}
          suggestions={['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Florianópolis', 'Brasília', 'Goiânia', 'Campinas', 'Guarulhos']} placeholder="Cidade" />
        <div className="space-y-1.5">
          <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Estado</Label>
          <Input placeholder="SP" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm w-20" value={propertyInfo.estado} onChange={e => setPropertyInfo({ ...propertyInfo, estado: e.target.value.toUpperCase().slice(0, 2) })} />
        </div>
      </div>

      {/* Condominio - Only for apt/cobertura */}
      {showCondominio && (
        <div className="space-y-1.5">
          <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nome do Condomínio *</Label>
          <AutocompleteInput label="" value={propertyInfo.condominio} onChange={v => setPropertyInfo({ ...propertyInfo, condominio: v })}
            suggestions={['EDIFÍCIO', 'CONDOMÍNIO', 'TORRE', 'BLOCO']} placeholder="EDIFÍCIO COLUMBUS TOWER" storageKey="vistoria_condominios" />
        </div>
      )}

      {/* Other Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5"><Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Finalidade</Label><CreatableSelect options={FINALIDADE_OPTIONS} value={propertyInfo.finalidade} onChange={v => setPropertyInfo({ ...propertyInfo, finalidade: v })} storageKey="vistoria_finalidade" /></div>
        <div className="space-y-1.5"><Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mobiliado</Label><CreatableSelect options={MOBILIADO_OPTIONS} value={propertyInfo.mobiliado} onChange={v => setPropertyInfo({ ...propertyInfo, mobiliado: v })} storageKey="vistoria_mobiliado" /></div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Metragem</Label>
          <Input placeholder="87m²" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm" value={propertyInfo.metragem} onChange={e => setPropertyInfo({ ...propertyInfo, metragem: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Data da Vistoria</Label>
          <Input className="rounded-xl bg-white/5 border-white/5 text-white text-sm" value={propertyInfo.dataLaudo} onChange={e => setPropertyInfo({ ...propertyInfo, dataLaudo: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// ==================== TYPES ====================
interface PhotoAnnotation { x: number; y: number; label: string; }
interface PhotoData { dataUrl: string; name: string; annotations: PhotoAnnotation[]; }
interface RoomData { id: string; name: string; photos: PhotoData[]; items: string[]; analyzing: boolean; analyzed: boolean; }
interface PropertyInfo {
  condominio: string; endereco: string; numero: string; conjApto: string; cep: string;
  bairro: string; cidade: string; estado: string; tipoImovel: string; finalidade: string;
  metragem: string; mobiliado: string; locadora: string; locadoraCpf: string;
  locadoraTelefone: string;
  locatario: string; locatarioCpf: string; locatarioTelefone: string;
  vistoriadora: string; dataFotografia: string;
  dataLaudo: string; solicitante: string; consideracoes: string; totalComodos: number;
}
interface SavedLaudo {
  id: string; name: string; condominio: string; savedAt: string;
  propertyInfo: PropertyInfo; rooms: RoomData[];
}
interface VistoriaSettings {
  defaultVistoriadora: string; defaultSolicitante: string; defaultCidade: string;
  defaultEstado: string; defaultTipoImovel: string; defaultFinalidade: string;
  autoAnalyze: boolean; customProblems: string[];
  watermarkImage: string; watermarkText: string; watermarkEnabled: boolean;
}

const defaultPropertyInfo: PropertyInfo = {
  condominio: '', endereco: '', numero: '', conjApto: '', cep: '', bairro: '',
  cidade: '', estado: '', tipoImovel: '', finalidade: 'RESIDENCIAL',
  metragem: '', mobiliado: 'NÃO', locadora: '', locadoraCpf: '', locadoraTelefone: '',
  locatario: '', locatarioCpf: '', locatarioTelefone: '',
  vistoriadora: '', dataFotografia: new Date().toLocaleDateString('pt-BR'),
  dataLaudo: new Date().toLocaleDateString('pt-BR'), solicitante: '', consideracoes: '', totalComodos: 0,
};

const defaultSettings: VistoriaSettings = {
  defaultVistoriadora: '', defaultSolicitante: '', defaultCidade: 'São Paulo',
  defaultEstado: 'SP', defaultTipoImovel: 'APARTAMENTO', defaultFinalidade: 'RESIDENCIAL',
  autoAnalyze: true, customProblems: [],
  watermarkImage: '', watermarkText: 'imobWeb Vistoria', watermarkEnabled: false,
};

const WIZARD_STEPS = [
  { id: 'property', title: 'Dados do Imóvel', icon: Building2 },
  { id: 'parties', title: 'Partes', icon: Edit3 },
  { id: 'rooms', title: 'Cômodos', icon: ClipboardCheck },
  { id: 'photos', title: 'Fotos', icon: Camera },
  { id: 'review', title: 'Finalizar', icon: FileText },
];

const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

// ==================== ROOM QUESTIONNAIRE ====================
interface RoomQuestionnaireProps {
  rooms: RoomData[];
  setRooms: React.Dispatch<React.SetStateAction<RoomData[]>>;
  propertyInfo: PropertyInfo;
  addRoom: () => void;
  removeRoom: (idx: number) => void;
}

// Questions per property type
function getQuestionsForType(tipo: string) {
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
        { key: 'garagem', label: 'Tem garagem?', type: 'boolean' as const, icon: '🚗', group: 'Externo' },
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

function RoomQuestionnaire({ rooms, setRooms, propertyInfo, addRoom, removeRoom }: RoomQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [generated, setGenerated] = useState(false);

  const questions = getQuestionsForType(propertyInfo.tipoImovel || 'APARTAMENTO');
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
  }, [propertyInfo.tipoImovel]);

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
    const mk = (name: string): RoomData => ({ id: (id++).toString(), name, photos: [], items: [], analyzing: false, analyzed: false });

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
      if (answers.garagem) r.push(mk('GARAGEM'));
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
          {rooms.length > 0 && <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center"><p className="text-lg font-bold text-indigo-400">{rooms.length}</p><p className="text-[9px] text-indigo-400 uppercase">Total</p></div>}
          {answers.quartos > 0 && <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center"><p className="text-lg font-bold text-white">{answers.quartos}</p><p className="text-[9px] text-slate-500 uppercase">Quartos</p></div>}
          {answers.suites > 0 && <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center"><p className="text-lg font-bold text-amber-400">{answers.suites}</p><p className="text-[9px] text-slate-500 uppercase">Suítes</p></div>}
          {answers.andares > 1 && <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center"><p className="text-lg font-bold text-white">{answers.andares}</p><p className="text-[9px] text-slate-500 uppercase">Andares</p></div>}
        </div>

        <div className="space-y-1.5">{rooms.map((room, idx) => (
          <div key={room.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-colors">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">{idx + 1}</div>
            <Input placeholder={`Cômodo ${idx + 1}`} className="rounded-xl bg-transparent border-none text-white placeholder:text-slate-600 text-sm font-semibold p-0 h-auto focus-visible:ring-0 flex-1" value={room.name} onChange={e => setRooms(rooms.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))} />
            <span className="text-[10px] text-slate-600 shrink-0">{room.photos.length}f</span>
            <button onClick={() => removeRoom(idx)} className="p-1 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}</div>

        <div className="flex gap-2">
          <Input placeholder="Adicionar cômodo extra..." className="rounded-xl bg-white/5 border-white/5 text-white text-sm placeholder:text-slate-600" onKeyDown={e => {
            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
              setRooms([...rooms, { id: Date.now().toString(), name: (e.target as HTMLInputElement).value.trim().toUpperCase(), photos: [], items: [], analyzing: false, analyzed: false }]);
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
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{currentQ.group} · {step + 1}/{questions.length}</p>
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

// ==================== PHOTO ANNOTATOR ====================
function PhotoAnnotator({ photo, onClose, onSave }: { photo: PhotoData; onClose: () => void; onSave: (a: PhotoAnnotation[]) => void }) {
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#12121a] rounded-2xl border border-white/10 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">Anotações na Foto</span>
            <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[9px] font-bold">{annotations.length} pontos</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl text-xs text-slate-400">Cancelar</Button>
            <Button size="sm" onClick={() => { onSave(annotations); onClose(); }} className="rounded-xl text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              Salvar {annotations.length > 0 && `(${annotations.length})`}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/5">
                <img ref={imgRef} src={photo.dataUrl} alt="Foto" className="w-full h-auto cursor-crosshair" onClick={handleImageClick} />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {annotations.map((ann, idx) => {
                    const goRight = ann.x < 60; const endX = goRight ? Math.min(ann.x + 20, 95) : Math.max(ann.x - 20, 5);
                    return <g key={idx}><line x1={ann.x} y1={ann.y} x2={endX} y2={ann.y} stroke="#ef4444" strokeWidth="0.3" strokeDasharray="1,0.5" opacity="0.7" /><circle cx={endX} cy={ann.y} r="0.5" fill="#ef4444" /></g>;
                  })}
                </svg>
                {annotations.map((ann, idx) => (
                  <div key={idx} className="absolute -ml-3 -mt-3" style={{ left: `${ann.x}%`, top: `${ann.y}%` }}>
                    <div className={cn("w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white cursor-pointer transition-all", editingIdx === idx ? 'bg-amber-500 scale-125' : 'bg-red-500 hover:scale-110')}
                      onClick={e => { e.stopPropagation(); setEditingIdx(editingIdx === idx ? null : idx); setPendingPos(null); setNewAnnotation(ann.label); }}>{idx + 1}</div>
                    <div className={cn("absolute top-7 whitespace-nowrap text-[9px] font-semibold px-2 py-1 rounded-md shadow-lg", editingIdx === idx ? 'bg-amber-500 text-black left-0' : 'bg-black/80 text-white left-1/2 -translate-x-1/2')}>{ann.label}</div>
                  </div>
                ))}
                {pendingPos && <div className="absolute w-6 h-6 -ml-3 -mt-3 animate-pulse" style={{ left: `${pendingPos.x}%`, top: `${pendingPos.y}%` }}><div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg" /></div>}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">Clique na foto para marcar · Clique num marcador para editar</p>
            </div>
            <div className="space-y-4">
              {!pendingPos && !editingIdx && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Problemas comuns</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {COMMON_PROBLEMS.map(p => (
                      <button key={p} onClick={() => editingIdx !== null && updateAnnotation(editingIdx, p)}
                        className={cn("text-[10px] px-2 py-1 rounded-md border transition-colors", editingIdx !== null ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer' : 'border-white/5 bg-white/5 text-slate-500 cursor-default opacity-50')}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {(pendingPos || editingIdx !== null) && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2">{editingIdx !== null ? `Editando ponto ${editingIdx + 1}` : 'Novo ponto'}</p>
                  <Input placeholder="Ex: Rachadura na parede" className="rounded-xl bg-white/5 border-white/5 text-white text-sm mb-2" value={newAnnotation}
                    onChange={e => { setNewAnnotation(e.target.value); if (editingIdx !== null) updateAnnotation(editingIdx, e.target.value); }}
                    onKeyDown={e => { if (e.key === 'Enter') { editingIdx !== null ? (setEditingIdx(null), setNewAnnotation('')) : addAnnotation(); } if (e.key === 'Escape') { setPendingPos(null); setEditingIdx(null); setNewAnnotation(''); } }} autoFocus />
                  {editingIdx === null ? <Button size="sm" onClick={() => addAnnotation()} disabled={!newAnnotation.trim()} className="w-full rounded-xl text-xs bg-amber-500 text-black font-bold">Adicionar</Button>
                    : <Button size="sm" onClick={() => { setEditingIdx(null); setNewAnnotation(''); }} className="w-full rounded-xl text-xs bg-amber-500/20 text-amber-400 font-bold">Concluído</Button>}
                </div>
              )}
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Pontos marcados</p>
                {annotations.length === 0 ? <p className="text-xs text-slate-600">Nenhuma anotação ainda</p> : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {annotations.map((ann, idx) => (
                      <div key={idx} onClick={() => { setEditingIdx(editingIdx === idx ? null : idx); setNewAnnotation(ann.label); setPendingPos(null); }}
                        className={cn("flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all", editingIdx === idx ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]')}>
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0", editingIdx === idx ? 'bg-amber-500' : 'bg-red-500')}>{idx + 1}</div>
                        <span className="text-xs text-slate-300 flex-1 truncate">{ann.label}</span>
                        <button onClick={e => { e.stopPropagation(); removeAnnotation(idx); }} className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
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

// ==================== MAIN PAGE ====================
export default function AdminVistoriaPage() {
  const [view, setView] = useState<'home' | 'wizard' | 'edit' | 'config' | 'stats'>('home');
  const [wizardStep, setWizardStep] = useState(0);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo>(defaultPropertyInfo);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
  const [annotatingPhoto, setAnnotatingPhoto] = useState<{ roomIdx: number; photoIdx: number } | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ dataUrl: string; name: string; annotations: PhotoAnnotation[] } | null>(null);
  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [savedLaudos, setSavedLaudos] = useState<SavedLaudo[]>([]);
  const [editingLaudoId, setEditingLaudoId] = useState<string | null>(null);
  const [settings, setSettings] = useState<VistoriaSettings>(defaultSettings);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<Record<string, string[]>>({});

  // Load from localStorage
  useEffect(() => {
    try { const s = localStorage.getItem('vistoria_saved'); if (s) setSavedLaudos(JSON.parse(s)); } catch {}
    try { const s = localStorage.getItem('vistoria_settings'); if (s) setSettings({ ...defaultSettings, ...JSON.parse(s) }); } catch {}
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (view !== 'wizard' || !propertyInfo.condominio) return;
    const interval = setInterval(() => { saveLaudo(true); }, 30000);
    return () => clearInterval(interval);
  }, [view, propertyInfo, rooms]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveLaudo(); }
      if (e.ctrlKey && e.key === 'g') { e.preventDefault(); generatePdf(); }
      if (e.key === 'Escape' && view === 'wizard') { setView('home'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, propertyInfo, rooms]);

  const saveLaudo = (silent: boolean = false) => {
    const id = editingLaudoId || Date.now().toString();
    const laudo: SavedLaudo = { id, name: propertyInfo.condominio || `Laudo ${new Date().toLocaleDateString('pt-BR')}`, condominio: propertyInfo.condominio, savedAt: new Date().toISOString(), propertyInfo: { ...propertyInfo }, rooms: rooms.map(r => ({ ...r, photos: r.photos.map(p => ({ ...p, dataUrl: '' })) })) };
    const updated = editingLaudoId ? savedLaudos.map(l => l.id === id ? laudo : l) : [...savedLaudos, laudo];
    setSavedLaudos(updated); localStorage.setItem('vistoria_saved', JSON.stringify(updated)); setEditingLaudoId(id);
    if (!silent) toast.success('Laudo salvo!');
  };

  const loadLaudo = (laudo: SavedLaudo) => { setPropertyInfo(laudo.propertyInfo); setRooms(laudo.rooms); setEditingLaudoId(laudo.id); setCurrentRoomIdx(0); setWizardStep(0); setView('wizard'); };
  const deleteLaudo = (id: string) => { const u = savedLaudos.filter(l => l.id !== id); setSavedLaudos(u); localStorage.setItem('vistoria_saved', JSON.stringify(u)); toast.success('Laudo removido'); };
  const saveSettings = () => { localStorage.setItem('vistoria_settings', JSON.stringify(settings)); toast.success('Configurações salvas!'); };

  const startWizard = (template?: typeof LAUDO_TEMPLATES[0]) => {
    const t = template || LAUDO_TEMPLATES.find(t => t.id === selectedTemplate) || LAUDO_TEMPLATES[0];
    setPropertyInfo({ ...defaultPropertyInfo, vistoriadora: settings.defaultVistoriadora, solicitante: settings.defaultSolicitante, cidade: settings.defaultCidade, estado: settings.defaultEstado, tipoImovel: t.tipoImovel || settings.defaultTipoImovel, finalidade: t.finalidade || settings.defaultFinalidade });
    setRooms(t.rooms.filter(Boolean).map((name, i) => ({ id: Date.now().toString() + i, name, photos: [], items: [], analyzing: false, analyzed: false })));
    setCurrentRoomIdx(0); setWizardStep(0); setEditingLaudoId(null); setView('wizard');
  };

  const addRoom = () => setRooms([...rooms, { id: Date.now().toString(), name: '', photos: [], items: [], analyzing: false, analyzed: false }]);
  const removeRoom = (idx: number) => { setRooms(rooms.filter((_, i) => i !== idx)); if (currentRoomIdx >= rooms.length - 1) setCurrentRoomIdx(Math.max(0, rooms.length - 2)); };

  const handlePhotoUpload = (roomIdx: number, files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setRooms(prev => prev.map((r, i) => i === roomIdx ? { ...r, photos: [...r.photos, { dataUrl: e.target?.result as string, name: file.name, annotations: [] }] } : r));
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (idx: number) => setDraggedPhotoIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIdx: number) => {
    if (draggedPhotoIdx === null || draggedPhotoIdx === targetIdx) return;
    setRooms(prev => prev.map((r, i) => { if (i !== currentRoomIdx) return r; const p = [...r.photos]; const [m] = p.splice(draggedPhotoIdx, 1); p.splice(targetIdx, 0, m); return { ...r, photos: p }; }));
    setDraggedPhotoIdx(null);
  };

  const analyzeRoom = async (roomIdx: number) => {
    const room = rooms[roomIdx]; if (!room || room.photos.length === 0) return;
    setRooms(prev => prev.map((r, i) => i === roomIdx ? { ...r, analyzing: true } : r));
    try {
      const res = await fetch('/api/admin/vistoria/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rooms: [{ name: room.name || `Cômodo ${roomIdx + 1}`, photos: room.photos.map(p => p.dataUrl) }], propertyType: propertyInfo.tipoImovel, finality: propertyInfo.finalidade }) });
      const data = await res.json();
      if (data.success) { const rn = room.name || `Cômodo ${roomIdx + 1}`; setRooms(prev => prev.map((r, i) => i === roomIdx ? { ...r, items: data.results[rn] || [], analyzing: false, analyzed: true } : r)); toast.success(`${room.name || 'Cômodo'} analisado!`); }
      else throw new Error(data.error);
    } catch { setRooms(prev => prev.map((r, i) => i === roomIdx ? { ...r, analyzing: false } : r)); toast.error('Erro ao analisar'); }
  };

  const analyzeAllRooms = async () => { setBatchAnalyzing(true); for (const room of rooms) { if (room.photos.length > 0 && !room.analyzed) { const idx = rooms.indexOf(room); await analyzeRoom(idx); } } setBatchAnalyzing(false); toast.success('Todas as análises concluídas!'); };

  const generatePdf = async () => {
    setGenerating(true); setGenerationStep('Preparando dados...');
    try {
      await new Promise(r => setTimeout(r, 300)); setGenerationStep('Gerando HTML do laudo...');
      const res = await fetch('/api/admin/vistoria/generate-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...propertyInfo, rooms: rooms.map((r, i) => ({ name: r.name || `Cômodo ${i + 1}`, items: r.items.length > 0 ? r.items : [`✓ Cômodo "${r.name || 'Sem nome'}" - sem análise automática`], photos: r.photos.map(p => ({ dataUrl: p.dataUrl, name: p.name, annotations: p.annotations || [] })) })) }) });
      const data = await res.json();
      if (data.success && data.html) { setPdfHtml(data.html); setGenerationStep('Laudo pronto!'); setShowPdfPreview(true); toast.success('Laudo gerado!'); }
    } catch { toast.error('Erro ao gerar laudo'); setGenerationStep(''); }
    finally { setGenerating(false); }
  };

  const exportHtml = () => { if (!pdfHtml) return; const blob = new Blob([pdfHtml], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `laudo-${propertyInfo.condominio || 'imovel'}.html`; a.click(); URL.revokeObjectURL(url); toast.success('HTML baixado!'); };

  const shareWhatsApp = () => { const text = encodeURIComponent(`📋 Laudo de Vistoria\n\n🏢 ${propertyInfo.condominio}\n📍 ${propertyInfo.endereco} ${propertyInfo.numero}\n📅 ${propertyInfo.dataLaudo}\n\nVistoriadora: ${propertyInfo.vistoriadora}\nImóvel: ${propertyInfo.tipoImovel} - ${propertyInfo.finalidade}\n\nCômodos: ${rooms.length}\nFotos: ${rooms.reduce((s, r) => s + r.photos.length, 0)}\nAnotações: ${rooms.reduce((s, r) => s + r.photos.reduce((s2, p) => s2 + p.annotations.length, 0), 0)}\n\nGerado por imobWeb Vistoria`); window.open(`https://wa.me/?text=${text}`, '_blank'); };

  const totalPhotos = rooms.reduce((s, r) => s + r.photos.length, 0);
  const totalAnnotations = rooms.reduce((s, r) => s + r.photos.reduce((s2, p) => s2 + p.annotations.length, 0), 0);
  const analyzedRooms = rooms.filter(r => r.analyzed).length;
  const currentRoom = rooms[currentRoomIdx];

  const canProceed = () => { switch (wizardStep) { case 0: return propertyInfo.condominio.trim() !== ''; case 1: return propertyInfo.locadora.trim() !== '' && propertyInfo.locatario.trim() !== ''; case 2: return rooms.length > 0; default: return true; } };

  // ==================== HOME VIEW ====================
  if (view === 'home') {
    const totalLaudos = savedLaudos.length;
    const totalRoomsAll = savedLaudos.reduce((s, l) => s + (l.rooms?.length || 0), 0);
    const recentLaudos = [...savedLaudos].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).slice(0, 5);

    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/10"><ClipboardCheck className="w-5 h-5 text-cyan-400" /></div>
                <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Vistoria</h1><p className="text-xs text-slate-500 hidden sm:block">Gestão completa de laudos com IA</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setView('stats')} className="rounded-xl text-xs text-slate-400 hover:text-white"><BarChart3 className="w-3.5 h-3.5 mr-1" /> Estatísticas</Button>
                <Button variant="ghost" size="sm" onClick={() => setView('config')} className="rounded-xl text-xs text-slate-400 hover:text-white"><Settings className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Laudos Criados', value: totalLaudos, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { label: 'Último Laudo', value: savedLaudos.length > 0 ? new Date(savedLaudos[savedLaudos.length - 1].savedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Templates', value: LAUDO_TEMPLATES.length, icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Problemas Cadastrados', value: COMMON_PROBLEMS.length + (settings.customProblems?.length || 0), icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              ].map((stat, idx) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", stat.bg)}><stat.icon className={cn("w-4 h-4", stat.color)} /></div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Main Actions */}
            <div>
              <h2 className="text-sm font-bold text-white mb-4">Ações Principais</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { title: 'Criar', desc: 'Novo laudo com templates e IA', icon: Sparkles, gradient: 'from-indigo-600/20 to-purple-600/20', border: 'border-indigo-500/20 hover:border-indigo-500/40', iconColor: 'text-indigo-400', action: () => setView('wizard') },
                  { title: 'Visualizar', desc: `${totalLaudos} laudo(s) salvos`, icon: Eye, gradient: 'from-cyan-600/20 to-blue-600/20', border: 'border-cyan-500/20 hover:border-cyan-500/40', iconColor: 'text-cyan-400', action: () => setView('edit') },
                  { title: 'Editar', desc: 'Modificar um laudo existente', icon: Edit3, gradient: 'from-amber-600/20 to-orange-600/20', border: 'border-amber-500/20 hover:border-amber-500/40', iconColor: 'text-amber-400', action: () => setView('edit') },
                  { title: 'Configurar', desc: 'Padrões e preferências', icon: Settings, gradient: 'from-emerald-600/20 to-teal-600/20', border: 'border-emerald-500/20 hover:border-emerald-500/40', iconColor: 'text-emerald-400', action: () => setView('config') },
                ].map((card, idx) => (
                  <motion.button key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} whileHover={{ scale: 1.02, y: -4 }} onClick={card.action}
                    className={cn("relative p-5 rounded-2xl bg-gradient-to-br border text-left transition-all group overflow-hidden", card.gradient, card.border)}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><card.icon className={cn("w-5 h-5", card.iconColor)} /></div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{card.title}</h3>
                    <p className="text-[11px] text-slate-400">{card.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Templates Quick Start */}
            <div>
              <h2 className="text-sm font-bold text-white mb-4">Templates Rápidos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {LAUDO_TEMPLATES.filter(t => t.id !== 'personalizado').map((template, idx) => (
                  <motion.button key={template.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.03, y: -2 }}
                    onClick={() => { setSelectedTemplate(template.id); startWizard(template); }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 text-left transition-all group">
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <p className="text-xs font-bold text-white mb-0.5">{template.name}</p>
                    <p className="text-[10px] text-slate-500">{template.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Laudos */}
            {recentLaudos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-white">Laudos Recentes</h2>
                  <Button variant="ghost" size="sm" onClick={() => setView('edit')} className="text-xs text-slate-400 hover:text-white">Ver todos <ArrowRight className="w-3 h-3 ml-1" /></Button>
                </div>
                <div className="space-y-2">
                  {recentLaudos.map((laudo, idx) => (
                    <motion.div key={laudo.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-pointer group" onClick={() => loadLaudo(laudo)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10"><FileText className="w-4 h-4 text-indigo-400" /></div>
                        <div>
                          <p className="text-sm font-semibold text-white">{laudo.name}</p>
                          <p className="text-[10px] text-slate-500">{laudo.propertyInfo?.tipoImovel} · {laudo.rooms?.length || 0} cômodos · {new Date(laudo.savedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Atalhos de Teclado</p>
              <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">Ctrl+S</kbd> Salvar</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">Ctrl+G</kbd> Gerar PDF</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">Esc</kbd> Voltar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== STATS VIEW ====================
  if (view === 'stats') {
    const laudosByMonth = savedLaudos.reduce((acc, l) => { const m = new Date(l.savedAt).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }); acc[m] = (acc[m] || 0) + 1; return acc; }, {} as Record<string, number>);
    const tipoDistribution = savedLaudos.reduce((acc, l) => { const t = l.propertyInfo?.tipoImovel || 'N/A'; acc[t] = (acc[t] || 0) + 1; return acc; }, {} as Record<string, number>);

    return (
      <div className="min-h-screen bg-[#0a0a0f]">
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
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">{stat.label}</p>
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
                        <span className="text-[10px] text-slate-400 font-bold">{count}</span>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(count / max) * 100}%` }} transition={{ delay: idx * 0.1 }}
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg min-h-[4px]" />
                        <span className="text-[9px] text-slate-500">{month}</span>
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
          </div>
        </div>
      </div>
    );
  }

  // ==================== EDIT VIEW ====================
  if (view === 'edit') {
    const [searchEdit, setSearchEdit] = useState('');
    const filteredLaudos = [...savedLaudos]
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .filter(l => {
        if (!searchEdit) return true;
        const s = searchEdit.toLowerCase();
        return (l.name || '').toLowerCase().includes(s) ||
          (l.propertyInfo?.condominio || '').toLowerCase().includes(s) ||
          (l.propertyInfo?.endereco || '').toLowerCase().includes(s) ||
          (l.propertyInfo?.cidade || '').toLowerCase().includes(s) ||
          (l.propertyInfo?.bairro || '').toLowerCase().includes(s) ||
          (l.propertyInfo?.locadora || '').toLowerCase().includes(s) ||
          (l.propertyInfo?.locatario || '').toLowerCase().includes(s);
      });

    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/10"><Eye className="w-5 h-5 text-cyan-400" /></div>
                <div><h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Laudos de Vistoria</h1><p className="text-xs text-slate-500">{savedLaudos.length} laudo(s) · Clique para editar</p></div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setView('home')} className="rounded-xl text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar</Button>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Search */}
            {savedLaudos.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Buscar por nome, endereço, cidade, locatário..." value={searchEdit} onChange={e => setSearchEdit(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
              </div>
            )}

            {savedLaudos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-white mb-2">Nenhum laudo salvo</h2>
                <p className="text-sm text-slate-500 mb-4">Crie um novo laudo e salve para encontrá-lo aqui.</p>
                <Button onClick={() => setView('home')} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold"><Plus className="w-3.5 h-3.5 mr-1" /> Criar Primeiro Laudo</Button>
              </div>
            ) : filteredLaudos.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
                <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Nenhum laudo encontrado para "{searchEdit}"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLaudos.map((laudo, idx) => {
                  const totalPhotos = laudo.rooms?.reduce((s, r) => s + (r.photos?.length || 0), 0) || 0;
                  const totalAnnotations = laudo.rooms?.reduce((s, r) => s + (r.photos?.reduce((s2, p) => s2 + (p.annotations?.length || 0), 0) || 0), 0) || 0;
                  const roomNames = laudo.rooms?.map(r => r.name).filter(Boolean).join(', ') || 'Sem cômodos';
                  const date = new Date(laudo.savedAt);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const timeStr = isToday ? `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <motion.div key={laudo.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                      className="rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group" onClick={() => loadLaudo(laudo)}>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/10 shrink-0 mt-0.5">
                              <FileText className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-white truncate">{laudo.name || 'Sem nome'}</h3>
                                <Badge className="bg-white/5 text-slate-400 border-0 text-[9px] shrink-0">{laudo.propertyInfo?.tipoImovel}</Badge>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{laudo.propertyInfo?.endereco} {laudo.propertyInfo?.numero} {laudo.propertyInfo?.conjApto}</p>
                              <p className="text-[11px] text-slate-500">{laudo.propertyInfo?.bairro}{laudo.propertyInfo?.bairro && laudo.propertyInfo?.cidade ? ', ' : ''}{laudo.propertyInfo?.cidade}/{laudo.propertyInfo?.estado}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-slate-500">{timeStr}</p>
                          </div>
                        </div>

                        {/* Details Row */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Building2 className="w-3 h-3" /> {laudo.rooms?.length || 0} cômodo(s)
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Camera className="w-3 h-3" /> {totalPhotos} foto(s)
                          </div>
                          {totalAnnotations > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
                              <MapPin className="w-3 h-3" /> {totalAnnotations} anotação(ões)
                            </div>
                          )}
                          {laudo.propertyInfo?.metragem && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              {laudo.propertyInfo.metragem}
                            </div>
                          )}
                          {laudo.propertyInfo?.locadora && (
                            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500">
                              <User className="w-3 h-3" /> {laudo.propertyInfo.locadora}
                            </div>
                          )}
                        </div>

                        {/* Room Names Preview */}
                        {roomNames !== 'Sem cômodos' && (
                          <p className="text-[10px] text-slate-600 mt-2 truncate">{roomNames}</p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <span className="text-[10px] text-slate-600 group-hover:text-cyan-400 transition-colors">Clique para editar</span>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button size="sm" onClick={() => loadLaudo(laudo)} className="rounded-lg text-[10px] h-7 px-3 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20"><Edit3 className="w-3 h-3 mr-1" /> Editar</Button>
                          <button onClick={() => deleteLaudo(laudo.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== CONFIG VIEW ====================
  if (view === 'config') {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
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
                    <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{field.label}</Label>
                    <Input className="rounded-xl bg-white/5 border-white/5 text-white text-sm" value={(settings as any)[field.key]} onChange={e => setSettings({ ...settings, [field.key]: e.target.value })} />
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
                      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Texto da Marca d'Água</Label>
                      <Input className="rounded-xl bg-white/5 border-white/5 text-white text-sm" value={settings.watermarkText} onChange={e => setSettings({ ...settings, watermarkText: e.target.value })} placeholder="imobWeb Vistoria" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Imagem da Marca d'Água</Label>
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
                            <Image className="w-4 h-4" />
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

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white">Opções</h3></div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-white">Análise Automática com IA</p><p className="text-[11px] text-slate-500">Analisar fotos automaticamente ao adicioná-las</p></div>
                  <button onClick={() => setSettings({ ...settings, autoAnalyze: !settings.autoAnalyze })} className={cn("w-12 h-6 rounded-full transition-colors", settings.autoAnalyze ? 'bg-indigo-500' : 'bg-white/10')}>
                    <div className={cn("w-5 h-5 rounded-full bg-white shadow transition-transform", settings.autoAnalyze ? 'translate-x-6' : 'translate-x-0.5')} />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white">Problemas Personalizados</h3><p className="text-[11px] text-slate-500">Adicione vários de uma vez, um por linha</p></div>
              <div className="p-5 space-y-3">
                <textarea
                  placeholder={"Portão com ruído\nVazamento na torneira\nParede com mancha\nRachadura no piso\nInterruptor com defeito"}
                  className="w-full h-32 px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
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
                {settings.customProblems.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">{settings.customProblems.map((p, i) => (
                    <span key={i} className="text-[10px] px-2.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">{p}<button onClick={() => setSettings({ ...settings, customProblems: settings.customProblems.filter((_, j) => j !== i) })} className="hover:text-red-400"><X className="w-3 h-3" /></button></span>
                  ))}</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5"><h3 className="text-sm font-bold text-white">Dados Salvos</h3></div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between"><p className="text-sm text-white">Laudos salvos</p><Badge className="bg-white/5 text-slate-400 border-0 text-[10px]">{savedLaudos.length}</Badge></div>
                <Button variant="outline" size="sm" className="rounded-xl text-xs text-red-400 border-red-500/20 hover:bg-red-500/10" onClick={() => { if (confirm('Remover todos os laudos?')) { setSavedLaudos([]); localStorage.removeItem('vistoria_saved'); toast.success('Limpo!'); } }}><Trash2 className="w-3 h-3 mr-1" /> Limpar Tudo</Button>
              </div>
            </div>

            <Button onClick={saveSettings} className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 h-11 text-sm font-bold"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Salvar Configurações</Button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== WIZARD VIEW ====================
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('home')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"><ArrowLeft className="w-3 h-3" /> Voltar</button>
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-500/10 text-indigo-400 border-0 text-[9px] font-bold">Passo {wizardStep + 1}/{WIZARD_STEPS.length}</Badge>
              <Button variant="ghost" size="sm" onClick={() => saveLaudo()} className="rounded-xl text-xs text-slate-400 hover:text-white"><FileText className="w-3 h-3 mr-1" /> Salvar</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto overflow-x-auto scrollbar-hide pb-2">
          {WIZARD_STEPS.map((step, idx) => (
            <button key={step.id} onClick={() => idx <= wizardStep && setWizardStep(idx)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all shrink-0",
                idx === wizardStep ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : idx < wizardStep ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer' : 'text-slate-600 border border-white/5')}>
              {idx < wizardStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={wizardStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              {/* STEP 0: Property */}
              {wizardStep === 0 && (
                <PropertyStep propertyInfo={propertyInfo} setPropertyInfo={setPropertyInfo} />
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

              {/* STEP 3: Photos */}
              {wizardStep === 3 && (
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
                          <div className="flex gap-1.5 text-[9px]"><span className={room.photos.length > 0 ? 'text-cyan-400' : ''}>{room.photos.length}f</span>{ann > 0 && <span className="text-amber-400">{ann}a</span>}</div>
                        </button>
                      );
                    })}
                  </div>

                  {currentRoom && (() => {
                    const roomKey = currentRoom.id;
                    const roomProblems = selectedProblems[roomKey] || [];
                    const allProblems = [...COMMON_PROBLEMS, ...settings.customProblems];
                    const toggleProblem = (problem: string) => {
                      setSelectedProblems(prev => {
                        const current = prev[roomKey] || [];
                        const next = current.includes(problem) ? current.filter(p => p !== problem) : [...current, problem];
                        return { ...prev, [roomKey]: next };
                      });
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
                          </div>
                          <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <p className="text-[9px] text-indigo-400 uppercase tracking-wider font-semibold mb-1.5">Dicas de fotos</p>
                            <div className="flex flex-wrap gap-1">{getRoomPhotoTips(currentRoom.name).map((tip, i) => <span key={i} className="text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{tip}</span>)}</div>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          {/* Problem Checklist */}
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Problemas para Documentar</p>
                              {roomProblems.length > 0 && <span className="text-[9px] text-amber-400 font-bold">{roomProblems.length} selecionado(s)</span>}
                            </div>
                            <p className="text-[9px] text-slate-500 mb-2">Clique para marcar problemas encontrados neste cômodo</p>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                              {allProblems.map((problem) => {
                                const isSelected = roomProblems.includes(problem);
                                return (
                                  <button key={problem} onClick={() => toggleProblem(problem)}
                                    className={cn("text-[10px] px-2 py-1 rounded-lg border transition-all",
                                      isSelected ? 'border-amber-500/40 bg-amber-500/20 text-amber-300 font-bold' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300')}>
                                    {isSelected && '✓ '}{problem}
                                  </button>
                                );
                              })}
                            </div>
                            {roomProblems.length > 0 && (
                              <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-[9px] text-amber-400 font-bold mb-1">Tirar fotos de:</p>
                                <div className="flex flex-wrap gap-1">{roomProblems.map((p, i) => (
                                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1">
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
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                                    <button onClick={e => { e.stopPropagation(); setPreviewPhoto(photo); }} className="p-1.5 bg-white/20 rounded-lg"><Eye className="w-3 h-3 text-white" /></button>
                                    <button onClick={e => { e.stopPropagation(); setAnnotatingPhoto({ roomIdx: currentRoomIdx, photoIdx: pIdx }); }} className="p-1.5 bg-white/20 rounded-lg"><MapPin className="w-3 h-3 text-white" /></button>
                                    <button onClick={e => { e.stopPropagation(); setRooms(prev => prev.map((r, i) => i === currentRoomIdx ? { ...r, photos: r.photos.filter((_, pi) => pi !== pIdx) } : r)); }} className="p-1.5 bg-red-500/30 rounded-lg"><Trash2 className="w-3 h-3 text-white" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : <div className="text-center py-6"><Camera className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-xs text-slate-500">Nenhuma foto ainda</p>{roomProblems.length > 0 && <p className="text-[10px] text-amber-400 mt-1">Tire fotos dos problemas selecionados acima</p>}</div>}

                          <label><input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(currentRoomIdx, e.target.files)} />
                            <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors text-slate-400 hover:text-white">
                              <Camera className="w-4 h-4" /><span className="text-xs font-medium">Adicionar Fotos</span><span className="text-[10px] text-slate-600">· múltiplas</span>
                            </div></label>

                          {currentRoom.items.length > 0 && (
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mb-1.5">Itens detectados ({currentRoom.items.length})</p>
                              <div className="text-[11px] text-slate-400 space-y-0.5 max-h-20 overflow-y-auto">{currentRoom.items.slice(0, 5).map((item, i) => <p key={i} className="truncate">{item}</p>)}{currentRoom.items.length > 5 && <p className="text-slate-500">+{currentRoom.items.length - 5} mais</p>}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* STEP 4: Review */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div><h2 className="text-xl font-bold text-white mb-1">Revisão e Observações</h2><p className="text-sm text-slate-500">Revise, adicione observações e gere o laudo</p></div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Imóvel</h3>
                      <p className="text-sm font-bold text-white">{propertyInfo.condominio || 'Sem nome'}</p>
                      <p className="text-xs text-slate-400">{propertyInfo.endereco} {propertyInfo.numero} {propertyInfo.conjApto}</p>
                      <div className="flex gap-1.5 mt-2">{[propertyInfo.tipoImovel, propertyInfo.finalidade, propertyInfo.metragem].filter(Boolean).map((v, i) => <Badge key={i} className="bg-white/5 text-slate-400 border-0 text-[9px]">{v}</Badge>)}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resumo</h3>
                      <div className="space-y-1 text-xs"><p className="text-slate-400">Cômodos: <span className="text-white font-bold">{rooms.length}</span></p><p className="text-slate-400">Fotos: <span className="text-white font-bold">{totalPhotos}</span></p><p className="text-slate-400">Anotações: <span className="text-white font-bold">{totalAnnotations}</span></p></div>
                    </div>
                  </div>

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
                    <Label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Observações</Label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {['Imóvel entregue com pintura nova', 'Hidráulica OK', 'Elétrica OK', 'Ar condicionado funcionando', 'Todos interruptores testados'].map(t => (
                        <button key={t} onClick={() => setPropertyInfo({ ...propertyInfo, consideracoes: propertyInfo.consideracoes + (propertyInfo.consideracoes ? '\n' : '') + '· ' + t })}
                          className="text-[10px] px-2 py-1 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500/10 transition-all">+ {t}</button>
                      ))}
                    </div>
                    <textarea className="w-full h-28 px-4 py-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Observações adicionais..."
                      value={propertyInfo.consideracoes} onChange={e => setPropertyInfo({ ...propertyInfo, consideracoes: e.target.value })} />
                    <p className="text-[10px] text-slate-600">{propertyInfo.consideracoes.split('\n').filter(Boolean).length} linha(s)</p>
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
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
            <Button variant="ghost" onClick={() => setWizardStep(Math.max(0, wizardStep - 1))} disabled={wizardStep === 0} className="rounded-xl text-xs text-slate-400 hover:text-white"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Anterior</Button>
            {wizardStep < WIZARD_STEPS.length - 1 && (
              <Button onClick={() => setWizardStep(wizardStep + 1)} disabled={!canProceed()} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20">Próximo <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Annotator Modal */}
      <AnimatePresence>{annotatingPhoto && currentRoom && (
        <PhotoAnnotator photo={currentRoom.photos[annotatingPhoto.photoIdx]} onClose={() => setAnnotatingPhoto(null)}
          onSave={annotations => { setRooms(prev => prev.map((r, i) => i === annotatingPhoto.roomIdx ? { ...r, photos: r.photos.map((p, pi) => pi === annotatingPhoto.photoIdx ? { ...p, annotations } : p) } : r)); toast.success(`${annotations.length} anotações salvas`); }} />
      )}</AnimatePresence>

      {/* Photo Preview */}
      <AnimatePresence>{previewPhoto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-w-5xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <img src={previewPhoto.dataUrl} alt={previewPhoto.name} className="w-full h-auto max-h-[85vh] object-contain rounded-2xl" />
            {previewPhoto.annotations.length > 0 && (
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md rounded-xl p-3 max-w-xs">
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-2">Anotações</p>
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
              <Button size="sm" onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(pdfHtml); w.document.close(); toast.success('Ctrl+P para salvar PDF'); } }} className="rounded-xl text-xs bg-gradient-to-r from-cyan-600 to-blue-600 text-white"><FileText className="w-3 h-3 mr-1" /> Imprimir</Button>
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
