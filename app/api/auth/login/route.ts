import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Auth] Variáveis de ambiente Supabase não configuradas:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    });
    return NextResponse.json(
      { error: "Configuração de autenticação incompleta. Contate o administrador." },
      { status: 500 }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  let email: string, password: string;
  try {
    const body = await request.json();
    email = body.email;
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

  let data: any, error: any;
  try {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    data = result.data;
    error = result.error;
  } catch (fetchErr: any) {
    console.error("[Auth] Falha de conexão com Supabase:", {
      message: fetchErr.message,
      code: fetchErr.cause?.code,
      email,
    });
    return NextResponse.json(
      { error: "Serviço de autenticação temporariamente indisponível. Verifique se o projeto Supabase está ativo." },
      { status: 503 }
    );
  }

  if (error) {
    console.error("[Auth] Login falhou:", {
      message: error.message,
      status: error.status,
      code: (error as any).code,
      email,
    });
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  console.log("[Auth] Login bem-sucedido:", {
    userId: data.user?.id,
    email: data.user?.email,
  });

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
