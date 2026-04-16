// @ts-ignore
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de Autenticação e Proteção de Rotas
 * Executa no Edge Runtime da Vercel para cada request
 */

// Rotas que exigem autenticação
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/partner', '/portal', '/settings', '/reports']

// Rotas públicas (nunca bloqueadas)
const PUBLIC_ROUTES = ['/', '/login', '/register', '/pricing', '/properties', '/sign', '/api', '/schedule', '/offline', '/health']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se não houver configuração do Supabase, permitir passagem (dev mode)
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Atualizar sessão (mantém cookies frescos)
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Verificar se a rota atual exige autenticação
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))

  // Redirecionar para login se não autenticado e tentando acessar rota protegida
  if (isProtected && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirecionar para dashboard se já autenticado e tentando acessar login/register
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - public folder assets
     * - API routes that handle their own auth
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|images|sw.js|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
