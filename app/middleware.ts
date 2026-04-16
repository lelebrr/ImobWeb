import { NextResponse } from "next/server";

export function middleware() {
  console.log("[Middleware] Middleware está rodando!");
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
