import {
  PermissionAction,
  ResourceType,
  UserPermissions,
  PermissionCheck,
  PermissionResult,
  Role,
  ROLE_PERMISSIONS,
  Condition,
} from '../types/permissions';

export class RBACService {
  private static userPermissions: Map<string, UserPermissions> = new Map();
  private static customRoles: Map<string, Role> = new Map();
  private static permissionCache: Map<string, boolean> = new Map();

  static async initialize(): Promise<void> {
    Object.entries(ROLE_PERMISSIONS).forEach(([id, role]) => {
      this.customRoles.set(id, role);
    });
  }

  static async hasPermission(check: PermissionCheck): Promise<PermissionResult> {
    const cacheKey = `${check.userId}:${check.action}:${check.resource}:${check.resourceId || '*'}`;
    
    if (this.permissionCache.has(cacheKey)) {
      return { allowed: this.permissionCache.get(cacheKey) || false };
    }

    const userPerms = this.userPermissions.get(check.userId);
    if (!userPerms) {
      return { allowed: false, reason: 'Usuário não encontrado ou sem permissões' };
    }

    let allowed = false;
    let reason = '';
    let conditions: Condition[] | undefined;

    for (const roleId of userPerms.roles) {
      const role = this.customRoles.get(roleId);
      if (!role) continue;

      const result = this.checkRolePermission(role, check);
      if (result.allowed) {
        allowed = true;
        conditions = result.conditions;
        break;
      }
      reason = result.reason || reason;
    }

    if (!allowed && userPerms.customPermissions) {
      for (const customPerm of userPerms.customPermissions) {
        if (customPerm.resource === check.resource || customPerm.resource === '*') {
          if (customPerm.actions.includes(check.action)) {
            if (this.evaluateConditions(customPerm.conditions, check.context)) {
              allowed = true;
              conditions = customPerm.conditions as Condition[] | undefined;
              break;
            }
          }
        }
      }
    }

    if (!allowed && !reason) {
      reason = `Sem permissão para ${check.action} em ${check.resource}`;
    }

    this.permissionCache.set(cacheKey, allowed);

    return { allowed, reason: allowed ? undefined : reason, conditions };
  }

  private static checkRolePermission(role: Role, check: PermissionCheck): PermissionResult {
    for (const perm of role.permissions) {
      if (perm.resource === '*' || perm.resource === check.resource) {
        if (perm.actions.includes(check.action)) {
          if (perm.conditions && !this.evaluateConditions(perm.conditions, check.context)) {
            continue;
          }

          const levelCheck = this.checkLevelAccess(role, check);
          if (!levelCheck.allowed) {
            return levelCheck;
          }

          return { allowed: true, conditions: perm.conditions as Condition[] | undefined };
        }
      }
    }

    return { allowed: false };
  }

  private static checkLevelAccess(role: Role, check: PermissionCheck): PermissionResult {
    switch (role.level) {
      case 'global':
        return { allowed: true };
      
      case 'franchise':
        if (check.franchiseId && check.organizationId) {
          return { allowed: true };
        }
        return { allowed: false, reason: 'Acesso restrito a franquia específica' };
      
      case 'branch':
        if (check.branchId && check.organizationId) {
          return { allowed: true };
        }
        return { allowed: false, reason: 'Acesso restrito a filial específica' };
      
      case 'team':
        if (check.teamId) {
          return { allowed: true };
        }
        return { allowed: false, reason: 'Acesso restrito a equipe específica' };
      
      case 'user':
        if (check.context?.userId === check.userId) {
          return { allowed: true };
        }
        return { allowed: false, reason: 'Acesso apenas para próprio usuário' };
      
      default:
        return { allowed: false, reason: 'Nível de acesso inválido' };
    }
  }

  private static evaluateConditions(conditions?: Record<string, unknown>, context?: Record<string, unknown>): boolean {
    if (!conditions || !context) return true;

    for (const [field, condition] of Object.entries(conditions)) {
      const cond = condition as { operator: string; value: unknown };
      const contextValue = this.getNestedValue(context, field);

      if (!this.evaluateCondition(contextValue, cond.operator, cond.value)) {
        return false;
      }
    }

    return true;
  }

