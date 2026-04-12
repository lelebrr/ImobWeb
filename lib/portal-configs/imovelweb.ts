import { FieldMapping } from '../../types/portals';

/**
 * Configuração específica para o Portal ImovelWeb
 */
export const imovelwebConfig = {
  name: 'ImovelWeb',
  portal: 'IMOVELWEB',
  
  mappings: [
    { internal: 'title', external: 'AdTitle', required: true },
    { internal: 'description', external: 'AdDescription', required: true },
    { internal: 'price', external: 'Price', transform: (v: any) => v?.toString() },
    { internal: 'area', external: 'TotalArea' },
    { internal: 'bedrooms', external: 'RoomCount' },
  ] as FieldMapping[],

  rules: {
    minPhotos: 1,
    supportsVirtualTour: true,
  }
};
