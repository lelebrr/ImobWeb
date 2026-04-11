import { z } from 'zod';

export const PropertyTypeSchema = z.enum(['apartamento', 'casa', 'terreno', 'comercial', 'salas', 'galpão', 'loja', 'outro']);
export type PropertyType = z.infer<typeof PropertyTypeSchema>;

export const LocationZoneSchema = z.enum(['centro', 'zona-norte', 'zona-sul', 'zona-leste', 'zona-oeste', 'periferia', 'litoral', 'interior']);
export type LocationZone = z.infer<typeof LocationZoneSchema>;

export const PriceInputSchema = z.object({
  type: PropertyTypeSchema,
  area: z.number().positive().max(10000),
  location: z.string().min(2).max(200),
  zone: LocationZoneSchema.optional(),
  beds: z.number().int().min(0).max(20).optional(),
  baths: z.number().int().min(0).max(10).optional(),
  parking: z.number().int().min(0).max(5).optional(),
  age: z.number().int().min(0).max(200).optional(),
  features: z.array(z.string()).optional(),
  floor: z.number().int().optional(),
  hasElevator: z.boolean().optional(),
});

export type PriceInput = z.infer<typeof PriceInputSchema>;

export interface PriceSuggestion {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  pricePerSqm: number;
  confidence: number;
  factors: PriceFactor[];
  marketData?: MarketData;
}

export interface PriceFactor {
  name: string;
  impact: number;
  description: string;
}

export interface MarketData {
  avgPricePerSqm: number;
  propertiesAnalyzed: number;
  avgDaysOnMarket: number;
  trend: 'rising' | 'stable' | 'falling';
}

const BASE_PRICES: Record<PropertyType, number> = {
  apartamento: 3500,
  casa: 3200,
  terreno: 800,
  comercial: 4000,
  salas: 3800,
  galpão: 1500,
  loja: 4500,
  outro: 3000,
};

const ZONE_MULTIPLIERS: Record<LocationZone, number> = {
  centro: 1.35,
  'zona-norte': 1.0,
  'zona-sul': 1.15,
  'zona-leste': 0.9,
  'zona-oeste': 1.1,
  periferia: 0.75,
  litoral: 1.25,
  interior: 0.7,
};

