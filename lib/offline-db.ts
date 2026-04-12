/**
 * ImobWeb Offline Database (Dexie.js) - 2026
 * 
 * Configuração do banco de dados IndexedDB para suporte offline completo.
 * Armazena imóveis, leads e uma fila de sincronização (Sync Queue).
 */

import Dexie, { type Table } from 'dexie';

// Interfaces baseadas no domínio Real Estate
export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  mainImage: string;
  status: 'active' | 'sold' | 'rented';
  updatedAt: number;
  isFavorite?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastInteraction: number;
  status: 'new' | 'contacted' | 'visiting' | 'closed';
}

export interface SyncAction {
  id?: number;
  type: 'CREATE_LEAD' | 'UPDATE_PRICE' | 'FAVORITE_PROPERTY' | 'REGISTER_VISIT';
  payload: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
}

export class ImobWebDB extends Dexie {
  properties!: Table<Property>;
  leads!: Table<Lead>;
  syncQueue!: Table<SyncAction>;

  constructor() {
    super('ImobWebOfflineDB');
    
    // Schema definition
    this.version(1).stores({
      properties: 'id, price, status, updatedAt',
      leads: 'id, name, phone, status',
      syncQueue: '++id, type, status, timestamp'
    });
  }
}

// Singleton instance
export const db = new ImobWebDB();

/**
 * Utilitários de Sync (Helper para o corretor)
 */

export async function addToSyncQueue(action: Omit<SyncAction, 'id' | 'timestamp' | 'status' | 'retryCount'>) {
  return await db.syncQueue.add({
    ...action,
    timestamp: Date.now(),
    status: 'pending',
    retryCount: 0
  });
}

export async function getPendingSyncCount() {
  return await db.syncQueue.where('status').equals('pending').count();
}

/**
 * Performance: O broker pode estar em um túnel ou área rural.
 * O IndexedDB garante que ele nunca perca um lead capturado durante a visita.
 */
