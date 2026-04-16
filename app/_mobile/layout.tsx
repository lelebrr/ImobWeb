"use client";

/**
 * Mobile Layout - ImobWeb 2026
 * 
 * Shell global para todas as páginas do grupo (mobile).
 * Fornece os providers específicos de mobile, navegação e indicadores.
 */

import React from "react";
import { MobileProvider } from "../../providers/mobile-provider";
import BottomNav from "../../components/mobile/BottomNav";
import SyncIndicator from "../../components/offline/SyncIndicator";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileProvider>
      <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
        {/* Indicador de Sincronização em tempo real */}
        <SyncIndicator />

        {/* Conteúdo da Página */}
        <div className="flex-1">
          {children}
        </div>

        {/* Navegação Inferior Otimizada */}
        <BottomNav />
      </div>
    </MobileProvider>
  );
}
