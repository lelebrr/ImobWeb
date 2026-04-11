"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { WhiteLabelConfig } from "../../lib/white-label/white-label-service";

/**
 * BRANDING PROVIDER - imobWeb 2026
 * Gerenciamento dinâmico de identidade visual HSL e remoção de marca original.
 */

const BrandingContext = createContext<WhiteLabelConfig | null>(null);

export const BrandingProvider: React.FC<{ config: WhiteLabelConfig; children: ReactNode }> = ({ config, children }) => {
  
  // Atualizar Titulo e Favicon dinamicamente (Client-side)
  useEffect(() => {
    if (config.brandName) {
      document.title = config.brandName;
    }
    
    if (config.faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = config.faviconUrl;
    }
  }, [config]);

  return (
    <BrandingContext.Provider value={config}>
      {/* Injeção Dinâmica de Variáveis CSS com Suporte a HSL */}
      <style jsx global>{`
        :root {
          --brand-primary: ${config.colors.primary};
          --brand-secondary: ${config.colors.secondary};
          --brand-accent: ${config.colors.accent};
          
          /* Gerar variações de opacidade para utilitários tailwind customizados */
          --brand-primary-rgb: ${hexToRgb(config.colors.primary)};
        }
        
        /* Ocultação radical da marca original */
        ${config.removeImobWebBranding ? `
          [data-brand="imobweb"], 
          .imobweb-watermark,
          #imobweb-loader { 
            display: none !important; 
            visibility: hidden !important; 
            opacity: 0 !important;
            pointer-events: none !important;
          }
          
          /* Substituir o texto de 'Powered by' */
          footer span:contains("imobWeb") {
             content: "Plataforma ${config.brandName}" !important;
          }
        ` : ""}

        ${config.customCss || ""}
      `}</style>

      <div className={`app-container ${config.removeImobWebBranding ? 'whitelabel-active' : ''}`}>
        {children}
      </div>
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    return {
      tenantId: "default",
      brandName: "imobWeb",
      colors: { primary: "#3b82f6", secondary: "#1e293b", accent: "#f59e0b" },
      removeImobWebBranding: false,
    };
  }
  return context;
};

// Helper simples para conversão de Hex para RGB (necessário para filtros de opacidade no CSS bruto)
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    "59, 130, 246";
}
