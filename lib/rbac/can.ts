import type { Permission, Role } from '@/types/admin'
import { rolePermissions } from './permissions'

interface User {
    id: string
    role: Role
    organizationId?: string
}

interface Context {
    userId?: string
    organizationId?: string
    [key: string]: any
}

/**
 * Verifica se um usuário tem permissão para realizar uma ação em um recurso
 * @param user Usuário logado
 * @param resource Recurso que está sendo acessado
 * @param action Ação que está sendo realizada
 * @param context Contexto adicional para verificações condicionais
 * @returns true se o usuário tem permissão, false caso contrário
 */
export function can(
    user: User | null,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'manage',
    context: Context = {}
): boolean {
    // Se não há usuário, não tem permissão
    if (!user || !user.role) return false

    // Superadmin tem acesso a tudo
    if (user.role === 'superadmin') return true

    // Busca as permissões do role do usuário
    const permissions = rolePermissions[user.role] || []

    // Busca a permissão específica para este recurso e ação
    const permission = permissions.find(
        p => p.resource === resource && p.action === action
    )

    // Se não há permissão definida, nega acesso
    if (!permission) return false

    // Se não há condições, concede acesso
    if (!permission.conditions) return true

    // Verifica as condições
    return checkConditions(permission.conditions, user, context)
}

/**
 * Verifica se as condições de permissão são atendidas
 * @param conditions Condicions da permissão
 * @param user Usuário logado
 * @param context Contexto adicional
 * @returns true se todas as condições são atendidas
 */
function checkConditions(conditions: Record<string, any>, user: User, context: Context): boolean {
    // Verifica se o usuário é dono da organização
    if (conditions.ownOrganization) {
        if (!user.organizationId || user.organizationId !== context.organizationId) {
            return false
        }
    }

    // Verifica se o usuário não é owner
    if (conditions.notOwner) {
        if (user.role === 'owner') {
            return false
        }
    }

    // Verifica se o usuário é dono do perfil
    if (conditions.ownProfile) {
        if (user.id !== context.userId) {
            return false
        }
    }

    // Verifica se o usuário é corretor atribuído
    if (conditions.assignedBroker) {
        if (user.role !== 'broker' || context.assignedBrokerId !== user.id) {
            return false
        }
    }

    // Verifica se não é configuração do sistema
    if (conditions.notSystem) {
        if (context.isSystem) {
            return false
        }
    }

    // Adicione mais verificações de condições conforme necessário

    return true
}

/**
 * Verifica se um usuário tem pelo menos uma das permissões fornecidas
 * @param user Usuário logado
 * @param permissions Lista de permissões para verificar
 * @param context Contexto adicional
 * @returns true se o usuário tem pelo menos uma das permissões
 */
export function hasAnyPermission(
    user: User | null,
    permissions: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' | 'manage' }>,
    context: Context = {}
): boolean {
    return permissions.some(permission =>
        can(user, permission.resource, permission.action, context)
    )
}

/**
 * Verifica se um usuário tem todas as permissões fornecidas
 * @param user Usuário logado
 * @param permissions Lista de permissões para verificar
 * @param context Contexto adicional
 * @returns true se o usuário tem todas as permissões
 */
export function hasAllPermissions(
    user: User | null,
    permissions: Array<{ resource: string; action: 'create' | 'read' | 'update' | 'delete' | 'manage' }>,
    context: Context = {}
): boolean {
    return permissions.every(permission =>
        can(user, permission.resource, permission.action, context)
    )
}

/**
 * Helper para verificar permissão de leitura
 */
export function canRead(user: User | null, resource: string, context: Context = {}): boolean {
    return can(user, resource, 'read', context)
}

/**
 * Helper para verificar permissão de criação
 */
export function canCreate(user: User | null, resource: string, context: Context = {}): boolean {
    return can(user, resource, 'create', context)
}

/**
 * Helper para verificar permissão de atualização
 */
export function canUpdate(user: User | null, resource: string, context: Context = {}): boolean {
    return can(user, resource, 'update', context)
}

/**
 * Helper para verificar permissão de exclusão
 */
export function canDelete(user: User | null, resource: string, context: Context = {}): boolean {
    return can(user, resource, 'delete', context)
}

/**
 * Helper para verificar permissão de gerenciamento
 */
export function canManage(user: User | null, resource: string, context: Context = {}): boolean {
    return can(user, resource, 'manage', context)
}