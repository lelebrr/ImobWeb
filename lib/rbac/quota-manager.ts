/**
 * RBAC QUOTA MANAGER
 * ImobWeb Elite 2026
 * 
 * Manages user seats limits, monetization alerts, and upselling.
 */

import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export interface QuotaCheckResult {
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  error?: string;
  upsellUrl?: string; // Link to buy more seats
  upgradeUrl?: string; // Link to upgrade plan
}

export class QuotaManager {
  /**
   * Check if an organization can add more users of a specific role
   */
  static async checkRoleQuota(organizationId: string, role: UserRole): Promise<QuotaCheckResult> {
    // 1. Fetch organization data
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        roleQuotas: true,
        // In a real scenario, we might also check planType
      }
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    // 2. Count current users with this role (+ Legacy roles)
    // We map legacy roles to new roles for quota counting
    const currentCount = await prisma.user.count({
      where: {
        organizationId,
        role: role,
        status: 'ATIVO'
      }
    });

    // 3. Get Maximum allowed from roleQuotas JSON
    const quotas = (org.roleQuotas as Record<string, number>) || {};
    
    // Default quotas if not specified (Safety fallbacks)
    const defaultQuotas: Record<string, number> = {
      'AGENCY_MASTER': 1,
      'AGENCY_SALES': 5,
      'AGENCY_HR': 1,
      'AGENCY_MARKETING': 1,
      'AGENCY_FINANCE': 1,
      'AGENCY_SUPPORT': 2,
    };

    const maxAllowed = quotas[role] ?? defaultQuotas[role] ?? 0;

    // 4. Return result
    if (currentCount >= maxAllowed) {
      return {
        allowed: false,
        currentCount,
        maxAllowed,
        error: `Limite de usuários para a função ${role} atingido (${maxAllowed}).`,
        upsellUrl: `/dashboard/billing/addons?role=${role}`, // Dynamic upsell link
        upgradeUrl: `/pricing`
      };
    }

    return {
      allowed: true,
      currentCount,
      maxAllowed
    };
  }

  /**
   * Batch check for all roles to show in a UI Dashboard
   */
  static async getOrganizationQuotaOverview(organizationId: string) {
    const rolesToCheck: UserRole[] = [
      'AGENCY_MASTER', 'AGENCY_SALES', 'AGENCY_HR', 
      'AGENCY_MARKETING', 'AGENCY_FINANCE', 'AGENCY_SUPPORT'
    ];

    const results = await Promise.all(
      rolesToCheck.map(role => this.checkRoleQuota(organizationId, role))
    );

    return results;
  }
}
