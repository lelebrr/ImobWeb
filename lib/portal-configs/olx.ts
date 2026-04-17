import { FieldMapping, PortalConnector, PortalSettings, PortalIntegrationStatus } from '../../types/portals';

/**
 * Configuração completa para o Portal OLX (VRSync)
 * Documentação: Mesma do Grupo OLX (VRSync)
 */
export const olxConfig = {
  name: 'OLX',
  portal: 'OLX',
  type: 'OLX',

  // Configuração principal
  enabled: true,
  status: PortalIntegrationStatus.ATIVO,
  syncCount: 0,
  errorCount: 0,

  // Mapeamento completo de campos CRM -> OLX VRSync
  mappings: [
    // Campos básicos
    { internal: 'title', external: 'Subject', required: true, transform: (v: any) => v?.substring(0, 80) },
    { internal: 'description', external: 'Body', required: true, transform: (v: any) => v?.substring(0, 4000) },
    { internal: 'price', external: 'Price', required: true, transform: (v: any) => v?.toString() },
    { internal: 'priceNegotiable', external: 'PriceNegotiable', transform: (v: any) => v ? 'true' : 'false' },

    // Tipo de imóvel e negócio
    {
      internal: 'propertyType', external: 'PropertyType', required: true, transform: (v: string) => {
        const mapping: Record<string, string> = {
          'APARTAMENTO': 'apartment',
          'CASA': 'house',
          'COMERCIAL': 'commercial',
          'TERRENO': 'land',
          'INDUSTRIAL': 'industrial'
        };
        return mapping[v] || v;
      }
    },
    {
      internal: 'transactionType', external: 'TransactionType', required: true, transform: (v: string) => {
        return v === 'VENDA' ? 'sale' : 'rental';
      }
    },

    // Endereço - OLX é mais simples
    { internal: 'address.street', external: 'Address.Street' },
    { internal: 'address.number', external: 'Address.Number' },
    { internal: 'address.complement', external: 'Address.Complement' },
    { internal: 'address.neighborhood', external: 'District', required: true },
    { internal: 'address.city', external: 'City', required: true },
    { internal: 'address.state', external: 'State', required: true },
    { internal: 'address.zipCode', external: 'ZipCode' },
    { internal: 'latitude', external: 'Latitude' },
    { internal: 'longitude', external: 'Longitude' },

    // Características
    { internal: 'area', external: 'Area', transform: (v: any) => v?.toString() },
    { internal: 'areaTotal', external: 'TotalArea', transform: (v: any) => v?.toString() },
    { internal: 'bedrooms', external: 'Bedrooms' },
    { internal: 'bathrooms', external: 'Bathrooms' },
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
    { internal: 'photos', external: 'Images' },
    { internal: 'videos', external: 'Videos' },

    // Categoria e tags
    {
      internal: 'category', external: 'Category', required: true, transform: (v: string) => {
        return v === 'VENDA' ? 'imoveis-venda' : 'imoveis-aluguel';
      }
    },
    { internal: 'tags', external: 'Tags' },

    // Observações
    { internal: 'observations', external: 'Observations' },
    { internal: 'restrictions', external: 'Restrictions' },

    // Metadados
    { internal: 'createdAt', external: 'CreatedDate', transform: (v: any) => new Date(v).toISOString() },
    { internal: 'updatedAt', external: 'ModifiedDate', transform: (v: any) => new Date(v).toISOString() },
  ] as FieldMapping[],

  // Regras de negócio do OLX
  rules: {
    minPhotos: 1,
    maxPhotos: 20,
    maxTitleLength: 80,
    maxDescriptionLength: 4000,
    requiresFullAddress: false, // OLX aceita bairro
    requiresContactInfo: true,
    supportsVideo: true,
    supportsChat: true,
    supportsHighlights: false, // OLX não tem sistema de destaque pago
    maxHighlightDays: 0,
    autoRenewal: false,
    requiresBrokerLicense: false, // OLX permite particulares
  },

  // Configurações do conector
  connector: {
    format: 'XML_VRSYNC' as const,
    requiresAuth: true,
    authMethod: 'api_key' as const,
    endpoint: 'https://api.olx.com.br/v1',
    rateLimit: 30, // OLX tem limite mais restrito
    supportsBatch: true,
    supportsHighlights: false,
    supportsVirtualTour: false,
    maxPhotos: 20,
    maxTitleLength: 80,
    minPhotos: 1,
  } as PortalConnector,

  // Configurações padrão
  settings: {
    authType: 'api_key' as const,
    apiKey: '',
    baseUrl: 'https://api.olx.com.br/v1',
    defaultCategory: 'imoveis',
    autoPublish: true,
    syncInterval: 60, // OLX tem sincronização menos frequente
    retryAttempts: 5, // Mais tentativas por limites mais restritos
    timeout: 45, // segundos
    customFields: {
      'codigo_anuncio': 'adCode',
      'bairro_preferencial': 'preferredNeighborhood',
      'aceita_troca': 'acceptsTrade',
      'valor_minimo': 'minimumValue',
    },
    mappingRules: [
      { internal: 'amenities', external: 'Attributes', required: false },
      { internal: 'documents', external: 'Documents', required: false },
    ],
  } as PortalSettings,

  /**
   * Validador completo para garantir que o anúncio não seja rejeitado pelo OLX
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
      errors.push('O OLX exige pelo menos 1 foto para publicar');
    }
    if (!property.address?.city || !property.address?.state) {
      errors.push('Cidade e estado são obrigatórios para OLX');
    }
    if (!property.neighborhood) {
      warnings.push('Recomendado informar o bairro para melhor localização');
    }

    // Validações de formato
    if (property.title?.length > 80) {
      errors.push('O título não pode ultrapassar 80 caracteres');
    }
    if (property.description?.length > 4000) {
      errors.push('A descrição não pode ultrapassar 4000 caracteres');
    }

    // Validações de qualidade específicas do OLX
    if (property.photos && property.photos.length < 3) {
      warnings.push('Recomendado pelo menos 3 fotos para melhor engajamento');
    }
    if (!property.description || property.description.length < 100) {
      warnings.push('Descrição muito curta, recomendo mais detalhes sobre o imóvel');
    }
    if (property.price > 500000 && !property.description?.includes('motivo da venda')) {
      suggestions.push('Para imóveis de alto valor, explique o motivo da venda na descrição');
    }
    if (!property.tags && property.bedrooms && property.bathrooms) {
      suggestions.push('Adicione tags como "quartos", "banheiros", "área" para melhor busca');
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
   * Geração de XML VRSync completo para OLX
   */
  generateXml: (property: any) => {
    // Esta será implementada no xml-generator
    return '';
  },

  /**
   * Análise de desempenho para o OLX
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
      uptime: 99.5,
      responseTime: 200,
      errorRate: 0.5,
    };
  }
};
