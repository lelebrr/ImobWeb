/**
 * Tipos para Publicação em Múltiplos Portais - ImobWeb 2026
 * Sistema de publicação simultânea com pacotes inteligentes
 */

export type PublicationStatus =
  | "DRAFT"
  | "PUBLISHING"
  | "PUBLISHED"
  | "SYNCING"
  | "ERROR"
  | "BLOCKED"
  | "EXPIRED";

export type PortalStatus =
  | "NOT_PUBLISHED"
  | "PENDING"
  | "PUBLISHED"
  | "ERROR"
  | "BLOCKED"
  | "DELETED";

export type PublicationPackageType =
  | "BASIC"
  | "HIGHLIGHT"
  | "SUPER_HIGHLIGHT"
  | "PREMIUM"
  | "CUSTOM";

export type HighlightLevel =
  | "NONE"
  | "STANDARD"
  | "PREMIUM"
  | "PREMIUM_PLUS"
  | "DESTAQUE"
  | "SUPER_DESTAQUE";

export type PublicationLogType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "REPUBLISH"
  | "SYNC";

export interface PortalConfig {
  portalId: string;
  portalName: string;
  enabled: boolean;
  highlightLevel: HighlightLevel;
  additionalPrice?: number;
  customFields?: Record<string, any>;
}

export interface PublicationPackage {
  id: string;
  name: string;
  description: string;
  type: PublicationPackageType;
  portals: PortalConfig[];
  durationDays: number;
  isHighlight: boolean;
  highlightLevel?: HighlightLevel;
  price: number;
  isActive: boolean;
  isDefault?: boolean;
}

export interface Publication {
  id: string;
  propertyId: string;
  organizationId: string;
  packageId: string;
  package?: PublicationPackage;
  status: PublicationStatus;
  publishedAt?: Date;
  expiresAt?: Date;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyAnnouncement {
  id: string;
  publicationId: string;
  portalId: string;
  portalName: string;
  portalType: string;
  externalId?: string;
  status: PortalStatus;
  url?: string;
  errorMessage?: string;
  publishedAt?: Date;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicationLog {
  id: string;
  publicationId: string;
  portalId: string;
  type: PublicationLogType;
  status: "SUCCESS" | "ERROR";
  message?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export interface PublishRequest {
  propertyId: string;
  packageId: string;
  forceRepublish?: boolean;
  customPortals?: string[];
}

export interface SyncRequest {
  propertyId: string;
  field: "PRICE" | "PHOTOS" | "DESCRIPTION" | "STATUS" | "ALL";
  forceSync?: boolean;
}

export interface PublicationStats {
  total: number;
  published: number;
  pending: number;
  error: number;
  blocked: number;
  byPortal: Record<
    string,
    {
      total: number;
      published: number;
      error: number;
    }
  >;
}

export interface HealthCheckResult {
  isHealthy: boolean;
  issues: string[];
  lastCheck: Date;
  portalStatus: Record<
    string,
    {
      status: "OK" | "ERROR" | "WARNING";
      message?: string;
      lastSync?: Date;
    }
  >;
}
