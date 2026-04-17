import { ProofOfLife, CreateProofOfLifeInput, UpdateProofOfLifeInput } from "./types/proof-of-life";
import { OpenAIClient } from "@/lib/ai/openai-client";
import { prisma } from "@/lib/prisma";
import { WhatsAppButton } from "@/types/ai";

/**
 * Motor de Prova de Vida - IA para análise de evidências de propriedade
 * Analisa vídeos, fotos e documentos para verificar a autenticidade do proprietário
 */
export class ProofOfLifeEngine {
    /**
     * Processa uma prova de vida (video, foto ou documento)
     * @param propertyId ID da propriedade
     * @param ownerContact Dados do proprietário
     * @param proofType Tipo de prova (VIDEO, PHOTO, DOCUMENT)
     * @param proofContent Conteúdo da prova (URL do vídeo, base64 da foto, etc.)
     * @returns Objeto com a análise e o registro da prova
     */
    static async processProof(
        propertyId: string,
        ownerContact: any,
        proofType: "VIDEO" | "PHOTO" | "DOCUMENT",
        proofContent: string
    ): Promise<ProofOfLife> {
        try {
            // 1. Gerar análise com IA
            const aiAnalysis = await this.analyzeProofWithAI(proofContent, proofType);

            // 2. Salvar prova no banco de dados
            const proof = await this.saveProof(propertyId, ownerContact, proofType, proofContent, aiAnalysis);

            return proof;
        } catch (error) {
            console.error("Erro ao processar prova de vida:", error);
            throw new Error("Falha ao processar prova de vida");
        }
    }

    /**
     * Análise da prova com IA (OpenAI)
     * @param proofContent Conteúdo da prova
     * @param proofType Tipo de prova
     * @returns Análise da IA com confiança e riscos
     */
    private static async analyzeProofWithAI(
        proofContent: string,
        proofType: "VIDEO" | "PHOTO" | "DOCUMENT"
    ): Promise<AIAnalysisResult> {
        const systemPrompt = `
      Você é um especialista em verificação de propriedade imobiliária.
      Analise o conteúdo fornecido e verifique se é uma prova válida do proprietário.
      Retorne um relatório detalhado com:
      1. Confiança na autenticidade (0-100)
      2. Risco de fraude (0-100)
      3. Recomendações de verificação
      4. Detalhes da análise
      
      Formato JSON com as seguintes chaves:
      - confidence: number
      - riskScore: number
      - recommendations: string[]
      - detailedAnalysis: string
    `;

        let messages: any[] = [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: `Tipo de prova: ${proofType}\nConteúdo: ${proofContent}`,
            },
        ];

        try {
            const openai = OpenAIClient.getInstance();
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages,
                max_tokens: 1000,
                temperature: 0.3,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("Resposta da IA vazia");
            const analysis = JSON.parse(content);

            return {
                confidence: analysis.confidence,
                riskScore: analysis.riskScore,
                recommendations: analysis.recommendations,
                detailedAnalysis: analysis.detailedAnalysis,
            };
        } catch (error) {
            console.error("Erro na análise com IA:", error);
            throw new Error("Falha na análise da prova com IA");
        }
    }

    /**
     * Salva a prova no banco de dados
     * @param propertyId ID da propriedade
     * @param ownerContact Dados do proprietário
     * @param proofType Tipo de prova
     * @param proofContent Conteúdo da prova
     * @param aiAnalysis Análise da IA
     * @returns Prova salva
     */
    private static async saveProof(
        propertyId: string,
        ownerContact: any,
        proofType: "VIDEO" | "PHOTO" | "DOCUMENT",
        proofContent: string,
        aiAnalysis: AIAnalysisResult
    ): Promise<ProofOfLife> {
        const proofData: CreateProofOfLifeInput & {
            aiAnalysis: AIAnalysisResult;
        } = {
            propertyId,
            ownerContact,
            proofType,
            proofContent,
            aiAnalysis,
            verificationStatus: "PENDING",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const proof = await prisma.proofOfLife.create({
            data: proofData,
        });

        return proof;
    }

    /**
     * Verifica e atualiza a prova
     * @param proofId ID da prova
     * @param verificationStatus Status da verificação
     * @param verificationDate Data da verificação
     * @param aiAnalysis Análise atualizada da IA
     * @returns Prova atualizada
     */
    static async verifyProof(
        proofId: string,
        verificationStatus: "VERIFIED" | "REJECTED",
        verificationDate?: Date,
        aiAnalysis?: AIAnalysisResult
    ): Promise<ProofOfLife> {
        const updateData: UpdateProofOfLifeInput & {
            verificationDate: Date;
            aiAnalysis: AIAnalysisResult;
        } = {
            verificationStatus,
            verificationDate: verificationDate || new Date(),
            aiAnalysis: aiAnalysis || {
                confidence: 0,
                riskScore: 0,
                recommendations: [],
                detailedAnalysis: "",
            },
        };

        const proof = await prisma.proofOfLife.update({
            where: { id: proofId },
            data: updateData,
        });

        return proof;
    }

    /**
     * Gera um fluxo de WhatsApp para solicitar prova de vida
     * @param propertyId ID da propriedade
     * @param ownerPhone Telefone do proprietário
     * @param ownerName Nome do proprietário
     * @returns Mensagem e botões para o WhatsApp
     */
    static async generateProofRequestFlow(
        propertyId: string,
        ownerPhone: string,
        ownerName: string
    ): Promise<WhatsAppButton[]> {
        const buttons: WhatsAppButton[] = [
            {
                id: `proof_video_${propertyId}`,
                title: "Gravar Vídeo",
                payload: `PROOF_VIDEO_${propertyId}`,
            },
            {
                id: `proof_photo_${propertyId}`,
                title: "Enviar Foto",
                payload: `PROOF_PHOTO_${propertyId}`,
            },
            {
                id: `proof_document_${propertyId}`,
                title: "Enviar Documento",
                payload: `PROOF_DOCUMENT_${propertyId}`,
            },
            {
                id: `proof_later_${propertyId}`,
                title: "Mais Tarde",
                payload: `PROOF_LATER_${propertyId}`,
            },
        ];

        return buttons;
    }

    /**
     * Gera um fluxo de WhatsApp para mostrar o status da prova
     * @param proofId ID da prova
     * @param ownerPhone Telefone do proprietário
     * @param ownerName Nome do proprietário
     * @returns Mensagem e botões para o WhatsApp
     */
    static async generateProofStatusFlow(
        proofId: string,
        ownerPhone: string,
        ownerName: string
    ): Promise<WhatsAppButton[]> {
        const buttons: WhatsAppButton[] = [
            {
                id: `proof_details_${proofId}`,
                title: "Ver Detalhes",
                payload: `PROOF_DETAILS_${proofId}`,
            },
            {
                id: `proof_resend_${proofId}`,
                title: "Reenviar",
                payload: `PROOF_RESEND_${proofId}`,
            },
        ];

        return buttons;
    }
}

/**
 * Interface para o resultado da análise da IA
 */
export interface AIAnalysisResult {
    confidence: number;
    riskScore: number;
    recommendations: string[];
    detailedAnalysis: string;
}

/**
 * Interface para o resultado da verificação
 */
export interface ProofVerificationResult {
    proof: ProofOfLife;
    verificationStatus: "VERIFIED" | "REJECTED";
    aiAnalysis: AIAnalysisResult;
}
