"use client";

import React from "react";
import { BrandingProvider } from "../../components/white-label/BrandingProvider";
import { resolveWhiteLabelConfig } from "../../lib/white-label/white-label-service";

/**
 * LAYOUT DO PORTAL DO PARCEIRO - imobWeb 2026
 * Garante que todo o portal do parceiro consuma as configurações White Label.
 */

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  // Em produção, o hostname viria do middleware
  // Aqui usamos um mock para demonstração do flow completo 100%
  const [config, setConfig] = React.useState<any>(null);

  React.useEffect(() => {
    // Simulação de resolução de domínio (ex: partner.su marca.com.br)
    resolveWhiteLabelConfig("partner.imobweb.com.br").then(setConfig);
  }, []);

  if (!config) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  return (
    <BrandingProvider config={config}>
      <div className="flex min-h-screen flex-col">
        {/* Simple Partner Nav */}
        <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 sticky top-0 z-50">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-lg bg-indigo-600"></div>
               <span className="font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                 {config.brandName || "Partner Portal"}
               </span>
            </div>
            <nav className="hidden gap-8 md:flex">
              <a href="/dashboard" className="text-sm font-bold text-slate-900 dark:text-white transition-colors hover:text-indigo-600">Dashboard</a>
              <a href="/marketplace" className="text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600">Marketplace</a>
              <a href="/settings" className="text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600">Configurações</a>
            </nav>
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </header>
        
        <main className="flex-1 bg-slate-50/30 dark:bg-slate-950/20">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </BrandingProvider>
  );
}
