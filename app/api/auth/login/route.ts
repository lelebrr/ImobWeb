import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth/jwt";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  let email: string, password: string;
  try {
    const body = await request.json();
    email = body.email?.trim().toLowerCase();
    password = body.password;
  } catch {
    return NextResponse.json(
      { error: "Dados de login inválidos" },
      { status: 400 }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios" },
      { status: 400 }
    );
  }

  // 1. Tentar autenticação nativa via Prisma / PostgreSQL
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (user && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        if (user.status !== "ATIVO") {
          return NextResponse.json(
            { error: "Sua conta está inativa ou bloqueada. Contate o administrador." },
            { status: 403 }
          );
        }

        const token = await signToken({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        });

        cookieStore.set("imobweb_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        const isSuperAdmin =
          user.role === "PLATFORM_MASTER" || (user.role as string) === "SUPER_ADMIN";

        return NextResponse.json({
          success: true,
          // Token também no corpo: clientes nativos (app Android) não usam o cookie
          // e enviam este valor em "Authorization: Bearer <token>".
          token,
          expiresIn: 60 * 60 * 24 * 7,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            user_metadata: {
              name: user.name,
              role: user.role,
              organizationId: user.organizationId,
            },
          },
          role: user.role,
          redirectTo: isSuperAdmin ? "/admin" : "/dashboard",
        });
      }
    }
  } catch (dbErr: any) {
    console.error("[Auth] Erro ao consultar banco nativo:", dbErr.message);
  }

  // 2. Fallback opcional para Supabase se configurado
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const userRole = (data.user?.user_metadata?.role as string) || "BROKER";
        const isSuperAdmin =
          userRole === "SUPER_ADMIN" || userRole === "PLATFORM_MASTER";

        return NextResponse.json({
          success: true,
          user: data.user,
          role: userRole,
          redirectTo: isSuperAdmin ? "/admin" : "/dashboard",
        });
      }
    } catch (err: any) {
      console.error("[Auth] Falha no fallback Supabase:", err.message);
    }
  }

  return NextResponse.json(
    { error: "E-mail ou senha incorretos" },
    { status: 401 }
  );
}
