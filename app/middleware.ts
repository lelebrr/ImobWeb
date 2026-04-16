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
    "/register",
    "/forgot-password",
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

  // Se a rota for pública, permite o acesso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Por enquanto, permitir todas as rotas (a verificação de auth é feita no client)
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
