import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RBACService } from '../../lib/permissions/rbac';

/**
 * Unit tests for the RBAC (Role Based Access Control) system.
 * Verifies role inheritance, custom permissions, and conditional access.
 */

describe('RBAC System', () => {
  beforeEach(async () => {
    await RBACService.initialize();
    // Reset internal maps for clean state
    (RBACService as any).userPermissions.clear();
    (RBACService as any).permissionCache.clear();
  });

  it('should allow ADMIN to perform any action on any resource', async () => {
    const adminUser = {
      userId: 'user-admin',
      roles: ['ADMIN'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await RBACService.setUserPermissions(adminUser);
    
    const canEdit = await RBACService.can('user-admin', 'update', 'property');
    const canDeleteUser = await RBACService.can('user-admin', 'delete', 'user');
    
    expect(canEdit).toBe(true);
    expect(canDeleteUser).toBe(true);
  });

  it('should restrict BROKER from deleting properties', async () => {
    const brokerUser = {
      userId: 'user-broker',
      roles: ['CORRETOR'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await RBACService.setUserPermissions(brokerUser);
    
    const canDelete = await RBACService.can('user-broker', 'delete', 'property');
    expect(canDelete).toBe(false);
  });

  it('should allow access based on conditions (e.g., owner only)', async () => {
    // Create a custom role that allows updating only if the user is the owner
    const ownerOnlyRole = await RBACService.createCustomRole({
      id: 'owner_only',
      name: 'Owner',
      isSystem: false,
      level: 'user',
      permissions: [
        {
          resource: 'property',
          actions: ['update'],
          conditions: { 'userId': { operator: 'eq', value: 'user-owner' } }
        }
      ]
    });

    await RBACService.setUserPermissions({
      userId: 'user-owner',
      roles: [ownerOnlyRole.id],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Test with correct context
    const canUpdateSuccess = await RBACService.can('user-owner', 'update', 'property', { userId: 'user-owner' });
    expect(canUpdateSuccess).toBe(true);

    // Test with wrong context
    const canUpdateFail = await RBACService.can('user-owner', 'update', 'property', { userId: 'other-user' });
    expect(canUpdateFail).toBe(false);
  });

  it('should handle multi-tenant isolation by organization level', async () => {
    const managerUser = {
      userId: 'manager-1',
      roles: ['GERENTE'],
      organizationId: 'org-a',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await RBACService.setUserPermissions(managerUser);

    const hasAccessToOwnOrg = await RBACService.checkOrganizationAccess('manager-1', 'org-a');
    const hasAccessToOtherOrg = await RBACService.checkOrganizationAccess('manager-1', 'org-b');

    expect(hasAccessToOwnOrg).toBe(true);
    expect(hasAccessToOtherOrg).toBe(false);
  });
});
