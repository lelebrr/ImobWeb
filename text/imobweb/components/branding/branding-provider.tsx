"use client"

import * as React from "react"
import { applyTheme, ThemeConfig } from "@/lib/design-system/theme-utils"

interface BrandingContextType {
  config: ThemeConfig;
  updateConfig: (newConfig: Partial<ThemeConfig>) => void;
}

const BrandingContext = React.createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ 
  children, 
  initialConfig 
}: { 
  children: React.ReactNode;
  initialConfig?: ThemeConfig;
}) {
  const [config, setConfig] = React.useState<ThemeConfig>(initialConfig || {
    primary: "221.2 83.2% 53.3%", // Default ImobWeb Blue
    radius: "0.5rem"
  });

  // Aplica o tema sempre que a configuração mudar
  React.useEffect(() => {
    applyTheme(config);
  }, [config]);

  const updateConfig = (newConfig: Partial<ThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <BrandingContext.Provider value={{ config, updateConfig }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  const context = React.useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
