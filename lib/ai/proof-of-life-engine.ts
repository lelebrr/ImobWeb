/**
 * MOTOR DE PROVA DE VIDA (PROOF OF LIFE ENGINE)
 * ImobWeb 2026 - Sistema completo de verificação de propriedades
 * 
 * Este motor gerencia o ciclo completo de Prova de Vida para propriedades,
 * incluindo:
 * - Configuração de ciclos e prazos
 * - Geração de mensagens personalizadas por IA
 * - Integração com WhatsApp
 * - Gerenciamento de ciclos e monitoramento
 * - Lógica de alerta e despublicação
 * - Tratamento de respostas
 * - Logs e auditoria
 */

import { ProofOfLife, CreateProofOfLifeInput, UpdateProofOfLifeInput } from "./types/proof-of-life";
import { OpenAIClient } from "@/lib/ai/openai-client";
import { prisma } from "@/lib/prisma";
import { WhatsAppButton } from "@/types/whatsapp";
import { AIAnalysisResult } from "@/types/ai";
import { Property } from "@/types/property";
import { ConversationContext, FlowType, MessagePriority } from "@/types/whatsapp";
import { AuditAction, AuditLog } from "@prisma/client";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Configuração do ciclo de prova de vida
 */
export interface ProofOfLifeCycleConfig {
    enabled: boolean;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    gracePeriodDays: number;
    autoReminderDays: number;
    maxAttempts: number;
    escalationLevel: number;
    notificationChannels: ("WHATSAPP" | "EMAIL" | "SMS")[];
    aiEnabled: boolean;
    aiThreshold: number;
    autoUnpublishAfterDays: number;
    autoUnpublishDaysBeforeExpiration: number;
    requireProofResponse: boolean;
    allowProofUpload: boolean;
}

/**
 * Status do ciclo de prova de vida
 */
export type ProofOfLifeCycleStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "EXPIRED" | "SKIPPED" | "UNPUBLISHED";

/**
 * Status de verificação
 */
export type ProofVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";

/**
 * Tipo de prova
 */
export type ProofType = "VIDEO" | "PHOTO" | "DOCUMENT" | "NONE";

/**
 * Nível de urgência
 */
export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/**
 * Dados de métricas da propriedade
 */
export interface PropertyMetrics {
    propertyId: string;
    title: string;
    address: string;
    views: number;
    viewsThisMonth: number;
    viewsLastMonth: number;
    timeOnlineDays: number;
    daysOnMarket: number;
    favorites: number;
    inquiries: number;
    price: number;
    status: string;
    photoCount: number;
    hasVideo: boolean;
    lastUpdated: Date;
}

/**
 * Dados para geração de mensagem personalizada
 */
export interface PersonalizedMessageData {
    property: PropertyMetrics;
    viewsThisMonth: number;
    viewsLastMonth: number;
    timeOnlineDays: number;
    daysOnMarket: number;
    price: number;
    favorites: number;
    inquiries: number;
    photoQuality: number;
    engagementScore: number;
    previousResponse?: {
        responseContent: string;
        proofType: ProofType;
        submittedAt: Date;
    };
}

/**
 * Mensagem personalizada gerada pela IA
 */
export interface PersonalizedMessage {
    id: string;
    message: string;
    suggestedActions: {
        type: "BUTTON" | "LIST" | "NONE";
        options: string[];
        buttons: WhatsAppButton[];
    };
    urgency: UrgencyLevel;
    suggestedDeadline: Date;
    aiAnalysis: AIAnalysisResult;
    metadata: {
        propertyId: string;
        propertyTitle: string;
        context: string;
    };
    createdAt: Date;
}

/**
 * Resposta do proprietário
 */
export interface OwnerResponse {
    id: string;
    proofOfLifeId: string;
    propertyId: string;
    ownerContact: {
        name: string;
        phone: string;
        whatsapp: string;
    };
    responseContent: string;
    proofType: ProofType;
    proofContent: string | null;
    submittedAt: Date;
    aiAnalysis: AIAnalysisResult;
    status: ProofVerificationStatus;
    aiVerification: {
        confidence: number;
        verified: boolean;
        verificationDate: Date;
    };
    escalationLevel: number;
    isPositiveResponse: boolean;
}

/**
 * Log de auditoria customizado
 */
export interface ProofOfLifeAuditLog {
    id: string;
    proofOfLifeId: string;
    propertyId: string;
    action: string;
    performedBy: string;
    performedAt: Date;
    details: Record<string, any>;
    metadata?: Record<string, any>;
}

/**
 * Resultado do ciclo de verificação
 */
export interface CycleVerificationResult {
    propertyId: string;
    status: ProofOfLifeCycleStatus;
    nextDueDate: Date;
    attemptsCount: number;
    consecutiveMissed: number;
    currentEscalationLevel: number;
    shouldAlert: boolean;
    shouldUnpublish: boolean;
    shouldSendReminder: boolean;
    message?: PersonalizedMessage;
    logs: ProofOfLifeAuditLog[];
}

/**
 * Dados para envio de alerta
 */
export interface AlertData {
    propertyId: string;
    propertyTitle: string;
    ownerName: string;
    ownerPhone: string;
    daysSinceLastResponse: number;
    daysUntilDeadline: number;
    urgency: UrgencyLevel;
    message: string;
    suggestedActions: WhatsAppButton[];
    escalationLevel: number;
}

/**
 * Dados para despublicação
 */
export interface UnpublishData {
    propertyId: string;
    propertyTitle: string;
    ownerName: string;
    ownerPhone: string;
    reason: string;
    reasonCode: string;
    message: string;
    suggestedActions: WhatsAppButton[];
}

/**
 * Configuração padrão do ciclo
 */
export const DEFAULT_CYCLE_CONFIG: ProofOfLifeCycleConfig = {
    enabled: true,
    frequency: "MONTHLY",
    gracePeriodDays: 7,
    autoReminderDays: 7,
    maxAttempts: 3,
    escalationLevel: 1,
    notificationChannels: ["WHATSAPP"],
    aiEnabled: true,
    aiThreshold: 70,
    autoUnpublishAfterDays: 14,
    autoUnpublishDaysBeforeExpiration: 30,
    requireProofResponse: true,
    allowProofUpload: true,
};

// ============================================================================
// MOTOR PRINCIPAL - PROOF OF LIFE ENGINE
// ============================================================================

