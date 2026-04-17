export type PortalType = 'ZAP' | 'VIVAREAL' | 'OLX' | 'IMOVELWEB' | 'CHAVES_NA_MAO' | 'VRSYNC' | 'MERCADO_LIVRE' | 'PROPRIETARIO_DIRETO' | 'IMOBIBRASIL' | 'LOFT' | 'QUINTO_ANDAR' | 'CUSTOM';
export type PortalId = 'zap' | 'viva' | 'olx' | 'imovelweb' | 'chaves' | 'mercado_livre' | 'proprietario_direto' | 'imobibrasil' | 'loft' | 'quinto_andar' | 'meta' | 'vrsync' | 'custom';

export enum PortalIntegrationStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  SUSPENSO = 'SUSPENSO',
  ERRO = 'ERRO',
  AGUARDANDO_CONFIG = 'AGUARDANDO_CONFIG'
}

export interface LeadFromPortal {
  id: string;
  portalId: PortalId;
  propertyExternalId?: string;
  propertyId?: string;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  source: string;
  receivedAt: Date | string;
}

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SUCCESS' | 'ERROR' | 'CONFLICT';

export interface PortalConfig {
  id: string;
  name: string;
  type: PortalType;
  enabled: boolean;
  settings: PortalSettings;
  lastSync?: Date;
  syncCount: number;
  errorCount: number;
  status: PortalIntegrationStatus;
  metadata?: Record<string, any>;
}

export interface PortalSettings {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
  authType: 'api_key' | 'oauth' | 'basic_auth' | 'bearer_token';
  webhookUrl?: string;
  defaultCategory?: string;
  defaultPackage?: string;
  autoPublish?: boolean;
  syncInterval?: number; // in minutes
  retryAttempts?: number;
  timeout?: number; // in seconds
  customFields?: Record<string, string>;
  mappingRules?: FieldMapping[];
}

export interface SyncResult {
  success: boolean;
  portalId: string;
  propertyId: string;
  externalId?: string;
  timestamp: Date;
  error?: string;
  details?: any;
  retryCount?: number;
  executionTime?: number; // in milliseconds
  responseCode?: number;
  responseMessage?: string;
}

export interface SyncBatchResult {
  total: number;
  success: number;
  failed: number;
  results: SyncResult[];
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface PropertyValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100
  compliance: {
    minimumRequirements: boolean;
    qualityStandards: boolean;
    completeness: boolean;
  };
}

export interface PortalAnalytics {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalClicks: number;
  totalLeads: number;
  averageViewsPerListing: number;
  averageClicksPerListing: number;
  conversionRate: number;
  topPerformingListings: Array<{
    id: string;
    title: string;
    views: number;
    clicks: number;
    leads: number;
  }>;
  performanceByCategory: Record<string, {
    listings: number;
    views: number;
    clicks: number;
    leads: number;
  }>;
}

export interface IntegrationHealth {
  status: 'healthy' | 'warning' | 'critical' | 'down';
  lastCheck: Date;
  uptime: number; // percentage
  responseTime: number; // average in ms
  errorRate: number; // percentage
  apiLimitStatus: {
    used: number;
    total: number;
    remaining: number;
    resetTime: Date;
  };
  syncQueue: {
    pending: number;
    processing: number;
    failed: number;
  };
}

export interface PortalAdapter {
  createProperty(data: Record<string, unknown>): Promise<string>;
  updateProperty(externalId: string, data: Record<string, unknown>): Promise<void>;
  deleteProperty(externalId: string): Promise<void>;
  getProperty(externalId: string): Promise<Record<string, unknown>>;
  getLeads(): Promise<any[]>;
  getAnalytics(propertyId?: string): Promise<Record<string, unknown>>;
  validateProperty(property: any): { valid: boolean; errors?: string[] };
}

export interface FieldMapping {
  internal: string;
  external: string;
  transform?: (value: any) => any;
  required?: boolean;
}

export interface PortalConnector {
  format: 'XML_VRSYNC' | 'XML_IMOBILEWEB' | 'XML_CHAVES_NA_MAO' | 'XML_DEDICADO' | 'API_MERCADO_LIVRE' | 'API_PARCEIRO' | 'MANUAL' | 'FECHADA';
  generateFeed?: (properties: any[]) => string;
  pushUpdate?: (property: any) => Promise<SyncResult>;
  validateProperty: (property: any) => { valid: boolean; errors?: string[] };
  requiresAuth?: boolean;
  authMethod?: 'api_key' | 'oauth' | 'basic_auth' | 'bearer_token';
  endpoint?: string;
  rateLimit?: number; // requests per minute
  supportsBatch?: boolean;
  supportsHighlights?: boolean;
  supportsVirtualTour?: boolean;
  maxPhotos?: number;
  maxTitleLength?: number;
  minPhotos?: number;
}
