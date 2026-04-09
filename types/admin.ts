// Tipos para o painel Super Admin

export interface Organization {
    id: string
    name: string
    slug: string
    plan: 'free' | 'professional' | 'enterprise'
    status: 'active' | 'inactive' | 'suspended'
    createdAt: Date
    updatedAt: Date
    owner: {
        id: string
        name: string
        email: string
    }
    billing: {
        stripeCustomerId: string
        subscriptionId: string | null
        currentPeriodEnd: Date | null
        trialEnd: Date | null
    }
    stats: {
        totalProperties: number
        totalUsers: number
        totalLeads: number
        mrr: number
        churnRate: number
    }
}

export interface User {
    id: string
    name: string
    email: string
    role: 'superadmin' | 'owner' | 'manager' | 'broker'
    organizationId: string
    organization: {
        name: string
        slug: string
    }
    isActive: boolean
    createdAt: Date
    lastLoginAt: Date | null
}

export interface Subscription {
    id: string
    organizationId: string
    status: 'active' | 'past_due' | 'canceled' | 'unpaid'
    plan: 'free' | 'professional' | 'enterprise'
    currentPeriodStart: Date
    currentPeriodEnd: Date
    trialEnd: Date | null
    cancelAtPeriodEnd: boolean
    createdAt: Date
    updatedAt: Date
}

export interface BillingMetrics {
    totalOrganizations: number
    activeOrganizations: number
    totalMRR: number
    newMRR: number
    churnedMRR: number
    churnRate: number
    growthRate: number
}

export interface AnalyticsData {
    organizations: Organization[]
    users: User[]
    subscriptions: Subscription[]
    metrics: BillingMetrics
}

export interface BroadcastMessage {
    id: string
    title: string
    content: string
    type: 'info' | 'warning' | 'success' | 'error'
    targetAudience: 'all' | 'organization' | 'role'
    targetOrganizationId?: string
    targetRole?: string
    isSent: boolean
    sentAt: Date | null
    scheduledFor: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface Permission {
    resource: string
    action: 'create' | 'read' | 'update' | 'delete' | 'manage'
    conditions?: Record<string, any>
}

export type Role = 'superadmin' | 'owner' | 'manager' | 'broker'