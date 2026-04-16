"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email] = useState("admin@imobweb.com.br");
  const [password] = useState("admin123");
  const [status, setStatus] = useState("");

  const handleLogin = async () => {
    setStatus("Enviando requisição...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Resposta da API:", data);

      if (res.ok) {
        setStatus("Login OK - Redirecionando agora...");
        window.location.href = redirectTo;
      } else {
        setStatus(`Erro: ${data.error || "Falha no login"}`);
      }
    } catch (err) {
      console.error("Erro no fetch:", err);
      setStatus("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-8">imobWeb Login</h1>

        <p className="mb-6 text-gray-600">
          Tentando login com:
          <br />
          <strong>admin@imobweb.com.br</strong> / <strong>admin123</strong>
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-medium text-lg"
        >
          CLICAR PARA FAZER LOGIN
        </button>

        <p className="mt-8 text-sm text-gray-500">Status: {status}</p>
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
