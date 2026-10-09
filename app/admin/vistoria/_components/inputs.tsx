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

export function AutocompleteInput({ label, value, onChange, suggestions, placeholder, required, storageKey }: {
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
      <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{label} {required && <span className="text-red-400">*</span>}</Label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setShowSuggestions(true); }}
        onFocus={() => value.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full h-11 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-base sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
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
export function CpfCnpjInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const validation = value ? validateCpfCnpj(value) : null;

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{label}</Label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(formatCpfCnpj(e.target.value))}
          placeholder={placeholder || '000.000.000-00 ou 00.000.000/0000-00'}
          maxLength={18}
          className={cn(
            "w-full h-11 px-3 rounded-xl border bg-white/5 text-white text-base sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all",
            validation?.valid ? 'border-emerald-500/30 focus:ring-emerald-500/30' :
            validation && !validation.valid ? 'border-red-500/30 focus:ring-red-500/30' :
            'border-white/5 focus:ring-indigo-500/30'
          )}
        />
        {validation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validation.valid ? (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{validation.type}</span>
            ) : (
              <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Inválido</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PHONE INPUT ====================
export function PhoneInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{label}</Label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(formatPhone(e.target.value))}
        placeholder="(11) 99999-9999"
        maxLength={15}
        className="w-full h-11 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-base sm:text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
    </div>
  );
}

