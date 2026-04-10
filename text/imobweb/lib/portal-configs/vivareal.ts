import { FieldMapping } from '../../types/portals';

/**
 * Configuração específica para o Portal Viva Real
 */
export const vivaRealConfig = {
  name: 'Viva Real',
  portal: 'VIVAREAL',
  
  mappings: [
    { internal: 'title', external: 'Title', required: true },
    { internal: 'description', external: 'Description', required: true },
    { internal: 'priceRent', external: 'RentalPrice', transform: (v: any) => v?.toString() },
    { internal: 'priceCondominium', external: 'CondoFee' },
    { internal: 'area', external: 'LivingArea', required: true },
    { internal: 'bedrooms', external: 'Bedrooms' },
  ] as FieldMapping[],

  rules: {
    minPhotos: 1,
    requiresFullAddress: false, // VivaReal aceita bairro se for confuso
    supportsBadge: true, // Super Destaque, etc.
  }
};
