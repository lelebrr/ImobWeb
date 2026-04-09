import type {
  PortalId,
  PortalConfig,
  SyncQueueItem,
  SyncDirection,
  PortalSyncResult,
  SyncError,
  PropertyPortalMapping,
  ConflictData,
  PropertyStatus
} from '@/types/portals';

export interface SyncEngineConfig {
  maxRetries: number;
  retryDelayMs: number;
  maxConcurrentSyncs: number;
  syncIntervalMs: number;
  conflictCheckIntervalMs: number;
  batchSize: number;
}

const DEFAULT_CONFIG: SyncEngineConfig = {
  maxRetries: 3,
  retryDelayMs: 5000,
  maxConcurrentSyncs: 5,
  syncIntervalMs: 120000,
  conflictCheckIntervalMs: 60000,
  batchSize: 50
};

export class SyncEngine {
  private config: SyncEngineConfig;
  private syncQueue: Map<string, SyncQueueItem> = new Map();
  private activeSyncs: Set<string> = new Set();
  private portalConfigs: Map<PortalId, PortalConfig> = new Map();
  private propertyMappings: Map<string, PropertyPortalMapping[]> = new Map();
  private syncHistory: PortalSyncResult[] = [];
  private listeners: Map<string, Set<(event: SyncEvent) => void>> = new Map();

  constructor(config: Partial<SyncEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  registerPortal(config: PortalConfig): void {
    this.portalConfigs.set(config.id, config);
  }

  unregisterPortal(portalId: PortalId): void {
    this.portalConfigs.delete(portalId);
  }

  getPortalConfig(portalId: PortalId): PortalConfig | undefined {
    return this.portalConfigs.get(portalId);
  }

  getAllPortalConfigs(): PortalConfig[] {
    return Array.from(this.portalConfigs.values());
  }

  async queueSync(
    propertyId: string,
    portalId: PortalId,
    action: 'create' | 'update' | 'delete',
    data?: Record<string, unknown>,
    priority: number = 5
  ): Promise<string> {
    const queueItem: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      propertyId,
      portalId,
      action,
      data,
      priority,
      attempts: 0,
      maxAttempts: this.config.maxRetries,
      createdAt: new Date()
    };
    
    this.syncQueue.set(queueItem.id, queueItem);
    await this.persistQueue();
    this.emitEvent('sync.queued', { propertyId, portalId, action });
    
    return queueItem.id;
  }

  async processQueue(): Promise<PortalSyncResult[]> {
    const results: PortalSyncResult[] = [];
    const sortedQueue = this.getSortedQueue();
    const activePortals = new Set<PortalId>();
    
    for (const item of sortedQueue) {
      if (activePortals.size >= this.config.maxConcurrentSyncs) break;
      if (this.activeSyncs.has(item.id)) continue;
      
      const portalConfig = this.portalConfigs.get(item.portalId);
      if (!portalConfig?.enabled) continue;
      
      activePortals.add(item.portalId);
      this.activeSyncs.add(item.id);
      
      const result = await this.processSyncItem(item);
      results.push(result);
      
      this.activeSyncs.delete(item.id);
      activePortals.delete(item.portalId);
      
      if (result.success) {
        this.syncQueue.delete(item.id);
      }
    }
    
    await this.persistQueue();
    return results;
  }

  private async processSyncItem(item: SyncQueueItem): Promise<PortalSyncResult> {
    const startTime = Date.now();
    const errors: SyncError[] = [];
    let propertiesSuccess = 0;
    let propertiesFailed = 0;
    
    try {
      const portalAdapter = this.getPortalAdapter(item.portalId);
      if (!portalAdapter) {
        throw new Error(`No adapter found for portal: ${item.portalId}`);
      }
      
      const mapping = this.propertyMappings.get(item.propertyId)?.find(m => m.portalId === item.portalId);
      
      switch (item.action) {
        case 'create':
          if (mapping?.externalId) {
            await portalAdapter.updateProperty(mapping.externalId, item.data);
          } else {
            const externalId = await portalAdapter.createProperty(item.data);
            await this.updateMapping(item.propertyId, item.portalId, externalId);
          }
          propertiesSuccess++;
          break;
          
        case 'update':
          if (mapping?.externalId) {
            await portalAdapter.updateProperty(mapping.externalId, item.data);
            propertiesSuccess++;
          } else {
            const externalId = await portalAdapter.createProperty(item.data);
            await this.updateMapping(item.propertyId, item.portalId, externalId);
            propertiesSuccess++;
          }
          break;
          
        case 'delete':
          if (mapping?.externalId) {
            await portalAdapter.deleteProperty(mapping.externalId);
          }
          await this.removeMapping(item.propertyId, item.portalId);
          propertiesSuccess++;
          break;
      }
      
      await this.updateMappingSyncStatus(item.propertyId, item.portalId, 'synced');
      
    } catch (error) {
      propertiesFailed++;
      errors.push({
        propertyId: item.propertyId,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error ? error.message : undefined,
        timestamp: new Date()
      });
      
      item.attempts++;
      if (item.attempts < item.maxAttempts) {
        item.lastAttempt = new Date();
        item.scheduledFor = new Date(Date.now() + this.config.retryDelayMs * item.attempts);
      } else {
        await this.updateMappingSyncStatus(item.propertyId, item.portalId, 'failed');
        this.syncQueue.delete(item.id);
      }
    }
    
    const result: PortalSyncResult = {
      portalId: item.portalId,
      success: propertiesFailed === 0,
      propertiesProcessed: propertiesSuccess + propertiesFailed,
      propertiesSuccess,
      propertiesFailed,
      errors,
      duration: Date.now() - startTime,
      timestamp: new Date()
    };
    
    this.syncHistory.push(result);
    if (this.syncHistory.length > 1000) {
      this.syncHistory = this.syncHistory.slice(-500);
    }
    
    this.emitEvent('sync.completed', result);
    
    return result;
  }

