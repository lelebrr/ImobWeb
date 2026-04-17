import { PrismaClient } from '@prisma/client';
import { SyncResult, SyncStatus, PortalType, PortalId } from '../../types/portals';
import { portalValidator } from './validator';
import { autoMaintenance } from './auto-maintenance';
import { getPortalAdapter } from './adapters';
import { generateXml } from './xml-generator';
import { selectPortalsAutomatically, PortalConfig } from './auto-selector';

const prisma = new PrismaClient();

/**
 * Interface para adaptadores de portais externos
 */
export interface PortalAdapter {
  createProperty(data: Record<string, unknown>): Promise<string>;
  updateProperty(externalId: string, data: Record<string, unknown>): Promise<void>;
  deleteProperty(externalId: string): Promise<void>;
  getProperty(externalId: string): Promise<Record<string, unknown>>;
  getLeads(): Promise<any[]>;
  getAnalytics(propertyId?: string): Promise<Record<string, unknown>>;
}

/**
 * Detalhes de sincronização bidirecional
 */
export interface SyncDetails {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';
  direction: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
  externalId?: string;
  portalData?: Record<string, unknown>;
  localData?: Record<string, unknown>;
  conflicts?: Conflict[];
  metadata?: Record<string, unknown>;
}

/**
 * Representa um conflito de sincronização
 */
export interface Conflict {
  type: 'DATA_MISMATCH' | 'STATUS_CONFLICT' | 'PRICE_CONFLICT' | 'TITLE_CONFLICT';
  field: string;
  localValue: any;
  remoteValue: any;
  resolution: 'LOCAL_WINS' | 'REMOTE_WINS' | 'MANUAL_REVIEW';
  timestamp: Date;
}

/**
 * Resultado detalhado da sincronização bidirecional
 */
export interface BidirectionalSyncResult extends SyncResult {
  details: SyncDetails;
  conflicts: Conflict[];
  resolution: 'SUCCESS' | 'CONFLICTS_RESOLVED' | 'CONFLICTS_PENDING' | 'FAILED';
  executionTime: number;
}

/**
 * Motor de Sincronização Bidirecional Avançado (Sync Engine)
 * Responsável por orquestrar a publicação e atualização de imóveis nos portais.
 */
