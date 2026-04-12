/**
 * TIPOS PARA O ECOSSISTEMA DE PARCEIROS E MARKETPLACE - imobWeb
 * 2026 - Estratégia de Distribuição e Extensões
 */

export type PartnerLevel = 'silver' | 'gold' | 'platinum' | 'franchise';

export interface Partner {
  id: string;
  name: string;
  email: string;
  level: PartnerLevel;
  commissionRate: number; // Percentual de comissão (ex: 0.20 para 20%)
  totalSubAccounts: number;
  mrrGenerated: number;
  unpaidRoyalties: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export interface SubAccount {
  id: string;
  partnerId: string;
  tenantName: string;
  plan: string;
  mrr: number;
  status: 'active' | 'trial' | 'overdue';
  joinedAt: string;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  category: 'ia' | 'portals' | 'marketing' | 'financial' | 'reports';
  price: number;
  billingType: 'monthly' | 'one_time' | 'usage';
  icon: string;
  isInstalled?: boolean;
  developer: string;
}

export interface RoyaltyPayment {
  id: string;
  partnerId: string;
  amount: number;
  period: string; // "YYYY-MM"
  status: 'paid' | 'pending' | 'processing';
  processedAt?: string;
}
