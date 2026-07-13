/**
 * Utilitários de Criptografia para o imobWeb
 * Usado para proteger dados sensíveis (API Keys, Tokens de integração) no banco de dados
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"

// Nota: EM PRODUÇÃO, estas chaves DEVEM vir de variáveis de ambiente seguras
const ALGORITHM = "aes-256-cbc"
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error(
    "ENCRYPTION_KEY environment variable is required and must be at least 32 characters. " +
    "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  )
}
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || "imobweb-default-salt-v1"
const KEY = scryptSync(ENCRYPTION_KEY, ENCRYPTION_SALT, 32)

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
