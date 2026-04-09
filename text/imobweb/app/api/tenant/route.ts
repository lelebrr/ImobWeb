import { NextRequest, NextResponse } from 'next/server';
import { TenantManager } from '../../lib/tenant/tenant-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');
    const parentId = searchParams.get('parentId');
    const userId = searchParams.get('userId');

    if (userId) {
      const tenants = await TenantManager.getAccessibleTenants(userId);
      return NextResponse.json({ success: true, data: tenants });
    }

    if (tenantId) {
      const tenant = await TenantManager.get(tenantId);
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
      }

      if (searchParams.get('hierarchy') === 'true') {
        const hierarchy = await TenantManager.getHierarchy(tenantId);
        return NextResponse.json({ success: true, data: hierarchy });
      }

      return NextResponse.json({ success: true, data: tenant });
    }

    if (parentId) {
      const children = await TenantManager.getChildren(parentId);
      return NextResponse.json({ success: true, data: children });
    }

    const tenants = await TenantManager.getAll();
    return NextResponse.json({ success: true, data: tenants });
  } catch (error) {
    console.error('Tenant GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar tenants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const tenant = await TenantManager.create({
      name: body.name,
      type: body.type || 'individual',
      parentId: body.parentId,
      status: 'pending',
      settings: body.settings,
      limits: body.limits,
      usage: { users: 0, properties: 0, leads: 0, storage: 0, apiCalls: 0 },
      subscription: body.subscription,
    });

    return NextResponse.json({ success: true, data: tenant }, { status: 201 });
  } catch (error) {
    console.error('Tenant POST error:', error);
    return NextResponse.json({ error: 'Erro ao criar tenant' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await TenantManager.update(tenantId, body);

    if (!updated) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Tenant PATCH error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar tenant' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId é obrigatório' }, { status: 400 });
    }

    const deleted = await TenantManager.delete(tenantId);

    if (!deleted) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Tenant removido' });
  } catch (error) {
    console.error('Tenant DELETE error:', error);
    return NextResponse.json({ error: 'Erro ao excluir tenant' }, { status: 500 });
  }
}