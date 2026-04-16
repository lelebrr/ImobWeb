import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from './rbac/can'
import type { User } from '@/types/admin'

/**
 * Verifica se o usuário está autenticado
 * @param request Request do Next.js
 * @returns Usuário autenticado ou null
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
    const session = await auth()

    if (!session?.user) {
        return null
    }

    return {
        id: session.user.id,
        name: (session.user as any).user_metadata?.name || '',
        email: session.user.email || '',
        role: (session.user as any).user_metadata?.role || 'broker',
        organizationId: (session.user as any).user_metadata?.organizationId || '',
        organization: {
            name: '',
            slug: ''
        },
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: new Date()
    }
}

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 * @param user Usuário autenticado
 * @param resource Recurso que está sendo acessado
 * @param action Ação que está sendo realizada
 * @param context Contexto adicional para verificações condicionais
 * @returns true se o usuário tem permissão
 */
export function checkUserPermission(
    user: User | null,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'manage',
    context: Record<string, any> = {}
): boolean {
    if (!user) return false

    return can(user, resource, action, context)
}

/**
 * Redireciona usuário não autenticado para o login
 * @param request Request do Next.js
 * @param redirectTo URL de redirecionamento após login
 * @returns Response de redirecionamento
 */
export function redirectToLogin(request: NextRequest, redirectTo = '/'): NextResponse {
    const loginUrl = new URL('/api/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', redirectTo)

    return NextResponse.redirect(loginUrl)
}

/**
 * Redireciona usuário sem permissão
 * @param request Request do Next.js
 * @param redirectTo URL de redirecionamento
 * @returns Response de redirecionamento
 */
export function redirectToUnauthorized(request: NextRequest, redirectTo = '/'): NextResponse {
    const url = new URL(redirectTo, request.url)
    url.searchParams.set('error', 'unauthorized')

    return NextResponse.redirect(url)
}

/**
 * Verifica se o usuário é dono da organização
 * @param user Usuário autenticado
 * @param organizationId ID da organização
 * @returns true se o usuário é dono
 */
export function isOrganizationOwner(user: User | null, organizationId: string): boolean {
    if (!user) return false

    return user.organizationId === organizationId && user.role === 'owner'
}

/**
 * Verifica se o usuário pode acessar a organização
 * @param user Usuário autenticado
 * @param organizationId ID da organização
 * @returns true se o usuário pode acessar
 */
export function canAccessOrganization(user: User | null, organizationId: string): boolean {
    if (!user) return false

    // Superadmin pode acessar todas as organizações
    if (user.role === 'superadmin') return true

    // Outros usuários só podem acessar sua organização
    return user.organizationId === organizationId
}

/**
 * Função para verificar e proteger rotas
 * @param request Request do Next.js
 * @param options Opções de proteção
 * @returns Response se a rota for protegida, null se não for
 */
export async function protectRoute(
    request: NextRequest,
    options: {
        requireAuth?: boolean
        requireRole?: string | string[]
        resource?: string
        action?: 'create' | 'read' | 'update' | 'delete' | 'manage'
        context?: Record<string, any>
        redirectTo?: string
    } = {}
): Promise<NextResponse | null> {
    const {
        requireAuth = true,
        requireRole,
        resource,
        action,
        context = {},
        redirectTo = '/',
    } = options

    // Verifica autenticação se necessário
    if (requireAuth) {
        const user = await getAuthenticatedUser(request)

        if (!user) {
            return redirectToLogin(request, redirectTo)
        }

        // Verifica role se necessário
        if (requireRole) {
            const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole]

            if (!requiredRoles.includes(user.role)) {
                return redirectToUnauthorized(request, redirectTo)
            }
        }

        // Verifica permissão se necessário
        if (resource && action) {
            if (!checkUserPermission(user, resource, action, context)) {
                return redirectToUnauthorized(request, redirectTo)
            }
        }

        // Adiciona usuário ao contexto para uso em Server Components
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', user.id)
        requestHeaders.set('x-user-role', user.role)
        if (user.organizationId) {
            requestHeaders.set('x-organization-id', user.organizationId)
        }

        return null // Rota está protegida, pode continuar
    }

    return null // Rota não requer proteção
}

/**
 * Função para proteção de rotas de admin
 */
export async function protectAdminRoute(request: NextRequest): Promise<NextResponse | null> {
    return protectRoute(request, {
        requireAuth: true,
        requireRole: ['superadmin'],
        redirectTo: '/',
    })
}

/**
 * Função para proteção de rotas de organização
 */
export async function protectOrganizationRoute(
    request: NextRequest,
    organizationId: string,
    requireOwner = false
): Promise<NextResponse | null> {
    const user = await getAuthenticatedUser(request)

    if (!user) {
        return redirectToLogin(request)
    }

    // Superadmin pode acessar tudo
    if (user.role === 'superadmin') {
        return null
    }

    // Verifica se o usuário pertence à organização
    if (user.organizationId !== organizationId) {
        return redirectToUnauthorized(request, '/')
    }

    // Se for necessário ser owner
    if (requireOwner && user.role !== 'owner') {
        return redirectToUnauthorized(request, '/')
    }

    return null
}

/**
 * Função para adicionar headers de segurança
 */
export function securityHeaders(request: NextRequest): NextResponse {
    const response = NextResponse.next()

    // Adiciona headers de segurança
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
}