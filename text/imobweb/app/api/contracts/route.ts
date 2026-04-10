import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { contractGenerator } from '@/lib/contracts/contract-generator';
import { signingService } from '@/lib/signing/signing-service';
import type { ContractType, ContractProperty, ContractParty, SigningMethod } from '@/types/contracts';

const createContractSchema = z.object({
  type: z.enum(['sale', 'rent', 'proposal', 'authorization', 'commercial']),
  property: z.object({
    id: z.string(),
    address: z.string(),
    type: z.enum(['apartment', 'house', 'commercial', 'land', 'industrial']),
    city: z.string(),
    state: z.string(),
    zipCode: z.string().optional(),
    area: z.number().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    parkingSpaces: z.number().optional(),
    value: z.number().optional()
  }),
  parties: z.array(z.object({
    id: z.string(),
    type: z.enum(['buyer', 'seller', 'tenant', 'landlord', 'witness', 'guarantor']),
    name: z.string(),
    document: z.string(),
    documentType: z.enum(['cpf', 'cnpj', 'rg']),
    email: z.string(),
    phone: z.string()
  })),
  totalValue: z.number(),
  installments: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customClauses: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string()
  })).optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const mockContracts = getMockContracts();

    let contracts = mockContracts;

    if (contractId) {
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      return NextResponse.json({ contract });
    }

    if (type) {
      contracts = contracts.filter(c => c.type === type);
    }

    if (status) {
      contracts = contracts.filter(c => c.status === status);
    }

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createContractSchema.parse(body);

    const contract = contractGenerator.generate({
      type: validatedData.type,
      property: validatedData.property,
      parties: validatedData.parties,
      totalValue: validatedData.totalValue,
      installments: validatedData.installments,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      customClauses: validatedData.customClauses
    });

    contract.createdBy = 'current-user';

    return NextResponse.json({
      success: true,
      contract,
      message: 'Contract generated successfully'
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updateSchema = z.object({
      status: z.enum(['draft', 'pending_review', 'pending_signature', 'fully_signed', 'cancelled']).optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      totalValue: z.number().optional(),
      notes: z.string().optional()
    });

    const updates = updateSchema.parse(body);

    return NextResponse.json({
      success: true,
      contractId,
      updates,
      message: 'Contract updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error updating contract:', error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Contract ${contractId} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  }
}

function getMockContracts() {
  return [
    {
      id: 'contract-001',
      templateId: 'template-sale',
      type: 'sale' as ContractType,
      status: 'pending_signature',
      title: 'Contrato de Compra e Venda - Rua das Flores, 123',
      description: 'Contrato de compra e venda para apartamento no valor de R$ 450.000',
      property: {
        id: 'prop-001',
        address: 'Rua das Flores, 123',
        type: 'apartment' as const,
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        area: 85,
        bedrooms: 2,
        bathrooms: 1,
        parkingSpaces: 1,
        value: 450000
      },
      parties: [
        {
          id: 'party-001',
          type: 'seller' as const,
          name: 'João Silva',
          document: '123.456.789-00',
          documentType: 'cpf' as const,
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          signature: { status: 'signed' as const, signedAt: new Date() }
        },
        {
          id: 'party-002',
          type: 'buyer' as const,
          name: 'Maria Santos',
          document: '987.654.321-00',
          documentType: 'cpf' as const,
          email: 'maria@email.com',
          phone: '(11) 98888-8888',
          signature: { status: 'sent' as const }
        }
      ],
      clauses: [],
      totalValue: 450000,
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000),
      createdBy: 'user-001',
      documentVersion: 1
    },
    {
      id: 'contract-002',
      templateId: 'template-rent',
      type: 'rent' as ContractType,
      status: 'fully_signed',
      title: 'Contrato de Locação - Av. Paulista, 1000',
      description: 'Contrato de locação comercial no valor de R$ 5.000/mês',
      property: {
        id: 'prop-002',
        address: 'Av. Paulista, 1000',
        type: 'commercial' as const,
        city: 'São Paulo',
        state: 'SP',
        area: 50,
        value: 5000
      },
      parties: [
        {
          id: 'party-003',
          type: 'landlord' as const,
          name: 'Empresa XYZ Ltda',
          document: '12.345.678/0001-90',
          documentType: 'cnpj' as const,
          email: 'contato@xyz.com.br',
          phone: '(11) 3333-3333',
          signature: { status: 'signed' as const, signedAt: new Date(Date.now() - 86400000 * 5) }
        },
        {
          id: 'party-004',
          type: 'tenant' as const,
          name: 'Carlos Oliveira',
          document: '111.222.333-44',
          documentType: 'cpf' as const,
          email: 'carlos@email.com',
          phone: '(11) 97777-7777',
          signature: { status: 'signed' as const, signedAt: new Date(Date.now() - 86400000 * 5) }
        }
      ],
      clauses: [],
      totalValue: 5000,
      installments: 12,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 365),
      createdAt: new Date(Date.now() - 86400000 * 10),
      updatedAt: new Date(Date.now() - 86400000 * 5),
      createdBy: 'user-001',
      signedAt: new Date(Date.now() - 86400000 * 5),
      documentVersion: 1
    }
  ];
}