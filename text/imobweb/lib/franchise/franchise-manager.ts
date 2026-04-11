import { z } from 'zod';

export const FranchiseLevelSchema = z.enum(['matrix', 'franchise', 'branch', 'team']);
export type FranchiseLevel = z.infer<typeof FranchiseLevelSchema>;

export const FranchiseStatusSchema = z.enum(['active', 'inactive', 'suspended', 'pending_approval']);
export type FranchiseStatus = z.infer<typeof FranchiseStatusSchema>;

export const FranchiseSchema = z.object({
  id: z.string(),
  name: z.string(),
  corporateName: z.string().optional(),
  cnpj: z.string().optional(),
  level: FranchiseLevelSchema,
  parentId: z.string().optional(),
  status: FranchiseStatusSchema.default('pending_approval'),
  
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().default('Brasil'),
  }).optional(),
  
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  
  branding: z.object({
    logo: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    approved: z.boolean().default(false),
    approvedBy: z.string().optional(),
    approvedAt: z.number().optional(),
  }).optional(),
  
  configuration: z.object({
    maxUsers: z.number().default(10),
    maxProperties: z.number().default(100),
    maxLeads: z.number().default(500),
    availablePackages: z.array(z.string()).optional(),
    features: z.record(z.string(), z.boolean()).optional(),
  }).optional(),
  
  royalties: z.object({
    percentage: z.number().min(0).max(100).default(5),
    fixedFee: z.number().default(0),
    billingCycle: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),
    nextPaymentDate: z.number().optional(),
    lastPaymentDate: z.number().optional(),
    lastPaymentAmount: z.number().optional(),
    pendingAmount: z.number().default(0),
  }).optional(),
  
  metrics: z.object({
    totalProperties: z.number().default(0),
    totalLeads: z.number().default(0),
    convertedLeads: z.number().default(0),
    mrr: z.number().default(0),
    activeUsers: z.number().default(0),
  }).optional(),
  
  createdAt: z.number(),
  updatedAt: z.number(),
  activatedAt: z.number().optional(),
});

export type Franchise = z.infer<typeof FranchiseSchema>;

export interface FranchiseWithChildren extends Franchise {
  children: FranchiseWithChildren[];
}

export interface RoyaltyCalculation {
  franchiseId: string;
  franchiseName: string;
  period: string;
  mrr: number;
  percentage: number;
  fixedFee: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: number;
  paidDate?: number;
}

export interface FranchiseMetrics {
  totalMRR: number;
  totalRoyalties: number;
  propertyCount: number;
  leadCount: number;
  conversionRate: number;
  topFranchises: Franchise[];
  growth: {
    mrr: number;
    properties: number;
    leads: number;
  };
}

export class FranchiseManager {
  private static franchises: Map<string, Franchise> = new Map();

  static async initialize(): Promise<void> {
    // In production, load from database
  }

