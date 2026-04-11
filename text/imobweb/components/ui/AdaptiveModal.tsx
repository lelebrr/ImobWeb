"use client";

import React, { useEffect } from "react";
import { useResponsive } from "@/text/imobweb/hooks/use-responsive";
import { cn } from "@/text/imobweb/lib/responsive/tailwind-utils";
import { X } from "lucide-react";

interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * AdaptiveModal é o supra-sumo da responsividade moderna:
 * 1. Desktop: Ele atua como um elegante Popup (Dialog) centralizado no monitor.
 * 2. Mobile: Ele vira automaticamente um **Bottom Sheet**, ancorado no rodapé com bordas curvas, amigável pro dedão.
 */
export function AdaptiveModal({ isOpen, onClose, title, children }: AdaptiveModalProps) {
  const { isMobile, isClient } = useResponsive();

  // Trava o scroll do body quando aberto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isClient || !isOpen) return null;

  return (
    <>
      {/* O Backdrop Universal, trava os cliques de fundo e escurece */}
      <div 
        className="fixed inset-0 z-[60] bg-black/60 shadow-lg backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* O Container mutável mágico */}
      <div className={cn(
        "fixed z-[70] bg-card flex flex-col overflow-hidden transition-all duration-300 ease-out",
        isMobile 
          ? "bottom-0 left-0 right-0 rounded-t-[2rem] border-t min-h-[50vh] max-h-[90vh] pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          : "border top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl rounded-2xl shadow-2xl animate-in zoom-in-[0.98] fade-in"
      )}>
        
        {/* Handle Visual para Mobile (Tracejado superior) */}
        {isMobile && (
           <div className="w-full flex justify-center pt-3 pb-1">
             <div className="w-12 h-1.5 bg-muted rounded-full" />
           </div>
        )}

        {/* Header do componente */}
        <div className={cn("flex items-center justify-between border-b", isMobile ? "px-5 pb-4 pt-1" : "p-5")}>
          <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body scrollável livremente */}
        <div className="p-5 overflow-y-auto w-full flex-1">
          {children}
        </div>
      </div>
    </>
  );
}
