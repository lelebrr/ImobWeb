export type PortalId = 'zap' | 'viva' | 'olx' | 'imovelweb' | 'chaves' | 'meta' | 'vrsync';

export type PortalStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented' | 'inactive';

export type SyncDirection = 'push' | 'pull' | 'bidirectional';

export type SyncEvent = 
  | 'property.created'
  | 'property.updated'
  | 'property.deleted'
  | 'price.changed'
  | 'status.changed'
  | 'lead.received'
  | 'viewcount.updated';

export interface PortalCredentials {
  apiKey?: string;
  username?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  endpoint?: string;
}

export interface PortalConfig {
  id: PortalId;
  name: string;
  enabled: boolean;
  credentials: PortalCredentials;
  syncInterval: number;
  syncDirection: SyncDirection;
  syncFields: string[];
  autoPublish: boolean;
  autoDepublish: boolean;
  highlightPackage?: HighlightPackage;
  lastSync?: Date;
  lastError?: string;
}

export interface HighlightPackage {
  type: 'destaque' | 'super-destaque' | 'patrocinado' | 'gold' | 'silver';
  startDate?: Date;
  endDate?: Date;
}

export interface PortalSyncResult {
  portalId: PortalId;
  success: boolean;
  propertiesProcessed: number;
  propertiesSuccess: number;
  propertiesFailed: number;
  errors: SyncError[];
  duration: number;
  timestamp: Date;
}

export interface SyncError {
  propertyId: string;
  error: string;
  code?: string;
  timestamp: Date;
}

export interface SyncQueueItem {
  id: string;
  propertyId: string;
  portalId: PortalId;
  action: 'create' | 'update' | 'delete';
  data?: Record<string, unknown>;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledFor?: Date;
  lastAttempt?: Date;
}

export interface PropertyPortalMapping {
  propertyId: string;
  portalId: PortalId;
  externalId?: string;
  lastSync?: Date;
  syncStatus: 'synced' | 'pending' | 'failed' | 'conflict';
  conflictData?: ConflictData;
}

export interface ConflictData {
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  detectedAt: Date;
  resolution?: 'local' | 'remote' | 'manual';
}

export interface LeadFromPortal {
  id: string;
  portalId: PortalId;
  propertyExternalId: string;
  propertyId?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  receivedAt: Date;
}

export interface PortalAnalytics {
  portalId: PortalId;
  totalLeads: number;
  totalViews: number;
  totalContacts: number;
  averageResponseTime: number;
  conversionRate: number;
  period: { start: Date; end: Date };
}

export interface PortalFieldMapping {
  imobwebField: string;
  portalField: string;
  required: boolean;
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'number' | 'boolean' | 'date';
  defaultValue?: unknown;
  validate?: (value: unknown) => boolean;
}

export interface PortalSchema {
  portalId: PortalId;
  version: string;
  fields: PortalFieldMapping[];
  requiredFields: string[];
  optionalFields: string[];
  maxPhotos: number;
  maxPhotosSize: number;
  supportedPropertyTypes: string[];
  supportedTransactionTypes: string[];
}