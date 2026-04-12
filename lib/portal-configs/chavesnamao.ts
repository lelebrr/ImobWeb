import { FieldMapping } from '../../types/portals';

/**
 * Configuração específica para o Portal Chaves na Mão
 */
export const chavesNaMaoConfig = {
  name: 'Chaves na Mão',
  portal: 'CHAVES_NA_MAO',
  
  mappings: [
    { internal: 'title', external: 'Titulo', required: true },
    { internal: 'description', external: 'Descricao', required: true },
    { internal: 'price', external: 'Valor', transform: (v: any) => v?.toString() },
    { internal: 'area', external: 'AreaTotal' },
    { internal: 'bedrooms', external: 'Quartos' },
    { internal: 'bathrooms', external: 'Banheiros' },
    { internal: 'garages', external: 'Vagas' },
  ] as FieldMapping[],

  rules: {
    minPhotos: 1,
    supportsVideo: false,
    format: 'XML'
  }
};
