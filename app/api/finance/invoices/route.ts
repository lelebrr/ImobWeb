/**
 * Finance Invoices API - ImobWeb 2026
 * 
 * Gerencia o histórico de faturamento e transações financeiras.
 */

import { NextRequest, NextResponse } from "next/server";

// Mock de dados para simular listagem do banco de dados (Prisma)
const mockInvoices = [
  { id: "INV-001", customer: "José Imóveis", value: 1200.00, status: "paid", date: "2026-04-01" },
  { id: "INV-002", customer: "Maria Silva", value: 450.00, status: "pending", date: "2026-04-05" },
  { id: "INV-003", customer: "Real Property", value: 8900.00, status: "paid", date: "2026-03-28" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let filtered = mockInvoices;
  if (status) {
    filtered = mockInvoices.filter(i => i.status === status);
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.reduce((acc, curr) => acc + curr.value, 0)
  });
}

/**
 * Criação manual de transação financeira
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validação básica
    if (!body.value || !body.customer) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    console.log("[FinanceAPI] Nova fatura registrada:", body);

    return NextResponse.json({ 
      success: true, 
      id: `INV-${Math.floor(Math.random() * 1000)}`,
      status: "pending" 
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
