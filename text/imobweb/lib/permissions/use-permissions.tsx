'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { PermissionAction, ResourceType } from '@/types/permissions';

interface UsePermissionsOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface PermissionState {
  loading: boolean;
  hasPermission: boolean;
  error: string | null;
}

const PermissionCheckContext = createContext<{
  checkPermission: (action: PermissionAction, resource: ResourceType, context?: Record<string, unknown>) => Promise<boolean>;
  loading: boolean;
} | null>(null);

export function PermissionCheckProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const checkPermission = useCallback(async (
    action: PermissionAction, 
    resource: ResourceType, 
    context?: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/permissions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '', // Will be filled from context
          action,
          resource,
          context,
        }),
      });
      
      const data = await response.json();
      return data.success ? data.allowed : false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }, []);

  return (
    <PermissionCheckContext.Provider value={{ checkPermission, loading }}>
      {children}
    </PermissionCheckContext.Provider>
  );
}

export function usePermissionCheck() {
  const context = useContext(PermissionCheckContext);
  if (!context) {
    throw new Error('usePermissionCheck must be used within PermissionCheckProvider');
  }
  return context;
}

export function usePermissions(options: UsePermissionsOptions) {
  const { userId, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [permissions, setPermissions] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async (
    action: PermissionAction, 
    resource: ResourceType, 
    context?: Record<string, unknown>
  ): Promise<boolean> => {
    const key = `${action}:${resource}:${JSON.stringify(context || {})}`;
    
    if (permissions.has(key)) {
      return permissions.get(key)!;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/permissions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          resource,
          context,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newPermissions = new Map(permissions);
        newPermissions.set(key, data.allowed);
        setPermissions(newPermissions);
        return data.allowed;
      }

      setError('Falha ao verificar permissão');
      return false;
    } catch (err) {
      setError('Erro de conexão');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, permissions]);

  const canView = useCallback((resource: ResourceType) => 
    checkPermission('read', resource), [checkPermission]);
  
  const canCreate = useCallback((resource: ResourceType) => 
    checkPermission('create', resource), [checkPermission]);
  
  const canUpdate = useCallback((resource: ResourceType) => 
    checkPermission('update', resource), [checkPermission]);
  
  const canDelete = useCallback((resource: ResourceType) => 
    checkPermission('delete', resource), [checkPermission]);
  
  const canExport = useCallback((resource: ResourceType) => 
    checkPermission('export', resource), [checkPermission]);
  
  const canManage = useCallback((resource: ResourceType) => 
    checkPermission('manage', resource), [checkPermission]);

  useEffect(() => {
    if (autoRefresh && userId) {
      const interval = setInterval(() => {
        setPermissions(new Map());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, userId, refreshInterval]);

  const resetCache = useCallback(() => {
    setPermissions(new Map());
  }, []);

  return {
    loading,
    error,
    checkPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canExport,
    canManage,
    resetCache,
  };
}

export function useTeamPermissions(teamId: string, userId: string) {
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTeamAccess = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/permissions?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
          const roles = data.data.roles || [];
          const isLeader = roles.some((r: any) => 
            r.level === 'team' || r.level === 'branch' || r.level === 'franchise' || r.level === 'global'
          );
          setIsTeamLeader(isLeader);
          setIsTeamMember(true);
        }
      } catch (error) {
        console.error('Failed to check team access:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && teamId) {
      checkTeamAccess();
    }
  }, [userId, teamId]);

  return { isTeamMember, isTeamLeader, loading };
}

export function useFranchisePermissions(franchiseId: string, userId: string) {
  const [isFranchiseAdmin, setIsFranchiseAdmin] = useState(false);
  const [isMatrixAdmin, setIsMatrixAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFranchiseAccess = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/permissions?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
          const roles = data.data.roles || [];
          setIsFranchiseAdmin(roles.some((r: any) => r.level === 'franchise'));
          setIsMatrixAdmin(roles.some((r: any) => r.level === 'global'));
        }
      } catch (error) {
        console.error('Failed to check franchise access:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      checkFranchiseAccess();
    }
  }, [userId, franchiseId]);

  return { isFranchiseAdmin, isMatrixAdmin, loading };
}

export default usePermissions;
