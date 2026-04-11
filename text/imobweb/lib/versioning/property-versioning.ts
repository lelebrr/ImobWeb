import { prisma } from '@/lib/prisma'

/**
 * Motor de Versionamento Avançado de Imóveis
 * Registra snapshots de mudanças para histórico e auditoria
 */

export interface PropertySnapshot {
  propertyId: string
  payload: any
  changeType: 'PRICE_CHANGE' | 'STATUS_CHANGE' | 'PHOTO_UPDATE' | 'GENERAL_UPDATE'
  changedBy: string
}

export class PropertyVersioning {
  /**
   * Cria uma nova versão/snapshot de um imóvel
   */
  async createSnapshot(data: PropertySnapshot) {
    try {
      return await prisma.propertyHistory.create({
        data: {
          propertyId: data.propertyId,
          snapshot: data.payload,
          changeType: data.changeType,
          changedBy: data.changedBy,
          createdAt: new Date()
        }
      })
    } catch (err) {
      console.error('[Versioning] Erro ao criar snapshot de imóvel:', err)
      throw err
    }
  }

  /**
   * Recupera o histórico de preços de um imóvel
   */
  async getPriceHistory(propertyId: string) {
    const history = await prisma.propertyHistory.findMany({
      where: { 
        propertyId,
        changeType: 'PRICE_CHANGE'
      },
      orderBy: { createdAt: 'desc' }
    })

    return history.map(h => ({
      price: (h.snapshot as any).price,
      date: h.createdAt,
      changedBy: h.changedBy
    }))
  }

  /**
   * Restaura um imóvel para uma versão anterior específica
   */
  async revertToVersion(historyId: string) {
    const historicalData = await prisma.propertyHistory.findUnique({
      where: { id: historyId }
    })

    if (!historicalData) throw new Error('Versão histórica não encontrada')

    const snapshot = historicalData.snapshot as any
    
    // Atualiza o imóvel atual com os dados do snapshot
    return await prisma.property.update({
      where: { id: historicalData.propertyId },
      data: {
        title: snapshot.title,
        description: snapshot.description,
        price: snapshot.price,
        status: snapshot.status,
        // ... outros campos críticos
      }
    })
  }
}

export const propertyVersioning = new PropertyVersioning()