  private static evaluateCondition(value: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
      case 'eq':
        return value === expected;
      case 'neq':
        return value !== expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(value);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(value);
      case 'gt':
        return typeof value === 'number' && typeof expected === 'number' && value > expected;
      case 'gte':
        return typeof value === 'number' && typeof expected === 'number' && value >= expected;
      case 'lt':
        return typeof value === 'number' && typeof expected === 'number' && value < expected;
      case 'lte':
        return typeof value === 'number' && typeof expected === 'number' && value <= expected;
      case 'contains':
        return typeof value === 'string' && typeof expected === 'string' && value.includes(expected);
      case 'starts_with':
        return typeof value === 'string' && typeof expected === 'string' && value.startsWith(expected);
      case 'ends_with':
        return typeof value === 'string' && typeof expected === 'string' && value.endsWith(expected);
      default:
        return false;
    }
  }

  private static getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }

  static can(userId: string, action: PermissionAction, resource: ResourceType, context?: Record<string, unknown>): Promise<boolean> {
    return this.hasPermission({ userId, action, resource, context }).then(result => result.allowed);
  }

  static async getUserPermissions(userId: string): Promise<UserPermissions | undefined> {
    return this.userPermissions.get(userId);
  }

  static async setUserPermissions(permissions: UserPermissions): Promise<void> {
    this.userPermissions.set(permissions.userId, permissions);
    this.invalidateCache(permissions.userId);
  }

  static async addRoleToUser(userId: string, roleId: string): Promise<void> {
    const userPerms = this.userPermissions.get(userId);
    if (userPerms) {
      if (!userPerms.roles.includes(roleId)) {
        userPerms.roles.push(roleId);
        userPerms.updatedAt = Date.now();
        this.invalidateCache(userId);
      }
    } else {
      this.userPermissions.set(userId, {
        userId,
        roles: [roleId],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  static async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const userPerms = this.userPermissions.get(userId);
    if (userPerms) {
      userPerms.roles = userPerms.roles.filter(r => r !== roleId);
      userPerms.updatedAt = Date.now();
      this.invalidateCache(userId);
    }
  }

  static async createCustomRole(role: Role): Promise<Role> {
    const newRole: Role = {
      ...role,
      id: role.id || `custom_${Date.now()}`,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.customRoles.set(newRole.id, newRole);
    return newRole;
  }

  static async updateRole(roleId: string, updates: Partial<Role>): Promise<Role | null> {
    const role = this.customRoles.get(roleId);
    if (!role) return null;
    
    const updatedRole = { ...role, ...updates, updatedAt: Date.now() };
    this.customRoles.set(roleId, updatedRole);
    
    this.invalidateAllCache();
    
    return updatedRole;
  }

  static async deleteRole(roleId: string): Promise<boolean> {
    const role = this.customRoles.get(roleId);
    if (!role) return false;
    if (role.isSystem) return false;
    
    this.customRoles.delete(roleId);
    this.invalidateAllCache();
    
    return true;
  }

  static async getAllRoles(): Promise<Role[]> {
    return Array.from(this.customRoles.values());
  }

  static async getRole(roleId: string): Promise<Role | undefined> {
    return this.customRoles.get(roleId);
  }

  static async getUserRoles(userId: string): Promise<Role[]> {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return [];
    
    return userPerms.roles
      .map(roleId => this.customRoles.get(roleId))
      .filter((role): role is Role => role !== undefined);
  }

  static invalidateCache(userId: string): void {
    const keysToDelete: string[] = [];
    this.permissionCache.forEach((_, key) => {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.permissionCache.delete(key));
  }

  static invalidateAllCache(): void {
    this.permissionCache.clear();
  }

  static async checkTeamAccess(userId: string, teamId: string): Promise<boolean> {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;
    
    if (userPerms.teamId === teamId) return true;
    
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(role => role.level === 'global' || role.level === 'franchise' || role.level === 'branch');
  }

  static async checkOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;
    
    if (userPerms.organizationId === organizationId) return true;
    
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(role => role.level === 'global' || role.level === 'franchise');
  }

  static async checkFranchiseAccess(userId: string, franchiseId: string): Promise<boolean> {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;
    
    if (userPerms.franchiseId === franchiseId) return true;
    
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(role => role.level === 'global');
  }

  static async getAccessibleOrganizations(userId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);
    const userPerms = this.userPermissions.get(userId);
    
    const orgs = new Set<string>();
    
    if (userPerms?.organizationId) {
      orgs.add(userPerms.organizationId);
    }
    
    for (const role of userRoles) {
      if (role.level === 'global') {
        return ['*'];
      }
    }
    
    return Array.from(orgs);
  }

  static async getAccessibleTeams(userId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);
    const userPerms = this.userPermissions.get(userId);
    
    const teams = new Set<string>();
    
    if (userPerms?.teamId) {
      teams.add(userPerms.teamId);
    }
    
    for (const role of userRoles) {
      if (role.level === 'global' || role.level === 'franchise' || role.level === 'branch') {
        return ['*'];
      }
    }
    
    return Array.from(teams);
  }
}

export const rbacService = RBACService;

export async function hasPermission(check: PermissionCheck): Promise<PermissionResult> {
  return RBACService.hasPermission(check);
}

export async function can(userId: string, action: PermissionAction, resource: ResourceType, context?: Record<string, unknown>): Promise<boolean> {
  return RBACService.can(userId, action, resource, context);
}

export async function getUserPermissions(userId: string): Promise<UserPermissions | undefined> {
  return RBACService.getUserPermissions(userId);
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  return RBACService.getUserRoles(userId);
}

export async function assignRole(userId: string, roleId: string): Promise<void> {
  return RBACService.addRoleToUser(userId, roleId);
}

export async function removeRole(userId: string, roleId: string): Promise<void> {
  return RBACService.removeRoleFromUser(userId, roleId);
}