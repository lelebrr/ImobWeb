import { FieldVisit, VoiceRegistrationResult, OfflineAction, FieldSyncStatus, SmartCameraMedia } from '@/types/field-mode';
import { Property } from '@/types/property';
import { db } from './db';

/**
 * FIELD ENGINE v2.0 - IMOBWEB 2026
 * Orchestrates GPS, Voice, and Dual-Sync (Local + Remote).
 */
export class FieldEngine {
  private static instance: FieldEngine;
  private watchId: number | null = null;
  private syncInProgress: boolean = false;

  private constructor() {
    // Escuta mudanças na conexão para disparar sync automático
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.sync());
    }
  }

  public static getInstance(): FieldEngine {
    if (!FieldEngine.instance) {
      FieldEngine.instance = new FieldEngine();
    }
    return FieldEngine.instance;
  }

  // --- PERSISTENCE (DEXIE) ---

  public async saveMedia(media: SmartCameraMedia) {
    await db.media_queue.add(media);
    await this.queueSync('UPLOAD_MEDIA', { mediaId: media.id });
  }

  public async recordVisit(visit: Omit<FieldVisit, 'id'>) {
    const id = await db.field_visits.add({ ...visit, id: Math.random().toString(36).substr(2, 9) } as FieldVisit);
    await this.queueSync('REGISTER_VISIT', { visitId: id });
  }

  private async queueSync(type: OfflineAction['type'], payload: any) {
    const action: OfflineAction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    await db.sync_queue.add(action);
    this.sync(); // Tenta sincronizar imediatamente
  }

  // --- SYNC ENGINE (UPLOAD TO SYSTEM) ---

  public async sync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;

    this.syncInProgress = true;
    try {
      const pendingActions = await db.sync_queue.toArray();
      
      for (const action of pendingActions) {
        try {
          await this.processRemoteSync(action);
          await db.sync_queue.delete(action.id);
          console.log(`[FieldEngine] Sincronizado com sucesso: ${action.type}`);
        } catch (err) {
          console.error(`[FieldEngine] Falha ao sincronizar ${action.type}:`, err);
          // Incrementa retry count
          await db.sync_queue.update(action.id, { retryCount: action.retryCount + 1 });
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processRemoteSync(action: OfflineAction) {
    // Simulação de chamada de API real para o backend do sistema
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90% de chance de sucesso para simular ambiente real
        if (Math.random() > 0.1) resolve(true);
        else reject(new Error('Timeout de conexão'));
      }, 2000);
    });
  }

  // --- GEOLOCATION ---

  public startTracking(onUpdate: (coords: { lat: number, lng: number }) => void, onProximity: (property: Property) => void) {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onUpdate({ lat: latitude, lng: longitude });
      },
      (error) => console.error('FieldEngine GPS Error:', error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }

  public stopTracking() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
  }

  // --- VOICE & AI ---

  public async listen(): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return reject('Browser not supported');

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.onresult = (e: any) => resolve(e.results[0][0].transcript);
      recognition.onerror = (e: any) => reject(e.error);
      recognition.start();
    });
  }

  public async suggestCaption(room: string): Promise<string> {
    const captions: Record<string, string> = {
      'SALA': 'Ampla sala com design contemporâneo e excelente iluminação natural.',
      'QUARTO': 'Suíte arejada com armários embutidos de alta qualidade.',
      'COZINHA': 'Cozinha americana planejada com acabamento em quartzo.',
      'FACHADA': 'Fachada moderna em vidro e concreto aparente, presença marcante.'
    };
    return captions[room.toUpperCase()] || 'Detalhe exclusivo do imóvel.';
  }
}
