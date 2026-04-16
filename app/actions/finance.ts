'use server';

// Note: In a real app, these would be server actions with 'use server'
// But for the sake of this implementation, I'll create the structure

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Generates monthly invoices for a contract based on its rules
 */
export async function generateInvoicesForContract(contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { billingRule: true }
  });

  if (!contract || !contract.billingRule) {
    throw new Error('Contrato ou regra de cobranÃ§a nÃ£o encontrado');
  }

  const amount = contract.totalValue || 0;
  const installments = contract.installments || 12;
  const startDate = contract.startDate || new Date();

  const invoices = [];
  for (let i = 0; i < installments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    invoices.push({
      contractId,
      amount,
      dueDate,
      status: 'PENDING',
      referenceMonth: `${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`
    });
  }

  // Bulk create invoices (simplified)
  await prisma.invoice.createMany({
    data: invoices
  });

  revalidatePath('/analytics');
  return { success: true };
}

/**
 * Triggers the automated split when an invoice is marked as paid
 */
export async function processPaymentSplit(invoiceId: string, paymentMethod: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { 
      contract: {
        include: {
          billingRule: true,
          parties: true
        }
      }
    }
  });

  if (!invoice || !invoice.contract.billingRule) {
    throw new Error('Fatura ou regra de split nÃ£o encontrada');
  }

  const { agencyPercent, ownerPercent, fixedFee } = invoice.contract.billingRule;
  const amount = Number(invoice.amount);

  // Calculate amounts
  const agencyAmount = (amount * Number(agencyPercent)) / 100 + Number(fixedFee || 0);
  const ownerAmount = amount - agencyAmount;

  // Find the owner party
  const owner = invoice.contract.parties.find((p: any) => p.type === 'landlord');

  // Create distributions
  await prisma.$transaction([
    prisma.financialDistribution.create({
      data: {
        invoiceId,
        recipientType: 'AGENCY',
        recipientName: 'ImobiliÃ¡ria ImobWeb',
        amount: agencyAmount,
        status: 'PAID', // Commission usually available immediately
        scheduledFor: new Date()
      }
    }),
    prisma.financialDistribution.create({
      data: {
        invoiceId,
        recipientType: 'OWNER',
        recipientName: owner?.name || 'ProprietÃ¡rio',
        recipientId: owner?.id,
        amount: ownerAmount,
        status: 'PENDING',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) // D+1
      }
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod
      }
    })
  ]);

  revalidatePath('/analytics');
  return { success: true };
}

/**
 * Comprehensive financial data for the dashboard
 */
export async function getFinancialDashboardData(organizationId: string) {
  const stats = await prisma.financialDistribution.groupBy({
    by: ['recipientType', 'status'],
    _sum: { amount: true },
    where: {
      invoice: {
        contract: { organizationId }
      }
    }
  });

  const recentInvoices = await prisma.invoice.findMany({
    where: {
      contract: { organizationId }
    },
    include: {
      contract: { select: { title: true } },
      distributions: true
    },
    orderBy: { dueDate: 'desc' },
    take: 10
  });

  return {
    stats,
    recentInvoices
  };
}
