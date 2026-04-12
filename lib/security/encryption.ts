/**
 * Utilitários de Criptografia para o imobWeb
 * Usado para proteger dados sensíveis (API Keys, Tokens de integração) no banco de dados
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"

// Nota: Em produção, estas chaves devem vir de variáveis de ambiente seguras
const ALGORITHM = "aes-256-cbc"
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "imobweb-super-secret-key-2026-04-09" // 32 chars
const KEY = scryptSync(ENCRYPTION_KEY, 'salt', 32)

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return `${iv.toString("hex")}:${encrypted}`
}

export function decrypt(text: string): string {
  const [ivHex, encryptedText] = text.split(":")
  if (!ivHex || !encryptedText) throw new Error("Formato de criptografia inválido")
  
  const iv = Buffer.from(ivHex, "hex")
  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

/**
 * Hash determinístico apenas para indexação (opcional)
 */
export function hash(text: string): string {
  const { createHash } = require("crypto")
  return createHash("sha256").update(text).digest("hex")
}
