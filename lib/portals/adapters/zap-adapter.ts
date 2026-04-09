import type { PortalAdapter } from './sync-engine';
import { xmlGenerator } from './xml-generator';
import type { PropertyData } from './xml-generator';

export class ZapAdapter implements PortalAdapter {
  private apiKey: string;
  private endpoint: string;
  private clientId: string;

  constructor(config: { apiKey: string; endpoint?: string; clientId?: string }) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://api.zapimoveis.com.br/v1';
    this.clientId = config.clientId || '';
  }

  async createProperty(data: Record<string, unknown>): Promise<string> {
    const xmlPayload = xmlGenerator.generate(data as unknown as PropertyData, 'zap');
    
    const response = await fetch(`${this.endpoint}/imoveis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Client-ID': this.clientId
      },
      body: xmlPayload
    });

    if (!response.ok) {
      throw new Error(`Failed to create property on Zap: ${response.statusText}`);
    }

    const result = await response.text();
    const match = result.match(/<CodigoImovel>(\d+)<\/CodigoImovel>/);
    return match ? match[1] : '';
  }

  async updateProperty(externalId: string, data: Record<string, unknown>): Promise<void> {
    const xmlPayload = xmlGenerator.generate(data as unknown as PropertyData, 'zap');
    
    const response = await fetch(`${this.endpoint}/imoveis/${externalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Client-ID': this.clientId
      },
      body: xmlPayload
    });

    if (!response.ok) {
      throw new Error(`Failed to update property on Zap: ${response.statusText}`);
    }
  }

  async deleteProperty(externalId: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/imoveis/${externalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Client-ID': this.clientId
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete property on Zap: ${response.statusText}`);
    }
  }

  async getProperty(externalId: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.endpoint}/imoveis/${externalId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Client-ID': this.clientId
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get property from Zap: ${response.statusText}`);
    }

    const xml = await response.text();
    return this.parseXmlResponse(xml);
  }

  async getLeads(): Promise<LeadData[]> {
    const response = await fetch(`${this.endpoint}/leads`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Client-ID': this.clientId
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get leads from Zap: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.leads || []).map((lead: Record<string, unknown>) => ({
      id: lead.id as string,
      propertyId: lead.imovel_id as string,
      name: lead.nome as string,
      email: lead.email as string | undefined,
      phone: lead.telefone as string | undefined,
      message: lead.mensagem as string | undefined,
      receivedAt: new Date(lead.data as string)
    }));
  }

  async getAnalytics(propertyId?: string): Promise<Record<string, unknown>> {
    const url = propertyId 
      ? `${this.endpoint}/imoveis/${propertyId}/estatisticas`
      : `${this.endpoint}/estatisticas`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Client-ID': this.clientId
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get analytics from Zap: ${response.statusText}`);
    }

    return response.json();
  }

  async activateHighlight(
    externalId: string, 
    packageType: 'destaque' | 'super-destaque' | 'patrocinado',
    days: number = 30
  ): Promise<void> {
    const response = await fetch(`${this.endpoint}/imoveis/${externalId}/destaque`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Client-ID': this.clientId
      },
      body: JSON.stringify({
        tipo: packageType,
        dias: days
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to activate highlight on Zap: ${response.statusText}`);
    }
  }

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
    
    return result;
  }
}

interface LeadData {
  id: string;
  propertyId: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  receivedAt: Date;
}

export function createZapAdapter(config: { apiKey: string; endpoint?: string; clientId?: string }): PortalAdapter {
  return new ZapAdapter(config);
}