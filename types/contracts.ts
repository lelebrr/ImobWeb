// types/contracts.ts
export enum ContractType {
  PURCHASE_SALE = "PURCHASE_SALE",
  LEASE = "LEASE",
  COMMERCIAL_PROPOSAL = "COMMERCIAL_PROPOSAL",
  SALE_AUTHORIZATION = "SALE_AUTHORIZATION",
  SERVICE_AGREEMENT = "SERVICE_AGREEMENT",
}

export enum ContractStatus {
  DRAFT = "DRAFT",
  GENERATED = "GENERATED",
  PENDING_SIGNATURE = "PENDING_SIGNATURE",
  SIGNED = "SIGNED",
  ARCHIVED = "ARCHIVED",
}

export enum SignatureStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  SIGNED = "SIGNED",
  REJECTED = "REJECTED",
}

export enum SignatureMethod {
  SIMPLE = "SIMPLE",
  DIGITAL_CERTIFICATE = "DIGITAL_CERTIFICATE",
}

export enum PartyType {
  BUYER = "BUYER",
  SELLER = "SELLER",
  LANDLORD = "LANDLORD",
  TENANT = "TENANT",
  AGENT = "AGENT",
  GUARANTOR = "GUARANTOR",
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Party {
  id: string;
  type: PartyType;
  name: string;
  email: string;
  phone?: string;
  document: string; // CPF or CNPJ
  address?: Address;
}

export interface PropertySnapshot {
  id: string;
  title: string;
  address: string;
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  // Additional fields as needed for contract context
}

export interface ContractTermsBase {
  // Common terms across contract types
  effectiveDate?: Date;
  expirationDate?: Date;
  governingLaw?: string;
}

export interface PurchaseSaleTerms extends ContractTermsBase {
  salePrice: number;
  paymentMethod: PaymentMethod;
  downPayment?: number;
  financingDetails?: FinancingDetails;
  closingDate: Date;
  possessionDate: Date;
  inclusions: string[];
  exclusions: string[];
  // Additional purchase-specific terms
}

export interface LeaseTerms extends ContractTermsBase {
  monthlyRent: number;
  securityDeposit: number;
  leaseStart: Date;
  leaseEnd: Date;
  renewalTerms?: RenewalTerms;
  allowedUse: string;
  petPolicy: PetPolicy;
  // Additional lease-specific terms
}

export interface CommercialProposalTerms extends ContractTermsBase {
  proposedPrice: number;
  validityPeriod: number; // days
  paymentConditions: string;
  deliveryTerms: string;
  // Additional proposal-specific terms
}

export interface SaleAuthorizationTerms extends ContractTermsBase {
  authorizationPeriod: number; // days
  commissionRate: number;
  exclusivity: boolean;
  marketingBudget?: number;
  // Additional authorization-specific terms
}

export interface ServiceAgreementTerms extends ContractTermsBase {
  serviceDescription: string;
  serviceFrequency?: string;
  startDate: Date;
  endDate?: Date;
  paymentTerms: PaymentTerms;
  serviceLevelAgreement?: ServiceLevelAgreement;
  // Additional service agreement terms
}

// Union type for all possible contract terms
export type ContractTerms =
  | PurchaseSaleTerms
  | LeaseTerms
  | CommercialProposalTerms
  | SaleAuthorizationTerms
  | ServiceAgreementTerms;

export interface PaymentMethod {
  type: "BANK_TRANSFER" | "FINANCING" | "ESCROW" | "OTHER";
  details?: Record<string, any>;
}

export interface FinancingDetails {
  bank: string;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
}

export interface RenewalTerms {
  renewalNoticePeriod: number; // days before end
  renewalDuration: number; // months
  rentIncreaseCap?: number; // percentage
}

export interface PetPolicy {
  allowed: boolean;
  weightLimit?: number;
  breedRestrictions?: string[];
  additionalDeposit?: number;
  additionalMonthlyFee?: number;
}

export interface PaymentTerms {
  method: "BANK_TRANSFER" | "CHECK" | "CREDIT_CARD" | "OTHER";
  dueDate: "START_OF_MONTH" | "END_OF_MONTH" | "DAY_OF_MONTH"; // if DAY_OF_MONTH, specify day
  dayOfMonth?: number;
  lateFeePercentage: number;
  gracePeriodDays: number;
}

export interface ServiceLevelAgreement {
  responseTime: string; // e.g., '24 hours'
  resolutionTime: string; // e.g., '48 hours'
  uptimeGuarantee?: number; // percentage
}

export interface Contract {
  id: string;
  type: ContractType;
  propertyId: string;
  propertySnapshot?: PropertySnapshot; // Snapshot at time of contract generation
  parties: Party[];
  terms: ContractTerms;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
  currentVersionId: string | null;
}

export interface ContractVersion {
  id: string;
  contractId: string;
  versionNumber: number;
  content: string; // MDX or HTML content
  createdAt: Date;
  createdBy: string; // userId
  changeSummary?: string;
}

export interface Signature {
  id: string;
  contractVersionId: string;
  signerId: string; // Could be userId or external party identifier
  signerName: string;
  signerEmail: string;
  signerType: PartyType;
  status: SignatureStatus;
  method: SignatureMethod;
  certificateId?: string; // For digital signatures (ICP-Brasil)
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  rejectedReason?: string;
}

export interface DealPipelineStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  isFinal?: boolean;
  // Configuration for automation (e.g., auto-advance conditions)
  autoAdvanceConditions?: Record<string, any>;
  color?: string; // For UI display
}

export interface Deal {
  id: string;
  contractId: string;
  currentStageId: string;
  enteredAt: Date;
  exitedAt?: Date;
  // Metadata for tracking
  metadata?: Record<string, any>;
}

export interface PipelineAnalytics {
  stage: string;
  dealCount: number;
  averageDaysInStage: number;
  conversionRateToNextStage: number;
  totalValue: number;
}
