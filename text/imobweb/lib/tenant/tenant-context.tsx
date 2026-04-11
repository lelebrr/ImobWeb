'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TenantContext as TenantContextType, Tenant } from '@/lib/tenant/tenant-manager';

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ 
  children, 
  initialTenantId 
}: { 
  children: ReactNode; 
  initialTenantId?: string;
}) {
  const [tenantId, setTenantId] = useState<string | null>(initialTenantId || null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  const loadTenant = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tenant?tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setTenant(data.data);
      }
    } catch (error) {
      console.error('Failed to load tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (newTenantId: string) => {
    setTenantId(newTenantId);
  };

  const value: TenantContextType = {
    tenantId,
    tenant,
    loading,
    switchTenant,
    isMatrix: tenant?.type === 'matrix',
    isFranchise: tenant?.type === 'franchise',
    isBranch: tenant?.type === 'branch',
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function useTenantPermissions() {
  const { tenantId, tenant } = useTenant();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      loadPermissions();
    }
  }, [tenantId]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/permissions?userId=&allRoles=true`);
      const data = await response.json();
      if (data.success) {
        setPermissions(data.data.map((r: any) => r.id));
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return { permissions, loading, hasPermission };
}

export function useTeam() {
  const [teams, setTeams] = useState<any[]>([]);
  const [currentTeam, setCurrentTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTeams = async (organizationId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/team?organizationId=${organizationId}`);
      const data = await response.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: any) => {
    const response = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...teamData }),
    });
    const data = await response.json();
    if (data.success) {
      setTeams(prev => [...prev, data.data]);
    }
    return data;
  };

  const addMember = async (memberData: any) => {
    const response = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addMember', ...memberData }),
    });
    return response.json();
  };

  return { teams, currentTeam, setCurrentTeam, loading, loadTeams, createTeam, addMember };
}

export function useFranchise() {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [currentFranchise, setCurrentFranchise] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFranchises = async (parentId?: string) => {
    setLoading(true);
    try {
      const url = parentId ? `/api/franchise?parentId=${parentId}` : '/api/franchise';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setFranchises(data.data);
      }
    } catch (error) {
      console.error('Failed to load franchises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    const response = await fetch('/api/franchise?metrics=true');
    const data = await response.json();
    return data.success ? data.data : null;
  };

  const calculateRoyalties = async (franchiseId: string, period: string) => {
    const response = await fetch('/api/franchise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'calculateRoyalties', 
        franchiseId, 
        period 
      }),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  };

  return { 
    franchises, 
    currentFranchise, 
    setCurrentFranchise, 
    loading, 
    loadFranchises, 
    loadMetrics,
    calculateRoyalties 
  };
}

export default TenantProvider;
