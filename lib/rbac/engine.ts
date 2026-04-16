/**
 * RBAC ENGINE - THE BRAIN
 * ImobWeb Elite 2026
 * 
 * Manages hierarchical permissions, user overrides, and God Mode.
 */

import { UserRole } from '@prisma/client';
import { PERMISSIONS, ROLE_TEMPLATES, PermissionKey } from './constants';

export interface UserWithPermissions {
  id: string;
  role: UserRole;
  organizationId: string;
  permissions?: any; // JSON containing { denied: string[], granted: string[] }
}

export class RBACEngine {
  /**
   * Main authorization function
   * Checks if a user has a specific permission.
   */
  static can(user: UserWithPermissions, permission: PermissionKey): boolean {
    // 1. GOD MODE BYPASS
    // Platform Master always has access to everything.
    if (user.role === 'PLATFORM_MASTER') {
      return true;
    }

    // 2. CHECK EXPLICIT OVERRIDES (INDIVIDUAL PERMISSIONS)
    // Individual "Denied" takes precedence over everything else.
    if (this.isExplicitlyDenied(user, permission)) {
      return false;
    }

    // Individual "Granted" allows access even if Role doesn't have it.
    if (this.isExplicitlyGranted(user, permission)) {
      return true;
    }

    // 3. ROLE-BASED CHECK (DEFAULT TEMPLATE)
    const rolePermissions = ROLE_TEMPLATES[user.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if a permission is explicitly denied for a user
   */
  private static isExplicitlyDenied(user: UserWithPermissions, permission: PermissionKey): boolean {
    const overrides = user.permissions as any;
    if (overrides?.denied && Array.isArray(overrides.denied)) {
      return overrides.denied.includes(permission);
    }
    return false;
  }

  /**
   * Check if a permission is explicitly granted for a user
   */
  private static isExplicitlyGranted(user: UserWithPermissions, permission: PermissionKey): boolean {
    const overrides = user.permissions as any;
    if (overrides?.granted && Array.isArray(overrides.granted)) {
      return overrides.granted.includes(permission);
    }
    return false;
  }

  /**
   * Helper for multiple permissions (Requires ALL)
   */
  static hasAll(user: UserWithPermissions, permissions: PermissionKey[]): boolean {
    return permissions.every(p => this.can(user, p));
  }

  /**
   * Helper for multiple permissions (Requires ANY)
   */
  static hasAny(user: UserWithPermissions, permissions: PermissionKey[]): boolean {
    return permissions.some(p => this.can(user, p));
  }
}
