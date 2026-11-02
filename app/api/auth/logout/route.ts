import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // 1. Limpar cookie nativo
  cookieStore.delete("imobweb_token");

  // 2. Limpar Supabase se configurado
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
      await supabase.auth.signOut();
    } catch {
      // Ignora erro
    }
  }

  return NextResponse.json({ success: true });
}
