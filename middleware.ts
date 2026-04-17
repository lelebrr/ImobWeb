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

/**
 * ============================================
 * MAPA DE PERMISSÕES POR ROTA
 * ============================================
 * Define qual permissão é necessária para acessar cada rota
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

async function getUserContext(supabase: ReturnType<typeof createClient>): Promise<UserContext | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, organization_id, is_platform_admin")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email || "",
    role: profile?.role || "AGENCY_CORRETOR",
    organizationId: profile?.organization_id || "",
    isPlatformAdmin: profile?.is_platform_admin || false,
  };
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

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user) {
    const userContext = await getUserContext(supabase);

    if (userContext) {
      response.headers.set("x-user-id", userContext.id);
      response.headers.set("x-user-role", userContext.role);
      response.headers.set("x-organization-id", userContext.organizationId);
      response.headers.set("x-is-platform-admin", String(userContext.isPlatformAdmin));

      if (isPlatformRoute(pathname) && !userContext.isPlatformAdmin) {
        console.log(`[Middleware] Usuário não é PLATFORM_MASTER, acesso negado a: ${pathname}`);
        return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
      }

      if (isAgencyRoute(pathname) && userContext.isPlatformAdmin) {
        response.headers.set("x-impersonating", "true");
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|sw.js|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};