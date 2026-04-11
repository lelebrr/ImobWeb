export type PortalType = 'ZAP' | 'VIVAREAL' | 'OLX' | 'IMOVELWEB' | 'CHAVES_NA_MAO' | 'VRSYNC' | 'CUSTOM';
export type PortalId = 'zap' | 'viva' | 'olx' | 'imovelweb' | 'chaves' | 'meta' | 'vrsync' | 'custom';

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
  settings: Record<string, any>;
  lastSync?: Date;
}

export interface SyncResult {
  success: boolean;
  portalId: string;
  propertyId: string;
  externalId?: string;
  timestamp: Date;
  error?: string;
  details?: any;
}

export interface FieldMapping {
  internal: string;
  external: string;
  transform?: (value: any) => any;
  required?: boolean;
}

export interface PortalConnector {
  format: 'XML' | 'JSON' | 'API';
  generateFeed?: (properties: any[]) => string;
  pushUpdate?: (property: any) => Promise<SyncResult>;
  validateProperty: (property: any) => { valid: boolean; errors?: string[] };
}
