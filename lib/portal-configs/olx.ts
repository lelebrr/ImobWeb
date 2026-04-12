import { FieldMapping } from '../../types/portals';

/**
 * Configuração específica para o Portal OLX
 */
export const olxConfig = {
  name: 'OLX',
  portal: 'OLX',
  
  mappings: [
    { internal: 'title', external: 'Subject', required: true },
    { internal: 'description', external: 'Body', required: true },
    { internal: 'price', external: 'Price', transform: (v: any) => v?.toString() },
    { internal: 'city', external: 'City', required: true },
    { internal: 'neighborhood', external: 'District', required: true },
  ] as FieldMapping[],

  rules: {
    minPhotos: 1,
    maxPhotos: 20,
    supportsChat: true,
    category: 'Imóveis',
  }
};