  private getSortedQueue(): SyncQueueItem[] {
    return Array.from(this.syncQueue.values())
      .filter(item => {
        if (item.scheduledFor && item.scheduledFor > new Date()) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  private getPortalAdapter(portalId: PortalId): PortalAdapter | null {
    return portalAdapters.get(portalId) ?? null;
  }

  private async updateMapping(propertyId: string, portalId: PortalId, externalId: string): Promise<void> {
    const existing = this.propertyMappings.get(propertyId) || [];
    const index = existing.findIndex(m => m.portalId === portalId);
    
    const mapping: PropertyPortalMapping = {
      propertyId,
      portalId,
      externalId,
      lastSync: new Date(),
      syncStatus: 'synced'
    };
    
    if (index >= 0) {
      existing[index] = mapping;
    } else {
      existing.push(mapping);
    }
    
    this.propertyMappings.set(propertyId, existing);
    await this.persistMappings();
  }

  private async removeMapping(propertyId: string, portalId: PortalId): Promise<void> {
    const existing = this.propertyMappings.get(propertyId) || [];
    const filtered = existing.filter(m => m.portalId !== portalId);
    this.propertyMappings.set(propertyId, filtered);
    await this.persistMappings();
  }

  private async updateMappingSyncStatus(
    propertyId: string,
    portalId: PortalId,
    status: PropertyPortalMapping['syncStatus']
  ): Promise<void> {
    const existing = this.propertyMappings.get(propertyId) || [];
    const index = existing.findIndex(m => m.portalId === portalId);
    
    if (index >= 0) {
      existing[index].syncStatus = status;
      existing[index].lastSync = new Date();
      this.propertyMappings.set(propertyId, existing);
      await this.persistMappings();
    }
  }

  async checkConflicts(propertyId: string): Promise<ConflictData[]> {
    const conflicts: ConflictData[] = [];
    const mappings = this.propertyMappings.get(propertyId) || [];
    
    for (const mapping of mappings) {
      if (!mapping.externalId) continue;
      
      const portalAdapter = this.getPortalAdapter(mapping.portalId);
      if (!portalAdapter) continue;
      
      try {
        const remoteData = await portalAdapter.getProperty(mapping.externalId);
        const localData = await this.getLocalPropertyData(propertyId);
        
        const fieldConflicts = this.detectFieldConflicts(localData, remoteData, mapping.portalId);
        conflicts.push(...fieldConflicts);
        
        if (fieldConflicts.length > 0) {
          await this.updateMappingSyncStatus(propertyId, mapping.portalId, 'conflict');
        }
      } catch (error) {
        console.error(`Error checking conflicts for ${propertyId} on ${mapping.portalId}:`, error);
      }
    }
    
    return conflicts;
  }

  private detectFieldConflicts(
    localData: Record<string, unknown>,
    remoteData: Record<string, unknown>,
    portalId: PortalId
  ): ConflictData[] {
    const conflicts: ConflictData[] = [];
    const fieldMapping = this.getFieldMapping(portalId);
    
    const trackedFields = ['price', 'title', 'description', 'status', 'address'];
    
    for (const field of trackedFields) {
      const localValue = localData[field];
      const remoteValue = remoteData[field];
      
      if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
        conflicts.push({
          field,
          localValue,
          remoteValue,
          detectedAt: new Date(),
          resolution: undefined
        });
      }
    }
    
    return conflicts;
  }

  private getFieldMapping(portalId: PortalId): Record<string, string> {
    return fieldMappings[portalId] || {};
  }

  private async getLocalPropertyData(propertyId: string): Promise<Record<string, unknown>> {
    return {};
  }

  async resolveConflict(
    propertyId: string,
    portalId: PortalId,
    resolution: 'local' | 'remote' | 'manual'
  ): Promise<void> {
    const mappings = this.propertyMappings.get(propertyId);
    const mapping = mappings?.find(m => m.portalId === portalId);
    
    if (!mapping?.conflictData) return;
    
    if (resolution === 'local') {
      const localData = await this.getLocalPropertyData(propertyId);
      await this.queueSync(propertyId, portalId, 'update', localData);
    } else if (resolution === 'remote') {
      const portalAdapter = this.getPortalAdapter(portalId);
      if (portalAdapter && mapping.externalId) {
        const remoteData = await portalAdapter.getProperty(mapping.externalId);
        await this.applyRemoteData(propertyId, remoteData);
      }
    }
    
    mapping.conflictData = undefined;
    mapping.syncStatus = 'synced';
    this.propertyMappings.set(propertyId, mappings || []);
    await this.persistMappings();
    
    this.emitEvent('conflict.resolved', { propertyId, portalId, resolution });
  }

  private async applyRemoteData(propertyId: string, data: Record<string, unknown>): Promise<void> {
    console.log('Applying remote data to property:', propertyId, data);
  }

  getSyncStatus(): { queued: number; active: number; completed: number } {
    return {
      queued: this.syncQueue.size,
      active: this.activeSyncs.size,
      completed: this.syncHistory.length
    };
  }

  getSyncHistory(portalId?: PortalId, limit: number = 50): PortalSyncResult[] {
    let history = this.syncHistory;
    if (portalId) {
      history = history.filter(h => h.portalId === portalId);
    }
    return history.slice(-limit);
  }

  getPropertyMappings(propertyId: string): PropertyPortalMapping[] {
    return this.propertyMappings.get(propertyId) || [];
  }

  on(event: string, callback: (event: SyncEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (event: SyncEvent) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emitEvent(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb({ type: event, data, timestamp: new Date() } as SyncEvent));
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      const queue = Array.from(this.syncQueue.values());
      const serialized = JSON.stringify(queue);
      if (typeof window !== 'undefined') {
        localStorage.setItem('imobweb_sync_queue', serialized);
      }
    } catch (error) {
      console.error('Error persisting sync queue:', error);
    }
  }

  private async persistMappings(): Promise<void> {
    try {
      const mappings: Record<string, PropertyPortalMapping[]> = {};
      this.propertyMappings.forEach((value, key) => {
        mappings[key] = value;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('imobweb_property_mappings', JSON.stringify(mappings));
      }
    } catch (error) {
      console.error('Error persisting property mappings:', error);
    }
  }
}

interface SyncEvent {
  type: string;
  data: unknown;
  timestamp: Date;
}

interface PortalAdapter {
  createProperty(data: Record<string, unknown>): Promise<string>;
  updateProperty(externalId: string, data: Record<string, unknown>): Promise<void>;
  deleteProperty(externalId: string): Promise<void>;
  getProperty(externalId: string): Promise<Record<string, unknown>>;
  getLeads(): Promise<LeadData[]>;
}

interface LeadData {
  id: string;
  propertyId: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  receivedAt: Date;
}

const portalAdapters: Map<PortalId, PortalAdapter> = new Map();

export function registerPortalAdapter(portalId: PortalId, adapter: PortalAdapter): void {
  portalAdapters.set(portalId, adapter);
}

const fieldMappings: Record<PortalId, Record<string, string>> = {
  zap: {
    title: 'titulo',
    description: 'descricao',
    price: 'valor',
    address: 'endereco',
    bedrooms: 'quartos',
    bathrooms: 'banheiros',
    area: 'area',
    propertyType: 'tipoImovel',
    transactionType: 'tipoAnuncio'
  },
  viva: {
    title: 'Titulo',
    description: 'Descricao',
    price: 'Preco',
    address: 'Endereco',
    bedrooms: 'NumeroQuartos',
    bathrooms: 'NumeroBanheiros',
    area: 'AreaTotal',
    propertyType: 'TipoImovel',
    transactionType: 'TipoNegocio'
  },
  olx: {
    title: 'title',
    description: 'description',
    price: 'price',
    location: 'location',
    category: 'category'
  },
  imovelweb: {},
  chaves: {},
  meta: {},
  vrsync: {}
};

export const syncEngine = new SyncEngine();