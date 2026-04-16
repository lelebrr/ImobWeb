import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const { name, email, phone, creci, companyName, plan, password } =
    await request.json();

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
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Conta criada com sucesso! Verifique seu e-mail para confirmar.",
    user: signUpData.user,
  });
}
