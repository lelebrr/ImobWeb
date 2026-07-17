'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  storageKey: string;
  placeholder?: string;
  className?: string;
}

export function CreatableSelect({
  options,
  value,
  onChange,
  storageKey,
  placeholder,
  className,
}: CreatableSelectProps) {
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newValue, setNewValue] = useState('');

  // Load saved options from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const savedOptions: string[] = saved ? JSON.parse(saved) : [];
      // Merge: unique values from fixed options + saved
      const merged = Array.from(new Set([...options, ...savedOptions]));
      setAllOptions(merged);
    } catch {
      setAllOptions([...options]);
    }
  }, [options, storageKey]);

  const handleSaveNew = () => {
    const trimmed = newValue.trim().toUpperCase();
    if (!trimmed) return;

    if (!allOptions.includes(trimmed)) {
      const updated = [...allOptions, trimmed];
      setAllOptions(updated);
      // Persist to localStorage
      try {
        const saved = localStorage.getItem(storageKey);
        const savedOptions: string[] = saved ? JSON.parse(saved) : [];
        if (!savedOptions.includes(trimmed)) {
          localStorage.setItem(storageKey, JSON.stringify([...savedOptions, trimmed]));
        }
      } catch {
        localStorage.setItem(storageKey, JSON.stringify([trimmed]));
      }
    }

    onChange(trimmed);
    setNewValue('');
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="flex gap-1.5">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveNew();
            if (e.key === 'Escape') { setIsCreating(false); setNewValue(''); }
          }}
          placeholder="Digite e pressione Enter"
          className={cn(
            'flex-1 h-10 px-3 rounded-xl border bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30',
            className
          )}
          autoFocus
        />
        <button
          onClick={handleSaveNew}
          className="h-10 px-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-500/20 transition-colors shrink-0"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setIsCreating(false); setNewValue(''); }}
          className="h-10 px-3 rounded-xl bg-white/5 text-slate-400 border border-white/5 text-xs font-bold hover:bg-white/10 transition-colors shrink-0"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <select
      className={cn(
        'w-full h-10 px-3 rounded-xl border border-white/5 bg-white/5 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30',
        className
      )}
      value={value}
      onChange={(e) => {
        if (e.target.value === '__CREATE__') {
          setIsCreating(true);
          onChange('');
        } else {
          onChange(e.target.value);
        }
      }}
    >
      {/* Current value if not in options */}
      {value && !allOptions.includes(value) && (
        <option value={value} className="bg-[#12121a] text-white">{value}</option>
      )}

      {/* "+ Criar" as first option */}
      <option value="__CREATE__" className="bg-[#12121a] text-indigo-400">+ Criar novo...</option>

      {/* All options */}
      {allOptions.map((opt) => (
        <option key={opt} value={opt} className="bg-[#12121a] text-white">
          {opt}
        </option>
      ))}
    </select>
  );
}
