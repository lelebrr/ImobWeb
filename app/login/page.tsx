"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Zap,
  ShieldCheck,
  Globe,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("admin@imobweb.com.br");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Reload to pick up new session
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Credenciais inválidas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-dashboard-gradient">
      <div className="hero-glow top-[-10%] left-[-10%] scale-150" />
      <div className="hero-glow bottom-[-10%] right-[-10%] scale-150 opacity-30" />

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        <div className="hidden lg:flex flex-col space-y-8 p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <Zap className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-4xl font-black tracking-tighter text-gradient">
              imobWeb
            </span>
          </div>

          <h1 className="text-5xl font-black tracking-tighter leading-none">
            A Inteligência que seu <br />
            <span className="text-primary italic">
              Negócio Imobiliário
            </span>{" "}
            merece.
          </h1>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">Multi-Portal Sync</p>
                <p className="text-muted-foreground font-medium">
                  Cadastre 1x e publique em todos os portais automaticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center gap-2 text-sm font-bold text-muted-foreground opacity-60">
            <ShieldCheck className="w-4 h-4" />
            Plataforma Blindada & LGPD Compliant
          </div>
        </div>

        <Card className="glass border-none shadow-2xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">
                imobWeb
              </span>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-black tracking-tighter">
                Login de Acesso
              </h2>
              <p className="text-muted-foreground font-medium">
                Insira suas credenciais para gerenciar sua carteira.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-black uppercase text-[10px] tracking-widest ml-1 text-muted-foreground"
                >
                  Email Profissional
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 glass border-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-base font-medium"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label
                    htmlFor="password"
                    className="font-black uppercase text-[10px] tracking-widest text-muted-foreground"
                  >
                    Senha Secreta
                  </Label>
                  <Link
                    href="/forgot-password"
                    title="Recuperar senha"
                    className="text-[10px] font-black uppercase text-primary hover:underline"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 glass border-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner text-base font-medium"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Acessar Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Não tem conta?{" "}
                </span>
                <Link
                  href="/register"
                  className="text-sm font-black text-primary hover:underline"
                >
                  Cadastre-se
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dashboard-gradient">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
