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
    SyncEngine.init();
    SyncEngine.syncAll();

    // 2. Monitora status de rede
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    // 3. Detecta se estamos em um wrapper nativo
    const checkNative = () => {
      const native = !!((window as any).Capacitor || (window as any).ReactNativeWebView);
      setIsNative(native);
    };
    checkNative();

    return () => {
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
