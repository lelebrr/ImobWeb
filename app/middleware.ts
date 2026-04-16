import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  console.log(`[MIDDLEWARE DEBUG] Acessando: ${url.pathname}`);

  if (
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/properties")
  ) {
    console.log(
      "[MIDDLEWARE DEBUG] Rota protegida detectada → Verificando se deve bloquear",
    );

    console.log("[MIDDLEWARE DEBUG] → Permitindo acesso (temporário)");
  }

  if (url.pathname === "/login") {
    console.log("[MIDDLEWARE DEBUG] Página de login acessada");
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