export class SyncEngine {
  /**
   * Sincroniza um imóvel específico com um portal (bidirecional)
   */
  async syncProperty(propertyId: string, portalId: PortalId): Promise<BidirectionalSyncResult> {
    const startTime = Date.now();
    const timestamp = new Date();

    // 1. Buscar dados do imóvel e da integração
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        photos: true,
        announcements: { where: { portalId } },
        owner: true
      }
    });

    const integration = await prisma.portalIntegration.findUnique({
      where: { id: portalId }
    });

    if (!property || !integration) {
      return {
        success: false,
        portalId,
        propertyId,
        timestamp,
        error: 'Property or Integration not found',
        details: { action: 'SYNC', direction: 'BIDIRECTIONAL' },
        conflicts: [],
        resolution: 'FAILED',
        executionTime: Date.now() - startTime
      };
    }

    try {
      // 2. Obter adaptador do portal
      const adapter = getPortalAdapter(portalId, integration.settings);
      if (!adapter) {
        throw new Error(`Adapter not found for portal ${portalId}`);
      }

      // 3. Detecção de Conflitos
      const conflicts = await this.detectConflicts(property, portalId, adapter);

      // 4. Validar imóvel para o portal específico
      const { valid, errors } = portalValidator.validate(property, integration.type as any);
      if (!valid) {
        return {
          success: false,
          portalId,
          propertyId,
          timestamp,
          error: `Validation failed: ${errors.join(', ')}`,
          details: { action: 'SYNC', direction: 'BIDIRECTIONAL' },
          conflicts,
          resolution: 'FAILED',
          executionTime: Date.now() - startTime
        };
      }

      // 5. Sincronização bidirecional
      const syncDetails: SyncDetails = {
        action: 'SYNC',
        direction: 'BIDIRECTIONAL',
        metadata: { propertyId, portalId, startTime }
      };

      const announcement = property.announcements[0];
      const externalId = announcement?.externalId || `imob-${property.code || property.id}`;

      // 6. Sincronização PULL (baixar dados do portal)
      if (announcement?.externalId) {
        const remoteData = await adapter.getProperty(externalId);
        syncDetails.portalData = remoteData;

        // Verificar se há diferenças que precisam ser sincronizadas
        const differences = this.compareData(property, remoteData);
        if (differences.length > 0) {
          syncDetails.conflicts = differences;

          // Resolver conflitos automaticamente (CRM vence em 2026)
          const resolvedData = this.resolveConflicts(property, remoteData);
          syncDetails.localData = resolvedData;
        }
      }

      // 7. Sincronização PUSH (enviar dados para o portal)
      const propertyData = this.preparePropertyData(property);
      let pushAction: 'CREATE' | 'UPDATE' = 'CREATE';

      if (announcement?.externalId) {
        try {
          await adapter.updateProperty(externalId, propertyData);
          pushAction = 'UPDATE';
          syncDetails.action = pushAction;
        } catch (updateError) {
          // Se falhar ao atualizar, tentar criar
          try {
            await adapter.createProperty(propertyData);
            pushAction = 'CREATE';
            syncDetails.action = pushAction;
          } catch (createError) {
            throw createError;
          }
        }
      } else {
        const newExternalId = await adapter.createProperty(propertyData);
        syncDetails.externalId = newExternalId;
        syncDetails.action = 'CREATE';
      }

      // 8. Atualizar status do anúncio no banco de dados
      await prisma.announcement.upsert({
        where: {
          externalId_portalId: {
            externalId: syncDetails.externalId || externalId,
            portalId
          }
        },
        create: {
          propertyId,
          portalId,
          externalId: syncDetails.externalId || externalId,
          title: property.title,
          portalType: integration.type,
          status: 'PUBLICADO',
          lastSync: timestamp,
          price: property.price
        },
        update: {
          title: property.title,
          status: 'PUBLICADO',
          lastSync: timestamp,
          price: property.price
        }
      });

      // 9. Atualizar estatísticas da integração
      await prisma.portalIntegration.update({
        where: { id: portalId },
        data: {
          lastSync: timestamp,
          syncCount: { increment: 1 },
          errorCount: { increment: conflicts.length > 0 ? 1 : 0 }
        }
      });

      return {
        success: true,
        portalId,
        propertyId,
        externalId: syncDetails.externalId || externalId,
        timestamp,
        error: undefined,
        details: syncDetails,
        conflicts,
        resolution: conflicts.length > 0 ? 'CONFLICTS_RESOLVED' : 'SUCCESS',
        executionTime: Date.now() - startTime
      };

    } catch (error: any) {
      console.error(`[SyncEngine] Error syncing property ${propertyId}:`, error);
      return {
        success: false,
        portalId,
        propertyId,
        timestamp,
        error: error.message,
        details: { action: 'SYNC', direction: 'BIDIRECTIONAL' },
        conflicts: [],
        resolution: 'FAILED',
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Sincroniza um imóvel com múltiplos portais automaticamente
   */
  async syncPropertyWithMultiplePortals(
    propertyId: string,
    priority: 'performance' | 'reach' | 'cost' | 'quality' = 'performance'
  ): Promise<BidirectionalSyncResult[]> {

    // 1. Buscar configurações de portais ativos
    const integrations = await prisma.portalIntegration.findMany({
      where: {
        enabled: true,
        status: 'ATIVO',
        organizationId: (await prisma.property.findUnique({
          where: { id: propertyId }
        }))?.organizationId
      }
    });

    if (integrations.length === 0) {
      throw new Error('No active integrations found');
    }

    // 2. Buscar dados do imóvel
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { photos: true, owner: true }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // 3. Converter para PortalConfig
    const portalConfigs: PortalConfig[] = integrations.map(int => ({
      id: int.id,
      name: int.name || '',
      type: int.type,
      enabled: int.enabled,
      settings: int.settings,
      lastSync: int.lastSync,
      syncCount: int.syncCount || 0,
      errorCount: int.errorCount || 0,
      status: int.status
    }));

    // 4. Selecionar portais automaticamente
    const selectedPortals = selectPortalsAutomatically(
      portalConfigs,
      property,
      priority
    ).selectedPortals;

    // 5. Sincronizar com cada portal selecionado
    const results = await Promise.allSettled(
      selectedPortals.map(portalId => this.syncProperty(propertyId, portalId as PortalId))
    );

    // 6. Processar resultados
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          portalId: selectedPortals[index] as PortalId,
          propertyId,
          timestamp: new Date(),
          error: (result.reason as Error).message,
          details: { action: 'SYNC', direction: 'BIDIRECTIONAL' },
          conflicts: [],
          resolution: 'FAILED',
          executionTime: 0
        };
      }
    });
  }

  /**
   * Sincronização bidirecional completa (pull + push)
   */
  async bidirectionalSync(propertyId: string, portalId: PortalId): Promise<BidirectionalSyncResult> {
    return this.syncProperty(propertyId, portalId);
  }

  /**
   * Sincronização apenas de pull (baixar dados do portal)
   */
  async pullSync(propertyId: string, portalId: PortalId): Promise<BidirectionalSyncResult> {
    const startTime = Date.now();
    const timestamp = new Date();

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        photos: true,
        announcements: { where: { portalId } }
      }
    });

    const integration = await prisma.portalIntegration.findUnique({
      where: { id: portalId }
    });

    if (!property || !integration) {
      throw new Error('Property or Integration not found');
    }

    const adapter = getPortalAdapter(portalId, integration.settings);
    if (!adapter) {
      throw new Error(`Adapter not found for portal ${portalId}`);
    }

    try {
      const announcement = property.announcements[0];
      if (!announcement?.externalId) {
        throw new Error('No external ID found for pull sync');
      }

      const remoteData = await adapter.getProperty(announcement.externalId);

      // Atualizar dados locais com dados remotos
      await this.updateLocalPropertyData(propertyId, remoteData);

      return {
        success: true,
        portalId,
        propertyId,
        externalId: announcement.externalId,
        timestamp,
        error: undefined,
        details: {
          action: 'SYNC',
          direction: 'PULL',
          portalData: remoteData,
          localData: property
        },
        conflicts: [],
        resolution: 'SUCCESS',
        executionTime: Date.now() - startTime
      };

    } catch (error: any) {
      return {
        success: false,
        portalId,
        propertyId,
        timestamp,
        error: error.message,
        details: { action: 'SYNC', direction: 'PULL' },
        conflicts: [],
        resolution: 'FAILED',
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Sincronização apenas de push (enviar dados para o portal)
   */
  async pushSync(propertyId: string, portalId: PortalId): Promise<BidirectionalSyncResult> {
    return this.syncProperty(propertyId, portalId);
  }

  /**
   * Força a sincronização completa de todos os imóveis ativos para um portal
   */
  async syncAll(portalId: PortalId): Promise<BidirectionalSyncResult[]> {
    const integration = await prisma.portalIntegration.findUnique({
      where: { id: portalId }
    });

    if (!integration) throw new Error('Integration not found');

    const activeProperties = await prisma.property.findMany({
      where: {
        status: 'DISPONIVEL',
        organizationId: integration.id
      },
      select: { id: true }
    });

    const results = await Promise.allSettled(
      activeProperties.map(p => this.syncProperty(p.id, portalId))
    );

    // Processar resultados
    const processedResults: BidirectionalSyncResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          portalId,
          propertyId: activeProperties[index].id,
          timestamp: new Date(),
          error: (result.reason as Error).message,
          details: { action: 'SYNC', direction: 'BIDIRECTIONAL' },
          conflicts: [],
          resolution: 'FAILED',
          executionTime: 0
        };
      }
    });

    // Atualizar stats da integração
    const successCount = processedResults.filter(r => r.success).length;
    const errorCount = processedResults.filter(r => !r.success).length;

    await prisma.portalIntegration.update({
      where: { id: portalId },
      data: {
        lastSync: new Date(),
        syncCount: { increment: 1 },
        errorCount: { increment: errorCount }
      }
    });

    return processedResults;
  }

  /**
   * Executa a rotina de manutenção automática
   */
  async runMaintenance() {
    const staleListings = await autoMaintenance.checkStaleListings();
    if (staleListings.length > 0) {
      await autoMaintenance.notifyOwnersOfStaleListings(staleListings.map(l => l.id));
    }
    return { count: staleListings.length };
  }

  /**
   * Detecta conflitos entre dados locais e remotos
   */
  private async detectConflicts(
    property: any,
    portalId: PortalId,
    adapter: PortalAdapter
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    const announcement = property.announcements[0];
    if (!announcement?.externalId) return conflicts;

    try {
      const remoteData = await adapter.getProperty(announcement.externalId);
      const differences = this.compareData(property, remoteData);
      conflicts.push(...differences);
    } catch (error) {
      console.warn(`[SyncEngine] Could not fetch remote data for conflict detection:`, error);
    }

    return conflicts;
  }

  /**
   * Compara dados locais e remotos para detectar diferenças
   */
  private compareData(local: any, remote: any): Conflict[] {
    const conflicts: Conflict[] = [];
    const fieldsToCompare = ['title', 'price', 'description', 'status'];

    for (const field of fieldsToCompare) {
      if (local[field] !== remote[field]) {
        conflicts.push({
          type: 'DATA_MISMATCH',
          field,
          localValue: local[field],
          remoteValue: remote[field],
          resolution: 'LOCAL_WINS',
          timestamp: new Date()
        });
      }
    }

    // Verificar conflitos de preço específicos
    if (local.price !== remote.price) {
      conflicts.push({
        type: 'PRICE_CONFLICT',
        field: 'price',
        localValue: local.price,
        remoteValue: remote.price,
        resolution: 'LOCAL_WINS',
        timestamp: new Date()
      });
    }

    // Verificar conflitos de título
    if (local.title !== remote.title) {
      conflicts.push({
        type: 'TITLE_CONFLICT',
        field: 'title',
        localValue: local.title,
        remoteValue: remote.title,
        resolution: 'LOCAL_WINS',
        timestamp: new Date()
      });
    }

    return conflicts;
  }

  /**
   * Resolve conflitos (CRM vence em 2026)
   */
  private resolveConflicts(local: any, remote: any): any {
    return { ...local }; // CRM vence, então usamos dados locais
  }

  /**
   * Prepara dados do imóvel para envio ao portal
   */
  private preparePropertyData(property: any): any {
    return {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      transactionType: property.transactionType,
      propertyType: property.propertyType,
      address: property.address,
      features: property.features,
      photos: property.photos.map((p: any) => p.url),
      videos: property.videos?.map((v: any) => v.url),
      owner: property.owner,
      status: property.status,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    };
  }

  /**
   * Atualiza dados locais com dados remotos
   */
  private async updateLocalPropertyData(propertyId: string, remoteData: any): Promise<void> {
    // Implementar lógica de atualização de dados locais
    // Isso pode envolver atualizar campos específicos do imóvel
    console.log(`[SyncEngine] Updating local data for property ${propertyId} with remote data`);
  }

  /**
   * Valida se o imóvel atende aos requisitos mínimos do portal desejado
   */
  private validateForPortal(property: any, type: PortalType): string[] {
    const errors: string[] = [];

    if (!property.title) errors.push('Title is required');
    if (!property.price && !property.priceRent) errors.push('Price is required');
    if (!property.photos || property.photos.length === 0) errors.push('At least one photo is required');

    // Regras específicas do Grupo OLX (Zap/VivaReal)
    if (['ZAP', 'VIVAREAL'].includes(type)) {
      if (!property.address) errors.push('Full address is required for Zap/VivaReal');
      if (property.photos.length < 3) errors.push('Zap requires at least 3 photos for better ranking');
    }

    return errors;
  }
}

export const syncEngine = new SyncEngine();
