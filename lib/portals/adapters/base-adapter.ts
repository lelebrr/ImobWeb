import type { PortalAdapter, PropertyValidation } from '../../../types/portals';
import type { PropertyData } from '../xml-generator';

/**
 * Adaptador base para todos os portais de imóveis
 * Fornece funcionalidades comuns e estrutura padrão para adaptadores específicos
 */
export abstract class BasePortalAdapter implements PortalAdapter {
    protected config: Record<string, any>;
    protected baseUrl: string;
    protected apiKey: string;
    protected timeout: number;

    constructor(config: Record<string, any>) {
        this.config = config;
        this.baseUrl = config.baseUrl || '';
        this.apiKey = config.apiKey || '';
        this.timeout = config.timeout || 30; // segundos
    }

    /**
     * Validação base de propriedade
     */
    protected validatePropertyBase(property: PropertyData): PropertyValidation {
        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        // Validações básicas obrigatórias
        if (!property.title || property.title.trim().length === 0) {
            errors.push('Título é obrigatório');
        }
        if (!property.description || property.description.trim().length === 0) {
            errors.push('Descrição é obrigatória');
        }
        if (!property.price || property.price <= 0) {
            errors.push('Preço é obrigatório e deve ser maior que zero');
        }
        if (!property.photos || property.photos.length === 0) {
            errors.push('Pelo menos uma foto é obrigatória');
        }
        if (!property.address?.city || !property.address?.state) {
            errors.push('Cidade e estado são obrigatórios');
        }
        if (!property.features?.bedrooms || property.features.bedrooms < 1) {
            errors.push('Número de quartos é obrigatório');
        }
        if (!property.features?.bathrooms || property.features.bathrooms < 1) {
            errors.push('Número de banheiros é obrigatório');
        }
        if (!property.features?.area || property.features.area <= 0) {
            errors.push('Área do imóvel é obrigatória');
        }

        // Validações de formato
        if (property.title && property.title.length > this.getMaxTitleLength()) {
            errors.push(`O título não pode ultrapassar ${this.getMaxTitleLength()} caracteres`);
        }
        if (property.description && property.description.length > this.getMaxDescriptionLength()) {
            errors.push(`A descrição não pode ultrapassar ${this.getMaxDescriptionLength()} caracteres`);
        }

        // Validações de quantidade de fotos
        if (property.photos && property.photos.length < this.getMinPhotos()) {
            errors.push(`São necessárias pelo menos ${this.getMinPhotos()} fotos`);
        }
        if (property.photos && property.photos.length > this.getMaxPhotos()) {
            errors.push(`O número máximo de fotos é ${this.getMaxPhotos()}`);
        }

        // Cálculo de score
        const hasBasicInfo = property.title && property.description && property.price;
        const hasPhotos = property.photos && property.photos.length >= this.getMinPhotos();
        const hasLocation = property.address?.city && property.address?.state;
        const hasDimensions = property.features?.area && property.features?.bedrooms && property.features?.bathrooms;

        const score = Math.round(
            (hasBasicInfo ? 25 : 0) +
            (hasPhotos ? 25 : 0) +
            (hasLocation ? 25 : 0) +
            (hasDimensions ? 25 : 0)
        );

        return {
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
     * Validação específica do portal (deve ser implementada pelos adaptadores filhos)
     */
    abstract validateProperty(property: PropertyData): PropertyValidation;

    /**
     * Métodos abstratos que devem ser implementados por cada adaptador
     */
    abstract createProperty(data: Record<string, unknown>): Promise<string>;
    abstract updateProperty(externalId: string, data: Record<string, unknown>): Promise<void>;
    abstract deleteProperty(externalId: string): Promise<void>;
    abstract getProperty(externalId: string): Promise<Record<string, unknown>>;
    abstract getLeads(): Promise<any[]>;
    abstract getAnalytics(propertyId?: string): Promise<Record<string, unknown>>;

    /**
     * Métodos comuns que podem ser sobrescritos se necessário
     */
    protected async makeRequest(
        url: string,
        options: RequestInit = {},
        maxRetries: number = 3
    ): Promise<Response> {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            ...options.headers,
        };

        const finalOptions: RequestInit = {
            ...options,
            headers,
        };

        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout * 1000);

                const response = await fetch(url, {
                    ...finalOptions,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.status === 429) {
                    // Rate limit - aguarda exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                return response;
            } catch (error) {
                lastError = error as Error;

                if (attempt === maxRetries) {
                    throw lastError;
                }

                // Aguarda antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        throw lastError!;
    }

    /**
     * Métodos abstratos para configurações específicas de cada portal
     */
    abstract getMaxTitleLength(): number;
    abstract getMaxDescriptionLength(): number;
    abstract getMinPhotos(): number;
    abstract getMaxPhotos(): number;
    abstract getEndpoint(): string;
    abstract getAuthHeaders(): Record<string, string>;

    /**
     * Validação de integridade dos dados
     */
    protected sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
        const sanitized: Record<string, unknown> = {};

        // Remove valores nulos ou undefined
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                sanitized[key] = data[key];
            }
        });

        // Converte números para string se necessário
        if (typeof sanitized.price === 'number') {
            sanitized.price = sanitized.price.toString();
        }

        return sanitized;
    }

    /**
     * Gera ID externo único para o imóvel
     */
    protected generateExternalId(propertyId: string): string {
        return `imob-${propertyId}-${Date.now()}`;
    }

    /**
     * Formata data para o padrão do portal
     */
    protected formatDate(date: Date): string {
        return date.toISOString();
    }

    /**
     * Escapa caracteres especiais para XML
     */
    protected escapeXml(text: string): string {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}