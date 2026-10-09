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
import { AutocompleteInput, CpfCnpjInput, PhoneInput } from './inputs';

export function PropertyStep({ propertyInfo, setPropertyInfo }: { propertyInfo: PropertyInfo; setPropertyInfo: (v: PropertyInfo) => void }) {
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepChange = async (rawCep: string) => {
    const formatted = formatCep(rawCep);
    const clean = rawCep.replace(/\D/g, '');

    if (clean.length === 8) {
      setCepLoading(true);
      const result = await lookupCep(clean);
      if (result) {
        setPropertyInfo({
          ...propertyInfo,
          cep: formatted,
          endereco: result.endereco,
          bairro: result.bairro,
          cidade: result.cidade,
          estado: result.estado,
        });
        toast.success('Endereço preenchido automaticamente!');
      } else {
        setPropertyInfo({ ...propertyInfo, cep: formatted });
      }
      setCepLoading(false);
    } else {
      setPropertyInfo({ ...propertyInfo, cep: formatted });
    }
  };

  const showCondominio = CONDOMINIO_TYPES.includes(propertyInfo.tipoImovel);
  const showAptoFields = CONDOMINIO_TYPES.includes(propertyInfo.tipoImovel);
  const showAndar = ['APARTAMENTO', 'COBERTURA', 'LOFT', 'SALA'].includes(propertyInfo.tipoImovel);

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-white mb-1">Dados do Imóvel</h2><p className="text-sm text-slate-500">Informações básicas do imóvel</p></div>

      {/* Property Type - First Question */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-3 block">O que é o imóvel? *</Label>
        <CreatableSelect options={TIPO_IMOVEL_OPTIONS} value={propertyInfo.tipoImovel} onChange={v => setPropertyInfo({ ...propertyInfo, tipoImovel: v })} storageKey="vistoria_tipo_imovel" />
      </div>

      {/* CEP with Auto-fill */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-3 block">CEP do Imóvel</Label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="00000-000"
              value={propertyInfo.cep}
              onChange={e => handleCepChange(e.target.value)}
              maxLength={9}
              className="w-full h-10 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            {cepLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-[11px] text-indigo-400">Buscando...</span>
              </div>
            )}
            {!cepLoading && propertyInfo.endereco && propertyInfo.cep.replace(/\D/g, '').length === 8 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-600 mt-1.5">
          {propertyInfo.endereco ? (
            <span className="text-emerald-400">✓ Endereço preenchido: {propertyInfo.endereco}, {propertyInfo.bairro} - {propertyInfo.cidade}/{propertyInfo.estado}</span>
          ) : (
            'Digite o CEP para preencher endereço, bairro, cidade e estado automaticamente'
          )}
        </p>
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AutocompleteInput label="Endereço" value={propertyInfo.endereco} onChange={v => setPropertyInfo({ ...propertyInfo, endereco: v })}
          suggestions={['Avenida', 'Rua', 'Alameda', 'Travessa', 'Praça']} placeholder="Rua/Avenida..." />
        <div className="space-y-1.5">
          <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Número</Label>
          <Input placeholder="1410" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm" value={propertyInfo.numero} onChange={e => setPropertyInfo({ ...propertyInfo, numero: e.target.value })} />
        </div>
        {showAndar && (
          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Andar</Label>
            <Input placeholder="Ex: 10º andar" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm" value={propertyInfo.andar} onChange={e => setPropertyInfo({ ...propertyInfo, andar: e.target.value })} />
          </div>
        )}
        {showAptoFields && (
          <>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Conjunto</Label>
              <Input placeholder="Ex: conj. 103" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm" value={propertyInfo.conjApto} onChange={e => setPropertyInfo({ ...propertyInfo, conjApto: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Apartamento</Label>
              <Input placeholder="Ex: APTO 182" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm" value={propertyInfo.apto} onChange={e => setPropertyInfo({ ...propertyInfo, apto: e.target.value })} />
            </div>
          </>
        )}
        <AutocompleteInput label="Bairro" value={propertyInfo.bairro} onChange={v => setPropertyInfo({ ...propertyInfo, bairro: v })}
          suggestions={['Vila Suzana', 'Vila Mariana', 'Moema', 'Pinheiros', 'Itaim Bibi', 'Jardins', 'Brooklin', 'Morumbi', 'Vila Olímpia', 'Campo Belo']} placeholder="Bairro" />
        <AutocompleteInput label="Cidade" value={propertyInfo.cidade} onChange={v => setPropertyInfo({ ...propertyInfo, cidade: v })}
          suggestions={['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Florianópolis', 'Brasília', 'Goiânia', 'Campinas', 'Guarulhos']} placeholder="Cidade" />
        <div className="space-y-1.5">
          <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Estado</Label>
          <Input placeholder="SP" className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-slate-600 text-sm w-20" value={propertyInfo.estado} onChange={e => setPropertyInfo({ ...propertyInfo, estado: e.target.value.toUpperCase().slice(0, 2) })} />
        </div>
      </div>

      {/* Condominio - Only for apt/cobertura */}
      {showCondominio && (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Nome do Condomínio *</Label>
          <AutocompleteInput label="" value={propertyInfo.condominio} onChange={v => setPropertyInfo({ ...propertyInfo, condominio: v })}
            suggestions={['EDIFÍCIO', 'CONDOMÍNIO', 'TORRE', 'BLOCO']} placeholder="EDIFÍCIO COLUMBUS TOWER" storageKey="vistoria_condominios" />
        </div>
      )}

      {/* Other Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5"><Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Finalidade</Label><CreatableSelect options={FINALIDADE_OPTIONS} value={propertyInfo.finalidade} onChange={v => setPropertyInfo({ ...propertyInfo, finalidade: v })} storageKey="vistoria_finalidade" /></div>
        <div className="space-y-1.5"><Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Mobiliado</Label><CreatableSelect options={MOBILIADO_OPTIONS} value={propertyInfo.mobiliado} onChange={v => setPropertyInfo({ ...propertyInfo, mobiliado: v })} storageKey="vistoria_mobiliado" /></div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Metragem</Label>
          <div className="relative">
            <input
              type="text"
              placeholder="87"
              value={propertyInfo.metragem.replace('m²', '')}
              onChange={e => {
                const num = e.target.value.replace(/\D/g, '');
                setPropertyInfo({ ...propertyInfo, metragem: num ? `${num}m²` : '' });
              }}
              className="w-full h-10 px-3 pr-8 rounded-xl border border-white/5 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">m²</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Data da Vistoria</Label>
          <Input className="rounded-xl bg-white/5 border-white/5 text-white text-sm" value={propertyInfo.dataLaudo} onChange={e => setPropertyInfo({ ...propertyInfo, dataLaudo: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

