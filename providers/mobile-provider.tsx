"use client";

/**
 * MobileProvider - ImobWeb 2026
 * 
 * Orquestra a experiência mobile global:
 * - Inicializa o SyncEngine
 * - Monitora status de rede
 * - Gerencia o estado do NativeBridge
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { SyncEngine } from "../lib/offline/sync-engine";
import { NativeBridge } from "../lib/native-bridge/bridge";

interface MobileContextType {
  isOnline: boolean;
  isNative: boolean;
  hapticFeedback: (type?: 'impact' | 'notification' | 'selection') => Promise<void>;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // 1. Inicializa o motor de sincronização
    const cleanupSync = SyncEngine.init();
    
    // Pequeno delay para evitar processamento pesado durante o mount da aplicação
    const timer = setTimeout(() => {
      SyncEngine.syncAll();
    }, 2000);

    // 2. Monitora status de rede
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    // 3. Diagnostic History Guard (Identify navigation loops)
    if (process.env.NODE_ENV === 'production' || true) {
      const originalReplaceState = window.history.replaceState;
      const originalPushState = window.history.pushState;
      let callCount = 0;
      let lastCallTime = Date.now();

      window.history.replaceState = function(...args) {
        callCount++;
        const now = Date.now();
        if (now - lastCallTime > 1000) {
          callCount = 0;
          lastCallTime = now;
        }

        if (callCount > 5) {
          console.warn('[HistoryGuard] Detectado loop de replaceState:', args[2]);
          console.trace();
        }
        return originalReplaceState.apply(this, args);
      };

      window.history.pushState = function(...args) {
        console.log('[HistoryGuard] pushState:', args[2]);
        return originalPushState.apply(this, args);
      };
    }

    // 4. Detecta se estamos em um wrapper nativo
    const checkNative = () => {
      const native = !!((window as any).Capacitor || (window as any).ReactNativeWebView);
      setIsNative(native);
    };
    checkNative();

    return () => {
      cleanupSync();
      clearTimeout(timer);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const hapticFeedback = async (type: 'impact' | 'notification' | 'selection' = 'selection') => {
    await NativeBridge.hapticFeedback(type);
  };

  return (
    <MobileContext.Provider value={{ isOnline, isNative, hapticFeedback }}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobile() {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error("useMobile deve ser usado dentro de um MobileProvider");
  }
  return context;
}
