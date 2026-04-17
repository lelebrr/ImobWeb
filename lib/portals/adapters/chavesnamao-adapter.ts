import { BasePortalAdapter } from "./base-adapter";
import { xmlGenerator } from "../xml-generator";
import type { PropertyData } from "../xml-generator";
import type { PortalAdapter, PropertyValidation } from "../../../types/portals";

/**
 * Adaptador específico para o Portal Chaves na Mão
 */
export class ChavesNaMaoAdapter
  extends BasePortalAdapter
  implements PortalAdapter
{
  constructor(config: Record<string, any>) {
    super(config);
  }

  /**
   * Validação específica para o Chaves na Mão
   */
  validateProperty(property: PropertyData): PropertyValidation {
    const baseValidation = this.validatePropertyBase(property);

    // Validações específicas do Chaves na Mão
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const suggestions = [...baseValidation.suggestions];

    // Chaves na Mão exige endereço completo
    if (
      !property.address?.street ||
      !property.address?.city ||
      !property.address?.state
    ) {
      errors.push("Endereço completo é obrigatório para Chaves na Mão");
    }

    // Chaves na Mão exige pelo menos 1 foto
    if (property.photos && property.photos.length < 1) {
      errors.push("Chaves na Mão exige pelo menos 1 foto para publicar");
    }

    // Chaves na Mão tem limite de 70 caracteres no título
    if (property.title && property.title.length > 70) {
      errors.push("Título do Chaves na Mão não pode ultrapassar 70 caracteres");
    }

    // Chaves na Mão não suporta vídeos
    if (property.videos && property.videos.length > 0) {
      warnings.push("Chaves na Mão não suporta vídeos, eles serão ignorados");
    }

    // Chaves na Mão recomenda destaque para imóveis de alto valor
    if (
      property.price &&
      property.price > 800000 &&
      !property.highlightPackage
    ) {
      suggestions.push(
        "Para imóveis de alto valor, considere pacotes de destaque",
      );
    }

    // Cálculo de score específico do Chaves na Mão
    const hasFullAddress =
      property.address?.street &&
      property.address?.city &&
      property.address?.state;
    const hasMinPhotos = property.photos && property.photos.length >= 1;
    const hasBairro = property.address?.neighborhood;

    const score = Math.round(
      baseValidation.score * 0.7 + // Score base
        (hasFullAddress ? 15 : 0) + // Endereço completo
        (hasMinPhotos ? 10 : 0) + // Fotos mínimas
        (hasBairro ? 5 : 0), // Bairro informado
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
   * Criar novo imóvel no Chaves na Mão
   */
  async createProperty(data: Record<string, unknown>): Promise<string> {
    try {
      // Validação prévia
      const validation = this.validateProperty(data as unknown as PropertyData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Geração de XML Chaves na Mão
      const xmlPayload = xmlGenerator.generate(
        data as unknown as PropertyData,
        "chaves",
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
      const match = result.match(/<codigo>([^<]+)<\/codigo>/);
      if (!match) {
        throw new Error(
          "Failed to extract property ID from Chaves na Mão response",
        );
      }

      return match[1];
    } catch (error) {
      console.error("[ChavesNaMaoAdapter] Error creating property:", error);
      throw new Error(
        `Failed to create property on Chaves na Mão: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Atualizar imóvel existente no Chaves na Mão
   */
  async updateProperty(
    externalId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const xmlPayload = xmlGenerator.generate(
        data as unknown as PropertyData,
        "chaves",
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
      console.error("[ChavesNaMaoAdapter] Error updating property:", error);
      throw new Error(
        `Failed to update property on Chaves na Mão: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Excluir imóvel do Chaves na Mão
   */
  async deleteProperty(externalId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.getEndpoint()}/imoveis/${externalId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("[ChavesNaMaoAdapter] Error deleting property:", error);
      throw new Error(
        `Failed to delete property on Chaves na Mão: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter detalhes do imóvel do Chaves na Mão
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
      console.error("[ChavesNaMaoAdapter] Error getting property:", error);
      throw new Error(
        `Failed to get property from Chaves na Mão: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter leads do Chaves na Mão
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
      console.error("[ChavesNaMaoAdapter] Error getting leads:", error);
      throw new Error(
        `Failed to get leads from Chaves na Mão: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Obter analytics do Chaves na Mão
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
      console.error("[ChavesNaMaoAdapter] Error getting analytics:", error);
      throw new Error(
        `Failed to get analytics from Chaves na Mão: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Ativar destaque no Chaves na Mão
   */
  async activateHighlight(
    externalId: string,
    packageType: "destaque" | "super-destaque",
    days: number = 60,
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
      console.error("[ChavesNaMaoAdapter] Error activating highlight:", error);
      throw new Error(
        `Failed to activate highlight on Chaves na Mão: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Métodos de configuração específicos do Chaves na Mão
   */
  getMaxTitleLength(): number {
    return 70;
  }

  getMaxDescriptionLength(): number {
    return 3000;
  }

  getMinPhotos(): number {
    return 1;
  }

  getMaxPhotos(): number {
    return 30;
  }

  getEndpoint(): string {
    return this.baseUrl || "https://api.chavesnamao.com.br/v1";
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "X-Client-ID": this.config.clientId || "",
      "X-API-Key": this.config.apiKey || "",
    };
  }

  /**
   * Parse de resposta XML do Chaves na Mão
   */
  private parseXmlResponse(xml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    const extractValue = (tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1] : "";
    };

    result["titulo"] = extractValue("titulo");
    result["descricao"] = extractValue("descricao");
    result["price"] = parseFloat(extractValue("preco")) || 0;
    result["logradouro"] = extractValue("logradouro");
    result["bairro"] = extractValue("bairro");
    result["cidade"] = extractValue("cidade");
    result["estado"] = extractValue("estado");
    result["status"] = extractValue("status");

    return result;
  }
}

/**
 * Factory function para criar instância do ChavesNaMaoAdapter
 */
export function createChavesNaMaoAdapter(
  config: Record<string, any>,
): PortalAdapter {
  return new ChavesNaMaoAdapter(config);
}
