import { z } from "zod";

/**
 * Tipos de dados para integração com IA
 * Versão 2.0 - ImobWeb 2026
 */

// ============================================================================
// TIPOS COMUNS - AI ANALYSIS & METRICS
// ============================================================================

export const AIAnalysisSchema = z.object({
  confidence: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
  detailedAnalysis: z.string(),
});

export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;

/**
 * Resultado da análise da IA
 * Usado em todas as features de IA
 */
export interface AIAnalysisResult {
  confidence: number;
  riskScore: number;
  recommendations: string[];
  detailedAnalysis: string;
}

/**
 * Métricas de engajamento
 * Usado para análise de leads e propriedades
 */
export interface EngagementMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  activeLeads: number;
  leadConversionRate: number;
  averageResponseTime: number; // em minutos
  lastContactDate: Date;
  contactFrequency: number; // contatos por mês
  leadSourceDistribution: Record<string, number>;
  engagementScore: number; // 0-100
}

/**
 * Métricas de saúde do imóvel
 * Usado para avaliação de propriedades
 */
export interface PropertyHealthMetrics {
  photoQuality: number; // 0-100
  descriptionCompleteness: number; // 0-100
  priceCompetitiveness: number; // 0-100
  listingFreshness: number; // 0-100
  engagementLevel: number; // 0-100
  overallHealthScore: number; // 0-100
  improvementSuggestions: string[];
  criticalIssues: string[];
  lastUpdated: Date;
}

// ============================================================================
// PROVA DE VIDA (PROOF OF LIFE) - FEATURE 1
// ============================================================================

/**
 * Configuração do ciclo de prova de vida
 */
export const ProofOfLifeConfigSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  gracePeriodDays: z.number().min(0).max(30),
  autoReminderDays: z.number().min(0).max(14),
  maxAttempts: z.number().min(1).max(10),
  escalationLevel: z.number().min(1).max(5),
  notificationChannels: z.array(z.enum(["WHATSAPP", "EMAIL", "SMS"])),
  aiEnabled: z.boolean(),
  aiThreshold: z.number().min(0).max(100),
});

export type ProofOfLifeConfig = z.infer<typeof ProofOfLifeConfigSchema>;

/**
 * Mensagem personalizada pela IA para prova de vida
 */
export const ProofOfLifeMessageSchema = z.object({
  id: z.string().cuid(),
  propertyId: z.string(),
  ownerContact: z.object({
    name: z.string(),
    phone: z.string(),
    whatsapp: z.string(),
  }),
  message: z.string(),
  suggestedActions: z.object({
    type: z.enum(["VIDEO", "PHOTO", "DOCUMENT", "NONE"]),
    options: z.array(z.string()),
  }),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  suggestedDeadline: z.date(),
  createdAt: z.date(),
});

export type ProofOfLifeMessage = z.infer<typeof ProofOfLifeMessageSchema>;

/**
 * Resposta do proprietário à prova de vida
 */
export const ProofOfLifeResponseSchema = z.object({
  id: z.string().cuid(),
  proofOfLifeId: z.string(),
  ownerContact: z.object({
    name: z.string(),
    phone: z.string(),
  }),
  responseContent: z.string(),
  proofType: z.enum(["VIDEO", "PHOTO", "DOCUMENT", "NONE"]),
  proofContent: z.string().nullable(),
  submittedAt: z.date(),
  aiAnalysis: AIAnalysisSchema,
  status: z.enum(["PENDING", "REVIEW", "APPROVED", "REJECTED"]),
  aiVerification: z.object({
    confidence: z.number().min(0).max(100),
    verified: z.boolean(),
    verificationDate: z.date(),
  }),
});

export type ProofOfLifeResponse = z.infer<typeof ProofOfLifeResponseSchema>;

/**
 * Status do ciclo de prova de vida
 */
