import { BasePortalAdapter } from './base-adapter';
import { xmlGenerator } from '../xml-generator';
import type { PropertyData } from '../xml-generator';
import type { PortalAdapter, PropertyValidation } from '../../../types/portals';

/**
 * Adaptador específico para o Portal Zap Imóveis (VRSync)
 */
export class ZapAdapter extends BasePortalAdapter implements PortalAdapter {
  constructor(config: Record<string, any>) {
    super(config);
  }

  /**
   * Validação específica para o Zap Imóveis
   */
  validateProperty(property: PropertyData): PropertyValidation {
    const baseValidation = this.validatePropertyBase(property);

    // Validações específicas do Zap
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const suggestions = [...baseValidation.suggestions];

    // Zap exige endereço completo
    if (!property.address?.street) {
      errors.push('Endereço completo (logradouro) é obrigatório para Zap');
    }

    // Zap exige pelo menos 3 fotos
    if (property.photos && property.photos.length < 3) {
      errors.push('Zap exige pelo menos 3 fotos para publicar');
    }

    // Zap tem limite de 60 caracteres no título
    if (property.title && property.title.length > 60) {
      errors.push('Título do Zap não pode ultrapassar 60 caracteres');
    }

    // Cálculo de score específico do Zap
    const hasFullAddress = property.address?.street && property.address?.city && property.address?.state;
    const hasMinPhotos = property.photos && property.photos.length >= 3;

    const score = Math.round(
      (baseValidation.score * 0.7) + // Score base
      (hasFullAddress ? 15 : 0) + // Endereço completo
      (hasMinPhotos ? 15 : 0) // Fotos mínimas
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
      }
    };
  }

  /**
   * Criar novo imóvel no Zap
   */
  async createProperty(data: Record<string, unknown>): Promise<string> {
    try {
      // Validação prévia
      const validation = this.validateProperty(data as unknown as PropertyData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Geração de XML VRSync
      const xmlPayload = xmlGenerator.generate(data as unknown as PropertyData, 'zap');

      const response = await this.makeRequest(`${this.getEndpoint()}/imoveis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          ...this.getAuthHeaders(),
        },
        body: xmlPayload,
      });

      const result = await response.text();

      // Extrair ID do imóvel da resposta XML
      const match = result.match(/<CodigoImovel>(\d+)<\/CodigoImovel>/);
      if (!match) {
        throw new Error('Failed to extract property ID from Zap response');
      }

      return match[1];
    } catch (error) {
      console.error('[ZapAdapter] Error creating property:', error);
      throw new Error(`Failed to create property on Zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Atualizar imóvel existente no Zap
   */
  async updateProperty(externalId: string, data: Record<string, unknown>): Promise<void> {
    try {
      const xmlPayload = xmlGenerator.generate(data as unknown as PropertyData, 'zap');

      await this.makeRequest(`${this.getEndpoint()}/imoveis/${externalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/xml',
          ...this.getAuthHeaders(),
        },
        body: xmlPayload,
      });
    } catch (error) {
      console.error('[ZapAdapter] Error updating property:', error);
      throw new Error(`Failed to update property on Zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Excluir imóvel do Zap
   */
  async deleteProperty(externalId: string): Promise<void> {
    try {
      await this.makeRequest(`${this.getEndpoint()}/imoveis/${externalId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('[ZapAdapter] Error deleting property:', error);
      throw new Error(`Failed to delete property on Zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obter detalhes do imóvel do Zap
   */
  async getProperty(externalId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeRequest(`${this.getEndpoint()}/imoveis/${externalId}`, {
        headers: this.getAuthHeaders(),
      });

      const xml = await response.text();
      return this.parseXmlResponse(xml);
    } catch (error) {
      console.error('[ZapAdapter] Error getting property:', error);
      throw new Error(`Failed to get property from Zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obter leads do Zap
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
      console.error('[ZapAdapter] Error getting leads:', error);
      throw new Error(`Failed to get leads from Zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obter analytics do Zap
   */
  async getAnalytics(propertyId?: string): Promise<Record<string, unknown>> {
    try {
      const url = propertyId
        ? `${this.getEndpoint()}/imoveis/${propertyId}/estatisticas`
        : `${this.getEndpoint()}/estatisticas`;

      const response = await this.makeRequest(url, {
        headers: this.getAuthHeaders(),
      });

      return response.json();
    } catch (error) {
      console.error('[ZapAdapter] Error getting analytics:', error);
      throw new Error(`Failed to get analytics from Zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ativar destaque no Zap
   */
  async activateHighlight(
    externalId: string,
    packageType: 'destaque' | 'super-destaque' | 'patrocinado',
    days: number = 30
  ): Promise<void> {
    try {
      await this.makeRequest(`${this.getEndpoint()}/imoveis/${externalId}/destaque`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({
          tipo: packageType,
          dias: days,
        }),
      });
    } catch (error) {
      console.error('[ZapAdapter] Error activating highlight:', error);
      throw new Error(`Failed to activate highlight on Zap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Métodos de configuração específicos do Zap
   */
  getMaxTitleLength(): number {
    return 60;
  }

  getMaxDescriptionLength(): number {
    return 2000;
  }

  getMinPhotos(): number {
    return 3;
  }

  getMaxPhotos(): number {
    return 36;
  }

  getEndpoint(): string {
    return this.baseUrl || 'https://api.zapimoveis.com.br/v1';
  }

  getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Client-ID': this.config.clientId || '',
    };
  }

  /**
   * Parse de resposta XML do Zap
   */
  private parseXmlResponse(xml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    const extractValue = (tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1] : '';
    };

    result['titulo'] = extractValue('Titulo');
    result['descricao'] = extractValue('Descricao');
    result['price'] = parseFloat(extractValue('Valor')) || 0;
    result['status'] = extractValue('Status');
    result['bairro'] = extractValue('Bairro');
    result['cidade'] = extractValue('Cidade');
    result['estado'] = extractValue('Estado');

    return result;
  }
}

/**
 * Factory function para criar instância do ZapAdapter
 */
export function createZapAdapter(config: Record<string, any>): PortalAdapter {
  return new ZapAdapter(config);
}
