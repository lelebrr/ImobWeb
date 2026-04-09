"use client";

/**
 * SyncIndicator - ImobWeb 2026
 * 
 * Componente premium de status de conexão e sincronização.
 * Mostra o estado do banco offline e fila de processamento.
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { db, getPendingSyncCount } from "../../lib/offline-db";
import { cn } from "@/lib/utils";

export default function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateStatus = async () => {
      setIsOnline(navigator.onLine);
      const count = await getPendingSyncCount();
      setPendingCount(count);
    };

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // Polling leve para fila de sync se estiver online
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className={cn(
            "px-4 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-semibold border",
            isOnline 
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
              : "bg-red-500/10 text-red-500 border-red-500/20"
          )}
        >
          {isOnline ? (
            <>
              <RefreshCw className={cn("w-3.5 h-3.5", pendingCount > 0 && "animate-spin")} />
              <span>Sincronizando {pendingCount} {pendingCount === 1 ? 'item' : 'itens'}...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Modo Offline ({pendingCount} pendentes)</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
