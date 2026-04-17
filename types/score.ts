/**
 * ============================================
 * TIPOS DO SISTEMA DE SCORE DE SAÚDE
 * ============================================
 * Define todos os tipos relacionados ao score de saúde
 * dos imóveis e pulse de carteira.
 */

import { z } from "zod";

/**
 * ============================================
 * NÍVEIS DE SAÚDE DO IMÓVEL
 * ============================================
 * Classificação do estado de saúde do imóvel.
 */
export const HealthLevelSchema = z.enum([
  "healthy", // Saúde boa (80-100)
  "warning", // Em risco (50-79)
  "critical", // Crítico (0-49)
]);

export type HealthLevel = z.infer<typeof HealthLevelSchema>;

/**
 * ============================================
 * FATORES DO SCORE
 * ============================================
 * Cada fator que compõe o score de saúde.
 */
export const ScoreFactorSchema = z.enum([
  "recency", // Atualização recente
  "photos", // Fotos (quantidade e qualidade)
  "views", // Visualizações vs média
  "time_online", // Tempo no ar
  "price_alignment", // Preço vs mercado
  "owner_response", // Resposta do proprietário
  "portal_compliance", // Compatibilidade com portais
  "engagement", // Engajamento (favoritos, compartilhamentos)
]);

export type ScoreFactor = z.infer<typeof ScoreFactorSchema>;

/**
 * ============================================
 * DETALHE DE CADA FATOR
 * ============================================
 * Armazena a pontuação e detalhes de cada fator.
 */
export const FactorDetailSchema = z.object({
  factor: ScoreFactorSchema,
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  details: z.string().optional(),
  recommendation: z.string().optional(),
});

export type FactorDetail = z.infer<typeof FactorDetailSchema>;

/**
 * ============================================
 * SCORE COMPLETO DO IMÓVEL
 * ============================================
 * Score detalhado com todos os fatores.
 */
export const PropertyScoreSchema = z.object({
  propertyId: z.string(),
  overallScore: z.number().min(0).max(100),
  healthLevel: HealthLevelSchema,
  factors: z.array(FactorDetailSchema),
  calculatedAt: z.number(),
  nextCalculationAt: z.number(),
  isRealTime: z.boolean().default(false),
});

export type PropertyScore = z.infer<typeof PropertyScoreSchema>;

/**
 * ============================================
 * HISTÓRICO DE SCORE
 * ============================================
 * Armazena a evolução do score ao longo do tempo.
 */
export const ScoreHistorySchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  overallScore: z.number().min(0).max(100),
  healthLevel: HealthLevelSchema,
  factors: z.array(FactorDetailSchema),
  calculatedAt: z.number(),
  trigger: z.enum(["scheduled", "manual", "update", "alert"]),
});

export type ScoreHistory = z.infer<typeof ScoreHistorySchema>;

/**
 * ============================================
 * CONFIGURAÇÃO DE BLOQUEIO AUTOMÁTICO
 * ============================================
 * Configurações para o bloqueio automático de imóveis.
 */
export const AutoBlockConfigSchema = z.object({
  enabled: z.boolean().default(false),
  daysWithoutOwnerResponse: z.number().default(30),
  daysBeforeNotification: z.number().default(3),
  notifyOnBlock: z.boolean().default(true),
  blockFromPortals: z.boolean().default(true),
  keepOnPlatform: z.boolean().default(true),
});

export type AutoBlockConfig = z.infer<typeof AutoBlockConfigSchema>;

/**
 * ============================================
 * REGISTRO DE BLOQUEIO AUTOMÁTICO
 * ============================================
 * Armazena informações sobre bloqueios automáticos.
 */
export const AutoBlockRecordSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  reason: z.enum([
    "no_owner_response",
    "price_not_updated",
    "photos_outdated",
    "manual",
  ]),
  blockedAt: z.number(),
  unblockedAt: z.number().optional(),
  isActive: z.boolean().default(true),
  notifySent: z.boolean().default(false),
  notificationSentAt: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AutoBlockRecord = z.infer<typeof AutoBlockRecordSchema>;

/**
 * ============================================
 * RECOMENDAÇÃO DA IA
 * ============================================
 * Recomendação automática para melhorar o score.
 */
export const AIRecommendationSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  type: z.enum([
    "update_photos",
    "adjust_price",
    "update_description",
    "contact_owner",
    "check_portal_rules",
    "refresh_announcement",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  message: z.string(),
  potentialScoreGain: z.number().min(0).max(100),
  actionUrl: z.string().optional(),
  createdAt: z.number(),
});

export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;

/**
 * ============================================
 * PULSE DE CARTEIRA
 * ============================================
 * Visão geral da saúde da carteira de imóveis.
 */
