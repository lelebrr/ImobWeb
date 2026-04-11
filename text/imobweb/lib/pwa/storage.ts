export interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export class PWAStorage {
  private static DB_NAME = 'imobweb-pwa';
  private static DB_VERSION = 1;

  static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('properties')) {
          db.createObjectStore('properties', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('leads')) {
          db.createObjectStore('leads', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  static async set<T>(store: string, key: string, value: T, expiryMs?: number): Promise<void> {
    const db = await this.openDB();
    const item: StorageItem<T> = {
      data: value,
      timestamp: Date.now(),
      expiry: expiryMs ? Date.now() + expiryMs : undefined,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put({ id: key, ...item });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async get<T>(store: string, key: string): Promise<T | null> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as StorageItem<T> | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        if (result.expiry && Date.now() > result.expiry) {
          this.delete(store, key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  static async delete(store: string, key: string): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async getAll<T>(store: string): Promise<T[]> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result as StorageItem<T>[];
        const valid = results
          .filter(r => !r.expiry || Date.now() <= r.expiry)
          .map(r => r.data);
        resolve(valid);
      };
    });
  }

  static async clear(store: string): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  static async addToSyncQueue(action: string, data: Record<string, unknown>): Promise<number> {
    return this.set('syncQueue', `sync_${Date.now()}`, { action, data, createdAt: Date.now() });
  }

  static async getSyncQueue(): Promise<Array<{ action: string; data: Record<string, unknown>; createdAt: number }>> {
    return this.getAll('syncQueue');
  }

  static async clearSyncQueue(): Promise<void> {
    return this.clear('syncQueue');
  }
}

export const pwaStorage = {
  properties: {
    async set(id: string, data: unknown, expiryMs = 24 * 60 * 60 * 1000) {
      return PWAStorage.set('properties', id, data, expiryMs);
    },
    async get(id: string) {
      return PWAStorage.get('properties', id);
    },
    async getAll() {
      return PWAStorage.getAll('properties');
    },
    async delete(id: string) {
      return PWAStorage.delete('properties', id);
    },
  },
  leads: {
    async set(id: string, data: unknown, expiryMs = 60 * 60 * 1000) {
      return PWAStorage.set('leads', id, data, expiryMs);
    },
    async get(id: string) {
      return PWAStorage.get('leads', id);
    },
    async getAll() {
      return PWAStorage.getAll('leads');
    },
  },
  cache: {
    async set(key: string, data: unknown, expiryMs = 5 * 60 * 1000) {
      return PWAStorage.set('cache', key, data, expiryMs);
    },
    async get<T>(key: string): Promise<T | null> {
      return PWAStorage.get<T>('cache', key);
    },
  },
};