export const ProofOfLifeStatusSchema = z.object({
  propertyId: z.string(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "EXPIRED", "SKIPPED"]),
  lastProofDate: z.date().nullable(),
  nextDueDate: z.date().nullable(),
  attemptsCount: z.number(),
  consecutiveMissed: z.number(),
  escalationLevel: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProofOfLifeStatus = z.infer<typeof ProofOfLifeStatusSchema>;

// ============================================================================
// SCORE DE PROBABILIDADE DE VENDA (SALE PROBABILITY) - FEATURE 2
// ============================================================================

/**
 * Fatores que influenciam o score de probabilidade de venda
 */
export const SaleProbabilityFactorsSchema = z.object({
  leadScore: z.number().min(0).max(100),
  viewScore: z.number().min(0).max(100),
  portalScore: z.number().min(0).max(100),
  priceScore: z.number().min(0).max(100),
  engagementScore: z.number().min(0).max(100),
  timeOnlineScore: z.number().min(0).max(100),
  recentLeads: z.number().min(0),
  views: z.number().min(0),
  activePortals: z.number().min(0),
  favorites: z.number().min(0),
  inquiries: z.number().min(0),
  priceReductionsCount: z.number().min(0),
  daysOnMarket: z.number().min(0),
});

export type SaleProbabilityFactors = z.infer<typeof SaleProbabilityFactorsSchema>;

/**
 * Comparação com o mercado
 */
export const MarketComparisonSchema = z.object({
  averagePrice: z.number(),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  pricePercentile: z.number(),
  daysOnMarketAverage: z.number(),
  soldRatio: z.number(),
  competitiveAdvantage: z.object({
    hasAdvantage: z.boolean(),
    reason: z.string(),
    score: z.number(),
  }),
});

export type MarketComparison = z.infer<typeof MarketComparisonSchema>;

/**
 * Sugestão de preço da IA
 */
export const PriceSuggestionSchema = z.object({
  suggestedPrice: z.number(),
  suggestedPriceFormatted: z.string(),
  confidence: z.number().min(0).max(100),
  marketAnalysis: z.string(),
  comparison: z.object({
    currentPrice: z.number(),
    priceDifference: z.number(),
    priceDifferencePercentage: z.number(),
    pricePercentile: z.number(),
  }),
  recommendation: z.enum(["INCREASE", "KEEP", "DECREASE"]),
  justification: z.string(),
  expectedImpact: z.object({
    expectedViewsIncrease: z.number(),
    expectedLeadsIncrease: z.number(),
    expectedDaysToSellDecrease: z.number(),
  }),
});

export type PriceSuggestion = z.infer<typeof PriceSuggestionSchema>;

/**
 * Resultado do cálculo de probabilidade de venda
 */
export const SaleProbabilityScoreSchema = z.object({
  probability: z.number().min(0).max(1),
  probabilityPercentage: z.number().min(0).max(100),
  expectedDays: z.number().min(1),
  engagementScore: z.number().min(0).max(100),
  aiAnalysis: AIAnalysisSchema,
  factors: SaleProbabilityFactorsSchema,
  marketComparison: MarketComparisonSchema,
  recommendations: z.array(z.string()),
});

export type SaleProbabilityScore = z.infer<typeof SaleProbabilityScoreSchema>;

// ============================================================================
// MODO CORRETOR EM CAMPO (FIELD MODE) - FEATURE 3
// ============================================================================

/**
 * Estado do modo de campo
 */
export const FieldModeStateSchema = z.object({
  state: z.enum(["IDLE", "ACTIVE", "SYNCING", "OFFLINE", "ERROR"]),
  sync: z.object({
    status: z.enum(["IDLE", "SYNCING", "SYNCED", "SYNC_FAILED", "OFFLINE"]),
    pendingItems: z.number().min(0),
    syncedItems: z.number().min(0),
    failedItems: z.number().min(0),
    lastSyncTime: z.date().nullable(),
    syncProgress: z.number().min(0).max(100),
    estimatedTimeRemaining: z.number().nullable(),
    offlineMode: z.boolean(),
  }),
  camera: z.object({
    enabled: z.boolean(),
    autoCapture: z.boolean(),
    captureInterval: z.number().min(0),
    autoUpload: z.boolean(),
    quality: z.enum(["LOW", "MEDIUM", "HIGH", "ULTRA"]),
    maxFileSize: z.number().min(0),
    supportedFormats: z.array(z.string()),
    autoCaptioning: z.boolean(),
    autoGeotagging: z.boolean(),
    roomDetection: z.boolean(),
    aiEnhancement: z.boolean(),
  }),
  voice: z.object({
    enabled: z.boolean(),
    language: z.string(),
    autoParse: z.boolean(),
    confidenceThreshold: z.number().min(0).max(100),
    supportedCommands: z.array(z.string()),
    fallbackToText: z.boolean(),
  }),
  defaultVisitType: z.enum(["VISIT", "VIEWING", "INSPECTION", "OTHER"]),
  autoSave: z.boolean(),
  autoBackup: z.boolean(),
  backupInterval: z.number().min(0),
  maxOfflineStorage: z.number().min(0),
});

export type FieldModeState = z.infer<typeof FieldModeStateSchema>;

/**
 * Estado de sincronização do modo de campo
 */
export const SyncStatusSchema = z.object({
  status: z.enum(["IDLE", "SYNCING", "SYNCED", "SYNC_FAILED", "OFFLINE"]),
  pendingItems: z.number().min(0),
  syncedItems: z.number().min(0),
  failedItems: z.number().min(0),
  lastSyncTime: z.date().nullable(),
  syncProgress: z.number().min(0).max(100),
  estimatedTimeRemaining: z.number().nullable(),
  offlineMode: z.boolean(),
});

export type SyncStatus = z.infer<typeof SyncStatusSchema>;

/**
 * Tipo de mídia do campo
 */
export type FieldMediaType = "PHOTO" | "VIDEO" | "AUDIO" | "NOTE";

/**
 * Configurações da câmera inteligente
 */
export const SmartCameraConfigSchema = z.object({
  enabled: z.boolean(),
  autoCapture: z.boolean(),
  captureInterval: z.number().min(0),
  autoUpload: z.boolean(),
  quality: z.enum(["LOW", "MEDIUM", "HIGH", "ULTRA"]),
  maxFileSize: z.number().min(0),
  supportedFormats: z.array(z.string()),
  autoCaptioning: z.boolean(),
  autoGeotagging: z.boolean(),
  roomDetection: z.boolean(),
  aiEnhancement: z.boolean(),
});

export type SmartCameraConfig = z.infer<typeof SmartCameraConfigSchema>;

/**
 * Configurações de entrada por voz
 */
export const VoicePropertyInputSchema = z.object({
  enabled: z.boolean(),
  language: z.string(),
  autoParse: z.boolean(),
  confidenceThreshold: z.number().min(0).max(100),
  supportedCommands: z.array(z.string()),
  fallbackToText: z.boolean(),
});

export type VoicePropertyInput = z.infer<typeof VoicePropertyInputSchema>;

/**
 * Nota de visita
 */
export const VisitNoteSchema = z.object({
  id: z.string().cuid(),
  propertyId: z.string(),
  propertyTitle: z.string(),
  visitDate: z.date(),
  visitType: z.enum(["VISIT", "VIEWING", "INSPECTION", "OTHER"]),
  notes: z.string(),
  audioTranscript: z.string().nullable(),
  photos: z.array(z.string()),
  videos: z.array(z.string()),
  clientFeedback: z.object({
    satisfaction: z.number().min(1).max(5),
    comments: z.string(),
  }).nullable(),
  createdAt: z.date(),
  isSynced: z.boolean(),
  syncError: z.string().nullable(),
});

export type VisitNote = z.infer<typeof VisitNoteSchema>;

/**
 * Resultado do registro por voz
 */
export const VoiceRegistrationResultSchema = z.object({
  transcript: z.string(),
  confidence: z.number().min(0).max(1),
  extractedData: z.object({
    type: z.enum(["APARTMENT", "HOUSE", "COMMERCIAL", "LAND"]),
    bedrooms: z.number().min(0),
    bathrooms: z.number().min(0),
    area: z.number().min(0),
    price: z.number().min(0),
    neighborhood: z.string(),
    city: z.string(),
    address: z.string().nullable(),
    description: z.string().nullable(),
  }),
  suggestedActions: z.array(z.string()),
});

export type VoiceRegistrationResult = z.infer<typeof VoiceRegistrationResultSchema>;

/**
 * Tipo de visita
 */
export type VisitType = "VISIT" | "VIEWING" | "INSPECTION" | "OTHER";

// ============================================================================
// TIPOS DE RESPOSTA DA IA
// ============================================================================

/**
 * Resposta padrão da IA com ações sugeridas
 */
export const AIResponseSchema = z.object({
  message: z.string(),
  suggestedActions: z.object({
    type: z.enum(["BUTTON", "LIST", "NONE"]),
    items: z.array(z.any()),
    buttons: z.array(z.any()),
  }).nullable(),
  shouldUpdateCRM: z.boolean().default(false),
  crmUpdates: z.object({
    lead: z.object({
      score: z.number(),
      status: z.string().default("QUALIFYING"),
    }).default({ score: 0, status: "QUALIFYING" }),
    property: z.object({
      priceSuggestion: z.number().nullable(),
      healthScore: z.number().nullable(),
    }).default({ priceSuggestion: null, healthScore: null }),
  }).default({}),
  priority: z.enum(["HIGH", "NORMAL", "URGENT"]).default("NORMAL"),
  aiAnalysis: AIAnalysisSchema,
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

/**
 * Botão do WhatsApp
 */
export const WhatsAppButtonSchema = z.object({
  id: z.string(),
  title: z.string(),
  payload: z.string().optional(),
});

export type WhatsAppButton = z.infer<typeof WhatsAppButtonSchema>;

/**
 * Sugestão de preço (compatível com o schema anterior)
 */
export const PriceSuggestionLegacySchema = z.object({
  suggestedPrice: z.number().nullable(),
  confidence: z.number(),
  marketAnalysis: z.string(),
});

export type PriceSuggestionLegacy = z.infer<typeof PriceSuggestionLegacySchema>;

/**
 * Score de propriedade
 */
export const PropertyScoreSchema = z.object({
  overallScore: z.number(),
  healthLevel: z.enum(["healthy", "warning", "critical"]),
  factors: z.array(z.object({
    factor: z.string(),
    score: z.number(),
    weight: z.number(),
    details: z.string(),
    recommendation: z.string().nullable(),
  })),
  calculatedAt: z.date(),
  nextCalculationAt: z.date(),
  isRealTime: z.boolean().default(false),
});

export type PropertyScore = z.infer<typeof PropertyScoreSchema>;

/**
 * Score de probabilidade de venda (compatível com o schema anterior)
 */
export const SaleProbabilityScoreLegacySchema = z.object({
  probability: z.number(),
  expectedDays: z.number(),
  engagementScore: z.number(),
  aiAnalysis: AIAnalysisSchema.optional(),
});

export type SaleProbabilityScoreLegacy = z.infer<typeof SaleProbabilityScoreLegacySchema>;
