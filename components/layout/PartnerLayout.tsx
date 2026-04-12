'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * Wrapper for Reseller/Partner routes.
 * Forces the PARTNER role.
 */
export function PartnerLayout({ children }: { children: React.ReactNode }) {
  // In a real app, user data comes from session/auth context
  const partnerUser = {
    name: 'Revenda XYZ',
    email: 'contato@revendaxyz.com',
  };

  return (
    <DashboardLayout 
      role="PARTNER" 
      user={partnerUser} 
      tenantName="ImobWeb Partners"
    >
      {children}
    </DashboardLayout>
  );
}
