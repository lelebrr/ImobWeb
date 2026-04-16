import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  protectRoute,
  protectAdminRoute,
  protectOrganizationRoute,
  securityHeaders,
} from "@/lib/middleware-helpers";

export async function middleware(request: NextRequest) {
  // Adiciona headers de segurança
  const securityResponse = securityHeaders(request);
  if (securityResponse) {
    return securityResponse;
  }

  // Pega a URL atual
  const { pathname } = request.nextUrl;

  // Lista de rotas públicas
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/pricing",
    "/api/auth",
    "/api/webhooks/stripe",
    "/.well-known",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  // Verifica se a rota é pública
  const isPublicRoute = publicRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route,
  );

  // Rotas de marketing (não requer autenticação)
  const marketingRoutes = ["/onboarding"];

  // Rotas de admin (requer superadmin)
  const adminRoutes = [
    "/admin",
    "/admin/organizations",
    "/admin/subscriptions",
    "/admin/analytics",
    "/admin/broadcast",
  ];

  // Rotas de organização (require pertencer à organização)
  const organizationRoutes = [
    "/dashboard",
    "/properties",
    "/clients",
    "/whatsapp",
    "/settings",
  ];

  // Se a rota for pública, permite o acesso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verifica autenticação para rotas não públicas
  const session = await auth();

  // Se não tem sessão e a rota não é pública, redireciona para o login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protege rotas de admin
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const result = await protectAdminRoute(request);
    if (result) return result;
  }

  // Protege rotas de organização
  // Exemplo: /dashboard/settings extrai o organizationId da URL
  // Em uma implementação real, você precisaria extrair o organizationId da URL
  // Aqui vamos usar um exemplo simplificado
  let organizationId: string | null = null;

  // Extrai organizationId da URL (ex: /dashboard/123/settings)
  const pathMatch = pathname.match(/\/dashboard\/([^\/]+)/);
  if (pathMatch && pathMatch[1]) {
    organizationId = pathMatch[1];
  }

  if (
    organizationId &&
    organizationRoutes.some((route) => pathname.startsWith(route))
  ) {
    const result = await protectOrganizationRoute(request, organizationId);
    if (result) return result;
  }

  // Adiciona informações do usuário ao header para uso em Server Components
  if (session?.user) {
    const response = NextResponse.next();
    response.headers.set("x-user-id", session.user.id);
    response.headers.set("x-user-role", session.user.role as string);
    if (session.user.organizationId) {
      response.headers.set("x-organization-id", session.user.organizationId);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
