import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createI18nMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n/settings';
import { UserRole } from '@/prisma/schema'

// Middleware de Internacionalização
const i18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

/**
 * Proxy para proteção de rotas, redirecionamentos e i18n (Next.js 16+)
 */
export async function proxy(request: NextRequest) {
  // 1. Processar i18n primeiro para garantir o locale na URL
  const i18nResponse = i18nMiddleware(request);
  
  let response = i18nResponse || NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Obter sessão do usuário
  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname;
  
  // Regex para remover o prefixo de locale da busca de rotas
  const pathWithoutLocale = pathname.replace(/^\/(?:pt-BR|en-US|en-GB|es-ES|es-LA)/, '') || '/';

  const isAuthRoute = pathWithoutLocale.startsWith('/login') ||
    pathWithoutLocale.startsWith('/register') ||
    pathWithoutLocale.startsWith('/forgot-password') ||
    pathWithoutLocale.startsWith('/reset-password')

  const isDashboardRoute = pathWithoutLocale.startsWith('/dashboard') ||
    pathWithoutLocale.startsWith('/properties') ||
    pathWithoutLocale.startsWith('/leads') ||
    pathWithoutLocale.startsWith('/owners') ||
    pathWithoutLocale.startsWith('/conversations') ||
    pathWithoutLocale.startsWith('/campaigns') ||
    pathWithoutLocale.startsWith('/analytics') ||
    pathWithoutLocale.startsWith('/settings') ||
    pathWithoutLocale.startsWith('/integrations') ||
    pathWithoutLocale.startsWith('/billing') ||
    pathWithoutLocale.startsWith('/api/')

  // Proteger rotas de autenticação (redirecionar se já logado)
  if (isAuthRoute) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Proteger rotas do dashboard (redirecionar se não logado)
  if (isDashboardRoute && !session && !pathWithoutLocale.startsWith('/api/i18n')) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirecionar usuários não-admin para dashboard se tentarem acessar admin
  if (pathWithoutLocale.startsWith('/admin') && session) {
    if (session.user.user_metadata?.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Adicionar headers de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()')

  return response
}


/**
 * Configuração de rotas que não precisam de autenticação
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

/**
 * Função auxiliar para verificar permissões
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.ADMIN]: 4,
    [UserRole.GERENTE]: 3,
    [UserRole.CORRETOR]: 2,
    [UserRole.ASSISTENTE]: 1,
  }
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
