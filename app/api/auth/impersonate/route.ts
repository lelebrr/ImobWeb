import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Configuração de servidor ausente' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user: requester }, error: authError } = await adminClient.auth.admin.getUserById(
      request.headers.get('x-user-id') || ''
    );

    if (authError || !requester) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const requesterRole = requester.user_metadata?.role;
    if (requesterRole !== 'PLATFORM_MASTER') {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(userId);
    const targetUser = targetData?.user;
    if (targetError || !targetUser?.email) {
      return NextResponse.json({ error: 'Usuário alvo não encontrado' }, { status: 404 });
    }

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUser.email,
    });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.json({ error: 'Erro ao gerar link de acesso' }, { status: 500 });
    }

    return NextResponse.json({ url: linkData.properties.action_link });
  } catch (error) {
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
