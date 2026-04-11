"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/responsive/tailwind-utils";
import { useResponsive } from "@/hooks/use-responsive";

export function ResponsiveHeader() {
  const { isMobile, isClient } = useResponsive();

  if (!isClient) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-md border-b flex items-center h-16 px-fluid-4 lg:px-fluid-6 gap-4 shrink-0 transition-all">
      
      {/* No Desktop tentamos manter tudo à prova de falhas com clamp flexíveis */}
      <div className="flex-1 flex items-center h-full">
        <button 
          className={cn(
            "flex items-center gap-2 bg-muted/40 hover:bg-muted border border-border/50 hover:border-border transition-all h-9 w-full max-w-md text-muted-foreground text-sm outline-none focus-visible:ring-2",
            isMobile 
              ? "bg-transparent border-none w-9 p-0 justify-center flex-none rounded-full ml-auto" // Mobile vira um botão limpo
              : "rounded-lg px-3" // Desktop é uma grande barra formatada
          )}
          aria-label="Abrir barra de pesquisa mágica"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className={cn(isMobile ? "hidden" : "inline-block flex-1 text-left")}>Buscar inteligência (Ctrl + K)</span>
          {!isMobile && (
             <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-transparent px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
             </kbd>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        {/* Notificações Inteligentes */}
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors outline-none focus-visible:ring-2">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          {/* Luz de Ponto para Alertas Críticos */}
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
        </button>
        
        <div className="w-px h-6 bg-border hidden sm:block mx-1" />

        {/* User Profile Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/20 border-2 border-primary/10 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden ring-offset-background hover:ring-2 hover:ring-primary/40 transition-all shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Perfil" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
