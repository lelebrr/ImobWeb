import { BasePortalAdapter } from "./base-adapter";
import { xmlGenerator } from "../xml-generator";
import type { PropertyData } from "../xml-generator";
import type { PortalAdapter, PropertyValidation } from "../../../types/portals";

/**
 * Adaptador específico para o Portal ImovelWeb
 */
export class ImovelWebAdapter
  extends BasePortalAdapter
  implements PortalAdapter
{
  constructor(config: Record<string, any>) {
    super(config);
  }

  /**
   * Validação específica para o ImovelWeb
   */
  validateProperty(property: PropertyData): PropertyValidation {
    const baseValidation = this.validatePropertyBase(property);

    // Validações específicas do ImovelWeb
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const suggestions = [...baseValidation.suggestions];

    // ImovelWeb exige endereço completo
    if (
      !property.address?.street ||
      !property.address?.city ||
      !property.address?.state
    ) {
      errors.push("Endereço completo é obrigatório para ImovelWeb");
    }

    // ImovelWeb exige pelo menos 1 foto
    if (property.photos && property.photos.length < 1) {
      errors.push("ImovelWeb exige pelo menos 1 foto para publicar");
    }

    // ImovelWeb tem limite de 100 caracteres no título
    if (property.title && property.title.length > 100) {
      errors.push("Título do ImovelWeb não pode ultrapassar 100 caracteres");
    }

    // ImovelWeb recomenda tour virtual para imóveis grandes
    if (
      property.features?.area &&
      property.features.area > 150 &&
      !property.virtualTour
    ) {
      suggestions.push(
        "Para imóveis grandes, considere adicionar um tour virtual",
      );
    }

    // Cálculo de score específico do ImovelWeb
    const hasFullAddress =
      property.address?.street &&
      property.address?.city &&
      property.address?.state;
    const hasMinPhotos = property.photos && property.photos.length >= 1;
    const hasVirtualTour = property.virtualTour;

    const score = Math.round(
      baseValidation.score * 0.7 + // Score base
        (hasFullAddress ? 15 : 0) + // Endereço completo
        (hasMinPhotos ? 10 : 0) + // Fotos mínimas
        (hasVirtualTour ? 5 : 0), // Tour virtual
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
   * Criar novo imóvel no ImovelWeb
   */
  async createProperty(data: Record<string, unknown>): Promise<string> {
    try {
      // Validação prévia
      const validation = this.validateProperty(data as unknown as PropertyData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Geração de XML ImovelWeb
      const xmlPayload = xmlGenerator.generate(
        data as unknown as PropertyData,
        "imovelweb",
      );

      const response = await this.makeRequest(`${this.getEndpoint()}/imoveis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/xml",
          ...this.getAuthHeaders(),
        },
        body: xmlPayload,
      });

      const result = await response.text();

      // Extrair ID do imóvel da resposta XML
      const match = result.match(/<Codigo>([^<]+)<\/Codigo>/);
      if (!match) {
        throw new Error(
          "Failed to extract property ID from ImovelWeb response",
        );
      }

      return match[1];
    } catch (error) {
      console.error("[ImovelWebAdapter] Error creating property:", error);
      throw new Error(
        `Failed to create property on ImovelWeb: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Atualizar imóvel existente no ImovelWeb
   */
  async updateProperty(
    externalId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const xmlPayload = xmlGenerator.generate(
        data as unknown as PropertyData,
        "imovelweb",
      );

      await this.makeRequest(`${this.getEndpoint()}/imoveis/${externalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/xml",
          ...this.getAuthHeaders(),
        },
        body: xmlPayload,
      });
    } catch (error) {
      console.error("[ImovelWebAdapter] Error updating property:", error);
      throw new Error(
        `Failed to update property on ImovelWeb: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Excluir imóvel do ImovelWeb
   */
  async deleteProperty(externalId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.getEndpoint()}/imoveis/${externalId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("[ImovelWebAdapter] Error deleting property:", error);
      throw new Error(
        `Failed to delete property on ImovelWeb: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter detalhes do imóvel do ImovelWeb
   */
  async getProperty(externalId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(
        `${this.getEndpoint()}/imoveis/${externalId}`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      const xml = await response.text();
      return this.parseXmlResponse(xml);
    } catch (error) {
      console.error("[ImovelWebAdapter] Error getting property:", error);
      throw new Error(
        `Failed to get property from ImovelWeb: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter leads do ImovelWeb
   */
  async getLeads(): Promise<any[]> {
    try {
      const response = await this.makeRequest(`${this.getEndpoint()}/leads`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return (data.leads || []).map((lead: Record<string, unknown>) => ({
        id: lead.id as string,
        propertyId: lead.property_id as string,
        name: lead.name as string,
        email: lead.email as string | undefined,
        phone: lead.phone as string | undefined,
        message: lead.message as string | undefined,
        receivedAt: new Date(lead.created_at as string),
      }));
    } catch (error) {
      console.error("[ImovelWebAdapter] Error getting leads:", error);
      throw new Error(
        `Failed to get leads from ImovelWeb: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter analytics do ImovelWeb
   */
  async getAnalytics(propertyId?: string): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalViews: number;
    totalLeads: number;
  }> {
    try {
      const url = propertyId
        ? `${this.getEndpoint()}/imoveis/${propertyId}/analytics`
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
      console.error("[ImovelWebAdapter] Error getting analytics:", error);
      throw new Error(
        `Failed to get analytics from ImovelWeb: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Ativar destaque no ImovelWeb
   */
  async activateHighlight(
    externalId: string,
    packageType: "destaque" | "super-destaque",
    days: number = 30,
  ): Promise<void> {
    try {
      await this.makeRequest(
        `${this.getEndpoint()}/imoveis/${externalId}/destaque`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...this.getAuthHeaders(),
          },
          body: JSON.stringify({
            tipo: packageType,
            dias: days,
          }),
        },
      );
    } catch (error) {
      console.error("[ImovelWebAdapter] Error activating highlight:", error);
      throw new Error(
        `Failed to activate highlight on ImovelWeb: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Métodos de configuração específicos do ImovelWeb
   */
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
    return this.baseUrl || "https://api.imovelweb.com.br/v1";
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "X-Client-ID": this.config.clientId || "",
      "X-API-Key": this.config.apiKey || "",
    };
  }

  /**
   * Parse de resposta XML do ImovelWeb
   */
  private parseXmlResponse(xml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    const extractValue = (tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1] : "";
    };

    result["titulo"] = extractValue("Titulo");
    result["descricao"] = extractValue("Texto");
    result["price"] = parseFloat(extractValue("Preco")) || 0;
    result["rua"] = extractValue("Rua");
    result["bairro"] = extractValue("Bairro");
    result["cidade"] = extractValue("Cidade");
    result["estado"] = extractValue("UF");
    result["status"] = extractValue("Status");

    return result;
  }
}

/**
 * Factory function para criar instância do ImovelWebAdapter
 */
export function createImovelWebAdapter(
  config: Record<string, any>,
): PortalAdapter {
  return new ImovelWebAdapter(config);
}