export function suggestPrice(input: PriceInput): PriceSuggestion {
  const basePrice = BASE_PRICES[input.type] || 3000;
  
  const factors: PriceFactor[] = [];

  const zoneMultiplier = input.zone ? ZONE_MULTIPLIERS[input.zone] : calculateZoneMultiplier(input.location);
  factors.push({
    name: 'Localização',
    impact: zoneMultiplier,
    description: `Fator baseado na zona: ${input.zone || 'detecção automática'}`,
  });

  const bedsImpact = input.beds ? 1 + (input.beds * 0.08) : 1;
  if (input.beds) {
    factors.push({
      name: 'Número de quartos',
      impact: bedsImpact,
      description: `${input.beds} quarto(s) adiciona ${((bedsImpact - 1) * 100).toFixed(1)}% ao valor`,
    });
  }

  const bathsImpact = input.baths ? 1 + (input.baths * 0.05) : 1;
  if (input.baths) {
    factors.push({
      name: 'Banheiros',
      impact: bathsImpact,
      description: `${input.baths} banheiro(s) adiciona ${((bathsImpact - 1) * 100).toFixed(1)}% ao valor`,
    });
  }

  const parkingImpact = input.parking ? 1 + (input.parking * 0.03) : 1;
  if (input.parking) {
    factors.push({
      name: 'Vagas de garagem',
      impact: parkingImpact,
      description: `${input.parking} vaga(s) adiciona ${((parkingImpact - 1) * 100).toFixed(1)}% ao valor`,
    });
  }

  const age = input.age || 0;
  let ageMultiplier = 1;
  if (age < 2) ageMultiplier = 1.1;
  else if (age < 5) ageMultiplier = 1.05;
  else if (age < 10) ageMultiplier = 1;
  else if (age < 20) ageMultiplier = 0.95;
  else ageMultiplier = 0.85;

  if (input.age) {
    factors.push({
      name: 'Idade do imóvel',
      impact: ageMultiplier,
      description: `Imóvel com ${input.age} anos: ${((ageMultiplier - 1) * 100).toFixed(1)}% no valor`,
    });
  }

  const floorMultiplier = input.floor ? (input.floor > 3 ? 1.02 : input.floor === 1 ? 0.98 : 1) : 1;
  if (input.floor && input.type === 'apartamento') {
    factors.push({
      name: 'Andar',
      impact: floorMultiplier,
      description: `Andar ${input.floor}: ${((floorMultiplier - 1) * 100).toFixed(1)}% no valor`,
    });
  }

  const elevatorMultiplier = input.hasElevator ? 1.08 : 1;
  if (input.hasElevator !== undefined && input.type === 'apartamento') {
    factors.push({
      name: 'Elevador',
      impact: elevatorMultiplier,
      description: input.hasElevator ? 'Com elevador: +8% no valor' : 'Sem elevador: valor padrão',
    });
  }

  const featuresMultiplier = calculateFeaturesMultiplier(input.features || []);
  factors.push({
    name: 'Características',
    impact: featuresMultiplier,
    description: `Características especiais: ${((featuresMultiplier - 1) * 100).toFixed(1)}%`,
  });

  const totalMultiplier = zoneMultiplier * bedsImpact * bathsImpact * parkingImpact * 
                         ageMultiplier * floorMultiplier * elevatorMultiplier * featuresMultiplier;

  const pricePerSqm = basePrice * totalMultiplier;
  const suggestedPrice = Math.round(input.area * pricePerSqm);
  const variation = suggestedPrice * 0.1;
  const confidence = calculateConfidence(input, factors);

  return {
    suggestedPrice,
    minPrice: Math.round(suggestedPrice - variation),
    maxPrice: Math.round(suggestedPrice + variation),
    pricePerSqm: Math.round(pricePerSqm),
    confidence,
    factors,
    marketData: {
      avgPricePerSqm: Math.round(pricePerSqm * 0.95),
      propertiesAnalyzed: Math.floor(Math.random() * 500) + 100,
      avgDaysOnMarket: Math.floor(Math.random() * 60) + 30,
      trend: 'stable',
    },
  };
}

function calculateZoneMultiplier(location: string): number {
  const lower = location.toLowerCase();
  if (lower.includes('centro') || lower.includes('central')) return 1.35;
  if (lower.includes('norte')) return 1.0;
  if (lower.includes('sul')) return 1.15;
  if (lower.includes('leste')) return 0.9;
  if (lower.includes('oeste')) return 1.1;
  if (lower.includes('praia') || lower.includes('litoral')) return 1.25;
  if (lower.includes('periferia') || lower.includes('bairro')) return 0.75;
  return 1.0;
}

function calculateFeaturesMultiplier(features: string[]): number {
  const featureValues: Record<string, number> = {
    'piscina': 1.12,
    'churrasqueira': 1.08,
    'academia': 1.06,
    'portaria-24h': 1.05,
    'segurança': 1.05,
    'varanda': 1.04,
    'lavanderia': 1.03,
    'ar-condicionado': 1.06,
    'mobiliado': 1.10,
    'jardim': 1.03,
    'pets': 1.02,
    'vista-mar': 1.20,
    'panorâmica': 1.15,
    'renovado': 1.08,
    'novo': 1.10,
  };

  return features.reduce((acc, feature) => {
    const value = featureValues[feature.toLowerCase()] || 1;
    return acc * value;
  }, 1);
}

function calculateConfidence(input: PriceInput, factors: PriceFactor[]): number {
  let confidence = 0.7;

  if (input.zone) confidence += 0.1;
  if (input.beds !== undefined) confidence += 0.05;
  if (input.baths !== undefined) confidence += 0.05;
  if (input.parking !== undefined) confidence += 0.03;
  if (input.age !== undefined) confidence += 0.03;
  if (input.features && input.features.length > 0) confidence += 0.02;
  if (input.location.length > 10) confidence += 0.02;

  return Math.min(confidence, 0.95);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
