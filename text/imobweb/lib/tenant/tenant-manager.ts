import { z } from 'zod';

export const TenantTypeSchema = z.enum(['matrix', 'franchise', 'branch', 'individual']);
export type TenantType = z.infer<typeof TenantTypeSchema>;

export const TenantStatusSchema = z.enum(['active', 'inactive', 'suspended', 'pending']);
export type TenantStatus = z.infer<typeof TenantStatusSchema>;

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: TenantTypeSchema,
  parentId: z.string().optional(),
  status: TenantStatusSchema.default('pending'),
  
  settings: z.object({
    allowChildren: z.boolean().default(true),
    maxBranches: z.number().optional(),
    maxTeams: z.number().optional(),
    maxUsers: z.number().default(10),
    maxProperties: z.number().default(100),
    maxLeads: z.number().default(500),
    availableFeatures: z.record(z.boolean()).optional(),
    customBranding: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
    whitelabel: z.boolean().default(false),
  }).optional(),
  
  limits: z.object({
    users: z.number().default(10),
    properties: z.number().default(100),
    leads: z.number().default(500),
    storage: z.number().default(10737418240),
    apiCalls: z.number().default(10000),
  }).optional(),
  
  usage: z.object({
    users: z.number().default(0),
    properties: z.number().default(0),
    leads: z.number().default(0),
    storage: z.number().default(0),
    apiCalls: z.number().default(0),
  }).optional(),
  
  subscription: z.object({
    plan: z.string().optional(),
    status: z.string().default('active'),
    mrr: z.number().default(0),
    startDate: z.number().optional(),
    endDate: z.number().optional(),
  }).optional(),
  
  metadata: z.record(z.unknown()).optional(),
  
  createdAt: z.number(),
  updatedAt: z.number(),
  activatedAt: z.number().optional(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export interface TenantContext {
  tenantId: string;
  tenantType: TenantType;
  parentId?: string;
  organizationId: string;
  userId: string;
  roles: string[];
  permissions: string[];
}

export interface TenantHierarchy extends Tenant {
  children: TenantHierarchy[];
  teams: string[];
  users: number;
}

export class TenantManager {
  private static tenants: Map<string, Tenant> = new Map();
  private static tenantUsers: Map<string, Set<string>> = new Map();

  static async initialize(): Promise<void> {
    // Load from database in production
  }

  static async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const newTenant: Tenant = {
      ...tenant,
      id: `tenant_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    this.tenants.set(newTenant.id, newTenant);
    this.tenantUsers.set(newTenant.id, new Set());
    
    return newTenant;
  }

  static async get(tenantId: string): Promise<Tenant | undefined> {
    return this.tenants.get(tenantId);
  }

  static async update(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return null;
    
    const updated: Tenant = {
      ...tenant,
      ...updates,
      updatedAt: Date.now(),
    };
    
    this.tenants.set(tenantId, updated);
    return updated;
  }

  static async delete(tenantId: string): Promise<boolean> {
    return this.tenants.delete(tenantId);
  }

  static async getAll(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  static async getChildren(parentId: string): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(t => t.parentId === parentId);
  }

  static async getHierarchy(tenantId: string): Promise<TenantHierarchy | null> {
    const tenant = await this.get(tenantId);
    if (!tenant) return null;
    
    const children = await this.getChildren(tenantId);
    const userCount = this.tenantUsers.get(tenantId)?.size || 0;
    
    return {
      ...tenant,
      children: await Promise.all(children.map(c => this.getHierarchy(c.id))),
      teams: [],
      users: userCount,
    };
  }

  static async getRoot(): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(t => !t.parentId);
  }

  static async addUser(tenantId: string, userId: string): Promise<void> {
    const users = this.tenantUsers.get(tenantId);
    if (users) {
      users.add(userId);
    } else {
      this.tenantUsers.set(tenantId, new Set([userId]));
    }
    
    const tenant = this.tenants.get(tenantId);
    if (tenant && tenant.usage) {
      await this.update(tenantId, {
        usage: {
          ...tenant.usage,
          users: (tenant.usage.users || 0) + 1,
        },
      });
    }
  }

  static async removeUser(tenantId: string, userId: string): Promise<void> {
    const users = this.tenantUsers.get(tenantId);
    if (users) {
      users.delete(userId);
    }
    
    const tenant = this.tenants.get(tenantId);
    if (tenant && tenant.usage) {
      await this.update(tenantId, {
        usage: {
          ...tenant.usage,
          users: Math.max(0, (tenant.usage.users || 1) - 1),
        },
      });
    }
  }

  static async getTenantUsers(tenantId: string): Promise<string[]> {
    return Array.from(this.tenantUsers.get(tenantId) || []);
  }

  static async checkLimits(tenantId: string): Promise<{
    withinLimits: boolean;
    exceededLimits: string[];
    current: Record<string, number>;
    limits: Record<string, number>;
  }> {
    const tenant = await this.get(tenantId);
    if (!tenant) {
      return {
        withinLimits: false,
        exceededLimits: ['tenant_not_found'],
        current: {},
        limits: {},
      };
    }
    
    const limits = tenant.limits || { users: 10, properties: 100, leads: 500 };
    const usage = tenant.usage || { users: 0, properties: 0, leads: 0 };
    
    const exceededLimits: string[] = [];
    
    if (usage.users > limits.users) exceededLimits.push('users');
    if (usage.properties > limits.properties) exceededLimits.push('properties');
    if (usage.leads > limits.leads) exceededLimits.push('leads');
    
    return {
      withinLimits: exceededLimits.length === 0,
      exceededLimits,
      current: {
        users: usage.users,
        properties: usage.properties,
        leads: usage.leads,
        storage: usage.storage,
        apiCalls: usage.apiCalls,
      },
      limits: {
        users: limits.users,
        properties: limits.properties,
        leads: limits.leads,
        storage: limits.storage,
        apiCalls: limits.apiCalls,
      },
    };
  }

  static async getTenantContext(tenantId: string, userId: string): Promise<TenantContext | null> {
    const tenant = await this.get(tenantId);
    if (!tenant) return null;
    
    return {
      tenantId: tenant.id,
      tenantType: tenant.type,
      parentId: tenant.parentId,
      organizationId: tenant.id,
      userId,
      roles: [],
      permissions: [],
    };
  }

  static async switchTenant(userId: string, fromTenantId: string, toTenantId: string): Promise<boolean> {
    await this.removeUser(fromTenantId, userId);
    await this.addUser(toTenantId, userId);
    return true;
  }

  static async getAccessibleTenants(userId: string): Promise<Tenant[]> {
    const accessible: Tenant[] = [];
    
    for (const [tenantId, users] of this.tenantUsers.entries()) {
      if (users.has(userId)) {
        const tenant = await this.get(tenantId);
        if (tenant) accessible.push(tenant);
      }
    }
    
    return accessible;
  }

  static async isMember(tenantId: string, userId: string): Promise<boolean> {
    return this.tenantUsers.get(tenantId)?.has(userId) || false;
  }

  static async updateUsage(tenantId: string, resource: 'properties' | 'leads' | 'storage' | 'apiCalls', amount: number): Promise<void> {
    const tenant = await this.get(tenantId);
    if (!tenant) return;
    
    const current = tenant.usage?.[resource] || 0;
    
    await this.update(tenantId, {
      usage: {
        ...tenant.usage,
        [resource]: current + amount,
      },
    });
  }

  static async resetUsage(tenantId: string): Promise<void> {
    const tenant = await this.get(tenantId);
    if (!tenant) return;
    
    await this.update(tenantId, {
      usage: {
        users: tenant.usage?.users || 0,
        properties: 0,
        leads: 0,
        storage: 0,
        apiCalls: 0,
      },
    });
  }
}

export const tenantManager = TenantManager;

export async function createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
  return TenantManager.create(tenant);
}

export async function getTenant(tenantId: string): Promise<Tenant | undefined> {
  return TenantManager.get(tenantId);
}

export async function getAllTenants(): Promise<Tenant[]> {
  return TenantManager.getAll();
}

export async function getTenantHierarchy(tenantId: string): Promise<TenantHierarchy | null> {
  return TenantManager.getHierarchy(tenantId);
}

export async function checkTenantLimits(tenantId: string): Promise<ReturnType<typeof TenantManager.checkLimits>> {
  return TenantManager.checkLimits(tenantId);
}

export async function addUserToTenant(tenantId: string, userId: string): Promise<void> {
  return TenantManager.addUser(tenantId, userId);
}

export async function removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
  return TenantManager.removeUser(tenantId, userId);
}

export async function getTenantContext(tenantId: string, userId: string): Promise<TenantContext | null> {
  return TenantManager.getTenantContext(tenantId, userId);
}