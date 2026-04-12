import { LucideIcon } from 'lucide-react';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'PARTNER'
  | 'MANAGER'
  | 'BROKER'
  | 'OWNER'
  | 'FINANCIAL';

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
