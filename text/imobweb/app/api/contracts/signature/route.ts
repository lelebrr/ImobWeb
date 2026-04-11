import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signingService } from '@/lib/signing/signing-service';
import type { SigningMethod } from '@/types/contracts';

const sendForSignatureSchema = z.object({
  contractId: z.string(),
  partyId: z.string(),
  method: z.enum(['email', 'whatsapp', 'certificate', 'docusign', 'clicksign', 'assine_bem'])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'sendForSignature') {
      const validated = sendForSignatureSchema.parse(body);
      
      const result = await signingService.sendViaEmail(
        validated.contractId,
        validated.partyId,
        'signer@email.com',
        'https://docs.example.com/contract',
        'Nome do Assinante',
        'Assinatura de Contrato'
      );

      return NextResponse.json({
        success: result.success,
        requestId: result.requestId,
        signingUrl: result.signingUrl
      });
    }

    if (action === 'getStatus') {
      const { requestId } = z.object({ requestId: z.string() }).parse(body);
      const status = await signingService.getSignatureStatus(requestId);
      
      return NextResponse.json({ status });
    }

    if (action === 'cancel') {
      const { requestId } = z.object({ requestId: z.string() }).parse(body);
      const success = await signingService.cancelSignature(requestId);
      
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error in signature action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contractId = searchParams.get('contractId');

  if (!contractId) {
    return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
  }

  const requests = signingService.getActiveRequests(contractId);

  return NextResponse.json({ requests });
}
