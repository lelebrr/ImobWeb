"use client";

import { useEffect, useState } from "react";

// Sincronizado dinamicamente com tailwind.config.ts
const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
};

export function useResponsive() {
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    // Definimos a largura no client-side init
    setWindowWidth(window.innerWidth);

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      // Debounce básico para otimizar performance durante o redimensionamento
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 50);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const isClient = windowWidth !== 0;

  return {
    isMobile: isClient && windowWidth < BREAKPOINTS.md, // < 768px
    isTablet: isClient && windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg, // 768 - 1023px
    isDesktop: isClient && windowWidth >= BREAKPOINTS.lg, // >= 1024px
    isUltraWide: isClient && windowWidth >= BREAKPOINTS["2xl"], // >= 1440px
    isClient,
    windowWidth,
  };
}
