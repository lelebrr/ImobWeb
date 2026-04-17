import { z } from "zod";

/**
 * Tipos de dados para o motor de Prova de Vida
 */
export const ProofOfLifeSchema = z.object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    ownerContact: z.object({
        name: z.string(),
        phone: z.string(),
        whatsapp: z.string(),
    }),
    lastProofDate: z.date(),
    proofType: z.enum(["VIDEO", "PHOTO", "DOCUMENT"]),
    proofContent: z.string(),
    verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
    verificationDate: z.date().nullable(),
    aiAnalysis: z.object({
        confidence: z.number().min(0).max(100),
        riskScore: z.number().min(0).max(100),
        recommendations: z.array(z.string()),
        detailedAnalysis: z.string(),
    }),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ProofOfLife = z.infer<typeof ProofOfLifeSchema>;

export const createProofOfLifeInput = z.object({
    propertyId: z.string().uuid(),
    ownerContact: z.object({
        name: z.string(),
        phone: z.string(),
        whatsapp: z.string(),
    }),
    proofType: z.enum(["VIDEO", "PHOTO", "DOCUMENT"]),
    proofContent: z.string(),
});

export type CreateProofOfLifeInput = z.infer<typeof createProofOfLifeInput>;

export const updateProofOfLifeInput = z.object({
    verificationStatus: z.enum(["VERIFIED", "REJECTED"]),
    verificationDate: z.date().nullable(),
    aiAnalysis: z.object({
        confidence: z.number().min(0).max(100),
        riskScore: z.number().min(0).max(100),
        recommendations: z.array(z.string()),
        detailedAnalysis: z.string(),
    }),
});

export type UpdateProofOfLifeInput = z.infer<typeof updateProofOfLifeInput>;
