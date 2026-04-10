import { FieldMapping, PortalConnector } from '../../types/portals';

/**
 * Configuração específica para o Portal Zap Imóveis
 */
export const zapConfig = {
  name: 'Zap Imóveis',
  portal: 'ZAP',
  
  // Mapeamento de campos CRM -> Zap
  mappings: [
    { internal: 'title', external: 'Title', required: true },
    { internal: 'description', external: 'Description', required: true },
    { internal: 'price', external: 'ListPrice', transform: (v: any) => v?.toString() },
    { internal: 'propertyType', external: 'PropertyType', transform: (v: any) => v.toLowerCase() },
    { internal: 'area', external: 'LivingArea', required: true },
    { internal: 'bedrooms', external: 'Bedrooms' },
    { internal: 'bathrooms', external: 'Bathrooms' },
    { internal: 'garages', external: 'Garages' },
  ] as FieldMapping[],

  // Regras de negócio do Zap
  rules: {
    minPhotos: 3,
    maxTitleLength: 60,
    requiresFullAddress: true,
    supportsVideo: true,
    supportsVirtualTour: true,
  },

  /**
   * Validador customizado para garantir que o anúncio não seja rejeitado pelo Zap
   */
  validate: (property: any) => {
    const errors: string[] = [];
    if (!property.photos || property.photos.length < 3) {
      errors.push('O Zap exige pelo menos 3 fotos para publicar.');
    }
    if (property.title?.length > 60) {
      errors.push('O título para o Zap não pode ultrapassar 60 caracteres.');
    }
    return { valid: errors.length === 0, errors };
  }
};
