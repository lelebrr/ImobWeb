import { NextRequest, NextResponse } from 'next/server';
import { FranchiseManager } from '../../../lib/franchise/franchise-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const franchiseId = searchParams.get('franchiseId');
    const parentId = searchParams.get('parentId');
    const metrics = searchParams.get('metrics');
    const hierarchy = searchParams.get('hierarchy');
    const limits = searchParams.get('limits');
    const consolidated = searchParams.get('consolidated');

    if (franchiseId) {
      if (hierarchy === 'true') {
        const hierarchyData = await FranchiseManager.getHierarchy(franchiseId);
        return NextResponse.json({ success: true, data: hierarchyData });
      }

      if (limits === 'true') {
        const limitCheck = await FranchiseManager.checkLimits(franchiseId);
        return NextResponse.json({ success: true, data: limitCheck });
      }

      if (consolidated === 'true') {
        const report = await FranchiseManager.getConsolidatedReport(franchiseId);
        return NextResponse.json({ success: true, data: report });
      }

      const franchise = await FranchiseManager.get(franchiseId);
      if (!franchise) {
        return NextResponse.json({ error: 'Franquia não encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: franchise });
    }

    if (parentId) {
      const children = await FranchiseManager.getChildren(parentId);
      return NextResponse.json({ success: true, data: children });
    }

    if (metrics === 'true') {
      const franchiseMetrics = await FranchiseManager.getMetrics();
      return NextResponse.json({ success: true, data: franchiseMetrics });
    }

    const franchises = await FranchiseManager.getAll();
    return NextResponse.json({ success: true, data: franchises });
  } catch (error) {
    console.error('Franchise GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar franquias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'calculateRoyalties': {
        const royalties = await FranchiseManager.calculateRoyalties(body.franchiseId, body.period);
        return NextResponse.json({ success: true, data: royalties });
      }

      case 'calculateAllRoyalties': {
        const royalties = await FranchiseManager.calculateAllRoyalties(body.period);
        return NextResponse.json({ success: true, data: royalties });
      }

      case 'approveBranding': {
        const updated = await FranchiseManager.approveBranding(body.franchiseId, body.approvedBy);
        if (!updated) {
          return NextResponse.json({ error: 'Franquia não encontrada' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updated });
      }

      case 'updateConfiguration': {
        const updated = await FranchiseManager.updateConfiguration(body.franchiseId, body.configuration);
        if (!updated) {
          return NextResponse.json({ error: 'Franquia não encontrada' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updated });
      }

      default: {
        const franchise = await FranchiseManager.create({
          id: `franchise_${Date.now()}`,
          name: body.name,
          corporateName: body.corporateName,
          cnpj: body.cnpj,
          level: body.level || 'franchise',
          parentId: body.parentId,
          status: body.status || 'pending_approval',
          address: body.address,
          contact: body.contact,
          branding: body.branding,
          configuration: body.configuration,
          royalties: body.royalties,
          metrics: body.metrics,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        return NextResponse.json({ success: true, data: franchise }, { status: 201 });
      }
    }
  } catch (error) {
    console.error('Franchise POST error:', error);
    return NextResponse.json({ error: 'Erro ao processar ação' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const franchiseId = searchParams.get('franchiseId');

    if (!franchiseId) {
      return NextResponse.json({ error: 'franchiseId é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await FranchiseManager.update(franchiseId, body);

    if (!updated) {
      return NextResponse.json({ error: 'Franquia não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Franchise PATCH error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar franquia' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const franchiseId = searchParams.get('franchiseId');

    if (!franchiseId) {
      return NextResponse.json({ error: 'franchiseId é obrigatório' }, { status: 400 });
    }

    const deleted = await FranchiseManager.delete(franchiseId);

    if (!deleted) {
      return NextResponse.json({ error: 'Franquia não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Franquia removida' });
  } catch (error) {
    console.error('Franchise DELETE error:', error);
    return NextResponse.json({ error: 'Erro ao excluir franquia' }, { status: 500 });
  }
}