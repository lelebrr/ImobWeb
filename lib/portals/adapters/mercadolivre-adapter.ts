import { BasePortalAdapter } from "./base-adapter";
import { PortalAdapter, PropertyValidation } from "@/types/portals";
import type { PropertyData } from "@/lib/portals/xml-generator";

export class MercadoLivreAdapter
  extends BasePortalAdapter
  implements PortalAdapter
{
  private apiSecret: string;

  constructor(config: Record<string, any>) {
    super(config);
    this.apiSecret = config.apiSecret;
  }

  getMaxTitleLength(): number {
    return 60;
  }

  getMaxDescriptionLength(): number {
    return 5000;
  }

  getMinPhotos(): number {
    return 1;
  }

  getMaxPhotos(): number {
    return 12;
  }

  getEndpoint(): string {
    return "https://api.mercadolivre.com";
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async createProperty(data: Record<string, unknown>): Promise<string> {
    const propertyData = this.preparePropertyData(
      data as unknown as PropertyData,
    );
    const xml = this.generateXml(propertyData);

    try {
      const response = await this.makeApiCall("/items", {
        method: "POST",
        body: xml,
      });

      const result = this.parseXmlResponse(response);
      return result.id as string;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to create property on Mercado Livre: ${message}`);
    }
  }

  async updateProperty(
    externalId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const propertyData = this.preparePropertyData(
      data as unknown as PropertyData,
    );
    const xml = this.generateXml(propertyData);

    try {
      await this.makeApiCall(`/items/${externalId}`, {
        method: "PUT",
        body: xml,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to update property on Mercado Livre: ${message}`);
    }
  }

  async deleteProperty(externalId: string): Promise<void> {
    try {
      await this.makeApiCall(`/items/${externalId}`, {
        method: "DELETE",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to delete property on Mercado Livre: ${message}`);
    }
  }

  async getProperty(externalId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeApiCall(`/items/${externalId}`);
      return this.parseXmlResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get property from Mercado Livre: ${message}`);
    }
  }

  async getLeads(): Promise<any[]> {
    try {
      const response = await this.makeApiLead("/leads");
      return response.leads || [];
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get leads from Mercado Livre: ${message}`);
    }
  }

  async getAnalytics(propertyId?: string): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalViews: number;
    totalLeads: number;
  }> {
    try {
      const endpoint = propertyId
        ? `/items/${propertyId}/analytics`
        : "/analytics";
      const response = await this.makeApiCall(endpoint);
      return {
        totalProperties: (response as any).totalProperties || 0,
        activeProperties: (response as any).activeProperties || 0,
        totalViews: (response as any).totalViews || 0,
        totalLeads: (response as any).totalLeads || 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to get analytics from Mercado Livre: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  validateProperty(property: PropertyData): PropertyValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!property.title || property.title.length < 10) {
      errors.push("Title must be at least 10 characters long");
    }

    if (!property.description || property.description.length < 50) {
      errors.push("Description must be at least 50 characters long");
    }

    if (!property.price || property.price <= 0) {
      errors.push("Price must be greater than 0");
    }

    if (!property.photos || property.photos.length === 0) {
      errors.push("At least one photo is required");
    }

    if (property.photos && property.photos.length > 12) {
      errors.push("Maximum 12 photos allowed");
    }

    if (!property.address?.city || !property.address?.state) {
      errors.push("City and state are required");
    }

    const score = errors.length === 0 ? 85 : 60;

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score,
      compliance: {
        minimumRequirements: errors.length === 0,
        qualityStandards: warnings.length <= 2,
        completeness: score >= 75,
      },
    };
  }

  private preparePropertyData(property: PropertyData): PropertyData {
    return {
      ...property,
      title: property.title.substring(0, 60),
      description: property.description.substring(0, 5000),
    };
  }

  private generateXml(property: PropertyData): string {
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

    const category =
      property.transactionType === "sale" ? "MLB205874" : "MLB205875";
    const condition = property.transactionType === "sale" ? "new" : "used";

    const xmlContent = `<item>
  <title><![CDATA[${property.title}]]></title>
  <description><![CDATA[${property.description}]]></description>
  <category_id>${category}</category_id>
  <price>${property.price}</price>
  <currency>BRL</currency>
  <condition>${condition}</condition>
  <shipping>
    <free_shipping>false</free_shipping>
  </shipping>
  <pictures>
    ${property.photos
      .map(
        (url, i) => `<picture>
      <id>${i + 1}</id>
      <url>${this.escapeXml(url)}</url>
    </picture>`,
      )
      .join("")}
  </pictures>
  <attributes>
    <attribute id="BRAND" value="Generico"/>
    <attribute id="MODEL" value="${this.escapeXml(property.propertyType)}"/>
    <attribute id="YEAR" value="${property.features?.age || new Date().getFullYear()}"/>
  </attributes>
  <location>
    <state>${property.address.state}</state>
    <city>${this.escapeXml(property.address.city)}</city>
    <neighborhood>${this.escapeXml(property.address.neighborhood)}</neighborhood>
  </location>
</item>`;

    return xmlDeclaration + "\n" + xmlContent;
  }

  protected escapeXml(str: string): string {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  private parseXmlResponse(xml: string): Record<string, unknown> {
    // Implementar parser XML simples
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");

    const extractValue = (tag: string): string => {
      const element = doc.querySelector(tag);
      return element?.textContent || "";
    };

    return {
      id: extractValue("id"),
      title: extractValue("title"),
      price: extractValue("price"),
      status: extractValue("status"),
    };
  }

  private makeApiCall(
    endpoint: string,
    options?: { method?: string; body?: string },
  ): Promise<string> {
    const url = `https://api.mercadolivre.com${endpoint}`;
    const headers = {
      "Content-Type": "application/xml",
      Authorization: `Bearer ${this.apiKey}`,
    };

    const config: RequestInit = {
      method: options?.method || "GET",
      headers,
      body: options?.body,
    };

    return fetch(url, config).then((response) => {
      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }
      return response.text();
    });
  }

  private makeApiLead(
    endpoint: string,
    options?: { method?: string; body?: string },
  ): Promise<any> {
    const url = `https://api.mercadolivre.com${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };

    const config: RequestInit = {
      method: options?.method || "GET",
      headers,
      body: options?.body,
    };

    return fetch(url, config).then((response) => {
      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }
      return response.json();
    });
  }

  async updatePrice(externalId: string, price: number): Promise<void> {
    await this.updateProperty(externalId, { price });
  }

  async updatePhotos(externalId: string, photos: string[]): Promise<void> {
    await this.updateProperty(externalId, { photos });
  }

  async updateDescription(
    externalId: string,
    description: string,
  ): Promise<void> {
    await this.updateProperty(externalId, { description });
  }

  async updateStatus(externalId: string, status: string): Promise<void> {
    await this.updateProperty(externalId, { status });
  }

  async publish(externalId: string): Promise<void> {
    await this.updateProperty(externalId, { status: "active" });
  }
}

export function createMercadoLivreAdapter(
  config: Record<string, any>,
): MercadoLivreAdapter {
  return new MercadoLivreAdapter(config);
}
