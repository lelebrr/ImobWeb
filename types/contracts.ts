// types/contracts.ts
export enum ContractType {
  SALE = "sale",
  RENT = "rent",
  PROPOSAL = "proposal",
  AUTHORIZATION = "authorization",
  COMMERCIAL = "commercial",
}

// Para manter compatibilidade com nomes antigos
export const PURCHASE_SALE = ContractType.SALE;
export const LEASE = ContractType.RENT;
export const COMMERCIAL_PROPOSAL = ContractType.PROPOSAL;
export const SALE_AUTHORIZATION = ContractType.AUTHORIZATION;

export enum ContractStatus {
  DRAFT = "draft",
  GENERATED = "generated",
  PENDING_SIGNATURE = "pending_signature",
  SIGNED = "signed",
  ARCHIVED = "archived",
  PENDING_REVIEW = "pending_review",
  PARTIALLY_SIGNED = "partially_signed",
  FULLY_SIGNED = "fully_signed",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
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
  title: string;
  type: ContractType;
  propertyId: string;
  property: ContractProperty;
  propertySnapshot?: PropertySnapshot;
  parties: ContractParty[];
  terms: ContractTerms;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
  currentVersionId: string | null;
  createdBy: string;
  templateId?: string;
  description?: string;
  documentVersion?: number;
  totalValue: number;
  installments?: number;
  startDate?: Date;
  endDate?: Date;
  clauses: ContractClause[];
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

export interface DealStage {
  id: string;
  name: string;
  order: number;
  color: string;
  isFinal: boolean;
}

export interface DealActivity {
  id: string;
  dealId: string;
  type: 'note' | 'task' | 'document' | 'email' | 'call';
  title: string;
  description: string;
  createdBy: string;
  createdAt?: Date;
}

export interface Deal {
  id: string;
  contractId?: string;
  stageId: string;
  stage: DealStage;
  activities: DealActivity[];
  propertyId: string;
  property: ContractProperty;
  clientId: string;
  client: ContractParty;
  value: number;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  currentStageId?: string; // Mantendo por compatibilidade com definições antigas
  enteredAt?: Date;
  exitedAt?: Date;
  metadata?: Record<string, any>;
}

export interface DealPipeline {
  stages: DealStage[];
  deals: Deal[];
}

// Novos tipos adicionados para resolver erros de compilação
export interface ContractProperty {
  id: string;
  title?: string;
  address: string;
  type: 'apartment' | 'house' | 'commercial' | 'land' | 'industrial';
  city: string;
  state: string;
  zipCode: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  value?: number;
}

export interface ContractParty {
  id: string;
  type: 'buyer' | 'seller' | 'tenant' | 'landlord' | 'witness' | 'guarantor';
  name: string;
  document: string;
  documentType: 'cpf' | 'cnpj' | 'rg';
  email: string;
  phone: string;
  signature?: {
    status: 'pending' | 'sent' | 'signed' | 'rejected';
    signedAt?: Date;
  };
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  order: number;
  required: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  content: string;
}

export type SigningMethod = 'SIMPLE' | 'DIGITAL_CERTIFICATE' | 'email' | 'whatsapp' | 'certificate';
export type SigningStatus = 'pending' | 'sent' | 'signed' | 'rejected' | 'expired';

export interface SignatureRequest {
  id: string;
  contractId: string;
  partyId: string;
  method: SigningMethod;
  status: SigningStatus;
  sentAt: Date;
  expiresAt?: Date;
  signedAt?: Date;
  signingUrl?: string;
}

export interface SigningResult {
  success: boolean;
  requestId: string;
  signingUrl?: string;
  error?: string;
}

export interface SigningProvider {
  id: string;
  name: string;
  type: 'docusign' | 'clicksign' | 'assine_bem' | 'autentique' | 'manual';
  enabled: boolean;
  credentials: Record<string, string>;
}
