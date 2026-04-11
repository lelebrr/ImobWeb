'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * Wrapper for Super Admin routes.
 * Forces the SUPER_ADMIN role to correctly load admin menu sections.
 */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  // In a real app, user data comes from session/auth context
  const adminUser = {
    name: 'Super Admin',
    email: 'admin@imobweb.com',
  };

  return (
    <DashboardLayout 
      role="SUPER_ADMIN" 
      user={adminUser} 
      tenantName="ImobWeb Platform"
    >
      {children}
    </DashboardLayout>
  );
}
