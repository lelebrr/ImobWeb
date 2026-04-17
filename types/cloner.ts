/**
 * TYPES FOR INTELLIGENT AD CLONER - IMOBWEB 2026
 * Defining the structure for cloning high-performance real estate strategies.
 */

import { Property, PropertyMedia, PropertyPrice } from "./property";
import { PublicationPackageType, HighlightLevel } from "./publication";

export type CloningTone = "PROFESSIONAL" | "ENTHUSIASTIC" | "MINIMALIST" | "LUXURY" | "PERSUASIVE";

export interface ClonerAIInsight {
  reasoning: string;
  suggestion: string;
  confidence: number; // 0-1
  impact: "HIGH" | "MEDIUM" | "LOW";
}

export interface ClonedPropertyData {
  title: string;
  description: string;
  price: PropertyPrice;
  publicationPackage: PublicationPackageType;
  highlightLevel: HighlightLevel;
  mediaOrder: string[]; // Ordered list of media IDs
  mediaCaptions: Record<string, string>; // mediaId -> caption
  whatsappInitialText: string;
}

export interface CloneStrategyRequest {
  sourcePropertyId: string;
  targetPropertyId?: string; // If null, creates a new one
  adjustPrice: boolean;
  optimizeDescription: boolean;
  reorderPhotos: boolean;
  generateWhatsApp: boolean;
  preferredTone?: CloningTone;
}

export interface ClonedStrategyResult {
  sourceProperty: Property;
  optimizedData: ClonedPropertyData;
  insights: {
    price: ClonerAIInsight;
    description: ClonerAIInsight;
    photos: ClonerAIInsight;
    performance: {
      estimatedTimeUntilSale: number; // In days
      expectedLeadsPerWeek: number;
    }
  };
}

export interface ClonerHistory {
  id: string;
  sourcePropertyId: string;
  clonedPropertyId: string;
  brokerId: string;
  clonedAt: string;
  performanceMatch: number; // 0-1 (how close the new listing matches the source's performance)
}
