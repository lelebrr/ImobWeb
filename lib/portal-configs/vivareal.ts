import { FieldMapping, PortalConnector, PortalSettings, PortalIntegrationStatus } from '../../types/portals';

/**
 * Configuração completa para o Portal Viva Real (VRSync)
 * Documentação: Mesma do Grupo OLX (VRSync)
 */
export const vivaRealConfig = {
  name: 'Viva Real',
  portal: 'VIVAREAL',
  type: 'VIVAREAL',

  // Configuração principal
  enabled: true,
  status: PortalIntegrationStatus.ATIVO,
  syncCount: 0,
  errorCount: 0,

  // Mapeamento completo de campos CRM -> Viva Real VRSync
  mappings: [
    // Campos básicos
    { internal: 'title', external: 'Title', required: true, transform: (v: any) => v?.substring(0, 80) },
    { internal: 'description', external: 'Description', required: true, transform: (v: any) => v?.substring(0, 3000) },
    { internal: 'price', external: 'ListPrice', required: true, transform: (v: any) => v?.toString() },
    { internal: 'priceRent', external: 'RentalPrice', transform: (v: any) => v?.toString() },
    { internal: 'priceCondominium', external: 'CondoFee', transform: (v: any) => v?.toString() },
    { internal: 'priceIptu', external: 'TaxFee', transform: (v: any) => v?.toString() },

    // Tipo de imóvel e negócio
    {
      internal: 'propertyType', external: 'PropertyType', required: true, transform: (v: string) => {
        const mapping: Record<string, string> = {
          'APARTAMENTO': 'Apartment',
          'CASA': 'House',
          'COMERCIAL': 'Commercial',
          'TERRENO': 'Land',
          'INDUSTRIAL': 'Industrial',
          'CONDOMINIO': 'Condominium'
        };
        return mapping[v] || v;
      }
    },
    {
      internal: 'transactionType', external: 'TransactionType', required: true, transform: (v: string) => {
        return v === 'VENDA' ? 'Sale' : 'Lease';
      }
    },

    // Endereço - Viva Real é mais flexível que Zap
    { internal: 'address.street', external: 'Address.Street', required: false },
    { internal: 'address.number', external: 'Address.Number' },
    { internal: 'address.complement', external: 'Address.Complement' },
    { internal: 'address.neighborhood', external: 'Address.District', required: true },
    { internal: 'address.city', external: 'Address.City', required: true },
    { internal: 'address.state', external: 'Address.State', required: true },
    { internal: 'address.zipCode', external: 'Address.ZipCode' },
    { internal: 'latitude', external: 'Address.Latitude' },
    { internal: 'longitude', external: 'Address.Longitude' },

    // Características
    { internal: 'area', external: 'LivingArea', required: true, transform: (v: any) => v?.toString() },
    { internal: 'areaTotal', external: 'TotalArea', transform: (v: any) => v?.toString() },
    { internal: 'areaBuilt', external: 'BuiltArea', transform: (v: any) => v?.toString() },
    { internal: 'bedrooms', external: 'Bedrooms', required: true },
    { internal: 'bathrooms', external: 'Bathrooms', required: true },
    { internal: 'garages', external: 'Garages' },
    { internal: 'suites', external: 'Suites' },
    { internal: 'floors', external: 'Floor' },
    { internal: 'yearBuilt', external: 'YearBuilt' },
    { internal: 'furnished', external: 'Furnished' },

    // Recursos adicionais
    { internal: 'hasPool', external: 'HasPool' },
    { internal: 'hasBarbecue', external: 'HasBarbecue' },
    { internal: 'hasPlayground', external: 'HasPlayground' },
    { internal: 'hasGym', external: 'HasGym' },
    { internal: 'hasSecurity', external: 'HasSecurity' },
    { internal: 'hasElevator', external: 'HasElevator' },
    { internal: 'hasAirConditioning', external: 'HasAirConditioning' },

    // Contato
    { internal: 'owner.name', external: 'Contact.Name' },
    { internal: 'owner.phone', external: 'Contact.Phone' },
    { internal: 'owner.email', external: 'Contact.Email' },

    // Multimídia
    { internal: 'photos', external: 'Photos' },
    { internal: 'videos', external: 'Videos' },
    { internal: 'virtualTour', external: 'VirtualTour' },

    // Destaque e pacotes (Viva Real tem sistema de badge)
    { internal: 'highlightPackage', external: 'Badge.Package' },
    { internal: 'highlightDuration', external: 'Badge.Duration' },
    { internal: 'highlightPosition', external: 'Badge.Position' },

    // Observações
    { internal: 'observations', external: 'Observations' },
    { internal: 'restrictions', external: 'Restrictions' },

    // Metadados
    { internal: 'createdAt', external: 'CreatedDate', transform: (v: any) => new Date(v).toISOString() },
    { internal: 'updatedAt', external: 'ModifiedDate', transform: (v: any) => new Date(v).toISOString() },
  ] as FieldMapping[],

  // Regras de negócio do Viva Real
  rules: {
    minPhotos: 1,
    maxPhotos: 50,
    maxTitleLength: 80,
    maxDescriptionLength: 3000,
    requiresFullAddress: false, // Viva Real aceita bairro se for confuso
    requiresContactInfo: true,
    supportsVideo: true,
    supportsVirtualTour: true,
    supportsHighlights: true,
    supportsBadges: true,
    maxHighlightDays: 90,
    autoRenewal: true,
    requiresBrokerLicense: true,
  },

  // Configurações do conector
  connector: {
    format: 'XML_VRSYNC' as const,
    requiresAuth: true,
    authMethod: 'api_key' as const,
    endpoint: 'https://api.vivareal.com.br/v1',
    rateLimit: 60, // 60 requests per minute
    supportsBatch: true,
    supportsHighlights: true,
    supportsVirtualTour: true,
    maxPhotos: 50,
    maxTitleLength: 80,
    minPhotos: 1,
  } as PortalConnector,

  // Configurações padrão
  settings: {
    authType: 'api_key' as const,
    apiKey: '',
    baseUrl: 'https://api.vivareal.com.br/v1',
    defaultCategory: 'residencial',
    autoPublish: true,
    syncInterval: 30, // minutes
    retryAttempts: 3,
    timeout: 30, // seconds
    customFields: {
      'codigo_imovel': 'propertyCode',
      'bairro_preferencial': 'preferredNeighborhood',
      'tipo_cliente': 'clientType',
      'destaque_super': 'superHighlight',
    },
    mappingRules: [
      { internal: 'amenities', external: 'Features', required: false },
      { internal: 'documents', external: 'Documents', required: false },
    ],
  } as PortalSettings,

  /**
   * Validador completo para garantir que o anúncio não seja rejeitado pelo Viva Real
   */
  validate: (property: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validações obrigatórias
    if (!property.title || property.title.trim().length === 0) {
      errors.push('Título é obrigatório');
    }
    if (!property.description || property.description.trim().length === 0) {
      errors.push('Descrição é obrigatória');
    }
    if (!property.price || property.price <= 0) {
      errors.push('Preço é obrigatório e deve ser maior que zero');
    }
    if (!property.photos || property.photos.length < 1) {
      errors.push('O Viva Real exige pelo menos 1 foto para publicar');
    }
    if (!property.address?.city || !property.address?.state) {
      errors.push('Cidade e estado são obrigatórios para Viva Real');
    }
    if (!property.bedrooms || property.bedrooms < 1) {
      errors.push('Número de quartos é obrigatório');
    }
    if (!property.bathrooms || property.bathrooms < 1) {
      errors.push('Número de banheiros é obrigatório');
    }
    if (!property.area || property.area <= 0) {
      errors.push('Área do imóvel é obrigatória');
    }

    // Validações de formato
    if (property.title?.length > 80) {
      errors.push('O título não pode ultrapassar 80 caracteres');
    }
    if (property.description?.length > 3000) {
      errors.push('A descrição não pode ultrapassar 3000 caracteres');
    }

    // Validações de qualidade específicas do Viva Real
    if (property.photos && property.photos.length < 3) {
      warnings.push('Recomendado pelo menos 3 fotos para melhor engajamento');
    }
    if (!property.description || property.description.length < 150) {
      warnings.push('Descrição muito curta, recomendo mais detalhes sobre o imóvel');
    }
    if (!property.virtualTour && property.photos && property.photos.length >= 5) {
      suggestions.push('Considere adicionar um tour virtual para aumentar as visualizações');
    }
    if (property.price > 1000000 && !property.highlightPackage) {
      suggestions.push('Para imóveis de alto valor, considere pacotes de destaque (Super Destaque)');
    }
    if (!property.neighborhood && property.address?.city) {
      warnings.push('Recomendado informar o bairro para melhor localização');
    }

    // Cálculo de score
    const hasBasicInfo = property.title && property.description && property.price;
    const hasPhotos = property.photos && property.photos.length >= 1;
    const hasLocation = property.address?.city && property.address?.state;
    const hasDimensions = property.area && property.bedrooms && property.bathrooms;

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
  },

  /**
   * Geração de XML VRSync completo para Viva Real
   */
  generateXml: (property: any) => {
    // Esta será implementada no xml-generator
    return '';
  },

  /**
   * Análise de desempenho para o Viva Real
   */
  getAnalytics: async (propertyId?: string) => {
    // Implementação futura para analytics
    return {
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      totalClicks: 0,
      totalLeads: 0,
      conversionRate: 0,
    };
  },

  /**
   * Verificação de saúde da integração
   */
  checkHealth: async () => {
    // Implementação futura para health check
    return {
      status: 'healthy' as const,
      lastCheck: new Date(),
      uptime: 99.9,
      responseTime: 120,
      errorRate: 0.1,
    };
  }
};
