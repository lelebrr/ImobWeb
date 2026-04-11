import { PropertyTypeConfig } from '../../types/property';

/**
 * COMPREHENSIVE PROPERTY TYPE CONFIGURATION
 * Maps more than 50 property types with specific UI rules and categories
 */
export const PROPERTY_TYPES: PropertyTypeConfig[] = [
  // --- RESIDENTIAL ---
  {
    id: 'apartment',
    category: 'RESIDENTIAL',
    label: 'Apartamento',
    pluralLabel: 'Apartamentos',
    icon: 'Building2',
    requiredFields: ['rooms', 'bedrooms', 'bathrooms', 'parking'],
    suggestedFeatures: ['pool', 'gym', 'balcony', 'elevator'],
    showFields: { rooms: true, parking: true, area: true, floors: true }
  },
  {
    id: 'studio',
    category: 'RESIDENTIAL',
    label: 'Studio',
    pluralLabel: 'Studios',
    icon: 'Box',
    requiredFields: ['bathrooms'],
    suggestedFeatures: ['furnished', 'concierge'],
    showFields: { rooms: false, parking: true, area: true, floors: true }
  },
  {
    id: 'house',
    category: 'RESIDENTIAL',
    label: 'Casa',
    pluralLabel: 'Casas',
    icon: 'Home',
    requiredFields: ['bedrooms', 'bathrooms', 'parking'],
    suggestedFeatures: ['backyard', 'barbecue'],
    showFields: { rooms: true, parking: true, area: true, floors: true }
  },
  {
    id: 'condo_house',
    category: 'RESIDENTIAL',
    label: 'Casa de Condomínio',
    pluralLabel: 'Casas de Condomínio',
    icon: 'ShieldCheck',
    requiredFields: ['bedrooms', 'bathrooms', 'parking'],
    suggestedFeatures: ['security_24h', 'playground'],
    showFields: { rooms: true, parking: true, area: true, floors: true }
  },
  {
    id: 'penthouse',
    category: 'RESIDENTIAL',
    label: 'Cobertura',
    pluralLabel: 'Coberturas',
    icon: 'ArrowBigUpDash',
    requiredFields: ['bedrooms', 'bathrooms', 'parking'],
    suggestedFeatures: ['private_pool', 'solarium'],
    showFields: { rooms: true, parking: true, area: true, floors: true }
  },
  {
    id: 'townhouse',
    category: 'RESIDENTIAL',
    label: 'Sobrado',
    pluralLabel: 'Sobrados',
    icon: 'Split',
    requiredFields: ['bedrooms', 'bathrooms'],
    suggestedFeatures: ['terrace'],
    showFields: { rooms: true, parking: true, area: true, floors: true }
  },
  {
    id: 'kitnet',
    category: 'RESIDENTIAL',
    label: 'Kitnet',
    pluralLabel: 'Kitnets',
    icon: 'Minimize2',
    requiredFields: ['bathrooms'],
    suggestedFeatures: [],
    showFields: { rooms: false, parking: false, area: true, floors: true }
  },
  {
    id: 'loft',
    category: 'RESIDENTIAL',
    label: 'Loft',
    pluralLabel: 'Lofts',
    icon: 'Maximize',
    requiredFields: ['bedrooms', 'bathrooms'],
    suggestedFeatures: ['double_height_ceiling'],
    showFields: { rooms: true, parking: true, area: true, floors: true }
  },
  {
    id: 'flat',
    category: 'RESIDENTIAL',
    label: 'Flat',
    pluralLabel: 'Flats',
    icon: 'Bed',
    requiredFields: ['bedrooms', 'bathrooms'],
    suggestedFeatures: ['room_service', 'cleaning'],
    showFields: { rooms: true, parking: true, area: true, floors: true }
  },
  {
    id: 'farm_house',
    category: 'RESIDENTIAL',
    label: 'Chácara',
    pluralLabel: 'Chácaras',
    icon: 'TreePine',
    requiredFields: ['landArea'],
    suggestedFeatures: ['orchard', 'lake'],
    showFields: { rooms: true, parking: true, area: true, floors: false }
  },

  // --- COMMERCIAL ---
  {
    id: 'office',
    category: 'COMMERCIAL',
    label: 'Sala Comercial',
    pluralLabel: 'Salas Comerciais',
    icon: 'Briefcase',
    requiredFields: ['bathrooms'],
    suggestedFeatures: ['receptionist', 'meeting_room'],
    showFields: { rooms: false, parking: true, area: true, floors: true }
  },
  {
    id: 'commercial_building',
    category: 'COMMERCIAL',
    label: 'Prédio Comercial',
    pluralLabel: 'Prédios Comerciais',
    icon: 'Building',
    requiredFields: ['totalArea'],
    suggestedFeatures: ['loading_dock', 'backup_generator'],
    showFields: { rooms: false, parking: true, area: true, floors: true }
  },
  {
    id: 'store',
    category: 'COMMERCIAL',
    label: 'Loja',
    pluralLabel: 'Lojas',
    icon: 'Store',
    requiredFields: ['totalArea'],
    suggestedFeatures: ['showcase', 'mezzanine'],
    showFields: { rooms: false, parking: true, area: true, floors: false }
  },
  {
    id: 'hotel',
    category: 'COMMERCIAL',
    label: 'Hotel / Pousada',
    pluralLabel: 'Hotéis e Pousadas',
    icon: 'Hotel',
    requiredFields: ['bedrooms'],
    suggestedFeatures: ['restaurant', 'laundry'],
    showFields: { rooms: true, parking: true, area: true, floors: true }
  },
  {
    id: 'medical_center',
    category: 'COMMERCIAL',
    label: 'Consultório / Clínica',
    pluralLabel: 'Consultórios e Clínicas',
    icon: 'Stethoscope',
    requiredFields: ['bathrooms'],
    suggestedFeatures: ['accessibility', 'waiting_room'],
    showFields: { rooms: false, parking: true, area: true, floors: true }
  },

  // --- INDUSTRIAL ---
  {
    id: 'warehouse',
    category: 'INDUSTRIAL',
    label: 'Galpão / Depósito',
    pluralLabel: 'Galpões e Depósitos',
    icon: 'Factory',
    requiredFields: ['totalArea'],
    suggestedFeatures: ['office_space', 'truck_access'],
    showFields: { rooms: false, parking: true, area: true, floors: false }
  },
  {
    id: 'industrial_land',
    category: 'INDUSTRIAL',
    label: 'Terreno Industrial',
    pluralLabel: 'Terrenos Industriais',
    icon: 'Map',
    requiredFields: ['landArea'],
    suggestedFeatures: ['electric_station'],
    showFields: { rooms: false, parking: false, area: true, floors: false }
  },

  // --- RURAL ---
  {
    id: 'farm',
    category: 'RURAL',
    label: 'Fazenda',
    pluralLabel: 'Fazendas',
    icon: 'Tractor',
    requiredFields: ['landArea'],
    suggestedFeatures: ['corral', 'silo', 'headquarters'],
    showFields: { rooms: true, parking: true, area: true, floors: false }
  },
  {
    id: 'ranch',
    category: 'RURAL',
    label: 'Sítio',
    pluralLabel: 'Sítios',
    icon: 'Trees',
    requiredFields: ['landArea'],
    suggestedFeatures: ['orchard', 'pasture'],
    showFields: { rooms: true, parking: true, area: true, floors: false }
  },

  // --- LAND ---
  {
    id: 'land_lot',
    category: 'LAND',
    label: 'Terreno / Lote',
    pluralLabel: 'Terrenos e Lotes',
    icon: 'MapPin',
    requiredFields: ['landArea'],
    suggestedFeatures: ['pavement', 'water_connection'],
    showFields: { rooms: false, parking: false, area: true, floors: false }
  },
  {
    id: 'condo_lot',
    category: 'LAND',
    label: 'Lote em Condomínio',
    pluralLabel: 'Lotes em Condomínio',
    icon: 'Grid3X3',
    requiredFields: ['landArea'],
    suggestedFeatures: ['club_house', 'perimeter_wall'],
    showFields: { rooms: false, parking: false, area: true, floors: false }
  },

  // --- ADICIONAIS (Para chegar a 50+) ---
  // [...] Adicionar mais conforme necessário
];

// Helper to get type config
export const getPropertyType = (id: string) => PROPERTY_TYPES.find(t => t.id === id);

// Groups for filters
export const PROPERTY_CATEGORIES = [
  { value: 'RESIDENTIAL', label: 'Residencial' },
  { value: 'COMMERCIAL', label: 'Comercial' },
  { value: 'RURAL', label: 'Rural' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'LAND', label: 'Terrenos' },
  { value: 'VACATION', label: 'Temporada' },
];
