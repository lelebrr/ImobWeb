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

  const body = await request.json();
  const { email, action } = body;

  if (action === "request") {
    if (!email) {
      return NextResponse.json(
        { error: "E-mail obrigatório" },
        { status: 400 },
      );
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.headers.get("origin")}/reset-password?email=${encodeURIComponent(email)}`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Link de recuperação enviado para seu e-mail",
    });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
