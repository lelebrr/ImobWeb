// types/finance.ts
// Definições de tipos para o módulo financeiro

export type BusinessType = "SALE" | "RENTAL";

export type CommissionSplit = {
  broker: number; // percentual para o corretor
  manager: number; // percentual para o gerente
  agency: number; // percentual para a imobiliária
};

export type CommissionConfig = {
  id: string;
  businessType: BusinessType;
  basePercentage: number; // percentual base para o negócio
  split: CommissionSplit;
  bonusTarget?: number; // meta para bônus (valor)
  bonusPercentage?: number; // percentual de bônus se meta atingida
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CommissionCalculationInput = {
  contractId: string;
  businessType: BusinessType;
  value: number; // valor total do negócio (venda ou locação)
  brokerId: string;
  managerId?: string; // opcional, se houver gerente envolvido
  agencyId: string;
  commissionConfigId: string;
  // Campos para cálculo de bônus por meta (opcional)
  periodStart?: Date; // início do período para meta
  periodEnd?: Date; // fim do período para meta
  periodValue?: number; // valor acumulado no período para verificar meta
};

export type CommissionCalculationResult = {
  contractId: string;
  brokerId: string;
  managerId?: string;
  agencyId: string;
  businessType: BusinessType;
  baseValue: number; // valor do negócio
  basePercentage: number;
  baseAmount: number; // valor base antes do split
  split: CommissionSplit;
  brokerAmount: number;
  managerAmount: number;
  agencyAmount: number;
  bonusEligible: boolean;
  bonusAmount: number;
  totalBrokerAmount: number;
  totalManagerAmount: number;
  totalAgencyAmount: number;
  calculatedAt: Date;
};

export type Commission = {
  id: string;
  contractId: string;
  brokerId: string;
  managerId?: string;
  agencyId: string;
  businessType: BusinessType;
  contractValue: number;
  basePercentage: number;
  baseAmount: number;
  split: CommissionSplit;
  brokerAmount: number;
  managerAmount: number;
  agencyAmount: number;
  bonusEligible: boolean;
  bonusAmount: number;
  totalBrokerAmount: number;
  totalManagerAmount: number;
  totalAgencyAmount: number;
  calculatedAt: Date;
  // Histórico de alterações para auditoria
  updatedAt: Date;
  updatedBy: string; // ID do usuário que fez a última atualização
  // Referências (não são armazenadas no banco, mas úteis para popolare)
  // broker?: User;
  // manager?: User;
  // agency?: Agency;
  // contract?: Contract;
};

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type Invoice = {
  id: string;
  agencyId: string;
  brokerId?: string; // para comissões a pagar ao corretor
  contractId?: string;
  commissionId?: string; // se a fatura for relacionada a uma comissão
  description: string;
  value: number;
  taxes: {
    iss: number; // Imposto Sobre Serviços
    irrf: number; // Imposto de Renda Retido na Fonte
    pis: number; // PIS
    cofins: number; // COFINS
    csll: number; // Contribuição Social sobre o Lucro Líquido (opcional)
  };
  totalValue: number; // valor com impostos
  status: InvoiceStatus;
  dueDate: Date;
  issuedAt?: Date;
  paidAt?: Date;
  nfsNumber?: string; // número da NFS-e emitida
  xmlData?: string; // XML da NFS-e (para armazenamento)
  createdAt: Date;
  updatedAt: Date;
};

export type FiscalReportType = "SALES" | "RENTALS" | "COMMISSIONS" | "TAXES";

export type FiscalReport = {
  id: string;
  agencyId: string;
  type: FiscalReportType;
  referenceMonth: number; // 1-12
  referenceYear: number;
  generatedAt: Date;
  generatedBy: string; // ID do usuário
  data: {
    // Estrutura varia conforme o tipo
    [key: string]: any;
  };
  // Para exportação
  fileUrl?: string; // URL para o arquivo PDF/Excel gerado
  createdAt: Date;
  updatedAt: Date;
};

export type FinancialDashboardData = {
  mrr: number; // Monthly Recurring Revenue (para locações)
  arr: number; // Annual Recurring Revenue
  churnRate: number; // taxa de churn (para contratos de locação)
  ltv: number; // Lifetime Value (para locações)
  averageTicket: number; // ticket médio das transações
  projectedRevenue: number; // receita projetada para os próximos meses
  monthlyRevenue: Array<{ month: string; value: number }>; // últimos 12 meses
  monthlyExpenses: Array<{ month: string; value: number }>; // últimos 12 meses
  commissionsSummary: {
    totalPaid: number;
    totalPending: number;
    byBroker: Array<{ brokerId: string; brokerName: string; value: number }>;
  };
  cashFlow: {
    incoming: number;
    outgoing: number;
    net: number;
    projected: Array<{
      month: string;
      incoming: number;
      outgoing: number;
      net: number;
    }>;
  };
  taxSummary: {
    iss: number;
    irrf: number;
    pis: number;
    cofins: number;
    csll: number;
  };
};

export type PaymentReminder = {
  id: string;
  invoiceId: string;
  brokerId?: string;
  agencyId: string;
  reminderType: "EMAIL" | "WHATSAPP" | "SMS";
  sentAt: Date;
  status: "SENT" | "DELIVERED" | "FAILED";
  response?: string; // para WhatsApp, pode armazenar resposta do cliente
  createdAt: Date;
};
