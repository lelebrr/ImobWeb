/**
 * Shared types for the Predictive AI and Insights module.
 * Focused on 2026 real estate SaaS trends.
 */

export interface HealthScore {
  score: number; // 0-100
  factors: {
    label: string;
    impact: number; // Positive or negative
    description: string;
  }[];
  recommendations: string[];
}

export interface PriceRecommendation {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number; // 0-1
  marketAverage: number;
  reasoning: string[];
  comparablesCount: number;
}

export interface ChurnRisk {
  probability: number; // 0-1
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  suggestedActions: string[];
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  type: 'churn' | 'price' | 'health' | 'advisory';
  propertyId?: string;
  data?: any;
}

export interface SalesProbability {
  probability: number;
  expectedDays: number;
  engagementScore: number;
}
