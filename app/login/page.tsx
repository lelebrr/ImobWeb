"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [status, setStatus] = useState("Pronto para testar");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, message]);
  };

  const handleLogin = async () => {
    setStatus("Enviando requisição para /api/auth/login...");
    addLog("Iniciando fetch para /api/auth/login");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@imobweb.com.br",
          password: "admin123",
        }),
      });

      addLog(`Resposta recebida - Status: ${res.status}`);

      const data = await res.json();
      addLog(`Dados recebidos: ${JSON.stringify(data)}`);

      if (res.ok) {
        setStatus("Login OK! Redirecionando...");
        addLog("Redirecionando para " + redirectTo);
        window.location.href = redirectTo;
      } else {
        setStatus(`Erro ${res.status}: ${data.error || "Falha desconhecida"}`);
      }
    } catch (err: any) {
      console.error("Erro no fetch:", err);
      setStatus("Erro de conexão: " + err.message);
      addLog("ERRO: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-900">
          Debug Login
        </h1>

        <div className="bg-slate-800 text-white p-6 rounded-2xl mb-8 font-mono text-sm">
          <p>Tentando login com:</p>
          <p className="font-bold">admin@imobweb.com.br / admin123</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-xl font-medium mb-8 transition"
        >
          CLICAR PARA FAZER LOGIN (DEBUG)
        </button>

        <div className="bg-slate-100 p-6 rounded-2xl">
          <p className="font-medium mb-2">Status atual:</p>
          <p className="text-lg font-semibold text-emerald-600">{status}</p>
        </div>

        <div className="mt-8">
          <p className="font-medium mb-3">Logs:</p>
          <div className="bg-black text-green-400 p-4 rounded-xl font-mono text-xs h-80 overflow-auto">
            {logs.length === 0
              ? "Nenhum log ainda..."
              : logs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div>Carregando...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
