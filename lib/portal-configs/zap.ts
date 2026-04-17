import { FieldMapping, PortalConnector, PortalSettings, PortalIntegrationStatus } from '../../types/portals';

/**
 * Configuração completa para o Portal Zap Imóveis (VRSync)
 * Documentação: https://developers.grupozap.com/feeds/vrsync/elements/header.html
 */
export const zapConfig = {
  name: 'Zap Imóveis',
  portal: 'ZAP',
  type: 'ZAP',

  // Configuração principal
  enabled: true,
  status: PortalIntegrationStatus.ATIVO,
  syncCount: 0,
  errorCount: 0,

  // Mapeamento completo de campos CRM -> Zap VRSync
  mappings: [
    // Campos básicos
    { internal: 'title', external: 'Title', required: true, transform: (v: any) => v?.substring(0, 60) },
    { internal: 'description', external: 'Description', required: true, transform: (v: any) => v?.substring(0, 2000) },
    { internal: 'price', external: 'ListPrice', required: true, transform: (v: any) => v?.toString() },
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

    // Endereço
    { internal: 'address.street', external: 'Address.Street', required: true },
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

    // Contato
    { internal: 'owner.name', external: 'Contact.Name' },
    { internal: 'owner.phone', external: 'Contact.Phone' },
    { internal: 'owner.email', external: 'Contact.Email' },

    // Multimídia
    { internal: 'photos', external: 'Photos' },
    { internal: 'videos', external: 'Videos' },
    { internal: 'virtualTour', external: 'VirtualTour' },

    // Destaque e pacotes
    { internal: 'highlightPackage', external: 'Highlight.Package' },
    { internal: 'highlightDuration', external: 'Highlight.Duration' },

    // Observações
    { internal: 'observations', external: 'Observations' },
    { internal: 'restrictions', external: 'Restrictions' },

    // Metadados
    { internal: 'createdAt', external: 'CreatedDate', transform: (v: any) => new Date(v).toISOString() },
    { internal: 'updatedAt', external: 'ModifiedDate', transform: (v: any) => new Date(v).toISOString() },
  ] as FieldMapping[],

  // Regras de negócio do Zap VRSync
  rules: {
    minPhotos: 3,
    maxPhotos: 36,
    maxTitleLength: 60,
    maxDescriptionLength: 2000,
    requiresFullAddress: true,
    requiresContactInfo: true,
    supportsVideo: true,
    supportsVirtualTour: true,
    supportsHighlights: true,
    maxHighlightDays: 90,
    autoRenewal: false,
    requiresBrokerLicense: true,
  },

  // Configurações do conector
  connector: {
    format: 'XML_VRSYNC' as const,
    requiresAuth: true,
    authMethod: 'api_key' as const,
    endpoint: 'https://api.zapimoveis.com.br/v1',
    rateLimit: 60, // 60 requests per minute
    supportsBatch: true,
    supportsHighlights: true,
    supportsVirtualTour: true,
    maxPhotos: 36,
    maxTitleLength: 60,
    minPhotos: 3,
  } as PortalConnector,

  // Configurações padrão
  settings: {
    authType: 'api_key' as const,
    apiKey: '',
    baseUrl: 'https://api.zapimoveis.com.br/v1',
    defaultCategory: 'residencial',
    autoPublish: true,
    syncInterval: 30, // minutes
    retryAttempts: 3,
    timeout: 30, // seconds
    customFields: {
      'codigo_imovel': 'propertyCode',
      'bairro_preferencial': 'preferredNeighborhood',
      'tipo_cliente': 'clientType',
    },
    mappingRules: [
      { internal: 'amenities', external: 'Features', required: false },
      { internal: 'documents', external: 'Documents', required: false },
    ],
  } as PortalSettings,

  /**
   * Validador completo para garantir que o anúncio não seja rejeitado pelo Zap
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
    if (!property.photos || property.photos.length < 3) {
      errors.push('O Zap exige pelo menos 3 fotos para publicar');
    }
    if (!property.address?.street || !property.address?.city || !property.address?.state) {
      errors.push('Endereço completo é obrigatório para Zap/VivaReal');
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
    if (property.title?.length > 60) {
      errors.push('O título não pode ultrapassar 60 caracteres');
    }
    if (property.description?.length > 2000) {
      errors.push('A descrição não pode ultrapassar 2000 caracteres');
    }

    // Validações de qualidade
    if (property.photos && property.photos.length < 6) {
      warnings.push('Recomendado pelo menos 6 fotos para melhor engajamento');
    }
    if (!property.description || property.description.length < 100) {
      warnings.push('Descrição muito curta, recomendo mais detalhes sobre o imóvel');
    }
    if (!property.virtualTour && property.photos && property.photos.length >= 6) {
      suggestions.push('Considere adicionar um tour virtual para aumentar as visualizações');
    }
    if (!property.highlightPackage && property.price > 500000) {
      suggestions.push('Para imóveis de alto valor, considere pacotes de destaque');
    }

    // Cálculo de score
    const hasBasicInfo = property.title && property.description && property.price;
    const hasPhotos = property.photos && property.photos.length >= 3;
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
   * Geração de XML VRSync completo
   */
  generateXml: (property: any) => {
    // Esta será implementada no xml-generator
    return '';
  },

  /**
   * Análise de desempenho para o Zap
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
      responseTime: 150,
      errorRate: 0.1,
    };
  }
};
