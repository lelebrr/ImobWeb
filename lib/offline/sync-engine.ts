/**
 * Sync Engine - ImobWeb 2026
 * 
 * Lógica de sincronização inteligente que monitora a conexão
 * e processa a fila de ações pendentes.
 */

import { db, type SyncAction } from "../offline-db";

export class SyncEngine {
  private static isProcessing = false;

  /**
   * Tenta sincronizar todas as ações pendentes
   */
  static async syncAll() {
    if (this.isProcessing) return;
    if (!navigator.onLine) return;

    this.isProcessing = true;
    console.log("[SyncEngine] Iniciando sincronização...");

    try {
      const pendingActions = await db.syncQueue
        .where("status")
        .equals("pending")
        .toArray();

      for (const action of pendingActions) {
        await this.processAction(action);
      }
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
   * Registra listeners de rede
   */
  static init() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      console.log("[SyncEngine] Voltamos online! Iniciando sync...");
      this.syncAll();
    });
  }
}
