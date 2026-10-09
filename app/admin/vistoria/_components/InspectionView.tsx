'use client';

import React from 'react';
import { DEFECT_LABEL, type PhotoInspection } from '@/lib/vistoria/shared';
import { MIN_CONFIDENCE } from '../_lib/inspection';
import { cn } from '../_lib/utils';

const SEV_CLS = {
  leve: { box: 'border-amber-300', tag: 'bg-amber-300 text-black' },
  moderada: { box: 'border-orange-400', tag: 'bg-orange-400 text-black' },
  grave: { box: 'border-red-500', tag: 'bg-red-500 text-white' },
} as const;

/** Caixas de objetos (azul tracejado) e defeitos (cor pela gravidade) sobre a foto. O pai deve ser `relative` e do tamanho da imagem. */
export function InspectionOverlay({ inspection, objects = true }: { inspection?: PhotoInspection | null; objects?: boolean }) {
  if (!inspection) return null;
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {objects && inspection.objects.filter((o) => o.box && o.confidence >= MIN_CONFIDENCE).map((o, i) => (
        <div key={`o${i}`} className="absolute border border-dashed border-cyan-300/80 rounded-sm" style={{ left: `${o.box!.x}%`, top: `${o.box!.y}%`, width: `${o.box!.w}%`, height: `${o.box!.h}%` }}>
          <span className="absolute -top-4 left-0 max-w-full truncate text-[11px] leading-4 px-1 rounded bg-cyan-400/90 text-black font-semibold">{o.name}</span>
        </div>
      ))}
      {inspection.defects.filter((d) => d.box && d.confidence >= MIN_CONFIDENCE).map((d, i) => {
        const c = SEV_CLS[d.severity];
        return (
          <div key={`d${i}`} className={cn('absolute border-2 rounded-sm', c.box)} style={{ left: `${d.box!.x}%`, top: `${d.box!.y}%`, width: `${d.box!.w}%`, height: `${d.box!.h}%` }}>
            <span className={cn('absolute -bottom-4 left-0 max-w-[16rem] truncate text-[11px] leading-4 px-1 rounded font-bold', c.tag)}>{DEFECT_LABEL[d.type]}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Lista legível do que foi detectado numa foto. */
export function InspectionList({ inspection, className }: { inspection?: PhotoInspection | null; className?: string }) {
  if (!inspection) return null;
  const objects = inspection.objects.filter((o) => o.confidence >= MIN_CONFIDENCE);
  const defects = inspection.defects.filter((d) => d.confidence >= MIN_CONFIDENCE);
  if (objects.length === 0 && defects.length === 0) return <p className={cn('text-xs text-slate-400', className)}>Nada relevante detectado nesta foto.</p>;
  return (
    <div className={cn('space-y-2', className)}>
      {defects.length > 0 && (
        <ul className="space-y-1">
          {defects.map((d, i) => (
            <li key={i} className="text-xs flex items-start gap-2">
              <span className={cn('shrink-0 mt-0.5 px-1.5 rounded text-[11px] font-bold', SEV_CLS[d.severity].tag)}>{DEFECT_LABEL[d.type]}</span>
              <span className="text-slate-200">{d.description} <span className="text-slate-500">· {Math.round(d.confidence * 100)}%</span></span>
            </li>
          ))}
        </ul>
      )}
      {objects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {objects.map((o, i) => (
            <span key={i} className={cn('text-[11px] px-2 py-0.5 rounded-full border', o.condition === 'ruim' ? 'border-red-400/40 text-red-200 bg-red-500/10' : o.condition === 'regular' ? 'border-amber-400/40 text-amber-200 bg-amber-500/10' : 'border-cyan-400/30 text-cyan-100 bg-cyan-500/10')}>{o.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}
