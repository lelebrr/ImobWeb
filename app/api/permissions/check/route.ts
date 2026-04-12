import { NextRequest, NextResponse } from 'next/server';
import { can, hasPermission, assignRole, removeRole, getUserRoles } from '@/lib/permissions/rbac';
import { PermissionAction, ResourceType } from '@/types/permissions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, resource, context } = body;

    const result = await hasPermission({
      userId,
      action: action as PermissionAction,
      resource: resource as ResourceType,
      context,
    });

    return NextResponse.json({
      success: true,
      allowed: result.allowed,
      reason: result.reason,
    });
  } catch (error) {
    console.error('Permission check error:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar permissão' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const checkRole = searchParams.get('role');
    const checkAccess = searchParams.get('access');

    if (userId) {
      const roles = await getUserRoles(userId);
      return NextResponse.json({ success: true, data: roles });
    }

    if (userId && checkAccess) {
      const [action, resource] = checkAccess.split(':');
      const hasAccess = await can(userId, action as PermissionAction, resource as ResourceType);
      return NextResponse.json({ success: true, hasAccess });
    }

    return NextResponse.json(
      { error: 'Parâmetros insuficientes' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Permission API error:', error);
    return NextResponse.json(
      { error: 'Erro na API de permissões' },
      { status: 500 }
    );
  }
}
