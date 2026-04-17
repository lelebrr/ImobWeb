import { BasePortalAdapter } from "./base-adapter";
import { PortalAdapter } from "@/types/portals";
import type { PropertyData } from "@/lib/portals/xml-generator";

export class ImobiBrasilAdapter
  extends BasePortalAdapter
  implements PortalAdapter
{
  constructor(config: Record<string, any>) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.imobibrasil.com";
  }

  async createProperty(data: Record<string, unknown>): Promise<string> {
    const propertyData = this.preparePropertyData(
      data as unknown as PropertyData,
    );
    const xml = this.generateXml(propertyData);

    try {
      const response = await this.makeApiCall("/imoveis", {
        method: "POST",
        body: xml,
      });

      const result = this.parseXmlResponse(response) as { codigo: string };
      return result.codigo;
    } catch (error) {
      throw new Error(
        `Failed to create property on ImobiBrasil: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      await this.makeApiCall(`/imoveis/${externalId}`, {
        method: "PUT",
        body: xml,
      });
    } catch (error) {
      throw new Error(
        `Failed to update property on ImobiBrasil: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async deleteProperty(externalId: string): Promise<void> {
    try {
      await this.makeApiCall(`/imoveis/${externalId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(
        `Failed to delete property on ImobiBrasil: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getProperty(externalId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeApiCall(`/imoveis/${externalId}`);
      return this.parseXmlResponse(response);
    } catch (error) {
      throw new Error(
        `Failed to get property from ImobiBrasil: ${error instanceof Error ? error.message : "Unknown error"}`,
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
        `Failed to get leads from ImobiBrasil: ${error instanceof Error ? error.message : "Unknown error"}`,
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
        ? `/imoveis/${propertyId}/analytics`
        : "/analytics";
      const response = await this.makeApiCall(endpoint);
      const parsed = this.parseXmlResponse(response);
      return {
        totalProperties: (parsed.totalProperties as number) || 0,
        activeProperties: (parsed.activeProperties as number) || 0,
        totalViews: (parsed.totalViews as number) || 0,
        totalLeads: (parsed.totalLeads as number) || 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to get analytics from ImobiBrasil: ${error instanceof Error ? error.message : "Unknown error"}`,
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
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!property.title) errors.push("Título é obrigatório");
    if (!property.description) errors.push("Descrição é obrigatória");
    if (!property.price || property.price <= 0)
      errors.push("Preço é obrigatório");
    if (!property.photos || property.photos.length === 0)
      errors.push("Pelo menos uma foto é obrigatória");
    if (!property.address?.city || !property.address?.state)
      errors.push("Cidade e estado são obrigatórios");

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score: errors.length === 0 ? 80 : 40,
      compliance: {
        minimumRequirements: errors.length === 0,
        qualityStandards: true,
        completeness: true,
      },
    };
  }

  getMaxTitleLength(): number {
    return 100;
  }
  getMaxDescriptionLength(): number {
    return 5000;
  }
  getMinPhotos(): number {
    return 1;
  }
  getMaxPhotos(): number {
    return 50;
  }
  getEndpoint(): string {
    return this.baseUrl;
  }
  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/xml",
    };
  }

  private preparePropertyData(property: PropertyData): PropertyData {
    return {
      ...property,
      title: property.title.substring(0, 80),
      description: property.description.substring(0, 2500),
    };
  }

  private generateXml(property: PropertyData): string {
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

    const tipoImovel = this.mapPropertyType(property.propertyType);
    const tipoNegocio =
      property.transactionType === "sale" ? "Venda" : "Locação";

    const xmlContent = `<imoveis>
  <imovel>
    <codigo><![CDATA[${property.id}]]></codigo>
    <tipo>${tipoImovel}</tipo>
    <operacao>${tipoNegocio}</operacao>
    <titulo><![CDATA[${property.title}]]></titulo>
    <descricao><![CDATA[${property.description}]]></descricao>
    <valor>${property.price}</valor>
    <endereco>
      <logradouro><![CDATA[${property.address.street}]]></logradouro>
      <numero><![CDATA[${property.address.number || ""}]]></numero>
      <bairro><![CDATA[${property.address.neighborhood}]]></bairro>
      <cidade><![CDATA[${property.address.city}]]></cidade>
      <uf>${property.address.state}</uf>
      <cep><![CDATA[${property.address.zipCode || ""}]]></cep>
    </endereco>
    <detalhes>
      <area_util>${property.features?.builtArea || ""}</area_util>
      <area_total>${property.features?.area || ""}</area_total>
      <quartos>${property.features?.bedrooms || ""}</quartos>
      <banheiros>${property.features?.bathrooms || ""}</banheiros>
      <vagas>${property.features?.parkingSpaces || ""}</vagas>
      <pavimento><![CDATA[${property.features?.floor || ""}]]></pavimento>
      <idade>${property.features?.age || ""}</idade>
    </detalhes>
    <fotos>
      ${property.photos
        .map(
          (url, i) => `
        <foto id="${i + 1}">
          <url><![CDATA[${url}]]></url>
        </foto>`,
        )
        .join("")}
    </fotos>
    <contato>
      <nome><![CDATA[${property.owner?.name || ""}]]></nome>
      <telefone><![CDATA[${property.owner?.phone || ""}]]></telefone>
      <email><![CDATA[${property.owner?.email || ""}]]></email>
    </contato>
  </imovel>
</imoveis>`;

    return xmlDeclaration + "\n" + xmlContent;
  }

  private mapPropertyType(type: PropertyData["propertyType"]): string {
    const mappings = {
      apartment: "apartamento",
      house: "casa",
      commercial: "comercial",
      land: "terreno",
      industrial: "galpao",
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
      codigo: extractValue("codigo"),
      tipo: extractValue("tipo"),
      titulo: extractValue("titulo"),
      valor: extractValue("valor"),
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
}

export function createImobiBrasilAdapter(
  config: Record<string, any>,
): ImobiBrasilAdapter {
  return new ImobiBrasilAdapter(config);
}
