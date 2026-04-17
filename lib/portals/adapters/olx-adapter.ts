import { BasePortalAdapter } from "./base-adapter";
import { xmlGenerator } from "../xml-generator";
import type { PropertyData } from "../xml-generator";
import type { PortalAdapter, PropertyValidation } from "../../../types/portals";

/**
 * Adaptador específico para o Portal OLX (VRSync)
 */
export class OlxAdapter extends BasePortalAdapter implements PortalAdapter {
  constructor(config: Record<string, any>) {
    super(config);
  }

  /**
   * Validação específica para o OLX
   */
  validateProperty(property: PropertyData): PropertyValidation {
    const baseValidation = this.validatePropertyBase(property);

    // Validações específicas do OLX
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const suggestions = [...baseValidation.suggestions];

    // OLX exige cidade e estado, mas é mais flexível com endereço completo
    if (!property.address?.city || !property.address?.state) {
      errors.push("Cidade e estado são obrigatórios para OLX");
    }

    // OLX exige pelo menos 1 foto
    if (property.photos && property.photos.length < 1) {
      errors.push("OLX exige pelo menos 1 foto para publicar");
    }

    // OLX tem limite de 80 caracteres no título
    if (property.title && property.title.length > 80) {
      errors.push("Título do OLX não pode ultrapassar 80 caracteres");
    }

    // OLX permite particulares, então verifica se tem contato
    if (!property.owner?.name && !property.owner?.phone) {
      warnings.push("Recomendado informar dados de contato para OLX");
    }

    // Cálculo de score específico do OLX
    const hasCityState = property.address?.city && property.address?.state;
    const hasMinPhotos = property.photos && property.photos.length >= 1;
    const hasContact = property.owner?.name || property.owner?.phone;

    const score = Math.round(
      baseValidation.score * 0.7 + // Score base
        (hasCityState ? 15 : 0) + // Cidade e estado
        (hasMinPhotos ? 10 : 0) + // Fotos mínimas
        (hasContact ? 5 : 0), // Contato informado
    );

    return {
      ...baseValidation,
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

  /**
   * Criar novo imóvel no OLX
   */
  async createProperty(data: Record<string, unknown>): Promise<string> {
    try {
      // Validação prévia
      const validation = this.validateProperty(data as unknown as PropertyData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Geração de XML VRSync para OLX
      const xmlPayload = xmlGenerator.generate(
        data as unknown as PropertyData,
        "olx",
      );

      const response = await this.makeRequest(`${this.getEndpoint()}/ads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/xml",
          ...this.getAuthHeaders(),
        },
        body: xmlPayload,
      });

      const result = await response.text();

      // Extrair ID do anúncio da resposta XML
      const match = result.match(/<id>([^<]+)<\/id>/);
      if (!match) {
        throw new Error("Failed to extract ad ID from OLX response");
      }

      return match[1];
    } catch (error) {
      console.error("[OlxAdapter] Error creating property:", error);
      throw new Error(
        `Failed to create property on OLX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Atualizar imóvel existente no OLX
   */
  async updateProperty(
    externalId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const xmlPayload = xmlGenerator.generate(
        data as unknown as PropertyData,
        "olx",
      );

      await this.makeRequest(`${this.getEndpoint()}/ads/${externalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/xml",
          ...this.getAuthHeaders(),
        },
        body: xmlPayload,
      });
    } catch (error) {
      console.error("[OlxAdapter] Error updating property:", error);
      throw new Error(
        `Failed to update property on OLX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Excluir imóvel do OLX
   */
  async deleteProperty(externalId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.getEndpoint()}/ads/${externalId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("[OlxAdapter] Error deleting property:", error);
      throw new Error(
        `Failed to delete property on OLX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter detalhes do imóvel do OLX
   */
  async getProperty(externalId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(
        `${this.getEndpoint()}/ads/${externalId}`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      const xml = await response.text();
      return this.parseXmlResponse(xml);
    } catch (error) {
      console.error("[OlxAdapter] Error getting property:", error);
      throw new Error(
        `Failed to get property from OLX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter leads do OLX
   */
  async getLeads(): Promise<any[]> {
    try {
      const response = await this.makeRequest(`${this.getEndpoint()}/leads`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return (data.leads || []).map((lead: Record<string, unknown>) => ({
        id: lead.id as string,
        propertyId: lead.ad_id as string,
        name: lead.name as string,
        email: lead.email as string | undefined,
        phone: lead.phone as string | undefined,
        message: lead.message as string | undefined,
        receivedAt: new Date(lead.created_at as string),
      }));
    } catch (error) {
      console.error("[OlxAdapter] Error getting leads:", error);
      throw new Error(
        `Failed to get leads from OLX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter analytics do OLX
   */
  async getAnalytics(propertyId?: string): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalViews: number;
    totalLeads: number;
  }> {
    try {
      const url = propertyId
        ? `${this.getEndpoint()}/ads/${propertyId}/analytics`
        : `${this.getEndpoint()}/analytics`;

      const response = await this.makeRequest(url, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return {
        totalProperties: data.totalProperties || 0,
        activeProperties: data.activeProperties || 0,
        totalViews: data.totalViews || 0,
        totalLeads: data.totalLeads || 0,
      };
    } catch (error) {
      console.error("[OlxAdapter] Error getting analytics:", error);
      throw new Error(
        `Failed to get analytics from OLX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Ativar chat no OLX
   */
  async activateChat(externalId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.getEndpoint()}/ads/${externalId}/chat`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("[OlxAdapter] Error activating chat:", error);
      throw new Error(
        `Failed to activate chat on OLX: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Métodos de configuração específicos do OLX
   */
  getMaxTitleLength(): number {
    return 80;
  }

  getMaxDescriptionLength(): number {
    return 4000;
  }

  getMinPhotos(): number {
    return 1;
  }

  getMaxPhotos(): number {
    return 20;
  }

  getEndpoint(): string {
    return this.baseUrl || "https://api.olx.com.br/v1";
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "X-Client-ID": this.config.clientId || "",
    };
  }

  /**
   * Parse de resposta XML do OLX
   */
  private parseXmlResponse(xml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    const extractValue = (tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1] : "";
    };

    result["titulo"] = extractValue("title");
    result["descricao"] = extractValue("description");
    result["price"] = parseFloat(extractValue("price")) || 0;
    result["cidade"] = extractValue("city");
    result["bairro"] = extractValue("neighborhood");
    result["estado"] = extractValue("region");
    result["status"] = extractValue("status");

    return result;
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

/**
 * Factory function para criar instância do OlxAdapter
 */
export function createOlxAdapter(config: Record<string, any>): PortalAdapter {
  return new OlxAdapter(config);
}
