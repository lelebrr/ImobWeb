import { LucideIcon } from 'lucide-react';

export type UserRole = 
  // Platform Roles
  | 'PLATFORM_MASTER'
  | 'PLATFORM_MARKETING'
  | 'PLATFORM_FINANCE'
  | 'PLATFORM_SUPPORT'
  // Agency Roles
  | 'AGENCY_MASTER'
  | 'AGENCY_SALES'
  | 'AGENCY_HR'
  | 'AGENCY_MARKETING'
  | 'AGENCY_FINANCE'
  | 'AGENCY_SUPPORT'
  // Legacy / Hybrid Roles
  | 'SUPER_ADMIN'
  | 'PARTNER'
  | 'MANAGER'
  | 'BROKER'
  | 'OWNER'
  | 'FINANCIAL'
  | 'ADMIN'
  | 'GERENTE'
  | 'CORRETOR'
  | 'ASSISTENTE';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  disabled?: boolean;
  external?: boolean;
  badge?: string;
  children?: NavItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