export const PortfolioPulseSchema = z.object({
  organizationId: z.string(),
  totalProperties: z.number(),
  healthyCount: z.number(),
  warningCount: z.number(),
  criticalCount: z.number(),
  averageScore: z.number().min(0).max(100),
  calculatedAt: z.number(),
  filters: z
    .object({
      byUserId: z.string().optional(),
      byPropertyType: z.string().optional(),
      byPortal: z.string().optional(),
      byBusinessType: z.string().optional(),
    })
    .optional(),
});

export type PortfolioPulse = z.infer<typeof PortfolioPulseSchema>;

/**
 * ============================================
 * CONFIGURAÇÕES DO SCORE
 * ============================================
 * Configurações globais do sistema de score.
 */
export const ScoreConfigSchema = z.object({
  weights: z.object({
    recency: z.number().min(0).max(1).default(0.2),
    photos: z.number().min(0).max(1).default(0.15),
    views: z.number().min(0).max(1).default(0.1),
    timeOnline: z.number().min(0).max(1).default(0.1),
    priceAlignment: z.number().min(0).max(1).default(0.2),
    ownerResponse: z.number().min(0).max(1).default(0.15),
    portalCompliance: z.number().min(0).max(1).default(0.05),
    engagement: z.number().min(0).max(1).default(0.05),
  }),
  thresholds: z.object({
    healthyMin: z.number().min(0).max(100).default(80),
    warningMin: z.number().min(0).max(100).default(50),
  }),
  recalculationInterval: z.number().default(3600000), // 1 hora em ms
  autoBlock: AutoBlockConfigSchema,
});

export type ScoreConfig = z.infer<typeof ScoreConfigSchema>;

/**
 * ============================================
 * INTERFACE DE RESULTADO DE CÁLCULO
 * ============================================
 * Retorno do motor de cálculo de score.
 */
export interface ScoreCalculationResult {
  success: boolean;
  score?: PropertyScore;
  error?: string;
  processingTime?: number;
}

/**
 * ============================================
 * INTERFACE DE ESTATÍSTICAS DE SAÚDE
 * ============================================
 * Estatísticas agregadas para dashboard.
 */
export interface HealthStats {
  totalProperties: number;
  healthyPercentage: number;
  warningPercentage: number;
  criticalPercentage: number;
  averageScore: number;
  scoreTrend: "up" | "down" | "stable";
  topIssues: {
    issue: string;
    count: number;
    averageImpact: number;
  }[];
}

/**
 * ============================================
 * LEGENDAS E RÓTULOS
 * ============================================
 */
export const HEALTH_LEVEL_LABELS: Record<HealthLevel, string> = {
  healthy: "Saudável",
  warning: "Em Risco",
  critical: "Crítico",
};

export const HEALTH_LEVEL_COLORS: Record<HealthLevel, string> = {
  healthy: "#22c55e", // Verde
  warning: "#f59e0b", // Amarelo/Laranja
  critical: "#ef4444", // Vermelho
};

export const SCORE_FACTOR_LABELS: Record<ScoreFactor, string> = {
  recency: "Atualização",
  photos: "Fotos",
  views: "Visualizações",
  time_online: "Tempo Online",
  price_alignment: "Preço",
  owner_response: "Resposta do Proprietário",
  portal_compliance: "Compliance",
  engagement: "Engajamento",
};

export const SCORE_FACTOR_ICONS: Record<ScoreFactor, string> = {
  recency: "clock",
  photos: "image",
  views: "eye",
  time_online: "calendar",
  price_alignment: "dollar-sign",
  owner_response: "message-circle",
  portal_compliance: "check-circle",
  engagement: "heart",
};

export const RECOMMENDATION_TYPE_LABELS: Record<
  AIRecommendation["type"],
  string
> = {
  update_photos: "Atualizar Fotos",
  adjust_price: "Ajustar Preço",
  update_description: "Atualizar Descrição",
  contact_owner: "Contatar Proprietário",
  check_portal_rules: "Verificar Regras do Portal",
  refresh_announcement: "Renovar Anúncio",
};

/**
 * ============================================
 * PESOS PADRÃO DOS FATORES
 * ============================================
 * Configuração padrão de pesos para cálculo do score.
 */
export const DEFAULT_SCORE_WEIGHTS = {
  recency: 0.2,
  photos: 0.15,
  views: 0.1,
  timeOnline: 0.1,
  priceAlignment: 0.2,
  ownerResponse: 0.15,
  portalCompliance: 0.05,
  engagement: 0.05,
};

/**
 * ============================================
 * LIMIARES DE SAÚDE
 * ============================================
 */
export const HEALTH_THRESHOLDS = {
  healthy: { min: 80, max: 100 },
  warning: { min: 50, max: 79 },
  critical: { min: 0, max: 49 },
} as const;
