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

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setStatus("Iniciando...");
    addLog("Botão clicado!");

    doLogin();
  };

  const doLogin = async () => {
    addLog("doLogin iniciada");
    setStatus("Enviando requisição...");
    addLog("Enviando fetch para /api/auth/login");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@imobweb.com.br",
          password: "admin123",
        }),
      });

      addLog(`Status: ${res.status}`);
      const data = await res.json();
      addLog(`Data: ${JSON.stringify(data)}`);

      if (res.ok) {
        setStatus("Login OK! Redirecionando...");
        addLog("Redirecting...");
        window.location.href = redirectTo;
      } else {
        setStatus(`Erro: ${data.error}`);
      }
    } catch (err: any) {
      setStatus("Erro: " + err.message);
      addLog("ERRO: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto">
        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-8 text-2xl font-bold rounded-2xl"
        >
          CLIQUE AQUI PARA LOGIN
        </button>

        <div className="mt-4 p-4 bg-white rounded-xl">
          <p>Status: {status}</p>
        </div>

        <div className="mt-4 p-4 bg-black text-green-400 font-mono text-xs rounded-xl max-h-60 overflow-auto">
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      Carregando...
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
