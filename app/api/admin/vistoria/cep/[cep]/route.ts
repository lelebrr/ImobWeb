import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/vistoria/api-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cep: string }> }
) {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;
  try {
    const { cep } = await params;
    const clean = cep.replace(/\D/g, '');

    if (clean.length !== 8) {
      return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
    }

    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, { signal: AbortSignal.timeout(6000), next: { revalidate: 86400 } });
    const data = await res.json();

    if (data.erro) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('CEP lookup error:', error);
    return NextResponse.json({ error: 'Erro ao buscar CEP' }, { status: 500 });
  }
}
