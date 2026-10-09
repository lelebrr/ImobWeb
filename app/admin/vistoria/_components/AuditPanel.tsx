'use client';

import React from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle2 } from 'lucide-react';
import type { AuditResult } from '../_lib/audit';
import { cn } from '../_lib/utils';
import { ProgressRing } from './PageHeader';

const ICON = { error: XCircle, warn: AlertTriangle, info: Info } as const;
const TONE = { error: 'text-red-300', warn: 'text-amber-300', info: 'text-sky-300' } as const;

export function AuditPanel({ audit, onGoto }: { audit: AuditResult; onGoto: (step: number, roomId?: string) => void }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5" aria-label="Revisão de qualidade do laudo">
      <div className="flex items-center gap-3 mb-3">
        <ProgressRing value={audit.score} size={44} />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white">Revisão de qualidade</h3>
          <p className="text-[11px] text-slate-500">
            {audit.issues.length === 0 ? 'Tudo certo para gerar o laudo.' : `${audit.errors} pendência(s) obrigatória(s) · ${audit.warnings} alerta(s)`}
          </p>
        </div>
      </div>
      {audit.issues.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 className="w-4 h-4" /> Nenhum problema encontrado.</p>
      ) : (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {audit.issues.map((i) => {
            const Icon = ICON[i.level];
            return (
              <li key={i.id}>
                <button type="button" onClick={() => onGoto(i.step, i.roomId)}
                  className="w-full flex items-start gap-2.5 text-left rounded-xl px-3 py-2.5 min-h-[44px] bg-white/[0.03] hover:bg-white/[0.07] transition-colors">
                  <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', TONE[i.level])} />
                  <span className="text-xs text-slate-300 flex-1">{i.message}</span>
                  <span className="text-[11px] text-slate-600 shrink-0 mt-0.5">corrigir →</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