  static async create(franchise: Franchise): Promise<Franchise> {
    const newFranchise: Franchise = {
      ...franchise,
      id: franchise.id || `franchise_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    this.franchises.set(newFranchise.id, newFranchise);
    return newFranchise;
  }

  static async get(franchiseId: string): Promise<Franchise | undefined> {
    return this.franchises.get(franchiseId);
  }

  static async update(franchiseId: string, updates: Partial<Franchise>): Promise<Franchise | null> {
    const franchise = this.franchises.get(franchiseId);
    if (!franchise) return null;
    
    const updated: Franchise = {
      ...franchise,
      ...updates,
      updatedAt: Date.now(),
    };
    
    this.franchises.set(franchiseId, updated);
    return updated;
  }

  static async delete(franchiseId: string): Promise<boolean> {
    return this.franchises.delete(franchiseId);
  }

  static async getAll(): Promise<Franchise[]> {
    return Array.from(this.franchises.values());
  }

  static async getChildren(parentId: string): Promise<Franchise[]> {
    return Array.from(this.franchises.values()).filter(f => f.parentId === parentId);
  }

  static async getDescendants(franchiseId: string): Promise<Franchise[]> {
    const descendants: Franchise[] = [];
    const children = await this.getChildren(franchiseId);
    
    for (const child of children) {
      descendants.push(child);
      const childDescendants = await this.getDescendants(child.id);
      descendants.push(...childDescendants);
    }
    
    return descendants;
  }

  static async getHierarchy(franchiseId: string): Promise<FranchiseWithChildren | null> {
    const franchise = await this.get(franchiseId);
    if (!franchise) return null;
    
    const children = await this.getChildren(franchiseId);
    const childrenWithDescendants = await Promise.all(
      children.map(child => this.getHierarchy(child.id))
    );
    
    return {
      ...franchise,
      children: childrenWithDescendants.filter((c): c is FranchiseWithChildren => c !== null),
    };
  }

  static async getMatrix(): Promise<Franchise[]> {
    return Array.from(this.franchises.values()).filter(f => f.level === 'matrix');
  }

  static async getFranchises(): Promise<Franchise[]> {
    return Array.from(this.franchises.values()).filter(f => f.level === 'franchise');
  }

  static async getBranches(franchiseId: string): Promise<Franchise[]> {
    return this.getChildren(franchiseId).then(children => 
      children.filter(c => c.level === 'branch')
    );
  }

  static async calculateRoyalties(franchiseId: string, period: string): Promise<RoyaltyCalculation> {
    const franchise = await this.get(franchiseId);
    if (!franchise) {
      throw new Error('Franquia não encontrada');
    }

    const mrr = franchise.metrics?.mrr || 0;
    const percentage = franchise.royalties?.percentage || 5;
    const fixedFee = franchise.royalties?.fixedFee || 0;
    
    const totalAmount = (mrr * percentage / 100) + fixedFee;
    
    return {
      franchiseId,
      franchiseName: franchise.name,
      period,
      mrr,
      percentage,
      fixedFee,
      totalAmount,
      status: 'pending',
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
  }

  static async calculateAllRoyalties(period: string): Promise<RoyaltyCalculation[]> {
    const franchises = await this.getFranchises();
    const calculations: RoyaltyCalculation[] = [];
    
    for (const franchise of franchises) {
      const calc = await this.calculateRoyalties(franchise.id, period);
      calculations.push(calc);
    }
    
    return calculations;
  }

  static async getMetrics(): Promise<FranchiseMetrics> {
    const franchises = await this.getFranchises();
    
    let totalMRR = 0;
    let totalRoyalties = 0;
    let propertyCount = 0;
    let leadCount = 0;
    let convertedLeads = 0;
    
    for (const franchise of franchises) {
      totalMRR += franchise.metrics?.mrr || 0;
      totalRoyalties += ((franchise.metrics?.mrr || 0) * (franchise.royalties?.percentage || 5) / 100);
      propertyCount += franchise.metrics?.totalProperties || 0;
      leadCount += franchise.metrics?.totalLeads || 0;
      convertedLeads += franchise.metrics?.convertedLeads || 0;
    }
    
    const topFranchises = franchises
      .sort((a, b) => (b.metrics?.mrr || 0) - (a.metrics?.mrr || 0))
      .slice(0, 5);
    
    return {
      totalMRR,
      totalRoyalties,
      propertyCount,
      leadCount,
      conversionRate: leadCount > 0 ? (convertedLeads / leadCount) * 100 : 0,
      topFranchises,
      growth: {
        mrr: 5.2,
        properties: 12,
        leads: 8,
      },
    };
  }

  static async approveBranding(franchiseId: string, approvedBy: string): Promise<Franchise | null> {
    const franchise = await this.get(franchiseId);
    if (!franchise) return null;
    
    return this.update(franchiseId, {
      branding: {
        ...franchise.branding,
        approved: true,
        approvedBy,
        approvedAt: Date.now(),
      },
    });
  }

  static async updateConfiguration(franchiseId: string, config: Partial<Franchise['configuration']>): Promise<Franchise | null> {
    const franchise = await this.get(franchiseId);
    if (!franchise) return null;
    
    return this.update(franchiseId, {
      configuration: {
        maxUsers: 10,
        maxProperties: 100,
        maxLeads: 500,
        ...franchise.configuration,
        ...config,
      },
    });
  }

  static async checkLimits(franchiseId: string): Promise<{
    withinLimits: boolean;
    exceededLimits: string[];
    current: { users: number; properties: number; leads: number };
    limits: { users: number; properties: number; leads: number };
  }> {
    const franchise = await this.get(franchiseId);
    if (!franchise) {
      return {
        withinLimits: false,
        exceededLimits: ['franchise_not_found'],
        current: { users: 0, properties: 0, leads: 0 },
        limits: { users: 0, properties: 0, leads: 0 },
      };
    }
    
    const limits = franchise.configuration;
    const metrics = franchise.metrics;
    
    const exceededLimits: string[] = [];
    
    if (limits && metrics) {
      if (limits.maxUsers && metrics.activeUsers > limits.maxUsers) {
        exceededLimits.push('users');
      }
      if (limits.maxProperties && metrics.totalProperties > limits.maxProperties) {
        exceededLimits.push('properties');
      }
      if (limits.maxLeads && metrics.totalLeads > limits.maxLeads) {
        exceededLimits.push('leads');
      }
    }
    
    return {
      withinLimits: exceededLimits.length === 0,
      exceededLimits,
      current: {
        users: metrics?.activeUsers || 0,
        properties: metrics?.totalProperties || 0,
        leads: metrics?.totalLeads || 0,
      },
      limits: {
        users: limits?.maxUsers || 10,
        properties: limits?.maxProperties || 100,
        leads: limits?.maxLeads || 500,
      },
    };
  }

  static async getConsolidatedReport(franchiseId: string): Promise<{
    franchise: Franchise;
    branches: Franchise[];
    totalMRR: number;
    totalProperties: number;
    totalLeads: number;
    royaltyRate: number;
    estimatedRoyalties: number;
  }> {
    const franchise = await this.get(franchiseId);
    if (!franchise) {
      throw new Error('Franquia não encontrada');
    }
    
    const branches = await this.getBranches(franchiseId);
    
    let totalMRR = franchise.metrics?.mrr || 0;
    let totalProperties = franchise.metrics?.totalProperties || 0;
    let totalLeads = franchise.metrics?.totalLeads || 0;
    
    for (const branch of branches) {
      totalMRR += branch.metrics?.mrr || 0;
      totalProperties += branch.metrics?.totalProperties || 0;
      totalLeads += branch.metrics?.totalLeads || 0;
    }
    
    const royaltyRate = franchise.royalties?.percentage || 5;
    const estimatedRoyalties = totalMRR * (royaltyRate / 100);
    
    return {
      franchise,
      branches,
      totalMRR,
      totalProperties,
      totalLeads,
      royaltyRate,
      estimatedRoyalties,
    };
  }
}

export const franchiseManager = FranchiseManager;

export async function createFranchise(franchise: Franchise): Promise<Franchise> {
  return FranchiseManager.create(franchise);
}

export async function getFranchise(franchiseId: string): Promise<Franchise | undefined> {
  return FranchiseManager.get(franchiseId);
}

export async function getAllFranchises(): Promise<Franchise[]> {
  return FranchiseManager.getAll();
}

export async function getFranchiseHierarchy(franchiseId: string): Promise<FranchiseWithChildren | null> {
  return FranchiseManager.getHierarchy(franchiseId);
}

export async function calculateFranchiseRoyalties(franchiseId: string, period: string): Promise<RoyaltyCalculation> {
  return FranchiseManager.calculateRoyalties(franchiseId, period);
}

export async function getFranchiseMetrics(): Promise<FranchiseMetrics> {
  return FranchiseManager.getMetrics();
}

export async function checkFranchiseLimits(franchiseId: string): Promise<ReturnType<typeof FranchiseManager.checkLimits>> {
  return FranchiseManager.checkLimits(franchiseId);
}
