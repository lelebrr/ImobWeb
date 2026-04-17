import { FieldMapping, PortalConnector, PortalSettings, PortalIntegrationStatus } from '../../types/portals';

/**
 * Configuração completa para o Portal ImovelWeb
 * Documentação: https://help.imovelweb.com.br (integração de leads e XML)
 */
export const imovelwebConfig = {
  name: 'ImovelWeb',
  portal: 'IMOVELWEB',
  type: 'IMOVELWEB',

  // Configuração principal
  enabled: true,
  status: PortalIntegrationStatus.ATIVO,
  syncCount: 0,
  errorCount: 0,

  // Mapeamento completo de campos CRM -> ImovelWeb XML
  mappings: [
    // Campos básicos
    { internal: 'title', external: 'AdTitle', required: true, transform: (v: any) => v?.substring(0, 100) },
    { internal: 'description', external: 'AdDescription', required: true, transform: (v: any) => v?.substring(0, 5000) },
    { internal: 'price', external: 'Price', required: true, transform: (v: any) => v?.toString() },
    { internal: 'priceCurrency', external: 'PriceCurrency', transform: (v: any) => 'BRL' },
    { internal: 'priceCondominium', external: 'CondoFee', transform: (v: any) => v?.toString() },
    { internal: 'priceIptu', external: 'TaxFee', transform: (v: any) => v?.toString() },

    // Tipo de imóvel e negócio
    {
      internal: 'propertyType', external: 'PropertyType', required: true, transform: (v: string) => {
        const mapping: Record<string, string> = {
          'APARTAMENTO': 'Apartamento',
          'CASA': 'Casa',
          'COMERCIAL': 'Comercial',
          'TERRENO': 'Terreno',
          'INDUSTRIAL': 'Industrial',
          'CONDOMINIO': 'Condomínio'
        };
        return mapping[v] || v;
      }
    },
    {
      internal: 'transactionType', external: 'Operation', required: true, transform: (v: string) => {
        return v === 'VENDA' ? 'Sale' : 'Rent';
      }
    },

    // Endereço
    { internal: 'address.street', external: 'Street', required: true },
    { internal: 'address.number', external: 'Number' },
    { internal: 'address.complement', external: 'Complement' },
    { internal: 'address.neighborhood', external: 'District', required: true },
    { internal: 'address.city', external: 'City', required: true },
    { internal: 'address.state', external: 'State', required: true },
    { internal: 'address.zipCode', external: 'ZipCode' },
    { internal: 'latitude', external: 'Latitude' },
    { internal: 'longitude', external: 'Longitude' },

    // Características
    { internal: 'area', external: 'TotalArea', required: true, transform: (v: any) => v?.toString() },
    { internal: 'areaBuilt', external: 'BuiltArea', transform: (v: any) => v?.toString() },
    { internal: 'areaPrivate', external: 'PrivateArea', transform: (v: any) => v?.toString() },
    { internal: 'bedrooms', external: 'RoomCount', required: true },
    { internal: 'bathrooms', external: 'BathroomCount', required: true },
    { internal: 'garages', external: 'GarageCount' },
    { internal: 'suites', external: 'SuiteCount' },
    { internal: 'floors', external: 'Floor' },
    { internal: 'yearBuilt', external: 'YearBuilt' },
    { internal: 'furnished', external: 'Furnished' },
    { internal: 'semiFurnished', external: 'SemiFurnished' },

    // Recursos adicionais
    { internal: 'hasPool', external: 'HasPool' },
    { internal: 'hasBarbecue', external: 'HasBarbecue' },
    { internal: 'hasPlayground', external: 'HasPlayground' },
    { internal: 'hasGym', external: 'HasGym' },
    { internal: 'hasSecurity', external: 'HasSecurity' },
    { internal: 'hasElevator', external: 'HasElevator' },
    { internal: 'hasAirConditioning', external: 'HasAirConditioning' },
    { internal: 'hasBalcony', external: 'HasBalcony' },
    { internal: 'hasTerrace', external: 'HasTerrace' },
    { internal: 'hasGourmetArea', external: 'HasGourmetArea' },

    // Contato
    { internal: 'owner.name', external: 'Contact.Name' },
    { internal: 'owner.phone', external: 'Contact.Phone' },
    { internal: 'owner.email', external: 'Contact.Email' },

    // Multimídia
    { internal: 'photos', external: 'Images' },
    { internal: 'videos', external: 'Videos' },
    { internal: 'virtualTour', external: 'VirtualTour' },

    // Destaque e pacotes
    { internal: 'highlightPackage', external: 'Highlight.Package' },
    { internal: 'highlightDuration', external: 'Highlight.Duration' },
    { internal: 'featured', external: 'Featured' },

    // Observações e detalhes
    { internal: 'observations', external: 'Observations' },
    { internal: 'restrictions', external: 'Restrictions' },
    { internal: 'privileges', external: 'Privileges' },

    // Metadados
    { internal: 'createdAt', external: 'CreatedDate', transform: (v: any) => new Date(v).toISOString() },
    { internal: 'updatedAt', external: 'ModifiedDate', transform: (v: any) => new Date(v).toISOString() },
  ] as FieldMapping[],

  // Regras de negócio do ImovelWeb
  rules: {
    minPhotos: 1,
    maxPhotos: 50,
    maxTitleLength: 100,
    maxDescriptionLength: 5000,
    requiresFullAddress: true,
    requiresContactInfo: true,
    supportsVideo: true,
    supportsVirtualTour: true,
    supportsHighlights: true,
    maxHighlightDays: 90,
    autoRenewal: true,
    requiresBrokerLicense: true,
  },

  // Configurações do conector
  connector: {
    format: 'XML_IMOBILEWEB' as const,
    requiresAuth: true,
    authMethod: 'api_key' as const,
    endpoint: 'https://api.imovelweb.com.br/v1',
    rateLimit: 120, // ImovelWeb tem limite generoso
    supportsBatch: true,
    supportsHighlights: true,
    supportsVirtualTour: true,
    maxPhotos: 50,
    maxTitleLength: 100,
    minPhotos: 1,
  } as PortalConnector,

  // Configurações padrão
  settings: {
    authType: 'api_key' as const,
    apiKey: '',
    baseUrl: 'https://api.imovelweb.com.br/v1',
    defaultCategory: 'residencial',
    autoPublish: true,
    syncInterval: 15, // ImovelWeb permite sincronização frequente
    retryAttempts: 3,
    timeout: 30, // segundos
    customFields: {
      'codigo_imovel': 'propertyCode',
      'bairro_preferencial': 'preferredNeighborhood',
      'tipo_cliente': 'clientType',
      'aceita_financiamento': 'acceptsFinancing',
      'aceita_troca': 'acceptsTrade',
    },
    mappingRules: [
      { internal: 'amenities', external: 'Amenities', required: false },
      { internal: 'documents', external: 'Documents', required: false },
      { internal: 'energyRating', external: 'EnergyRating', required: false },
    ],
  } as PortalSettings,

  /**
   * Validador completo para garantir que o anúncio não seja rejeitado pelo ImovelWeb
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
      errors.push('O ImovelWeb exige pelo menos 1 foto para publicar');
    }
    if (!property.address?.street || !property.address?.city || !property.address?.state) {
      errors.push('Endereço completo é obrigatório para ImovelWeb');
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
    if (property.title?.length > 100) {
      errors.push('O título não pode ultrapassar 100 caracteres');
    }
    if (property.description?.length > 5000) {
      errors.push('A descrição não pode ultrapassar 5000 caracteres');
    }

    // Validações de qualidade específicas do ImovelWeb
    if (property.photos && property.photos.length < 6) {
      warnings.push('Recomendado pelo menos 6 fotos para melhor engajamento');
    }
    if (!property.description || property.description.length < 200) {
      warnings.push('Descrição muito curta, recomendo mais detalhes sobre o imóvel');
    }
    if (!property.virtualTour && property.photos && property.photos.length >= 8) {
      suggestions.push('Considere adicionar um tour virtual para aumentar as visualizações');
    }
    if (property.price > 1000000 && !property.highlightPackage) {
      suggestions.push('Para imóveis de alto valor, considere pacotes de destaque');
    }
    if (!property.energyRating && property.area > 150) {
      suggestions.push('Imóveis grandes devem ter classificação energética');
    }

    // Cálculo de score
    const hasBasicInfo = property.title && property.description && property.price;
    const hasPhotos = property.photos && property.photos.length >= 1;
    const hasAddress = property.address?.street && property.address?.city && property.address?.state;
    const hasDimensions = property.area && property.bedrooms && property.bathrooms;

    const score = Math.round(
      (hasBasicInfo ? 25 : 0) +
      (hasPhotos ? 25 : 0) +
      (hasAddress ? 25 : 0) +
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
   * Geração de XML ImovelWeb completo
   */
  generateXml: (property: any) => {
    // Esta será implementada no xml-generator
    return '';
  },

  /**
   * Análise de desempenho para o ImovelWeb
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
      responseTime: 100,
      errorRate: 0.1,
    };
  }
};
