import { NextRequest, NextResponse } from 'next/server';
import { RBACService } from '../../../lib/permissions/rbac';
import { 
  PermissionAction, 
  ResourceType, 
  ROLE_PERMISSIONS,
  Role
} from '../../../types/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');
    const allRoles = searchParams.get('allRoles');

    if (allRoles === 'true') {
      const roles = await RBACService.getAllRoles();
      return NextResponse.json({ success: true, data: roles });
    }

    if (roleId) {
      const role = await RBACService.getRole(roleId);
      if (!role) {
        return NextResponse.json({ error: 'Role não encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: role });
    }

    if (userId) {
      const roles = await RBACService.getUserRoles(userId);
      const permissions = await RBACService.getUserPermissions(userId);
      
      return NextResponse.json({ 
        success: true, 
        data: { roles, permissions } 
      });
    }

    const systemRoles = Object.values(ROLE_PERMISSIONS);
    return NextResponse.json({ success: true, data: systemRoles });
  } catch (error) {
    console.error('Permissions GET error:', error);
    return NextResponse.json({ error: 'Erro ao buscar permissões' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'check': {
        const result = await RBACService.hasPermission({
          userId: body.userId,
          action: body.action as PermissionAction,
          resource: body.resource as ResourceType,
          resourceId: body.resourceId,
          context: body.context,
        });
        return NextResponse.json({ success: true, data: result });
      }

      case 'assignRole': {
        await RBACService.addRoleToUser(body.userId, body.roleId);
        return NextResponse.json({ 
          success: true, 
          message: 'Role atribuída com sucesso' 
        });
      }

      case 'removeRole': {
        await RBACService.removeRoleFromUser(body.userId, body.roleId);
        return NextResponse.json({ 
          success: true, 
          message: 'Role removida com sucesso' 
        });
      }

      case 'createRole': {
        const role: Role = {
          id: `custom_${Date.now()}`,
          name: body.name,
          description: body.description,
          permissions: body.permissions || [],
          isSystem: false,
          isCustom: true,
          level: body.level || 'team',
        };
        
        const created = await RBACService.createCustomRole(role);
        return NextResponse.json({ success: true, data: created }, { status: 201 });
      }

      case 'setUserPermissions': {
        await RBACService.setUserPermissions({
          userId: body.userId,
          roles: body.roles || [],
          customPermissions: body.customPermissions,
          teamId: body.teamId,
          organizationId: body.organizationId,
          franchiseId: body.franchiseId,
          branchId: body.branchId,
          region: body.region,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Permissões atualizadas' 
        });
      }

      case 'getAccessibleOrgs': {
        const orgs = await RBACService.getAccessibleOrganizations(body.userId);
        return NextResponse.json({ success: true, data: orgs });
      }

      case 'getAccessibleTeams': {
        const teams = await RBACService.getAccessibleTeams(body.userId);
        return NextResponse.json({ success: true, data: teams });
      }

      case 'checkTeamAccess': {
        const hasAccess = await RBACService.checkTeamAccess(body.userId, body.teamId);
        return NextResponse.json({ success: true, data: { hasAccess } });
      }

      case 'checkOrgAccess': {
        const hasAccess = await RBACService.checkOrganizationAccess(body.userId, body.organizationId);
        return NextResponse.json({ success: true, data: { hasAccess } });
      }

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Permissions POST error:', error);
    return NextResponse.json({ error: 'Erro ao processar ação' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'roleId é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await RBACService.updateRole(roleId, body);

    if (!updated) {
      return NextResponse.json({ error: 'Role não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Permissions PUT error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar role' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'roleId é obrigatório' }, { status: 400 });
    }

    const deleted = await RBACService.deleteRole(roleId);

    if (!deleted) {
      return NextResponse.json({ 
        error: 'Role não encontrada ou é uma role do sistema' 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Role removida' });
  } catch (error) {
    console.error('Permissions DELETE error:', error);
    return NextResponse.json({ error: 'Erro ao excluir role' }, { status: 500 });
  }
}