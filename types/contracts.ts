export type ContractType = 'sale' | 'rent' | 'proposal' | 'authorization' | 'commercial';

export type ContractStatus = 
  | 'draft'
  | 'pending_review'
  | 'pending_signature'
  | 'partially_signed'
  | 'fully_signed'
  | 'expired'
  | 'cancelled'
  | 'completed';

export type SigningMethod = 'email' | 'whatsapp' | 'certificate' | 'docusign' | 'clicksign' | 'assine_bem';

export type SigningStatus = 'pending' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired';

export interface ContractParty {
  id: string;
  type: 'buyer' | 'seller' | 'tenant' | 'landlord' | 'witness' | 'guarantor';
  name: string;
  document: string;
  documentType: 'cpf' | 'cnpj' | 'rg';
  email: string;
  phone: string;
  address?: string;
  signature?: {
    status: SigningStatus;
    signedAt?: Date;
    method?: SigningMethod;
    ip?: string;
  };
}

export interface ContractProperty {
  id: string;
  address: string;
  type: 'apartment' | 'house' | 'commercial' | 'land' | 'industrial';
  registration?: string;
  city: string;
  state: string;
  zipCode: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  value?: number;
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  order: number;
  required: boolean;
  custom?: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  description: string;
  clauses: ContractClause[];
  variables: string[];
  version: number;
  isDefault: boolean;
}

export interface Contract {
  id: string;
  templateId: string;
  type: ContractType;
  status: ContractStatus;
  title: string;
  description?: string;
  property: ContractProperty;
  parties: ContractParty[];
  clauses: ContractClause[];
  totalValue: number;
  installments?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  expiresAt?: Date;
  signedAt?: Date;
  documentUrl?: string;
  documentVersion: number;
  metadata?: Record<string, unknown>;
}

export interface ContractVersion {
  id: string;
  contractId: string;
  version: number;
  documentUrl: string;
  changes: string;
  createdAt: Date;
  createdBy: string;
}

export interface SignatureRequest {
  id: string;
  contractId: string;
  partyId: string;
  method: SigningMethod;
  status: SigningStatus;
  sentAt?: Date;
  signedAt?: Date;
  expiresAt?: Date;
  signingUrl?: string;
  declineReason?: string;
}

export interface DealStage {
  id: string;
  name: string;
  order: number;
  color: string;
  isFinal: boolean;
}

export interface Deal {
  id: string;
  propertyId: string;
  property?: ContractProperty;
  clientId: string;
  client?: ContractParty;
  value: number;
  stage: DealStage;
  stageId: string;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  notes?: string;
  contractId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  activities: DealActivity[];
}

export interface DealActivity {
  id: string;
  dealId: string;
  type: 'note' | 'call' | 'meeting' | 'document' | 'signature' | 'payment';
  title: string;
  description?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  createdBy: string;
}

export interface DealPipeline {
  stages: DealStage[];
  deals: Deal[];
}

export interface DocumentUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  contractId?: string;
  dealId?: string;
  tags: string[];
  encrypted: boolean;
  version: number;
}

export interface SigningProvider {
  id: string;
  name: string;
  type: 'docusign' | 'clicksign' | 'assine_bem' | 'autentique';
  enabled: boolean;
  credentials: Record<string, string>;
}

export interface SigningResult {
  success: boolean;
  requestId: string;
  signingUrl?: string;
  error?: string;
}
