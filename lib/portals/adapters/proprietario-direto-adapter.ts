import { BasePortalAdapter } from './base-adapter';
import { PortalAdapter } from '@/types/portals';
import type { PropertyData } from '@/lib/portals/xml-generator';

export class ProprietarioDiretoAdapter extends BasePortalAdapter implements PortalAdapter {
    private apiKey: string;
    private baseUrl: string;

    constructor(config: Record<string, any>) {
        super(config);
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || 'https://api.proprietario-direto.com';
    }

    async createProperty(data: Record<string, unknown>): Promise<string> {
        const propertyData = this.preparePropertyData(data as PropertyData);
        const xml = this.generateXml(propertyData);

        try {
            const response = await this.makeApiCall('/imoveis', {
                method: 'POST',
                body: xml
            });

            const result = this.parseXmlResponse(response);
            return result.codigo_imovel;
        } catch (error) {
            throw new Error(`Failed to create property on Proprietário Direto: ${error.message}`);
        }
    }

    async updateProperty(externalId: string, data: Record<string, unknown>): Promise<void> {
        const propertyData = this.preparePropertyData(data as PropertyData);
        const xml = this.generateXml(propertyData);

        try {
            await this.makeApiCall(`/imoveis/${externalId}`, {
                method: 'PUT',
                body: xml
            });
        } catch (error) {
            throw new Error(`Failed to update property on Proprietário Direto: ${error.message}`);
        }
    }

    async deleteProperty(externalId: string): Promise<void> {
        try {
            await this.makeApiCall(`/imoveis/${externalId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw new Error(`Failed to delete property on Proprietário Direto: ${error.message}`);
        }
    }

    async getProperty(externalId: string): Promise<Record<string, unknown>> {
        try {
            const response = await this.makeApiCall(`/imoveis/${externalId}`);
            return this.parseXmlResponse(response);
        } catch (error) {
            throw new Error(`Failed to get property from Proprietário Direto: ${error.message}`);
        }
    }

    async getLeads(): Promise<any[]> {
        try {
            const response = await this.makeApiCall('/leads');
            return response.leads || [];
        } catch (error) {
            throw new Error(`Failed to get leads from Proprietário Direto: ${error.message}`);
        }
    }

    async getAnalytics(propertyId?: string): Promise<Record<string, unknown>> {
        try {
            const endpoint = propertyId ? `/imoveis/${propertyId}/analytics` : '/analytics';
            const response = await this.makeApiCall(endpoint);
            return response;
        } catch (error) {
            throw new Error(`Failed to get analytics from Proprietário Direto: ${error.message}`);
        }
    }

    validateProperty(property: PropertyData): { valid: boolean; errors?: string[] } {
        const errors: string[] = [];

        if (!property.title || property.title.length < 5) {
            errors.push('Title must be at least 5 characters long');
        }

        if (!property.description || property.description.length < 30) {
            errors.push('Description must be at least 30 characters long');
        }

        if (!property.price || property.price <= 0) {
            errors.push('Price must be greater than 0');
        }

        if (!property.photos || property.photos.length === 0) {
            errors.push('At least one photo is required');
        }

        if (property.photos && property.photos.length > 20) {
            errors.push('Maximum 20 photos allowed');
        }

        if (!property.address?.city || !property.address?.state) {
            errors.push('City and state are required');
        }

        if (property.propertyType === 'apartment' && (!property.features?.bedrooms || property.features.bedrooms < 1)) {
            errors.push('Apartments must have at least 1 bedroom');
        }

        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    private preparePropertyData(property: PropertyData): PropertyData {
        return {
            ...property,
            title: property.title.substring(0, 100),
            description: property.description.substring(0, 3000)
        };
    }

    private generateXml(property: PropertyData): string {
        const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

        const tipoImovel = this.mapPropertyType(property.propertyType);
        const tipoNegocio = property.transactionType === 'sale' ? 'venda' : 'aluguel';

        const xmlContent = `<imoveis>
  <imovel>
    <id><![CDATA[${property.id}]]></id>
    <tipo>${tipoImovel}</tipo>
    <tipo_transacao>${tipoNegocio}</tipo_transacao>
    <titulo><![CDATA[${property.title}]]></titulo>
    <descricao><![CDATA[${property.description}]]></descricao>
    <preco>${property.price}</preco>
    <endereco>
      <logradouro><![CDATA[${property.address.street}]]></logradouro>
      <numero><![CDATA[${property.address.number || ''}]]></numero>
      <bairro><![CDATA[${property.address.neighborhood}]]></bairro>
      <cidade><![CDATA[${property.address.city}]]></cidade>
      <uf>${property.address.state}</uf>
      <cep><![CDATA[${property.address.zipCode || ''}]]></cep>
    </endereco>
    <caracteristicas>
      <area_construida>${property.features?.builtArea || ''}</area_construida>
      <area_total>${property.features?.area || ''}</area_total>
      <quartos>${property.features?.bedrooms || ''}</quartos>
      <banheiros>${property.features?.bathrooms || ''}</banheiros>
      <vagas_garagem>${property.features?.parkingSpaces || ''}</vagas_garagem>
      <pavimento><![CDATA[${property.features?.floor || ''}]]></pavimento>
      <ano_construcao>${property.features?.age || ''}</ano_construcao>
    </caracteristicas>
    <imagens>
      ${property.photos.map((url, i) => `
        <imagem id="${i + 1}">
          <url><![CDATA[${url}]]></url>
        </imagem>`).join('')}
    </imagens>
    <contato>
      <nome><![CDATA[${property.owner?.name || ''}]]></nome>
      <telefone><![CDATA[${property.owner?.phone || ''}]]></telefone>
      <email><![CDATA[${property.owner?.email || ''}]]></email>
    </contato>
  </imovel>
</imoveis>`;

        return xmlDeclaration + '\n' + xmlContent;
    }

    private mapPropertyType(type: PropertyData['propertyType']): string {
        const mappings = {
            apartment: 'apartamento',
            house: 'casa',
            commercial: 'comercial',
            land: 'terreno',
            industrial: 'galpao'
        };
        return mappings[type] || type;
    }

    private parseXmlResponse(xml: string): Record<string, unknown> {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        const extractValue = (tag: string): string => {
            const element = doc.querySelector(tag);
            return element?.textContent || '';
        };

        return {
            id: extractValue('id'),
            tipo: extractValue('tipo'),
            titulo: extractValue('titulo'),
            preco: extractValue('preco'),
            status: extractValue('status')
        };
    }

    private makeApiCall(endpoint: string, options?: { method?: string; body?: string }): Promise<string> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/xml',
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/xml'
        };

        const config: RequestInit = {
            method: options?.method || 'GET',
            headers,
            body: options?.body
        };

        return fetch(url, config)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }
                return response.text();
            });
    }
}

export function createProprietarioDiretoAdapter(config: Record<string, any>): ProprietarioDiretoAdapter {
    return new ProprietarioDiretoAdapter(config);
}