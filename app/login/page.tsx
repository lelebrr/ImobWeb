"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Building2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("admin@imobweb.com.br");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Credenciais inválidas");
        setIsLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - ILLUSTRATION */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#10b98120_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-white text-5xl font-bold">iW</span>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white leading-tight max-w-md">
            O CRM que <span className="text-emerald-400">realmente</span> vende
            imóveis
          </h1>
          <p className="mt-6 text-xl text-white/70 max-w-xs mx-auto">
            Cadastro único • WhatsApp automático • Vendas mais rápidas
          </p>

          <div className="mt-16 flex justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <Building2 size={28} />
              <span className="text-sm">Imobiliárias</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-slate-900">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-600 mt-2">Faça login para continuar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-slate-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 mt-2 text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 mt-2 text-base"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Entrando na plataforma...
                </>
              ) : (
                <>
                  Acessar Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <a
              href="/register"
              className="text-emerald-600 hover:underline text-sm"
            >
              Ainda não tem conta? Criar conta gratuita
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
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
