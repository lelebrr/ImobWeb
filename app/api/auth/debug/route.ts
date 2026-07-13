import { NextResponse } from "next/server";

/**
 * Endpoint de diagnóstico para verificar a conexão com Supabase.
 * Não depende de cookies() para evitar problemas no Edge Runtime.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, any> = {};

  // 1. Check env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  results.env = {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseKey,
    hasServiceKey: !!serviceKey,
    urlValue: supabaseUrl ? supabaseUrl.substring(0, 40) + "..." : "MISSING",
    urlHost: supabaseUrl ? (() => { try { return new URL(supabaseUrl).hostname; } catch { return "INVALID URL"; } })() : "N/A",
  };

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      status: "ERROR",
      message: "Variáveis de ambiente Supabase não configuradas",
      results,
    }, { status: 500 });
  }

  // 2. Test basic HTTP connectivity to Supabase
  try {
    const healthUrl = `${supabaseUrl}/rest/v1/`;
    const healthResponse = await fetch(healthUrl, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    results.connectivity = {
      status: healthResponse.status,
      ok: healthResponse.ok,
      statusText: healthResponse.statusText,
    };
  } catch (err: any) {
    results.connectivity = {
      status: "FAILED",
      error: err.message,
      cause: err.cause?.message || null,
      code: err.cause?.code || null,
    };
  }

  // 3. Test auth endpoint directly (GoTrue health)
  try {
    const authHealthUrl = `${supabaseUrl}/auth/v1/health`;
    const authResponse = await fetch(authHealthUrl, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
      },
      signal: AbortSignal.timeout(10000),
    });
    const authBody = await authResponse.json().catch(() => null);
    results.authHealth = {
      status: authResponse.status,
      ok: authResponse.ok,
      body: authBody,
    };
  } catch (err: any) {
    results.authHealth = {
      status: "FAILED",
      error: err.message,
    };
  }

  // 4. Try listing users with service role key
  if (serviceKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
      
      if (usersError) {
        results.userList = {
          success: false,
          error: usersError.message,
          status: usersError.status,
        };
      } else {
        results.userList = {
          success: true,
          totalUsers: usersData?.users?.length || 0,
          users: (usersData?.users || []).map((u: any) => ({
            id: u.id,
            email: u.email,
            role: u.user_metadata?.role || "unknown",
            emailConfirmed: !!u.email_confirmed_at,
            createdAt: u.created_at?.substring(0, 10),
          })),
        };
      }
    } catch (err: any) {
      results.userList = {
        success: false,
        error: err.message,
      };
    }
  } else {
    results.userList = {
      success: false,
      error: "SUPABASE_SERVICE_ROLE_KEY não configurada",
    };
  }

  // 5. Summary
  const hasConnectivity = results.connectivity?.ok;
  const hasUsers = results.userList?.success && results.userList?.totalUsers > 0;
  
  let diagnosis = "";
  if (!hasConnectivity) {
    diagnosis = "❌ Supabase indisponível. Verifique se o projeto não está pausado (free tier pausa após 7 dias de inatividade). Acesse dashboard.supabase.com e clique em 'Restore project'.";
  } else if (!hasUsers) {
    diagnosis = "⚠️ Nenhum usuário encontrado. Execute o script create-test-users.ts ou crie uma conta via /register.";
  } else {
    diagnosis = `✅ ${results.userList.totalUsers} usuário(s) encontrado(s). Credenciais: ${results.userList.users[0]?.email}`;
  }

  return NextResponse.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    diagnosis,
    results,
  });
}
