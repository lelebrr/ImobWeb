/**
 * SERVIÇO DE API KEYS - imobWeb
 * 2026 - Autenticação de Integrações Externas
 */

import { PrismaClient } from "@prisma/client";
import { crypto } from "next/dist/compiled/@edge-runtime/primitives";

const prisma = new PrismaClient();

/**
 * Cria uma nova API Key para uma organização.
 */
export async function createApiKey(organizationId: string, name: string) {
  const key = `iw_${generateRandomString(32)}`;
  
  // Hash da chave para armazenamento seguro
  const keyHash = await hashKey(key);

  const apiKey = await prisma.apiKey.create({
    data: {
      keyHash,
      name,
      organizationId,
      preview: `${key.slice(0, 6)}...${key.slice(-4)}`,
    }
  });

  return { ...apiKey, clearKey: key };
}

/**
 * Valida uma API Key e retorna a organização associada.
 */
export async function validateApiKey(key: string) {
  const keyHash = await hashKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { organization: true }
  });

  if (!apiKey || !apiKey.enabled) return null;

  // Atualiza data de último uso (background)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() }
  }).catch(console.error);

  return apiKey.organization;
}

// Utilitários de Criptografia Baseados em Web Crypto para Edge Compatibility
async function hashKey(key: string) {
  const msgUint8 = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function generateRandomString(length: number) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}
