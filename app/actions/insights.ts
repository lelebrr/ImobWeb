'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { subDays, startOfDay, endOfDay } from 'date-fns'

/**
 * Identifies stagnant properties (no visits/leads/updates in 30+ days)
 */
export async function getStagnantProperties() {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) return []

    const thirtyDaysAgo = subDays(new Date(), 30)

    const stagnant = await prisma.property.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: 'DISPONIVEL',
        updatedAt: { lte: thirtyDaysAgo },
        // We also check if there are any leads associated in the last 30 days
        leads: {
          none: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      },
      select: {
        id: true,
        title: true,
        code: true,
        price: true,
        updatedAt: true,
        _count: {
          select: { leads: true }
        }
      },
      take: 5
    })

    return stagnant.map(p => ({
      ...p,
      daysStagnant: Math.floor((new Date().getTime() - p.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
      suggestion: p.price ? "Redução sugerida de 5% no valor" : "Renovação de fotos e descrição"
    }))
  } catch (error) {
    console.error('Error in getStagnantProperties:', error)
    return []
  }
}

/**
 * Detects performance drops in agents
 */
export async function getAtRiskAgents() {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) return []

    const agents = await prisma.user.findMany({
      where: {
        organizationId: session.user.organizationId,
        role: 'AGENCY_SALES'
      },
      include: {
        assignedLeads: {
          where: {
            createdAt: { gte: subDays(new Date(), 60) }
          },
          select: { status: true, createdAt: true }
        }
      }
    })

    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)

    const atRisk = agents.map(agent => {
      const recentLeads = agent.assignedLeads.filter(l => l.createdAt >= thirtyDaysAgo)
      const previousLeads = agent.assignedLeads.filter(l => l.createdAt < thirtyDaysAgo)

      const recentConv = recentLeads.filter(l => l.status === 'CONVERTIDO').length
      const previousConv = previousLeads.filter(l => l.status === 'CONVERTIDO').length

      const recentRate = recentLeads.length > 0 ? (recentConv / recentLeads.length) * 100 : 0
      const previousRate = previousLeads.length > 0 ? (previousConv / previousLeads.length) * 100 : 0

      const drop = previousRate > 0 ? ((previousRate - recentRate) / previousRate) * 100 : 0

      return {
        name: agent.name,
        drop,
        recentRate,
        previousRate,
        status: drop > 20 ? 'CRITICAL' : drop > 10 ? 'WARNING' : 'STABLE'
      }
    }).filter(a => a.status !== 'STABLE')

    return atRisk
  } catch (error) {
    console.error('Error in getAtRiskAgents:', error)
    return []
  }
}

/**
 * Finds leads without follow-up for 3+ days
 */
export async function getForgottenLeads() {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) return []

    const threeDaysAgo = subDays(new Date(), 3)

    const forgotten = await prisma.lead.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: { in: ['NOVO', 'CONTATADO'] },
        updatedAt: { lte: threeDaysAgo }
      },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        updatedAt: true,
        status: true
      },
      take: 10,
      orderBy: { updatedAt: 'asc' }
    })

    return forgotten.map(l => ({
      ...l,
      daysForgotten: Math.floor((new Date().getTime() - l.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    }))
  } catch (error) {
    console.error('Error in getForgottenLeads:', error)
    return []
  }
}

/**
 * Market trends and benchmarks
 */
export async function getMarketTrends() {
  // Usually this would fetch global stats, here we provide curated benchmarks
  return {
    conversionBench: 12.5, // Market average %
    timeToSaleBench: 85,   // Market average days
    leadsPerPropertyBench: 15,
    topRegions: ['Jardins', 'Pinheiros', 'Moema'],
    priceFluctuation: -1.2 // % compared to last month
  }
}
