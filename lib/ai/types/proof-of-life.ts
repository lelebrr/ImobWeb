import { z } from "zod";
import { AIAnalysisSchema } from "@/types/ai";

/**
 * Tipos de dados para Prova de Vida
 */

export const ProofOfLifeSchema = z.object({
  id: z.string().cuid(),
  propertyId: z.string(),
  ownerContact: z.object({
    name: z.string(),
    phone: z.string(),
    whatsapp: z.string().optional(),
  }),
  lastProofDate: z.date(),
  proofType: z.enum(["VIDEO", "PHOTO", "DOCUMENT"]),
  proofContent: z.string(), // URL or base64
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
  verificationDate: z.date().nullable(),
  aiAnalysis: AIAnalysisSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProofOfLife = z.infer<typeof ProofOfLifeSchema>;

export const createProofOfLifeInput = z.object({
  propertyId: z.string(),
  ownerContact: z.object({
    name: z.string(),
    phone: z.string(),
    whatsapp: z.string().optional(),
  }),
  proofType: z.enum(["VIDEO", "PHOTO", "DOCUMENT"]),
  proofContent: z.string(),
});

export type CreateProofOfLifeInput = z.infer<typeof createProofOfLifeInput>;

export const updateProofOfLifeInput = z.object({
  verificationStatus: z.enum(["VERIFIED", "REJECTED"]),
  verificationDate: z.date().optional(),
  aiAnalysis: AIAnalysisSchema.optional(),
});

export type UpdateProofOfLifeInput = z.infer<typeof updateProofOfLifeInput>;
