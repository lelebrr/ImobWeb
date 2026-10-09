'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnline } from '../_lib/useOnline';

/** Aviso fixo quando o aparelho está sem internet: vistoria continua, IA e PDF precisam de conexão. */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-2 bg-amber-500 px-3 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] text-xs font-semibold text-black"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Sem internet — você pode continuar vistoriando; IA e PDF voltam quando houver conexão.
    </div>
  );
}
