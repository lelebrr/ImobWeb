/**
 * Publication Engine - ImobWeb 2026
 * Motor central de publicação simultânea em múltiplos portais
 */

import { prisma } from "@/lib/prisma";
import {
  Publication,
  PublicationPackage,
  PublicationStatus,
  PortalStatus,
  PublishRequest,
  SyncRequest,
  PortalConfig,
  PublicationStats,
  PropertyAnnouncement,
} from "@/types/publication";
import { PortalAdapter } from "@/lib/portals/adapters/base-adapter";

const DEFAULT_PORTALS = [
  "ZAP",
  "VIVA_REAL",
  "OLX",
  "IMOVELWEB",
  "CHAVES_NAMAO",
];

class PublicationEngine {
  private adapers: Map<string, PortalAdapter> = new Map();

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters() {
    console.log(
      "[PublicationEngine] Initialized with",
      DEFAULT_PORTALS.length,
      "adapters",
    );
  }

  async publish(request: PublishRequest): Promise<Publication> {
    const { propertyId, packageId, forceRepublish, customPortals } = request;

    console.log(
      "[PublicationEngine] Starting publication for property:",
      propertyId,
    );

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    });

    if (!property) {
      throw new Error("Property not found");
    }

    const pkg = await this.getPackage(packageId);
    if (!pkg) {
      throw new Error("Package not found");
    }

    const portals = customPortals || pkg.portals.map((p) => p.portalId);

    const publication = await prisma.publication.upsert({
      where: { id: propertyId },
      create: {
        id: propertyId,
        propertyId,
        tenantId: property.organizationId,
        packageId,
        status: "PUBLISHING",
        expiresAt: new Date(
          Date.now() + pkg.durationDays * 24 * 60 * 60 * 1000,
        ),
      },
      update: {
        packageId,
        status: "PUBLISHING",
        expiresAt: new Date(
          Date.now() + pkg.durationDays * 24 * 60 * 60 * 1000,
        ),
      },
    });

    const results = await this.publishToPortals(property, portals, pkg);

    const hasError = results.some((r) => r.status === "ERROR");
    await prisma.publication.update({
      where: { id: publication.id },
      data: {
        status: hasError ? "ERROR" : "PUBLISHED",
        publishedAt: hasError ? null : new Date(),
      },
    });

    for (const result of results) {
      await prisma.propertyAnnouncement.upsert({
        where: { id: result.id },
        create: {
          id: result.id,
          publicationId: publication.id,
          portalId: result.portalId,
          portalName: result.portalName,
          portalType: result.portalType,
          status: result.status,
          externalId: result.externalId,
          url: result.url,
          errorMessage: result.errorMessage,
          publishedAt: result.publishedAt,
        },
        update: {
          status: result.status,
          externalId: result.externalId,
          url: result.url,
          errorMessage: result.errorMessage,
          lastSyncAt: new Date(),
        },
      });
    }

    return publication;
  }

  async sync(
    syncRequest: SyncRequest,
  ): Promise<{ success: boolean; results: any[] }> {
    const { propertyId, field, forceSync } = syncRequest;

    console.log(
      "[PublicationEngine] Syncing property:",
      propertyId,
      "field:",
      field,
    );

    const publication = await prisma.publication.findUnique({
      where: { propertyId },
      include: { announcements: true },
    });

    if (!publication) {
      throw new Error("Publication not found");
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new Error("Property not found");
    }

    const results = [];

    for (const announcement of publication.announcements) {
      if (announcement.status !== "PUBLISHED") continue;

      try {
        const adapter = this.getAdapter(announcement.portalId);
        if (!adapter) {
          console.log(
            "[PublicationEngine] No adapter for:",
            announcement.portalId,
          );
          continue;
        }

        let result;
        if (field === "PRICE" || field === "ALL") {
          result = await adapter.updatePrice(
            property,
            announcement.externalId!,
          );
        } else if (field === "PHOTOS" || field === "ALL") {
          result = await adapter.updatePhotos(
            property,
            announcement.externalId!,
          );
        } else if (field === "DESCRIPTION" || field === "ALL") {
          result = await adapter.updateDescription(
            property,
            announcement.externalId!,
          );
        } else if (field === "STATUS") {
          result = await adapter.updateStatus(
            property,
            announcement.externalId!,
          );
        }

        results.push({
          portalId: announcement.portalId,
          success: result?.success,
          message: result?.message,
        });
      } catch (error) {
        results.push({
          portalId: announcement.portalId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    await prisma.publication.update({
      where: { id: publication.id },
      data: { lastSyncAt: new Date() },
    });

    return {
      success: results.every((r) => r.success),
      results,
    };
  }

  async republishAll(propertyId: string): Promise<Publication> {
    const publication = await prisma.publication.findUnique({
      where: { propertyId },
    });

    if (!publication) {
      throw new Error("Publication not found");
    }

    return this.publish({
      propertyId,
      packageId: publication.packageId,
      forceRepublish: true,
    });
  }

  async getStats(tenantId: string): Promise<PublicationStats> {
    const publications = await prisma.publication.findMany({
      where: { tenantId },
      include: { announcements: true },
    });

    const stats: PublicationStats = {
      total: publications.length,
      published: 0,
      pending: 0,
      error: 0,
      blocked: 0,
      byPortal: {},
    };

    for (const pub of publications) {
      if (pub.status === "PUBLISHED") stats.published++;
      else if (pub.status === "PUBLISHING") stats.pending++;
      else if (pub.status === "ERROR") stats.error++;
      else if (pub.status === "BLOCKED") stats.blocked++;

      for (const ann of pub.announcements) {
        if (!stats.byPortal[ann.portalId]) {
          stats.byPortal[ann.portalId] = { total: 0, published: 0, error: 0 };
        }
        stats.byPortal[ann.portalId].total++;
        if (ann.status === "PUBLISHED")
          stats.byPortal[ann.portalId].published++;
        if (ann.status === "ERROR") stats.byPortal[ann.portalId].error++;
      }
    }

    return stats;
  }

  async getPublication(propertyId: string): Promise<Publication | null> {
    return prisma.publication.findUnique({
      where: { propertyId },
      include: { package: true, announcements: true },
    });
  }

  async getPackages(tenantId: string): Promise<PublicationPackage[]> {
    return prisma.publicationPackage.findMany({
      where: { tenantId, isActive: true },
      orderBy: { price: "asc" },
    });
  }

  async getDefaultPackage(
    tenantId: string,
  ): Promise<PublicationPackage | null> {
    return prisma.publicationPackage.findFirst({
      where: { tenantId, isActive: true, isDefault: true },
    });
  }

  private async publishToPortals(
    property: any,
    portalIds: string[],
    pkg: PublicationPackage,
  ): Promise<PropertyAnnouncement[]> {
    const results: PropertyAnnouncement[] = [];

    for (const portalId of portalIds) {
      const portalConfig = pkg.portals.find((p) => p.portalId === portalId);
      if (!portalConfig?.enabled) continue;

      const adapter = this.getAdapter(portalId);
      const result: PropertyAnnouncement = {
        id: property.id + "_" + portalId,
        publicationId: property.id,
        portalId,
        portalName: portalConfig.portalName,
        portalType: portalId,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        if (adapter) {
          const publishResult = await adapter.publish(property, {
            highlight: portalConfig.highlightLevel !== "NONE",
            highlightLevel: portalConfig.highlightLevel,
          });

          result.status = publishResult.success ? "PUBLISHED" : "ERROR";
          result.externalId = publishResult.externalId;
          result.url = publishResult.url;
          result.publishedAt = publishResult.success ? new Date() : undefined;
          result.errorMessage = publishResult.error;
        } else {
          result.status = "ERROR";
          result.errorMessage = "No adapter found";
        }
      } catch (error) {
        result.status = "ERROR";
        result.errorMessage =
          error instanceof Error ? error.message : "Unknown error";
      }

      results.push(result);
    }

    return results;
  }

  private async getPackage(
    packageId: string,
  ): Promise<PublicationPackage | null> {
    return prisma.publicationPackage.findUnique({
      where: { id: packageId },
    });
  }

  private getAdapter(portalId: string): PortalAdapter | null {
    return this.adapers.get(portalId) || null;
  }

  validateProperty(property: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!property.address) errors.push("Endereço é obrigatório");
    if (!property.price || property.price <= 0)
      errors.push("Preço é obrigatório");
    if (!property.bedrooms && property.propertyType === "APARTAMENTO") {
      errors.push("Número de quartos é obrigatório");
    }
    if (!property.squareFeet && property.propertyType === "APARTAMENTO") {
      errors.push("Metragem é obrigatória");
    }
    if (!property.photos || property.photos.length === 0) {
      errors.push("Pelo menos 1 foto é obrigatória");
    }

    return { valid: errors.length === 0, errors };
  }

  async checkHealth(
    propertyId: string,
  ): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    const publication = await prisma.publication.findUnique({
      where: { propertyId },
      include: { announcements: true },
    });

    if (!publication) {
      issues.push("Imóvel não publicado");
      return { healthy: false, issues };
    }

    if (publication.status === "EXPIRED") {
      issues.push("Publicação expirada");
    }

    if (publication.status === "ERROR") {
      issues.push("Erro na publicação");
    }

    const expiredAnnouncements = publication.announcements.filter(
      (a) => a.status === "BLOCKED" || a.status === "ERROR",
    );

    if (expiredAnnouncements.length > 0) {
      issues.push(expiredAnnouncements.length + " portais com erro");
    }

    return { healthy: issues.length === 0, issues };
  }
}

export const publicationEngine = new PublicationEngine();
export default publicationEngine;
