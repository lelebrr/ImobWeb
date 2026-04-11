/**
 * imobWeb Property Management System - Core Types
 * Specialized for 2026 High-Performance Real Estate SaaS
 */

export enum PropertyCategory {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  RURAL = 'RURAL',
  INDUSTRIAL = 'INDUSTRIAL',
  VACATION = 'VACATION',
  DEVELOPMENT = 'DEVELOPMENT', // Lançamentos / Terrenos
}

export enum PropertyStatus {
  FOR_SALE = 'FOR_SALE',
  FOR_RENT = 'FOR_RENT',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  RESERVED = 'RESERVED',
  OFF_MARKET = 'OFF_MARKET',
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  order: number;
  isMain: boolean;
  type: 'PHOTO' | 'VIDEO' | 'TOUR_360' | 'FLOOR_PLAN';
  metadata: {
    width: number;
    height: number;
    format: 'webp' | 'avif' | 'jpeg';
    size: number;
    aiQualityScore?: number; // 0-100
    aiTags?: string[];
    aiCaption?: string;
  };
}

export interface PropertyAddress {
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isExactLocationDisplayed: boolean;
}

export interface PropertyFeature {
  id: string;
  label: string;
  category: 'INTERIOR' | 'EXTERIOR' | 'COMMUNITY' | 'LEISURE' | 'SECURITY';
  icon?: string;
}

export interface PropertySEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

/**
 * Base Property Interface
 */
export interface Property {
  id: string;
  externalId?: string; // Integration IDs
  slug: string;
  title: string;
  description: string;
  type: string; // From PropertyTypeList
  category: PropertyCategory;
  status: PropertyStatus;
  
  // Pricing
  price: number;
  currency: string;
  condoFee?: number;
  propertyTax?: number; // IPTU
  pricePerMeter?: number;

  // Measurement
  totalArea: number;
  buildArea?: number;
  usableArea?: number;
  areaMeasurementUnit: 'm2' | 'hectare' | 'alqueire';
  
  // Details
  bedrooms?: number;
  bathrooms?: number;
  suites?: number;
  parkingSpots?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  
  // Media
  images: PropertyImage[];
  videos?: string[];
  virtualTourUrl?: string;
  
  // Location
  address: PropertyAddress;
  
  // Metadata
  features: string[]; // IDs from Global Features List
  tags: string[];
  ownerId: string;
  brokerId?: string;
  isFeatured: boolean;
  isExclusivelyListed: boolean;
  
  // AI Generated
  aiSummary?: string;
  aiSuggestedPriceRange?: { min: number; max: number };
  
  // Meta
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Property Type Definition for logic mapping
 */
export interface PropertyTypeDefinition {
  id: string;
  label: string;
  category: PropertyCategory;
  icon?: string;
  requiredFields: Array<keyof Property>;
  suggestedFields: Array<keyof Property>;
  availableFeatures: string[];
}
