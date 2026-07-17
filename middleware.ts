// @ts-ignore
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/**
 * ============================================
 * MIDDLEWARE DE AUTENTICAÇÃO E RBAC
 * ============================================
 * Executa no Edge Runtime da Vercel para cada request
 * Protege rotas baseado em autenticação + permissões
 */

// Rotas que exigem autenticação básica
const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
  "/partner",
  "/portal",
  "/settings",
  "/reports",
];

// Rotas administrativas que exigem role específico
const ADMIN_ROUTES = [
  "/admin/users",
  "/admin/roles",
  "/admin/permissions",
  "/admin/organizations",
  "/admin/platform",
  "/admin/billing",
  "/admin/settings",
  "/admin/reports",
  "/admin/marketplace",
  "/admin/partners",
  "/admin/integrations",
  "/admin/security",
  "/admin/vistoria",
  "/admin/tenants",
  "/admin/audit",
  "/admin/design",
];

// Rotas de agência/imobiliária
const AGENCY_ROUTES = [
  "/agency",
  "/properties",
  "/leads",
  "/owners",
  "/teams",
  "/contracts",
  "/finance",
];

// Rotas públicas (nunca bloqueadas)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/pricing",
  "/properties",
  "/sign",
  "/api",
  "/schedule",
  "/offline",
  "/health",
  "/auth",
];

// Rotas de API de auth - não devem passar pelo middleware de auth
const AUTH_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
];

/**
 * ============================================
 * MAPA DE PERMISSÕES POR ROTA
 * ============================================
 */
const ROUTE_PERMISSIONS: Record<string, { action: string; resource: string }> = {
  "/admin/users": { action: "read", resource: "user" },
  "/admin/roles": { action: "read", resource: "role" },
  "/admin/permissions": { action: "read", resource: "permission" },
  "/admin/organizations": { action: "read", resource: "organization" },
  "/admin/platform": { action: "manage", resource: "platform" },
  "/admin/billing": { action: "read", resource: "billing" },
  "/properties/new": { action: "create", resource: "property" },
  "/properties/*/edit": { action: "update", resource: "property" },
  "/properties/*/delete": { action: "delete", resource: "property" },
  "/leads/new": { action: "create", resource: "lead" },
  "/leads/*/edit": { action: "update", resource: "lead" },
  "/teams/new": { action: "create", resource: "team" },
  "/contracts/new": { action: "create", resource: "contract" },
  "/finance": { action: "read", resource: "billing" },
  "/settings": { action: "read", resource: "settings" },
  "/settings/*": { action: "update", resource: "settings" },
};

interface UserContext {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  isPlatformAdmin: boolean;
}

function isPlatformRoute(pathname: string): boolean {
  return pathname.startsWith("/admin/platform") || 
         pathname.startsWith("/admin/settings") ||
         pathname.startsWith("/admin/design") ||
         pathname.startsWith("/admin/marketplace");
}

function isAgencyRoute(pathname: string): boolean {
  return pathname.startsWith("/properties") ||
         pathname.startsWith("/leads") ||
         pathname.startsWith("/owners") ||
         pathname.startsWith("/teams") ||
         pathname.startsWith("/contracts");
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;

  // ============================================
  // SKIP MIDDLEWARE FOR AUTH API ROUTES
  // These routes handle their own Supabase auth
  // ============================================
  if (AUTH_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return response;
  }

  // Skip middleware for other API routes (they handle their own auth)
  if (pathname.startsWith("/api/")) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  let user: any = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data?.user;
  } catch (err) {
    console.error("[Middleware] Erro ao verificar autenticação:", err);
    // On error, let the request through for public routes
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user) {
    try {
      // Get user role from metadata instead of DB query to avoid Edge Runtime issues
      const role = (user.user_metadata?.role as string) || "BROKER";
      const isPlatformAdmin = role === "PLATFORM_MASTER" || role === "SUPER_ADMIN";
      const organizationId = user.user_metadata?.organizationId || "";

      response.headers.set("x-user-id", user.id);
      response.headers.set("x-user-role", role);
      response.headers.set("x-organization-id", organizationId);
      response.headers.set("x-is-platform-admin", String(isPlatformAdmin));

      if (isPlatformRoute(pathname) && !isPlatformAdmin) {
        console.log(`[Middleware] Usuário não é PLATFORM_MASTER, acesso negado a: ${pathname}`);
        return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
      }

      if (isAgencyRoute(pathname) && isPlatformAdmin) {
        response.headers.set("x-impersonating", "true");
      }
    } catch (err) {
      console.error("[Middleware] Erro ao processar contexto do usuário:", err);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|sw.js|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
