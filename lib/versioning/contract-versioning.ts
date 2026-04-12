import { prisma } from '@/lib/prisma'

/**
 * Motor de Versionamento de Contratos e Propostas
 * Essencial para trilha de auditoria jurídica e compliance
 */

export interface ContractSnapshot {
  contractId: string
  payload: {
    content: string
    value: number
    status: string
    signatories: any[]
    attachments: string[]
  }
  changeReason: string
  changedBy: string
}

export class ContractVersioning {
  /**
   * Registra uma nova versão do contrato (ex: após aditivo ou negociação)
   */
  async recordVersion(data: ContractSnapshot) {
    try {
      return await prisma.contractHistory.create({
        data: {
          contractId: data.contractId,
          snapshot: data.payload,
          reason: data.changeReason,
          changedBy: data.changedBy,
          version: await this.getNextVersionNumber(data.contractId),
          createdAt: new Date()
        }
      })
    } catch (err) {
      console.error('[Versioning] Erro ao versionar contrato:', err)
      throw err
    }
  }

  /**
   * Obtém todas as versões de um contrato para comparação
   */
  async getContractTimeline(contractId: string) {
    return await prisma.contractHistory.findMany({
      where: { contractId },
      orderBy: { version: 'desc' }
    })
  }

  /**
   * Calcula o próximo número de versão sequencial
   */
  private async getNextVersionNumber(contractId: string): Promise<number> {
    const lastVersion = await prisma.contractHistory.findFirst({
      where: { contractId },
      orderBy: { version: 'desc' },
      select: { version: true }
    })
    
    return (lastVersion?.version || 0) + 1
  }

  /**
   * Compara duas versões de um contrato (Diff)
   * (Simplificação da lógica de comparação)
   */
  async compareVersions(v1Id: string, v2Id: string) {
      const versions = await prisma.contractHistory.findMany({
          where: { id: { in: [v1Id, v2Id] } }
      })
      // Lógica de Diff entre JSONs
      return { diff: '...' }
  }
}

export const contractVersioning = new ContractVersioning()
