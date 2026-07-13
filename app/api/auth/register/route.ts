import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Auth/Register] Variáveis de ambiente Supabase não configuradas");
    return NextResponse.json(
      { error: "Configuração de autenticação incompleta" },
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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { name, email, phone, creci, companyName, plan, password } = body;

  if (!email || !password || !name || !companyName) {
    return NextResponse.json(
      { error: "Preencha todos os campos obrigatórios" },
      { status: 400 },
    );
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        creci,
        companyName,
        plan,
        role: plan === "enterprise" ? "AGENCY_MASTER" : "BROKER",
      },
      emailRedirectTo: `${request.headers.get("origin")}/auth/callback`,
    },
  });

  if (signUpError) {
    console.error("[Auth/Register] Cadastro falhou:", {
      message: signUpError.message,
      status: signUpError.status,
      email,
    });
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  console.log("[Auth/Register] Cadastro bem-sucedido:", {
    userId: signUpData.user?.id,
    email: signUpData.user?.email,
  });

  return NextResponse.json({
    success: true,
    message: "Conta criada com sucesso! Verifique seu e-mail para confirmar.",
    user: signUpData.user,
  });
}
