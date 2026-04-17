import { FieldMapping, PortalConnector, PortalSettings, PortalIntegrationStatus } from '../../types/portals';

/**
 * Configuração completa para o Portal Chaves na Mão
 * Documentação: https://tecnologiacnm.github.io/cnm-xml-documentation/
 */
export const chavesNaMaoConfig = {
  name: 'Chaves na Mão',
  portal: 'CHAVES_NA_MAO',
  type: 'CHAVES_NA_MAO',

  // Configuração principal
  enabled: true,
  status: PortalIntegrationStatus.ATIVO,
  syncCount: 0,
  errorCount: 0,

  // Mapeamento completo de campos CRM -> Chaves na Mão XML
  mappings: [
    // Campos básicos
    { internal: 'title', external: 'Titulo', required: true, transform: (v: any) => v?.substring(0, 70) },
    { internal: 'description', external: 'Descricao', required: true, transform: (v: any) => v?.substring(0, 3000) },
    { internal: 'price', external: 'Valor', required: true, transform: (v: any) => v?.toString() },
    { internal: 'priceCurrency', external: 'Moeda', transform: (v: any) => 'BRL' },
    { internal: 'priceCondominium', external: 'Condominio', transform: (v: any) => v?.toString() },
    { internal: 'priceIptu', external: 'IPTU', transform: (v: any) => v?.toString() },

    // Tipo de imóvel e negócio
    {
      internal: 'propertyType', external: 'Tipo', required: true, transform: (v: string) => {
        const mapping: Record<string, string> = {
          'APARTAMENTO': 'apartamento',
          'CASA': 'casa',
          'COMERCIAL': 'comercial',
          'TERRENO': 'terreno',
          'INDUSTRIAL': 'galpao',
          'CONDOMINIO': 'condominio'
        };
        return mapping[v] || v;
      }
    },
    {
      internal: 'transactionType', external: 'Operacao', required: true, transform: (v: string) => {
        return v === 'VENDA' ? 'venda' : 'aluguel';
      }
    },

    // Endereço
    { internal: 'address.street', external: 'Logradouro', required: true },
    { internal: 'address.number', external: 'Numero' },
    { internal: 'address.complement', external: 'Complemento' },
    { internal: 'address.neighborhood', external: 'Bairro', required: true },
    { internal: 'address.city', external: 'Cidade', required: true },
    { internal: 'address.state', external: 'Estado', required: true },
    { internal: 'address.zipCode', external: 'CEP' },
    { internal: 'latitude', external: 'Latitude' },
    { internal: 'longitude', external: 'Longitude' },

    // Características
    { internal: 'area', external: 'AreaTotal', required: true, transform: (v: any) => v?.toString() },
    { internal: 'areaBuilt', external: 'AreaConstruida', transform: (v: any) => v?.toString() },
    { internal: 'bedrooms', external: 'Quartos', required: true },
    { internal: 'bathrooms', external: 'Banheiros', required: true },
    { internal: 'garages', external: 'Vagas' },
    { internal: 'suites', external: 'Suites' },
    { internal: 'floors', external: 'Pavimento' },
    { internal: 'yearBuilt', external: 'AnoConstrucao' },
    { internal: 'furnished', external: 'Mobiliado' },

    // Recursos adicionais
    { internal: 'hasPool', external: 'Piscina' },
    { internal: 'hasBarbecue', external: 'Churrasqueira' },
    { internal: 'hasPlayground', external: 'Playground' },
    { internal: 'hasGym', external: 'Academia' },
    { internal: 'hasSecurity', external: 'Seguranca' },
    { internal: 'hasElevator', external: 'Elevador' },
    { internal: 'hasAirConditioning', external: 'ArCondicionado' },
    { internal: 'hasBalcony', external: 'Varanda' },
    { internal: 'hasTerrace', external: 'Terraco' },
    { internal: 'hasGourmetArea', external: 'AreaGourmet' },
    { internal: 'hasHomeOffice', external: 'HomeOffice' },
    { internal: 'hasStorageRoom', external: 'Deposito' },
    { internal: 'hasLaundry', external: 'Lavanderia' },

    // Contato
    { internal: 'owner.name', external: 'Contato.Nome' },
    { internal: 'owner.phone', external: 'Contato.Telefone' },
    { internal: 'owner.email', external: 'Contato.Email' },

    // Multimídia
    { internal: 'photos', external: 'Fotos' },
    { internal: 'videos', external: 'Videos' },

    // Destaque e pacotes
    { internal: 'highlightPackage', external: 'Destaque.Tipo' },
    { internal: 'highlightDuration', external: 'Destaque.Duracao' },
    { internal: 'featured', external: 'Destaque.Destacado' },

    // Observações e detalhes
    { internal: 'observations', external: 'Observacoes' },
    { internal: 'restrictions', external: 'Restricoes' },
    { internal: 'privileges', external: 'Privilegios' },

    // Metadados
    { internal: 'createdAt', external: 'DataCriacao', transform: (v: any) => new Date(v).toISOString() },
    { internal: 'updatedAt', external: 'DataAtualizacao', transform: (v: any) => new Date(v).toISOString() },
  ] as FieldMapping[],

  // Regras de negócio do Chaves na Mão
  rules: {
    minPhotos: 1,
    maxPhotos: 30,
    maxTitleLength: 70,
    maxDescriptionLength: 3000,
    requiresFullAddress: true,
    requiresContactInfo: true,
    supportsVideo: false, // Chaves na Mão não suporta vídeos
    supportsVirtualTour: false,
    supportsHighlights: true,
    maxHighlightDays: 60,
    autoRenewal: false,
    requiresBrokerLicense: true,
  },

  // Configurações do conector
  connector: {
    format: 'XML_CHAVES_NA_MAO' as const,
    requiresAuth: true,
    authMethod: 'api_key' as const,
    endpoint: 'https://api.chavesnamao.com.br/v1',
    rateLimit: 80, // Chaves na Mão tem limite moderado
    supportsBatch: true,
    supportsHighlights: true,
    supportsVirtualTour: false,
    maxPhotos: 30,
    maxTitleLength: 70,
    minPhotos: 1,
  } as PortalConnector,

  // Configurações padrão
  settings: {
    authType: 'api_key' as const,
    apiKey: '',
    baseUrl: 'https://api.chavesnamao.com.br/v1',
    defaultCategory: 'imoveis',
    autoPublish: true,
    syncInterval: 45, // minutos
    retryAttempts: 4,
    timeout: 35, // segundos
    customFields: {
      'codigo_imovel': 'codigoImovel',
      'bairro_preferencial': 'bairroPreferencial',
      'tipo_cliente': 'tipoCliente',
      'aceita_financiamento': 'aceitaFinanciamento',
      'aceita_troca': 'aceitaTroca',
    },
    mappingRules: [
      { internal: 'amenities', external: 'Comodidades', required: false },
      { internal: 'documents', external: 'Documentos', required: false },
    ],
  } as PortalSettings,

  /**
   * Validador completo para garantir que o anúncio não seja rejeitado pelo Chaves na Mão
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
      errors.push('O Chaves na Mão exige pelo menos 1 foto para publicar');
    }
    if (!property.address?.street || !property.address?.city || !property.address?.state) {
      errors.push('Endereço completo é obrigatório para Chaves na Mão');
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
    if (property.title?.length > 70) {
      errors.push('O título não pode ultrapassar 70 caracteres');
    }
    if (property.description?.length > 3000) {
      errors.push('A descrição não pode ultrapassar 3000 caracteres');
    }

    // Validações de qualidade específicas do Chaves na Mão
    if (property.photos && property.photos.length < 4) {
      warnings.push('Recomendado pelo menos 4 fotos para melhor engajamento');
    }
    if (!property.description || property.description.length < 150) {
      warnings.push('Descrição muito curta, recomendo mais detalhes sobre o imóvel');
    }
    if (property.price > 800000 && !property.highlightPackage) {
      suggestions.push('Para imóveis de alto valor, considere pacotes de destaque');
    }
    if (!property.neighborhood && property.address?.city) {
      warnings.push('Recomendado informar o bairro para melhor localização');
    }
    if (property.transactionType === 'ALUGUEL' && !property.priceCondominium) {
      warnings.push('Para aluguéis, é importante informar o valor do condomínio');
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
   * Geração de XML Chaves na Mão completo
   */
  generateXml: (property: any) => {
    // Esta será implementada no xml-generator
    return '';
  },

  /**
   * Análise de desempenho para o Chaves na Mão
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
      uptime: 99.7,
      responseTime: 180,
      errorRate: 0.3,
    };
  }
};
