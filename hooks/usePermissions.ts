"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PermissionAction,
  ResourceType,
  PermissionCheck,
  PermissionResult,
  Role,
  ROLE_PERMISSIONS,
} from "@/types/permissions";

interface UsePermissionsOptions {
  userId?: string;
  organizationId?: string;
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const { userId, organizationId } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const checkPermission = useCallback(
    async (
      action: PermissionAction,
      resource: ResourceType,
      resourceId?: string,
    ): Promise<PermissionResult> => {
      if (!userId) {
        return { allowed: false, reason: "Usuário não autenticado" };
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/permissions/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            action,
            resource,
            resourceId,
            organizationId,
          }),
        });

        const data = await res.json();

        return {
          allowed: data.allowed || false,
          reason: data.reason,
        };
      } catch (error) {
        console.error("Permission check error:", error);
        return { allowed: false, reason: "Erro ao verificar permissão" };
      } finally {
        setIsLoading(false);
      }
    },
    [userId, organizationId],
  );

  const can = useCallback(
    async (
      action: PermissionAction,
      resource: ResourceType,
    ): Promise<boolean> => {
      const result = await checkPermission(action, resource);
      return result.allowed;
    },
    [checkPermission],
  );

  const canCreate = useCallback(
    async (resource: ResourceType) => can("create", resource),
    [can],
  );

  const canRead = useCallback(
    async (resource: ResourceType) => can("read", resource),
    [can],
  );

  const canUpdate = useCallback(
    async (resource: ResourceType) => can("update", resource),
    [can],
  );

  const canDelete = useCallback(
    async (resource: ResourceType) => can("delete", resource),
    [can],
  );

  return {
    checkPermission,
    can,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isLoading,
  };
}

export function useRolePermissions(roleId: string) {
  const role = ROLE_PERMISSIONS[roleId];

  const permissions = useMemo(() => {
    if (!role) return [];

    return role.permissions.map((perm) => ({
      resource: perm.resource,
      actions: perm.actions,
    }));
  }, [role]);

  const canAction = useCallback(
    (action: PermissionAction, resource: ResourceType): boolean => {
      if (!role) return false;

      const perm = role.permissions.find(
        (p) => p.resource === resource || p.resource === "*",
      );

      return perm?.actions.includes(action) || false;
    },
    [role],
  );

  return {
    role,
    permissions,
    canAction,
    isPlatformLevel: role?.level === "platform",
    isAgencyLevel: role?.level === "agency",
    isSystemRole: role?.isSystem || false,
  };
}

export function useUserRoles(userId?: string) {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function fetchRoles() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/permissions/user?userId=${userId}`);
        const data = await res.json();

        if (res.ok && data.roles) {
          setRoles(data.roles);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoles();
  }, [userId]);

  const hasRole = useCallback(
    (roleId: string) => {
      return roles.includes(roleId);
    },
    [roles],
  );

  const isAdmin = useCallback(() => {
    return roles.includes("PLATFORM_MASTER") || roles.includes("AGENCY_MASTER");
  }, [roles]);

  const isManager = useCallback(() => {
    return roles.includes("AGENCY_GERENTE") || roles.includes("PLATFORM_ADMIN");
  }, [roles]);

  return {
    roles,
    hasRole,
    isAdmin,
    isManager,
    isLoading,
  };
}
