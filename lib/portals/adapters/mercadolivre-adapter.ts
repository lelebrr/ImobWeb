import { BasePortalAdapter } from './base-adapter';
import { PortalAdapter } from '@/types/portals';
import type { PropertyData } from '@/lib/portals/xml-generator';

export class MercadoLivreAdapter extends BasePortalAdapter implements PortalAdapter {
    private apiKey: string;
    private apiSecret: string;

    constructor(config: Record<string, any>) {
        super(config);
        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;
    }

    async createProperty(data: Record<string, unknown>): Promise<string> {
        const propertyData = this.preparePropertyData(data as PropertyData);
        const xml = this.generateXml(propertyData);

        try {
            const response = await this.makeApiCall('/items', {
                method: 'POST',
                body: xml
            });

            const result = this.parseXmlResponse(response);
            return result.id;
        } catch (error) {
            throw new Error(`Failed to create property on Mercado Livre: ${error.message}`);
        }
    }

    async updateProperty(externalId: string, data: Record<string, unknown>): Promise<void> {
        const propertyData = this.preparePropertyData(data as PropertyData);
        const xml = this.generateXml(propertyData);

        try {
            await this.makeApiCall(`/items/${externalId}`, {
                method: 'PUT',
                body: xml
            });
        } catch (error) {
            throw new Error(`Failed to update property on Mercado Livre: ${error.message}`);
        }
    }

    async deleteProperty(externalId: string): Promise<void> {
        try {
            await this.makeApiCall(`/items/${externalId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw new Error(`Failed to delete property on Mercado Livre: ${error.message}`);
        }
    }

    async getProperty(externalId: string): Promise<Record<string, unknown>> {
        try {
            const response = await this.makeApiCall(`/items/${externalId}`);
            return this.parseXmlResponse(response);
        } catch (error) {
            throw new Error(`Failed to get property from Mercado Livre: ${error.message}`);
        }
    }

    async getLeads(): Promise<any[]> {
        try {
            const response = await this.makeApiLead('/leads');
            return response.leads || [];
        } catch (error) {
            throw new Error(`Failed to get leads from Mercado Livre: ${error.message}`);
        }
    }

    async getAnalytics(propertyId?: string): Promise<Record<string, unknown>> {
        try {
            const endpoint = propertyId ? `/items/${propertyId}/analytics` : '/analytics';
            const response = await this.makeApiCall(endpoint);
            return response;
        } catch (error) {
            throw new Error(`Failed to get analytics from Mercado Livre: ${error.message}`);
        }
    }

    validateProperty(property: PropertyData): { valid: boolean; errors?: string[] } {
        const errors: string[] = [];

        if (!property.title || property.title.length < 10) {
            errors.push('Title must be at least 10 characters long');
        }

        if (!property.description || property.description.length < 50) {
            errors.push('Description must be at least 50 characters long');
        }

        if (!property.price || property.price <= 0) {
            errors.push('Price must be greater than 0');
        }

        if (!property.photos || property.photos.length === 0) {
            errors.push('At least one photo is required');
        }

        if (property.photos && property.photos.length > 12) {
            errors.push('Maximum 12 photos allowed');
        }

        if (!property.address?.city || !property.address?.state) {
            errors.push('City and state are required');
        }

        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    private preparePropertyData(property: PropertyData): PropertyData {
        return {
            ...property,
            title: property.title.substring(0, 60),
            description: property.description.substring(0, 5000)
        };
    }

    private generateXml(property: PropertyData): string {
        const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

        const category = property.transactionType === 'sale' ? 'MLB205874' : 'MLB205875';
        const condition = property.transactionType === 'sale' ? 'new' : 'used';

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
    ${property.photos.map((url, i) => `<picture>
      <id>${i + 1}</id>
      <url>${this.escapeXml(url)}</url>
    </picture>`).join('')}
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

        return xmlDeclaration + '\n' + xmlContent;
    }

    private escapeXml(str: string): string {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    private parseXmlResponse(xml: string): Record<string, unknown> {
        // Implementar parser XML simples
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        const extractValue = (tag: string): string => {
            const element = doc.querySelector(tag);
            return element?.textContent || '';
        };

        return {
            id: extractValue('id'),
            title: extractValue('title'),
            price: extractValue('price'),
            status: extractValue('status')
        };
    }

    private makeApiCall(endpoint: string, options?: { method?: string; body?: string }): Promise<string> {
        const url = `https://api.mercadolivre.com${endpoint}`;
        const headers = {
            'Content-Type': 'application/xml',
            'Authorization': `Bearer ${this.apiKey}`
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

    private makeApiLead(endpoint: string, options?: { method?: string; body?: string }): Promise<any> {
        const url = `https://api.mercadolivre.com${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
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
                return response.json();
            });
    }
}

export function createMercadoLivreAdapter(config: Record<string, any>): MercadoLivreAdapter {
    return new MercadoLivreAdapter(config);
}