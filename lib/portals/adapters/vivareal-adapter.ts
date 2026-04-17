import { BasePortalAdapter } from "./base-adapter";
import { xmlGenerator } from "../xml-generator";
import type { PropertyData } from "../xml-generator";
import type { PortalAdapter, PropertyValidation } from "../../../types/portals";

/**
 * Adaptador específico para o Portal Viva Real (VRSync)
 */
export class VivaRealAdapter
  extends BasePortalAdapter
  implements PortalAdapter
{
  constructor(config: Record<string, any>) {
    super(config);
  }

  /**
   * Validação específica para o Viva Real
   */
  validateProperty(property: PropertyData): PropertyValidation {
    const baseValidation = this.validatePropertyBase(property);

    // Validações específicas do Viva Real
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const suggestions = [...baseValidation.suggestions];

    // Viva Real é mais flexível com endereço, mas ainda exige bairro e cidade/estado
    if (!property.address?.neighborhood) {
      warnings.push(
        "Recomendado informar o bairro para melhor localização no Viva Real",
      );
    }

    // Viva Real aceita menos fotos que o Zap
    if (property.photos && property.photos.length < 1) {
      errors.push("Viva Real exige pelo menos 1 foto para publicar");
    }

    // Viva Real tem limite de 80 caracteres no título
    if (property.title && property.title.length > 80) {
      errors.push("Título do Viva Real não pode ultrapassar 80 caracteres");
    }

    // Cálculo de score específico do Viva Real
    const hasNeighborhood = property.address?.neighborhood;
    const hasMinPhotos = property.photos && property.photos.length >= 1;

    const score = Math.round(
      baseValidation.score * 0.7 + // Score base
        (hasNeighborhood ? 15 : 0) + // Bairro informado
        (hasMinPhotos ? 15 : 0), // Fotos mínimas
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
   * Criar novo imóvel no Viva Real
   */
  async createProperty(data: Record<string, unknown>): Promise<string> {
    try {
      // Validação prévia
      const validation = this.validateProperty(data as unknown as PropertyData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Geração de XML VRSync para Viva Real
      const xmlPayload = xmlGenerator.generate(
        data as unknown as PropertyData,
        "viva",
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
      const match = result.match(/<ListingID>([^<]+)<\/ListingID>/);
      if (!match) {
        throw new Error(
          "Failed to extract property ID from Viva Real response",
        );
      }

      return match[1];
    } catch (error) {
      console.error("[VivaRealAdapter] Error creating property:", error);
      throw new Error(
        `Failed to create property on Viva Real: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Atualizar imóvel existente no Viva Real
   */
  async updateProperty(
    externalId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const xmlPayload = xmlGenerator.generate(
        data as unknown as PropertyData,
        "viva",
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
      console.error("[VivaRealAdapter] Error updating property:", error);
      throw new Error(
        `Failed to update property on Viva Real: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Excluir imóvel do Viva Real
   */
  async deleteProperty(externalId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.getEndpoint()}/imoveis/${externalId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("[VivaRealAdapter] Error deleting property:", error);
      throw new Error(
        `Failed to delete property on Viva Real: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter detalhes do imóvel do Viva Real
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
      console.error("[VivaRealAdapter] Error getting property:", error);
      throw new Error(
        `Failed to get property from Viva Real: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter leads do Viva Real
   */
  async getLeads(): Promise<any[]> {
    try {
      const response = await this.makeRequest(`${this.getEndpoint()}/leads`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return (data.leads || []).map((lead: Record<string, unknown>) => ({
        id: lead.id as string,
        propertyId: lead.imovel_id as string,
        name: lead.nome as string,
        email: lead.email as string | undefined,
        phone: lead.telefone as string | undefined,
        message: lead.mensagem as string | undefined,
        receivedAt: new Date(lead.data as string),
      }));
    } catch (error) {
      console.error("[VivaRealAdapter] Error getting leads:", error);
      throw new Error(
        `Failed to get leads from Viva Real: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter analytics do Viva Real
   */
  async getAnalytics(propertyId?: string): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalViews: number;
    totalLeads: number;
  }> {
    try {
      const url = propertyId
        ? `${this.getEndpoint()}/imoveis/${propertyId}/estatisticas`
        : `${this.getEndpoint()}/estatisticas`;

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
      console.error("[VivaRealAdapter] Error getting analytics:", error);
      throw new Error(
        `Failed to get analytics from Viva Real: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Ativar badge (destaque) no Viva Real
   */
  async activateBadge(
    externalId: string,
    packageType: "super-destaque" | "destaque",
    days: number = 30,
  ): Promise<void> {
    try {
      await this.makeRequest(
        `${this.getEndpoint()}/imoveis/${externalId}/badge`,
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
      console.error("[VivaRealAdapter] Error activating badge:", error);
      throw new Error(
        `Failed to activate badge on Viva Real: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Métodos de configuração específicos do Viva Real
   */
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
    return this.baseUrl || "https://api.vivareal.com.br/v1";
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "X-Client-ID": this.config.clientId || "",
    };
  }

  /**
   * Parse de resposta XML do Viva Real
   */
  private parseXmlResponse(xml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    const extractValue = (tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1] : "";
    };

    result["titulo"] = extractValue("Title");
    result["descricao"] = extractValue("Description");
    result["price"] = parseFloat(extractValue("Price")) || 0;
    result["bairro"] = extractValue("District");
    result["cidade"] = extractValue("City");
    result["estado"] = extractValue("State");
    result["status"] = extractValue("Status");

    return result;
  }
}

/**
 * Factory function para criar instância do VivaRealAdapter
 */
export function createVivaRealAdapter(
  config: Record<string, any>,
): PortalAdapter {
  return new VivaRealAdapter(config);
}
