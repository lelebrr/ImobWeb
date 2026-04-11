/**
 * CORE PROPERTY TYPES - IMOBWEB 2026
 * Essential types for high-performance real estate SaaS
 */

export type PropertyCategory = 'RESIDENTIAL' | 'COMMERCIAL' | 'RURAL' | 'INDUSTRIAL' | 'LAND' | 'VACATION';

export type PropertyUsage = 'FOR_SALE' | 'FOR_RENT' | 'BOTH';

export interface PropertyMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;
  blurDataUrl?: string;
  category: 'EXTERIOR' | 'INTERIOR' | 'AERIAL' | 'PLAN' | 'PANORAMA_360' | 'VIDEO';
  order: number;
  aiMetadata?: {
    qualityScore: number;
    detectedType: string;
    description: string;
    labels: string[];
    isEnhanced: boolean;
  };
  alt: string;
}

export interface PropertyFeature {
  id: string;
  label: string;
  icon?: string;
  category: 'INFRASTRUCTURE' | 'LEISURE' | 'SECURITY' | 'INTERIOR';
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
}

export interface PropertyPrice {
  amount: number;
  currency: 'BRL' | 'USD' | 'EUR';
  period?: 'MONTHLY' | 'YEARLY' | 'DAILY';
  isNegotiable: boolean;
  fees?: {
    condo?: number;
    tax?: number;
  };
}

export interface Property {
  id: string;
  slug: string;
  externalId?: string;
  ownerId: string;
  organizationId: string;
  
  title: string;
  description: string;
  aiDescription?: string;
  
  status: 'DRAFT' | 'ACTIVE' | 'PENDING' | 'RESERVED' | 'SOLD' | 'INACTIVE';
  typeId: string; // Ref to property-types
  category: PropertyCategory;
  usage: PropertyUsage;
  
  price: PropertyPrice;
  address: PropertyAddress;
  media: PropertyMedia[];
  features: string[]; // List of feature IDs
  
  // Dynamic metrics based on type
  metrics: {
    totalArea: number;
    builtArea?: number;
    landArea?: number;
    rooms?: number;
    bedrooms?: number;
    suites?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    floor?: number;
    totalFloors?: number;
  };
  
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PropertyTypeConfig {
  id: string;
  category: PropertyCategory;
  label: string;
  pluralLabel: string;
  icon: string;
  requiredFields: string[];
  suggestedFeatures: string[];
  showFields: {
    rooms: boolean;
    parking: boolean;
    area: boolean;
    floors: boolean;
  };
}
