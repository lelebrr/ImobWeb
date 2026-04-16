/**
 * Sync Engine - ImobWeb 2026
 * 
 * Lógica de sincronização inteligente que monitora a conexão
 * e processa a fila de ações pendentes.
 */

import { db, type SyncAction } from "../offline-db";

export class SyncEngine {
  private static isProcessing = false;
  private static isInitialized = false;
  private static lastSyncTime = 0;
  private static readonly MIN_SYNC_INTERVAL = 30000; // 30 segundos

  /**
   * Tenta sincronizar todas as ações pendentes
   */
  static async syncAll(force = false) {
    if (this.isProcessing) return;
    if (!navigator.onLine) return;

    // Throttle: Evita sincronizações excessivas se não for forçado
    const now = Date.now();
    if (!force && now - this.lastSyncTime < this.MIN_SYNC_INTERVAL) {
      console.log("[SyncEngine] Sync ignorado por throttle (intervalo mínimo não atingido)");
      return;
    }

    this.isProcessing = true;
    this.lastSyncTime = now;
    console.log("[SyncEngine] Iniciando sincronização...");

    try {
      const pendingActions = await db.syncQueue
        .where("status")
        .equals("pending")
        .toArray();

      if (pendingActions.length === 0) {
        console.log("[SyncEngine] Nenhuma ação pendente encontrada.");
        return;
      }

      for (const action of pendingActions) {
        await this.processAction(action);
      }
    } catch (error) {
      console.error("[SyncEngine] Erro crítico durante sincronização:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Processa uma ação individual (Integração com Server Actions)
   */
  private static async processAction(action: SyncAction) {
    try {
      await db.syncQueue.update(action.id!, { status: "syncing" });

      // Simulação de chamada para Server Action ou API
      // Em produção, aqui importaríamos as actions do Core IA
      const success = await this.mockServerCall(action);

      if (success) {
        await db.syncQueue.delete(action.id!);
        console.log(`[SyncEngine] Ação ${action.type} sincronizada com sucesso.`);
      } else {
        throw new Error("Server rejected action");
      }
    } catch (error) {
      console.error(`[SyncEngine] Falha ao sincronizar ação ${action.id}:`, error);
      
      const retryCount = (action.retryCount || 0) + 1;
      if (retryCount > 5) {
        await db.syncQueue.update(action.id!, { status: "failed", retryCount });
      } else {
        await db.syncQueue.update(action.id!, { status: "pending", retryCount });
      }
    }
  }

  private static async mockServerCall(action: SyncAction): Promise<boolean> {
    // Simula latência de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    return true; 
  }

  /**
   * Registra listeners de rede e inicializa o motor
   * Retorna uma função de cleanup
   */
  static init() {
    if (typeof window === "undefined") return () => {};
    if (this.isInitialized) return () => {};

    console.log("[SyncEngine] Inicializando serviço de sincronização...");
    
    const handleOnline = () => {
      console.log("[SyncEngine] Voltamos online! Iniciando sync...");
      this.syncAll(true);
    };

    window.addEventListener("online", handleOnline);
    this.isInitialized = true;

    // Retorna função de limpeza para evitar múltiplos listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      this.isInitialized = false;
      console.log("[SyncEngine] Serviço de sincronização desativado.");
    };
  }
}
