import { BasePortalAdapter } from "./base-adapter";
import { PortalAdapter } from "@/types/portals";
import type { PropertyData } from "@/lib/portals/xml-generator";

export class LoftAdapter extends BasePortalAdapter implements PortalAdapter {
  protected apiKey: string;

  constructor(config: Record<string, any>) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.loft.com.br";
  }

  async createProperty(data: Record<string, unknown>): Promise<string> {
    const propertyData = this.preparePropertyData(
      data as unknown as PropertyData,
    );
    const xml = this.generateXml(propertyData);

    try {
      const response = await this.makeApiCall("/listings", {
        method: "POST",
        body: xml,
      });

      const result = this.parseXmlResponse(response) as { id: string };
      return result.id;
    } catch (error) {
      throw new Error(
        `Failed to create property on Loft: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
      await this.makeApiCall(`/listings/${externalId}`, {
        method: "PUT",
        body: xml,
      });
    } catch (error) {
      throw new Error(
        `Failed to update property on Loft: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async deleteProperty(externalId: string): Promise<void> {
    try {
      await this.makeApiCall(`/listings/${externalId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(
        `Failed to delete property on Loft: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getProperty(externalId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeApiCall(`/listings/${externalId}`);
      return this.parseXmlResponse(response);
    } catch (error) {
      throw new Error(
        `Failed to get property from Loft: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getLeads(): Promise<any[]> {
    try {
      const response = await this.makeApiCall("/leads");
      const parsed = this.parseXmlResponse(response);
      return (parsed.leads as unknown as any[]) || [];
    } catch (error) {
      throw new Error(
        `Failed to get leads from Loft: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
        ? `/listings/${propertyId}/analytics`
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
        `Failed to get analytics from Loft: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  validateProperty(property: PropertyData): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    score: number;
    compliance: {
      minimumRequirements: boolean;
      qualityStandards: boolean;
      completeness: boolean;
    };
  } {
    const errors: string[] = [];

    if (!property.title || property.title.length < 10) {
      errors.push("Title must be at least 10 characters long");
    }

    if (!property.description || property.description.length < 100) {
      errors.push("Description must be at least 100 characters long");
    }

    if (!property.price || property.price <= 0) {
      errors.push("Price must be greater than 0");
    }

    if (!property.photos || property.photos.length === 0) {
      errors.push("At least one photo is required");
    }

    if (property.photos && property.photos.length > 25) {
      errors.push("Maximum 25 photos allowed");
    }

    if (!property.address?.city || !property.address?.state) {
      errors.push("City and state are required");
    }

    if (
      property.propertyType === "apartment" &&
      (!property.features?.bedrooms || property.features.bedrooms < 1)
    ) {
      errors.push("Apartments must have at least 1 bedroom");
    }

    if (property.features?.area && property.features.area < 20) {
      errors.push("Minimum area is 20m²");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : [],
      warnings: [],
      suggestions: [],
      score: errors.length === 0 ? 100 : 50,
      compliance: {
        minimumRequirements: errors.length === 0,
        qualityStandards: true,
        completeness: true,
      },
    };
  }

  private preparePropertyData(property: PropertyData): PropertyData {
    return {
      ...property,
      title: property.title.substring(0, 80),
      description: property.description.substring(0, 4000),
    };
  }

  private generateXml(property: PropertyData): string {
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

    const tipoImovel = this.mapPropertyType(property.propertyType);
    const tipoNegocio =
      property.transactionType === "sale" ? "venda" : "aluguel";

    const xmlContent = `<listing>
  <id><![CDATA[${property.id}]]></id>
  <type>${tipoImovel}</type>
  <transaction_type>${tipoNegocio}</transaction_type>
  <title><![CDATA[${property.title}]]></title>
  <description><![CDATA[${property.description}]]></description>
  <price>${property.price}</price>
  <currency>BRL</currency>
  <address>
    <street><![CDATA[${property.address.street}]]></street>
    <number><![CDATA[${property.address.number || ""}]]></number>
    <complement><![CDATA[${property.address.complement || ""}]]></complement>
    <neighborhood><![CDATA[${property.address.neighborhood}]]></neighborhood>
    <city><![CDATA[${property.address.city}]]></city>
    <state>${property.address.state}</state>
    <zip_code><![CDATA[${property.address.zipCode || ""}]]></zip_code>
  </address>
  <characteristics>
    <total_area>${property.features?.area || ""}</total_area>
    <usable_area>${property.features?.builtArea || ""}</usable_area>
    <bedrooms>${property.features?.bedrooms || ""}</bedrooms>
    <bathrooms>${property.features?.bathrooms || ""}</bathrooms>
    <parking_spaces>${property.features?.parkingSpaces || ""}</parking_spaces>
    <floor><![CDATA[${property.features?.floor || ""}]]></floor>
    <year_built>${property.features?.age || ""}</year_built>
  </characteristics>
  <media>
    ${property.photos
      .map(
        (url, i) => `
      <image id="${i + 1}">
        <url><![CDATA[${url}]]></url>
      </image>`,
      )
      .join("")}
    ${
      property.videos
        ? property.videos
            .map(
              (url, i) => `
      <video id="${i + 1}">
        <url><![CDATA[${url}]]></url>
      </video>`,
            )
            .join("")
        : ""
    }
  </media>
  <contact>
    <name><![CDATA[${property.owner?.name || ""}]]></name>
    <phone><![CDATA[${property.owner?.phone || ""}]]></phone>
    <email><![CDATA[${property.owner?.email || ""}]]></email>
  </contact>
  <metadata>
    <created_at>${new Date().toISOString()}</created_at>
    <updated_at>${new Date().toISOString()}</updated_at>
  </metadata>
</listing>`;

    return xmlDeclaration + "\n" + xmlContent;
  }

  private mapPropertyType(type: PropertyData["propertyType"]): string {
    const mappings = {
      apartment: "apartment",
      house: "house",
      commercial: "commercial",
      land: "land",
      industrial: "industrial",
    };
    return mappings[type] || type;
  }

  private parseXmlResponse(xml: string): Record<string, unknown> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");

    const extractValue = (tag: string): string => {
      const element = doc.querySelector(tag);
      return element?.textContent || "";
    };

    return {
      id: extractValue("id"),
      type: extractValue("type"),
      title: extractValue("title"),
      price: extractValue("price"),
      status: extractValue("status"),
    };
  }

  private makeApiCall(
    endpoint: string,
    options?: { method?: string; body?: string },
  ): Promise<string> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/xml",
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/xml",
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

  getMaxTitleLength(): number {
    return 80;
  }

  getMaxDescriptionLength(): number {
    return 3000;
  }

  getMinPhotos(): number {
    return 1;
  }

  getMaxPhotos(): number {
    return 50;
  }

  getEndpoint(): string {
    return this.baseUrl || "https://api.loft.com.br/v1";
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }
}

export function createLoftAdapter(config: Record<string, any>): LoftAdapter {
  return new LoftAdapter(config);
}
