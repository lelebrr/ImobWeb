export type PartnerTier = "reseller" | "franchise";
export type PartnerLevel = "silver" | "gold" | "platinum" | "franchise";

export interface Partner {
  id: string;
  name: string;
  email: string;
  tier: PartnerTier;
  level: PartnerLevel;
  parentId: string | null; // For franchise hierarchies
  status: "active" | "suspended" | "pending";
  createdAt: Date;
  updatedAt: Date;
  brandingConfigId: string;
  commissionRate: number; // Percentage
  recurringCommission: boolean;
  maxSubAccounts: number;
  currentSubAccounts: number;
}

export interface BrandingConfig {
  id: string;
  partnerId: string;
  domain: string; // e.g., crm.suaimobiliaria.com.br
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  darkModeEnabled: boolean;
  darkModeColors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  } | null;
  hidePlatformBranding: boolean; // Removes "imobWeb" branding
  customCss: string | null;
  customJs: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResellerClient {
  id: string;
  partnerId: string;
  subAccountId: string; // Reference to the actual sub-account/tenant
  clientName: string;
  clientDomain: string;
  status: "active" | "suspended" | "trial" | "cancelled";
  planId: string;
  monthlyValue: number;
  commissionValue: number; // Calculated commission
  commissionRate: number; // Partner's commission rate
  startedAt: Date;
  endedAt: Date | null;
  lastPaymentDate: Date | null;
  nextPaymentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commission {
  id: string;
  partnerId: string;
  resellerClientId: string;
  amount: number;
  period: string; // YYYY-MM format
  status: "pending" | "paid" | "cancelled";
  calculatedAt: Date;
  paidAt: Date | null;
  createdAt: Date;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number; // Monthly price
  billingType: "monthly" | "yearly" | "once" | "usage";
  usageBased: boolean;
  usagePrice: number | null; // Price per unit if usage-based
  icon: string;
  category: "ia" | "portals" | "marketing" | "financial" | "reports";
  isActive?: boolean;
  developer: string;
  createdAt?: Date;
  updatedAt?: Date;
  isInstalled?: boolean; // For UI state
}

export interface PartnerAddon {
  id: string;
  partnerId: string;
  addonId: string;
  isActive: boolean;
  installedAt: Date;
  updatedAt: Date;
}

export interface SubAccountLimits {
  id: string;
  partnerId: string;
  maxProperties: number;
  maxAgents: number;
  maxUsers: number;
  storageGb: number;
  apiCallsPerMonth: number;
  currentProperties: number;
  currentAgents: number;
  currentUsers: number;
  currentStorageGb: number;
  currentApiCalls: number;
  updatedAt: Date;
}

export interface PartnerDashboardStats {
  totalClients: number;
  activeClients: number;
  totalCommissionEarned: number;
  pendingCommissions: number;
  monthlyRecurringRevenue: number;
  clientGrowth: number; // Percentage
  revenueGrowth: number; // Percentage
}

export interface SubAccount {
  id: string;
  partnerId: string;
  tenantName: string;
  plan: string;
  mrr: number;
  status: "active" | "trial" | "overdue";
  joinedAt: string;
}

export interface RoyaltyPayment {
  id: string;
  partnerId: string;
  amount: number;
  period: string; // "YYYY-MM"
  status: "paid" | "pending" | "processing";
  processedAt?: string;
}

export interface FranchiseRoyaltyDetail {
  type: string;
  count: number;
  mrr: number;
}
