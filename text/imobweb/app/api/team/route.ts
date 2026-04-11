import { NextRequest, NextResponse } from 'next/server';
import { TeamManager } from '@/lib/team/team-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');
    const organizationId = searchParams.get('organizationId');
    const branchId = searchParams.get('branchId');
    const performance = searchParams.get('performance');
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7);

    if (teamId) {
      if (performance === 'true') {
        const perf = await TeamManager.getTeamPerformance(teamId, period);
        return NextResponse.json({ success: true, data: perf });
      }

      const members = await TeamManager.getMembers(teamId);
      return NextResponse.json({ success: true, data: members });
    }

    if (organizationId) {
      const teams = await TeamManager.getAllTeams(organizationId);
      return NextResponse.json({ success: true, data: teams });
    }

    if (branchId) {
      const teams = await TeamManager.getTeamsByBranch(branchId);
      return NextResponse.json({ success: true, data: teams });
    }

    return NextResponse.json({ error: 'teamId ou organizationId é obrigatório' }, { status: 400 });
  } catch (error) {
    console.error('Team GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar equipes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const team = await TeamManager.createTeam({
          name: body.name,
          description: body.description,
          franchiseId: body.franchiseId,
          branchId: body.branchId,
          organizationId: body.organizationId,
          managerId: body.managerId,
          color: body.color,
          emoji: body.emoji,
          settings: body.settings,
        });
        return NextResponse.json({ success: true, data: team }, { status: 201 });
      }

      case 'addMember': {
        const member = await TeamManager.addMember({
          userId: body.userId,
          teamId: body.teamId,
          role: body.role,
          status: body.status || 'active',
          performance: body.performance,
          badges: body.badges,
          stats: body.stats,
        });
        return NextResponse.json({ success: true, data: member }, { status: 201 });
      }

      case 'bulkInvite': {
        const invites = body.invites.map((invite: any) => ({
          email: invite.email,
          name: invite.name,
          phone: invite.phone,
          role: invite.role,
          invitedBy: body.invitedBy,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        }));
        
        const results = await TeamManager.bulkInvite(body.teamId, invites);
        return NextResponse.json({ success: true, data: results }, { status: 201 });
      }

      case 'transferProperties': {
        const result = await TeamManager.transferProperty(
          body.fromUserId,
          body.toUserId,
          body.propertyIds
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'updatePerformance': {
        await TeamManager.updatePerformance(body.memberId, body.teamId, body.performance);
        return NextResponse.json({ success: true, message: 'Performance atualizada' });
      }

      case 'addBadge': {
        await TeamManager.addBadge(body.memberId, body.teamId, body.badge);
        return NextResponse.json({ success: true, message: 'Badge adicionado' });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Team POST error:', error);
    return NextResponse.json({ error: 'Erro ao processar ação' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'teamId é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const { memberId, ...updates } = body;

    if (memberId) {
      const member = await TeamManager.updateMember(memberId, teamId, updates);
      if (!member) {
        return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: member });
    }

    const team = await TeamManager.updateTeam(teamId, updates);
    if (!team) {
      return NextResponse.json({ error: 'Equipe não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error('Team PATCH error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');
    const memberId = searchParams.get('memberId');

    if (!teamId) {
      return NextResponse.json({ error: 'teamId é obrigatório' }, { status: 400 });
    }

    if (memberId) {
      const removed = await TeamManager.removeMember(memberId, teamId);
      if (!removed) {
        return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Membro removido' });
    }

    const deleted = await TeamManager.deleteTeam(teamId);
    if (!deleted) {
      return NextResponse.json({ error: 'Equipe não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Equipe removida' });
  } catch (error) {
    console.error('Team DELETE error:', error);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}