export class ProofOfLifeEngine {
    /**
     * Inicializa o ciclo de prova de vida para uma propriedade
     * @param propertyId ID da propriedade
     * @param ownerContact Dados do proprietário
     * @param config Configuração opcional do ciclo
     * @returns Resultado da inicialização
     */
    static async initializeCycle(
        propertyId: string,
        ownerContact: {
            name: string;
            phone: string;
            whatsapp?: string;
        },
        config: Partial<ProofOfLifeCycleConfig> = {}
    ): Promise<{ success: boolean; proofOfLifeId: string; cycleStatus: ProofOfLifeCycleStatus; nextDueDate: Date }> {
        try {
            const cycleConfig = { ...DEFAULT_CYCLE_CONFIG, ...config };

            // Verificar se já existe um ciclo ativo para esta propriedade
            const existingCycle = await (prisma as any).proofOfLife.findFirst({
                where: {
                    propertyId,
                    verificationStatus: { in: ["PENDING", "VERIFIED"] },
                },
                orderBy: { createdAt: "desc" },
            });

            if (existingCycle) {
                return {
                    success: false,
                    proofOfLifeId: existingCycle.id,
                    cycleStatus: existingCycle.verificationStatus === "VERIFIED" ? "COMPLETED" : "ACTIVE",
                    nextDueDate: existingCycle.lastProofDate,
                };
            }

            // Criar nova prova de vida inicial
            const proofOfLife = await (prisma as any).proofOfLife.create({
                data: {
                    propertyId,
                    ownerContact: {
                        name: ownerContact.name,
                        phone: ownerContact.phone,
                        whatsapp: ownerContact.whatsapp,
                    },
                    proofType: "NONE",
                    proofContent: "",
                    verificationStatus: "PENDING",
                    lastProofDate: new Date(),
                    aiAnalysis: {
                        confidence: 0,
                        riskScore: 0,
                        recommendations: [],
                        detailedAnalysis: "Aguardando primeira prova de vida",
                    } as any,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            // Registrar log de auditoria
            await this.createAuditLog(
                proofOfLife.id,
                propertyId,
                "SEND",
                "system",
                "Ciclo de prova de vida iniciado",
                {
                    ownerName: ownerContact.name,
                    ownerPhone: ownerContact.phone,
                    config: cycleConfig,
                }
            );

            // Calcular data de vencimento
            const nextDueDate = this.calculateNextDueDate(cycleConfig.frequency);

            return {
                success: true,
                proofOfLifeId: proofOfLife.id,
                cycleStatus: "ACTIVE",
                nextDueDate,
            };
        } catch (error) {
            console.error("Erro ao inicializar ciclo de prova de vida:", error);
            throw new Error("Falha ao inicializar ciclo de prova de vida");
        }
    }

    /**
     * Calcula a próxima data de vencimento baseado na frequência
     */
    private static calculateNextDueDate(frequency: "DAILY" | "WEEKLY" | "MONTHLY"): Date {
        const now = new Date();
        switch (frequency) {
            case "DAILY":
                return new Date(now.setDate(now.getDate() + 1));
            case "WEEKLY":
                return new Date(now.setDate(now.getDate() + 7));
            case "MONTHLY":
                return new Date(now.setMonth(now.getMonth() + 1));
            default:
                return new Date(now.setMonth(now.getMonth() + 1));
        }
    }

    /**
     * Verifica e atualiza o status do ciclo
     * @param propertyId ID da propriedade
     * @param metrics Métricas da propriedade
     * @returns Resultado da verificação
     */
    static async verifyCycle(
        propertyId: string,
        metrics: PropertyMetrics
    ): Promise<CycleVerificationResult> {
        try {
            const cycleConfig = DEFAULT_CYCLE_CONFIG;

            // Buscar última prova de vida
            const lastProof = await (prisma as any).proofOfLife.findFirst({
                where: {
                    propertyId,
                    verificationStatus: { in: ["PENDING", "VERIFIED"] },
                },
                orderBy: { lastProofDate: "desc" },
            });

            if (!lastProof) {
                // Inicializar ciclo se não existir
                const result = await this.initializeCycle(propertyId, {
                    name: "Proprietário",
                    phone: metrics.address.replace(/\D/g, "").slice(-11),
                });
                return {
                    propertyId,
                    status: "ACTIVE",
                    nextDueDate: result.nextDueDate,
                    attemptsCount: 0,
                    consecutiveMissed: 0,
                    currentEscalationLevel: cycleConfig.escalationLevel,
                    shouldAlert: false,
                    shouldUnpublish: false,
                    shouldSendReminder: true,
                    logs: [],
                };
            }

            // Calcular dias desde a última resposta
            const daysSinceLastResponse = this.calculateDaysSince(lastProof.lastProofDate);
            const daysUntilDeadline = this.calculateDaysUntil(cycleConfig.gracePeriodDays, lastProof.lastProofDate);

            // Verificar se deve enviar lembrete
            const shouldSendReminder = daysUntilDeadline <= cycleConfig.autoReminderDays && daysUntilDeadline > 0;

            // Verificar se deve alertar
            const shouldAlert = daysUntilDeadline <= 0 && daysSinceLastResponse > 0;

            // Verificar se deve despublicar
            const shouldUnpublish = daysSinceLastResponse >= cycleConfig.autoUnpublishAfterDays;

            // Atualizar status do ciclo
            let cycleStatus: ProofOfLifeCycleStatus;
            if (shouldUnpublish) {
                cycleStatus = "UNPUBLISHED";
            } else if (daysSinceLastResponse > cycleConfig.gracePeriodDays) {
                cycleStatus = "EXPIRED";
            } else if (lastProof.verificationStatus === "VERIFIED") {
                cycleStatus = "COMPLETED";
            } else {
                cycleStatus = "ACTIVE";
            }

            // Atualizar contador de tentativas
            const attemptsCount = await this.countAttempts(propertyId);
            const consecutiveMissed = await this.countConsecutiveMissed(propertyId);

            // Calcular próximo vencimento
            const nextDueDate = this.calculateNextDueDate(cycleConfig.frequency);

            // Gerar logs
            const logs: ProofOfLifeAuditLog[] = [];

            if (shouldSendReminder) {
                logs.push(await this.createAuditLog(
                    lastProof.id,
                    propertyId,
                    "SEND",
                    "system",
                    `Lembrete enviado: ${daysUntilDeadline} dias restantes`,
                    { daysUntilDeadline }
                ));
            }

            if (shouldAlert) {
                logs.push(await this.createAuditLog(
                    lastProof.id,
                    propertyId,
                    "SEND",
                    "system",
                    `Alerta vermelho: ${daysSinceLastResponse} dias sem resposta`,
                    { daysSinceLastResponse }
                ));
            }

            if (shouldUnpublish) {
                logs.push(await this.createAuditLog(
                    lastProof.id,
                    propertyId,
                    "SEND",
                    "system",
                    `Despublicação automática: ${daysSinceLastResponse} dias sem resposta`,
                    { daysSinceLastResponse }
                ));
            }

            return {
                propertyId,
                status: cycleStatus,
                nextDueDate,
                attemptsCount,
                consecutiveMissed,
                currentEscalationLevel: cycleConfig.escalationLevel,
                shouldAlert,
                shouldUnpublish,
                shouldSendReminder,
                logs,
            };
        } catch (error) {
            console.error("Erro ao verificar ciclo de prova de vida:", error);
            throw new Error("Falha ao verificar ciclo de prova de vida");
        }
    }

    /**
     * Calcula dias desde uma data
     */
    private static calculateDaysSince(date: Date): number {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Calcula dias até uma data
     */
    private static calculateDaysUntil(graceDays: number, date: Date): number {
        const now = new Date();
        const targetDate = new Date(date);
        targetDate.setDate(targetDate.getDate() + graceDays);
        const diffTime = targetDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Conta tentativas anteriores
     */
    private static async countAttempts(propertyId: string): Promise<number> {
        return await (prisma as any).proofOfLife.count({
            where: {
                propertyId,
                verificationStatus: "PENDING",
            },
        });
    }

    /**
     * Conta tentativas consecutivas sem resposta
     */
    private static async countConsecutiveMissed(propertyId: string): Promise<number> {
        const proofs = await (prisma as any).proofOfLife.findMany({
            where: {
                propertyId,
                verificationStatus: "PENDING",
            },
            orderBy: { lastProofDate: "desc" },
            take: 3,
        });

        return proofs.length;
    }

    /**
     * Gera mensagem personalizada para o proprietário
     * @param data Dados para geração da mensagem
     * @returns Mensagem personalizada
     */
    static async generatePersonalizedMessage(
        data: PersonalizedMessageData
    ): Promise<PersonalizedMessage> {
        try {
            const cycleConfig = DEFAULT_CYCLE_CONFIG;

            // Gerar contexto para a IA
            const context = this.generateContextForAI(data);

            // Prompt para a IA
            const systemPrompt = `
Você é um corretor imobiliário experiente e atencioso. Crie uma mensagem personalizada para o proprietário de um imóvel que está sendo verificado.

Dados do imóvel:
- Título: ${data.property.title}
- Endereço: ${data.property.address}
- Preço: R$ ${data.property.price.toLocaleString('pt-BR')}
- Dias no mercado: ${data.property.daysOnMarket}
- Visualizações este mês: ${data.viewsThisMonth}
- Visualizações mês anterior: ${data.viewsLastMonth}
- Tempo online: ${data.property.timeOnlineDays} dias
- Favoritos: ${data.property.favorites}
- Interesses: ${data.property.inquiries}
- Qualidade das fotos: ${data.photoQuality}/100
- Score de engajamento: ${data.engagementScore}/100

Regras:
1. Seja amigável e profissional
2. Use dados reais para personalizar a mensagem
3. Seja conciso (máximo 150 caracteres)
4. Inclua uma pergunta de verificação
5. Sugira ações claras
6. Use emojis apropriados

Formato JSON:
{
  "message": "Mensagem personalizada",
  "suggestedActions": {
    "type": "BUTTON" ou "NONE",
    "options": ["Opção 1", "Opção 2"],
    "buttons": [
      { "id": "button_id", "title": "Botão" }
    ]
  },
  "urgency": "LOW", "MEDIUM", "HIGH" ou "URGENT",
  "suggestedDeadline": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "aiAnalysis": {
    "confidence": 0-100,
    "riskScore": 0-100,
    "recommendations": ["Recomendação 1", "Recomendação 2"],
    "detailedAnalysis": "Análise detalhada"
  },
  "metadata": {
    "propertyId": "${data.property.propertyId}",
    "propertyTitle": "${data.property.title}",
    "context": "${this.generateContextForAI(data)}"
  }
}
`;

            const messages = [
                {
                    role: "system" as const,
                    content: systemPrompt,
                },
                {
                    role: "user" as const,
                    content: `Gere uma mensagem de verificação para este imóvel: ${JSON.stringify(data, null, 2)}`,
                },
            ];

            const openai = OpenAIClient.getInstance();
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages,
                max_tokens: 1500,
                temperature: 0.7,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("Resposta da IA vazia");

            const result = JSON.parse(content);

            // Validar resultado
            const rawAiAnalysis = result.aiAnalysis as any;
            const aiAnalysis: AIAnalysisResult = {
                confidence: rawAiAnalysis?.confidence || 70,
                riskScore: rawAiAnalysis?.riskScore || 30,
                recommendations: rawAiAnalysis?.recommendations || [],
                detailedAnalysis: rawAiAnalysis?.detailedAnalysis || "",
            };

            // Calcular urgência baseada no engajamento
            const urgency = this.calculateUrgency(data.engagementScore, data.viewsThisMonth);

            return {
                id: `msg_${Date.now()}`,
                message: result.message,
                suggestedActions: {
                    type: result.suggestedActions?.type || "NONE",
                    options: result.suggestedActions?.options || [],
                    buttons: result.suggestedActions?.buttons || [],
                },
                urgency,
                suggestedDeadline: new Date(result.suggestedDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                aiAnalysis,
                metadata: {
                    propertyId: data.property.propertyId,
                    propertyTitle: data.property.title,
                    context: result.metadata?.context || "",
                },
                createdAt: new Date(),
            };
        } catch (error) {
            console.error("Erro ao gerar mensagem personalizada:", error);
            // Retornar mensagem padrão em caso de erro
            return this.getDefaultMessage(data);
        }
    }

    /**
     * Gera contexto para a IA
     */
    private static generateContextForAI(data: PersonalizedMessageData): string {
        return `
    Contexto do imóvel:
    - Título: ${data.property.title}
    - Endereço: ${data.property.address}
    - Preço: R$ ${data.property.price.toLocaleString('pt-BR')}
    - Dias no mercado: ${data.property.daysOnMarket}
    - Visualizações este mês: ${data.viewsThisMonth}
    - Tempo online: ${data.property.timeOnlineDays} dias
    - Qualidade das fotos: ${data.photoQuality}/100
    - Engajamento: ${data.engagementScore}/100
    `;
    }

    /**
     * Calcula nível de urgência
     */
    private static calculateUrgency(engagementScore: number, views: number): UrgencyLevel {
        if (engagementScore >= 70 && views > 50) return "LOW";
        if (engagementScore >= 40 && views > 20) return "MEDIUM";
        if (engagementScore >= 20 && views > 10) return "HIGH";
        return "URGENT";
    }

    /**
     * Mensagem padrão em caso de erro
     */
    private static getDefaultMessage(data: PersonalizedMessageData): PersonalizedMessage {
        const urgency = this.calculateUrgency(data.engagementScore, data.viewsThisMonth);

        return {
            id: `msg_default_${Date.now()}`,
            message: `Olá! Seu imóvel "${data.property.title}" na ${data.property.address} gerou ${data.viewsThisMonth} visualizações este mês. Está tudo certo com o preço e as fotos? Responda com "sim" ou envie novas fotos.`,
            suggestedActions: {
                type: "NONE",
                options: [],
                buttons: [],
            },
            urgency,
            suggestedDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            aiAnalysis: {
                confidence: 50,
                riskScore: 30,
                recommendations: ["Verificar se as fotos estão atualizadas", "Avaliar se o preço está competitivo"],
                detailedAnalysis: "Mensagem padrão gerada devido a erro na IA",
            },
            metadata: {
                propertyId: data.property.propertyId,
                propertyTitle: data.property.title,
                context: "Mensagem padrão",
            },
            createdAt: new Date(),
        };
    }

    /**
     * Gera fluxo de botões para o WhatsApp
     * @param propertyId ID da propriedade
     * @param ownerPhone Telefone do proprietário
     * @param ownerName Nome do proprietário
     * @returns Botões interativos
     */
    static async generateProofRequestFlow(
        propertyId: string,
        ownerPhone: string,
        ownerName: string
    ): Promise<WhatsAppButton[]> {
        const buttons: WhatsAppButton[] = [
            {
                id: `proof_video_${propertyId}`,
                title: "📹 Gravar Vídeo",
                description: "Mostre seu rosto segurando um documento",
            },
            {
                id: `proof_photo_${propertyId}`,
                title: "📷 Enviar Foto",
                description: "Foto sua segurando documento",
            },
            {
                id: `proof_document_${propertyId}`,
                title: "📄 Documento",
                description: "Foto do documento de identidade",
            },
            {
                id: `proof_later_${propertyId}`,
                title: "Mais Tarde",
                description: "Responder depois",
            },
        ];

        return buttons;
    }

    /**
     * Processa resposta do proprietário
     * @param response Conteúdo da resposta
     * @param proofOfLifeId ID da prova de vida
     * @returns Análise da resposta
     */
    static async processOwnerResponse(
        response: string,
        proofOfLifeId: string
    ): Promise<OwnerResponse> {
        try {
            const proofOfLife = await (prisma as any).proofOfLife.findUnique({
                where: { id: proofOfLifeId },
            });

            if (!proofOfLife) {
                throw new Error("Prova de vida não encontrada");
            }

            // Determinar tipo de prova
            const proofType = this.detectProofType(response);

            // Analisar resposta com IA
            const aiAnalysis = await this.analyzeResponseWithAI(response);

            // Verificar se é resposta positiva
            const isPositiveResponse = this.isPositiveResponse(response);

            // Atualizar prova de vida
            const updatedProof = await (prisma as any).proofOfLife.update({
                where: { id: proofOfLifeId },
                data: {
                    proofType,
                    proofContent: response,
                    lastProofDate: new Date(),
                    aiAnalysis: aiAnalysis as any,
                    verificationStatus: isPositiveResponse ? "VERIFIED" : "PENDING",
                    updatedAt: new Date(),
                },
            });

            // Registrar log de auditoria
            await this.createAuditLog(
                proofOfLifeId,
                proofOfLife.propertyId,
                "SEND",
                "user",
                isPositiveResponse ? "Resposta positiva recebida" : "Resposta pendente de verificação",
                {
                    responseContent: response.substring(0, 100),
                    proofType,
                    isPositiveResponse,
                }
            );

            return {
                id: proofOfLifeId,
                proofOfLifeId,
                propertyId: proofOfLife.propertyId,
                ownerContact: proofOfLife.ownerContact as any,
                responseContent: response,
                proofType,
                proofContent: response,
                submittedAt: new Date(),
                aiAnalysis,
                status: isPositiveResponse ? "VERIFIED" : "PENDING",
                aiVerification: {
                    confidence: aiAnalysis.confidence,
                    verified: isPositiveResponse,
                    verificationDate: new Date(),
                },
                escalationLevel: 1,
                isPositiveResponse,
            };
        } catch (error) {
            console.error("Erro ao processar resposta do proprietário:", error);
            throw new Error("Falha ao processar resposta");
        }
    }

    /**
     * Detecta tipo de prova baseado na resposta
     */
    private static detectProofType(response: string): ProofType {
        const lowerResponse = response.toLowerCase();

        if (lowerResponse.includes("foto") || lowerResponse.includes("imagem") || lowerResponse.includes("photo")) {
            return "PHOTO";
        }
        if (lowerResponse.includes("vídeo") || lowerResponse.includes("video")) {
            return "VIDEO";
        }
        if (lowerResponse.includes("documento") || lowerResponse.includes("doc")) {
            return "DOCUMENT";
        }

        return "NONE";
    }

    /**
     * Analisa resposta com IA
     */
    private static async analyzeResponseWithAI(response: string): Promise<AIAnalysisResult> {
        const systemPrompt = `
Você é um especialista em análise de texto para verificação de propriedades imobiliárias.
Analise a resposta do proprietário e determine:
1. Confiança na autenticidade (0-100)
2. Risco de fraude (0-100)
3. Recomendações
4. Análise detalhada

Formato JSON:
{
  "confidence": 0-100,
  "riskScore": 0-100,
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "detailedAnalysis": "Análise detalhada"
}
`;

        const messages = [
            {
                role: "system" as const,
                content: systemPrompt,
            },
            {
                role: "user" as const,
                content: `Analise esta resposta: "${response}"`,
            },
        ];

        try {
            const openai = OpenAIClient.getInstance();
            const responseAI = await openai.chat.completions.create({
                model: "gpt-4o",
                messages,
                max_tokens: 1000,
                temperature: 0.3,
            });

            const content = responseAI.choices[0].message.content;
            if (!content) throw new Error("Resposta da IA vazia");

            const analysis = JSON.parse(content);

            return {
                confidence: analysis.confidence || 70,
                riskScore: analysis.riskScore || 30,
                recommendations: analysis.recommendations || [],
                detailedAnalysis: analysis.detailedAnalysis || "",
            };
        } catch (error) {
            console.error("Erro na análise de resposta:", error);
            return {
                confidence: 70,
                riskScore: 30,
                recommendations: ["Verificar manualmente a resposta"],
                detailedAnalysis: "Análise padrão devido a erro na IA",
            };
        }
    }

    /**
     * Verifica se é resposta positiva
     */
    private static isPositiveResponse(response: string): boolean {
        const lowerResponse = response.toLowerCase().trim();

        // Respostas positivas diretas
        const positiveKeywords = [
            "sim", "sim, está tudo certo", "sim, tudo certo", "ok",
            "sim, pode verificar", "sim, confirmo", "sim, confirmada",
            "sim, aprovado", "sim, verificado", "sim, correto",
            "sim, sim", "sim!", "sim.", "sim, sim",
        ];

        // Verificar se contém palavras positivas
        for (const keyword of positiveKeywords) {
            if (lowerResponse.includes(keyword)) {
                return true;
            }
        }

        // Se não for claramente negativa, considerar como positiva
        const negativeKeywords = [
            "não", "nao", "não, não", "não, está tudo errado",
            "não, precisa atualizar", "não, não tenho", "não, não posso",
            "não, obrigado", "não, não preciso",
        ];

        for (const keyword of negativeKeywords) {
            if (lowerResponse.includes(keyword)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Gera dados para alerta
     * @param propertyId ID da propriedade
     * @param daysSinceLastResponse Dias desde última resposta
     * @returns Dados do alerta
     */
    static async generateAlertData(
        propertyId: string,
        daysSinceLastResponse: number
    ): Promise<AlertData> {
        const proofOfLife = await (prisma as any).proofOfLife.findFirst({
            where: {
                propertyId,
                verificationStatus: { in: ["PENDING", "VERIFIED"] },
            },
            orderBy: { lastProofDate: "desc" },
        });

        if (!proofOfLife) {
            throw new Error("Prova de vida não encontrada");
        }

        const urgency = daysSinceLastResponse >= 7 ? "URGENT" : "HIGH";

        const message = urgency === "URGENT"
            ? `🚨 ALERTA VERMELHO - ${daysSinceLastResponse} dias sem resposta!\n\nSeu imóvel "${proofOfLife.propertyId}" não foi verificado há ${daysSinceLastResponse} dias. Isso pode afetar a publicação e a segurança do imóvel. Por favor, responda o lembrete o mais breve possível.`
            : `⚠️ ALERTA - ${daysSinceLastResponse} dias sem resposta\n\nSeu imóvel "${proofOfLife.propertyId}" não foi verificado há ${daysSinceLastResponse} dias. Por favor, responda o lembrete para manter a publicação ativa.`;

        const suggestedActions: WhatsAppButton[] = [
            {
                id: `alert_respond_${propertyId}`,
                title: "Responder Agora",
                description: "Confirmar recebimento",
            },
            {
                id: `alert_contact_agent_${propertyId}`,
                title: "Falar com Corretor",
                description: "Solicitar ajuda",
            },
        ];

        return {
            propertyId,
            propertyTitle: proofOfLife.propertyId, // TODO: Obter título real
            ownerName: (proofOfLife.ownerContact as any)?.name || "Proprietário",
            ownerPhone: (proofOfLife.ownerContact as any)?.phone || "",
            daysSinceLastResponse,
            daysUntilDeadline: 0,
            urgency,
            message,
            suggestedActions,
            escalationLevel: 1,
        };
    }

    /**
     * Gera dados para despublicação
     * @param propertyId ID da propriedade
     * @param daysSinceLastResponse Dias desde última resposta
     * @returns Dados da despublicação
     */
    static async generateUnpublishData(
        propertyId: string,
        daysSinceLastResponse: number
    ): Promise<UnpublishData> {
        const proofOfLife = await (prisma as any).proofOfLife.findFirst({
            where: {
                propertyId,
                verificationStatus: { in: ["PENDING", "VERIFIED"] },
            },
            orderBy: { lastProofDate: "desc" },
        });

        if (!proofOfLife) {
            throw new Error("Prova de vida não encontrada");
        }

        const reasonCode = "PROOF_OF_LIFE_EXPIRED";
        const reason = "Expiração do ciclo de prova de vida";

        const message = `⚠️ DESPUBLICAÇÃO AUTOMÁTICA\n\nSeu imóvel "${proofOfLife.propertyId}" não foi verificado há ${daysSinceLastResponse} dias, excedendo o período máximo de ${DEFAULT_CYCLE_CONFIG.autoUnpublishAfterDays} dias.\n\nMotivo: ${reason}\n\nPara reativar a publicação, você precisa:\n1. Responder o lembrete de prova de vida\n2. Enviar uma nova prova\n3. Entrar em contato com nosso suporte`;

        const suggestedActions: WhatsAppButton[] = [
            {
                id: `unpublish_respond_${propertyId}`,
                title: "Responder Agora",
                description: "Enviar prova de vida",
            },
            {
                id: `unpublish_support_${propertyId}`,
                title: "Falar com Suporte",
                description: "Reativar manualmente",
            },
        ];

        return {
            propertyId,
            propertyTitle: proofOfLife.propertyId, // TODO: Obter título real
            ownerName: (proofOfLife.ownerContact as any)?.name || "Proprietário",
            ownerPhone: (proofOfLife.ownerContact as any)?.phone || "",
            reason,
            reasonCode,
            message,
            suggestedActions,
        };
    }

    /**
     * Atualiza o status da prova de vida
     * @param proofOfLifeId ID da prova de vida
     * @param status Novo status
     * @param verificationDate Data de verificação
     * @returns Prova de vida atualizada
     */
    static async updateProofStatus(
        proofOfLifeId: string,
        status: "VERIFIED" | "REJECTED" | "PENDING",
        verificationDate?: Date
    ): Promise<ProofOfLife> {
        try {
            const updateData: any = {
                verificationStatus: status,
                verificationDate: verificationDate || new Date(),
            };

            if (status === "REJECTED") {
                updateData.aiAnalysis = {
                    confidence: 0,
                    riskScore: 100,
                    recommendations: ["Prova rejeitada", "Solicitar nova prova"],
                    detailedAnalysis: "Prova rejeitada pelo sistema",
                };
            }

            const updated = await (prisma as any).proofOfLife.update({
                where: { id: proofOfLifeId },
                data: updateData,
            });

            const proof = updated as unknown as ProofOfLife;

            // Registrar log de auditoria
            await this.createAuditLog(
                proofOfLifeId,
                proof.propertyId,
                status === "VERIFIED" ? "APPROVE" : "REJECT",
                "user",
                `Status atualizado para ${status}`,
                { status }
            );

            return proof;
        } catch (error) {
            console.error("Erro ao atualizar status da prova de vida:", error);
            throw new Error("Falha ao atualizar status");
        }
    }

    /**
     * Reabre um ciclo de prova de vida
     * @param propertyId ID da propriedade
     * @param reason Motivo da reabertura
     * @returns Resultado da reabertura
     */
    static async reopenCycle(
        propertyId: string,
        reason: string
    ): Promise<{ success: boolean; proofOfLifeId: string }> {
        try {
            // Verificar se existe um ciclo expirado
            const expiredProof = await (prisma as any).proofOfLife.findFirst({
                where: {
                    propertyId,
                    verificationStatus: "EXPIRED",
                },
                orderBy: { lastProofDate: "desc" },
            });

            if (expiredProof) {
                // Reabrir o ciclo existente
                await (prisma as any).proofOfLife.update({
                    where: { id: expiredProof.id },
                    data: {
                        verificationStatus: "PENDING",
                        lastProofDate: new Date(),
                        aiAnalysis: {
                            confidence: 0,
                            riskScore: 0,
                            recommendations: ["Ciclo reaberto"],
                            detailedAnalysis: "Ciclo reaberto por solicitação do usuário",
                        } as any,
                        updatedAt: new Date(),
                    },
                });

                // Registrar log
                await this.createAuditLog(
                    expiredProof.id,
                    propertyId,
                    "SEND",
                    "user",
                    reason,
                    { reason }
                );

                return {
                    success: true,
                    proofOfLifeId: expiredProof.id,
                };
            }

            // Criar novo ciclo
            const result = await this.initializeCycle(propertyId, {
                name: "Proprietário",
                phone: "00000000000",
            });

            return result;
        } catch (error) {
            console.error("Erro ao reabrir ciclo:", error);
            throw new Error("Falha ao reabrir ciclo");
        }
    }

    /**
     * Cria log de auditoria
     * @param proofOfLifeId ID da prova de vida
     * @param propertyId ID da propriedade
     * @param action Ação realizada
     * @param performedBy Quem realizou
     * @param details Detalhes da ação
     * @param metadata Metadados adicionais
     * @returns Log criado
     */
    private static async createAuditLog(
        proofOfLifeId: string,
        propertyId: string,
        action: string,
        performedBy: string,
        details: string,
        metadata?: Record<string, any>
    ): Promise<ProofOfLifeAuditLog> {
        try {
            const log = await prisma.auditLog.create({
                data: {
                    id: `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    action: action as any,
                    entityType: "PROPERTY",
                    entityId: propertyId,
                    metadata: {
                        proofOfLifeId,
                        action,
                        performedBy,
                        details,
                        metadata,
                    },
                    description: details,
                    timestamp: new Date(),
                },
            });

            return {
                id: log.id,
                proofOfLifeId,
                propertyId,
                action,
                performedBy,
                performedAt: log.timestamp,
                details: metadata || {},
                metadata,
            };
        } catch (error) {
            console.error("Erro ao criar log de auditoria:", error);
            // Retornar log sem salvar no banco em caso de erro
            return {
                id: `log_${Date.now()}`,
                proofOfLifeId,
                propertyId,
                action,
                performedBy,
                performedAt: new Date(),
                details: metadata || {},
                metadata,
            };
        }
    }

    /**
     * Obtém histórico de um ciclo de prova de vida
     * @param propertyId ID da propriedade
     * @returns Histórico de provas
     */
    static async getProofHistory(
        propertyId: string
    ): Promise<ProofOfLife[]> {
        try {
            const history = await (prisma as any).proofOfLife.findMany({
                where: { propertyId },
                orderBy: { lastProofDate: "desc" },
            });
            return history as unknown as ProofOfLife[];
        } catch (error) {
            console.error("Erro ao obter histórico:", error);
            return [];
        }
    }

    /**
     * Obtém métricas de engajamento do proprietário
     * @param propertyId ID da propriedade
     * @returns Métricas de engajamento
     */
    static async getOwnerEngagementMetrics(
        propertyId: string
    ): Promise<{
        totalProofs: number;
        verifiedProofs: number;
        pendingProofs: number;
        rejectedProofs: number;
        averageResponseTime: number;
        lastResponseDate: Date | null;
        responseRate: number;
    }> {
        try {
            const proofs = await (prisma as any).proofOfLife.findMany({
                where: { propertyId },
            });

            const totalProofs = proofs.length;
            const verifiedProofs = proofs.filter((p: any) => p.verificationStatus === "VERIFIED").length;
            const pendingProofs = proofs.filter((p: any) => p.verificationStatus === "PENDING").length;
            const rejectedProofs = proofs.filter((p: any) => p.verificationStatus === "REJECTED").length;

            const responseRate = totalProofs > 0 ? (verifiedProofs / totalProofs) * 100 : 0;

            // Calcular tempo médio de resposta
            const responseTimes = proofs
                .filter((p: any) => p.verificationStatus === "VERIFIED" && p.lastProofDate && p.createdAt)
                .map((p: any) => {
                    if (!p.createdAt) return 0;
                    const diff = p.lastProofDate.getTime() - p.createdAt.getTime();
                    return diff / (1000 * 60 * 60 * 24); // em dias
                });

            const averageResponseTime = responseTimes.length > 0
                ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length
                : 0;

            const lastResponseDate = proofs
                .filter((p: any) => p.lastProofDate)
                .sort((a: any, b: any) => b.lastProofDate.getTime() - a.lastProofDate.getTime())[0]?.lastProofDate || null;

            return {
                totalProofs,
                verifiedProofs,
                pendingProofs,
                rejectedProofs,
                averageResponseTime,
                lastResponseDate,
                responseRate,
            };
        } catch (error) {
            console.error("Erro ao obter métricas de engajamento:", error);
            return {
                totalProofs: 0,
                verifiedProofs: 0,
                pendingProofs: 0,
                rejectedProofs: 0,
                averageResponseTime: 0,
                lastResponseDate: null,
                responseRate: 0,
            };
        }
    }

    /**
     * Obtém alertas pendentes
     * @returns Lista de alertas pendentes
     */
    static async getPendingAlerts(): Promise<AlertData[]> {
        try {
            // Buscar propriedades com ciclos expirados
            const properties = await prisma.property.findMany({
                where: {
                    status: "DISPONIVEL",
                },
                select: {
                    id: true,
                    title: true,
                    ownerId: true,
                    address: true,
                    price: true,
                    updatedAt: true,
                },
            });

            const alerts: AlertData[] = [];

            for (const property of properties) {
                const cycleConfig = DEFAULT_CYCLE_CONFIG;
                const lastProof = await (prisma as any).proofOfLife.findFirst({
                    where: {
                        propertyId: property.id,
                        verificationStatus: { in: ["PENDING", "VERIFIED"] },
                    },
                    orderBy: { lastProofDate: "desc" },
                });

                if (lastProof && lastProof.lastProofDate) {
                    const daysSinceLastResponse = this.calculateDaysSince(lastProof.lastProofDate);

                    if (daysSinceLastResponse >= cycleConfig.autoReminderDays) {
                        const alert = await this.generateAlertData(property.id, daysSinceLastResponse);
                        alerts.push(alert);
                    }
                }
            }

            return alerts;
        } catch (error) {
            console.error("Erro ao obter alertas pendentes:", error);
            return [];
        }
    }

    /**
     * Obtém propriedades para despublicação
     * @returns Lista de propriedades para despublicação
     */
    static async getPropertiesForUnpublish(): Promise<UnpublishData[]> {
        try {
            const cycleConfig = DEFAULT_CYCLE_CONFIG;

            const properties = await prisma.property.findMany({
                where: {
                    status: "DISPONIVEL",
                },
                select: {
                    id: true,
                    title: true,
                    ownerId: true,
                    address: true,
                    price: true,
                    updatedAt: true,
                },
            });

            const toUnpublish: UnpublishData[] = [];

            for (const property of properties) {
                const lastProof = await (prisma as any).proofOfLife.findFirst({
                    where: {
                        propertyId: property.id,
                        verificationStatus: { in: ["PENDING", "VERIFIED"] },
                    },
                    orderBy: { lastProofDate: "desc" },
                });

                if (lastProof && lastProof.lastProofDate) {
                    const daysSinceLastResponse = this.calculateDaysSince(lastProof.lastProofDate);

                    if (daysSinceLastResponse >= cycleConfig.autoUnpublishAfterDays) {
                        const unpublish = await this.generateUnpublishData(property.id, daysSinceLastResponse);
                        toUnpublish.push(unpublish);
                    }
                }
            }

            return toUnpublish;
        } catch (error) {
            console.error("Erro ao obter propriedades para despublicação:", error);
            return [];
        }
    }

    /**
     * Verifica se deve enviar lembrete
     * @param propertyId ID da propriedade
     * @returns Se deve enviar lembrete
     */
    static async shouldSendReminder(propertyId: string): Promise<boolean> {
        try {
            const cycleConfig = DEFAULT_CYCLE_CONFIG;
            const lastProof = await (prisma as any).proofOfLife.findFirst({
                where: {
                    propertyId,
                    verificationStatus: { in: ["PENDING", "VERIFIED"] },
                },
                orderBy: { lastProofDate: "desc" },
            });

            if (!lastProof || !lastProof.lastProofDate) {
                return false;
            }

            const daysSinceLastResponse = this.calculateDaysSince(lastProof.lastProofDate);
            const daysUntilDeadline = this.calculateDaysUntil(cycleConfig.gracePeriodDays, lastProof.lastProofDate);

            return daysUntilDeadline <= cycleConfig.autoReminderDays && daysUntilDeadline > 0;
        } catch (error) {
            console.error("Erro ao verificar se deve enviar lembrete:", error);
            return false;
        }
    }

    /**
     * Verifica se deve alertar
     * @param propertyId ID da propriedade
     * @returns Se deve alertar
     */
    static async shouldAlert(propertyId: string): Promise<boolean> {
        try {
            const cycleConfig = DEFAULT_CYCLE_CONFIG;
            const lastProof = await (prisma as any).proofOfLife.findFirst({
                where: {
                    propertyId,
                    verificationStatus: { in: ["PENDING", "VERIFIED"] },
                },
                orderBy: { lastProofDate: "desc" },
            });

            if (!lastProof || !lastProof.lastProofDate) {
                return false;
            }

            const daysSinceLastResponse = this.calculateDaysSince(lastProof.lastProofDate);

            return daysSinceLastResponse > cycleConfig.gracePeriodDays;
        } catch (error) {
            console.error("Erro ao verificar se deve alertar:", error);
            return false;
        }
    }

    /**
     * Verifica se deve despublicar
     * @param propertyId ID da propriedade
     * @returns Se deve despublicar
     */
    static async shouldUnpublish(propertyId: string): Promise<boolean> {
        try {
            const cycleConfig = DEFAULT_CYCLE_CONFIG;
            const lastProof = await (prisma as any).proofOfLife.findFirst({
                where: {
                    propertyId,
                    verificationStatus: { in: ["PENDING", "VERIFIED"] },
                },
                orderBy: { lastProofDate: "desc" },
            });

            if (!lastProof || !lastProof.lastProofDate) {
                return false;
            }

            const daysSinceLastResponse = this.calculateDaysSince(lastProof.lastProofDate);

            return daysSinceLastResponse >= cycleConfig.autoUnpublishAfterDays;
        } catch (error) {
            console.error("Erro ao verificar se deve despublicar:", error);
            return false;
        }
    }

    /**
     * Obtém status do ciclo de uma propriedade
     * @param propertyId ID da propriedade
     * @returns Status do ciclo
     */
    static async getCycleStatus(propertyId: string): Promise<{
        status: ProofOfLifeCycleStatus;
        lastProofDate: Date | null;
        nextDueDate: Date | null;
        attemptsCount: number;
        consecutiveMissed: number;
        daysSinceLastResponse: number;
    }> {
        try {
            const cycleConfig = DEFAULT_CYCLE_CONFIG;
            const lastProof = await (prisma as any).proofOfLife.findFirst({
                where: {
                    propertyId,
                    verificationStatus: { in: ["PENDING", "VERIFIED"] },
                },
                orderBy: { lastProofDate: "desc" },
            });

            let status: ProofOfLifeCycleStatus = "ACTIVE";

            if (lastProof) {
                const daysSinceLastResponse = this.calculateDaysSince(lastProof.lastProofDate);

                if (daysSinceLastResponse >= cycleConfig.autoUnpublishAfterDays) {
                    status = "UNPUBLISHED";
                } else if (daysSinceLastResponse > cycleConfig.gracePeriodDays) {
                    status = "EXPIRED";
                } else if (lastProof.verificationStatus === "VERIFIED") {
                    status = "COMPLETED";
                }
            }

            const attemptsCount = await this.countAttempts(propertyId);
            const consecutiveMissed = await this.countConsecutiveMissed(propertyId);
            const nextDueDate = lastProof ? this.calculateNextDueDate(cycleConfig.frequency) : null;
            const daysSinceLastResponse = lastProof ? this.calculateDaysSince(lastProof.lastProofDate) : 0;

            return {
                status,
                lastProofDate: lastProof?.lastProofDate || null,
                nextDueDate,
                attemptsCount,
                consecutiveMissed,
                daysSinceLastResponse,
            };
        } catch (error) {
            console.error("Erro ao obter status do ciclo:", error);
            return {
                status: "ACTIVE",
                lastProofDate: null,
                nextDueDate: null,
                attemptsCount: 0,
                consecutiveMissed: 0,
                daysSinceLastResponse: 0,
            };
        }
    }

    /**
     * Atualiza configuração do ciclo
     * @param propertyId ID da propriedade
     * @param config Nova configuração
     * @returns Resultado da atualização
     */
    static async updateCycleConfig(
        propertyId: string,
        config: Partial<ProofOfLifeCycleConfig>
    ): Promise<{ success: boolean; message: string }> {
        try {
            // Em produção, isso salvaria a configuração no banco de dados
            // Por enquanto, apenas registra no log
            console.log(`Configuração atualizada para propriedade ${propertyId}:`, config);

            return {
                success: true,
                message: "Configuração atualizada com sucesso",
            };
        } catch (error) {
            console.error("Erro ao atualizar configuração do ciclo:", error);
            return {
                success: false,
                message: "Falha ao atualizar configuração",
            };
        }
    }

    /**
     * Obtém estatísticas globais do motor de Prova de Vida
     * @returns Estatísticas globais
     */
    static async getGlobalStats(): Promise<{
        totalProperties: number;
        activeCycles: number;
        pendingAlerts: number;
        propertiesToUnpublish: number;
        averageResponseTime: number;
        overallEngagementRate: number;
    }> {
        try {
            const totalProperties = await prisma.property.count({
                where: { status: "DISPONIVEL" },
            });

            const activeCycles = await (prisma as any).proofOfLife.count({
                where: {
                    verificationStatus: { in: ["PENDING", "VERIFIED"] },
                },
            });

            const pendingAlerts = (await this.getPendingAlerts()).length;
            const propertiesToUnpublish = (await this.getPropertiesForUnpublish()).length;

            // Calcular métricas de engajamento
            const allProperties = await prisma.property.findMany({
                where: { status: "DISPONIVEL" },
                select: { id: true },
            });

            let totalResponseTime = 0;
            let totalResponseCount = 0;

            for (const property of allProperties) {
                const metrics = await this.getOwnerEngagementMetrics(property.id);
                totalResponseTime += metrics.averageResponseTime;
                totalResponseCount += metrics.totalProofs;
            }

            const averageResponseTime = totalResponseCount > 0
                ? totalResponseTime / totalResponseCount
                : 0;

            const overallEngagementRate = totalProperties > 0
                ? (activeCycles / totalProperties) * 100
                : 0;

            return {
                totalProperties,
                activeCycles,
                pendingAlerts,
                propertiesToUnpublish,
                averageResponseTime,
                overallEngagementRate,
            };
        } catch (error) {
            console.error("Erro ao obter estatísticas globais:", error);
            return {
                totalProperties: 0,
                activeCycles: 0,
                pendingAlerts: 0,
                propertiesToUnpublish: 0,
                averageResponseTime: 0,
                overallEngagementRate: 0,
            };
        }
    }

    /**
     * Gera o fluxo de botões para mostrar o status da prova de vida
     */
    static async generateProofStatusFlow(
        proofId: string,
        ownerPhone: string,
        ownerName: string
    ): Promise<WhatsAppButton[]> {
        return [
            {
                id: `proof_details_${proofId}`,
                title: "Ver Detalhes",
            },
            {
                id: `proof_resend_${proofId}`,
                title: "Reenviar Prova",
            },
        ];
    }
}

// ============================================================================
// EXPORTAÇÕES DE COMPATIBILIDADE
// ============================================================================


// Exportar funções antigas para compatibilidade
export const generateProofRequestFlow = ProofOfLifeEngine.generateProofRequestFlow.bind(
    ProofOfLifeEngine
);
export const processOwnerResponse = ProofOfLifeEngine.processOwnerResponse.bind(
    ProofOfLifeEngine
);
export const verifyProof = ProofOfLifeEngine.updateProofStatus.bind(
    ProofOfLifeEngine
);
