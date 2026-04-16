"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, LogIn, Building2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Usando sonner (configurado no RootProvider)

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormInput = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@imobweb.com.br",
      password: "admin123",
    },
  });

  const onSubmit = async (data: LoginFormInput) => {
    setIsLoading(true);

    try {
      // Mantendo a lógica de autenticação via Supabase API (já verificada como funcional)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "E-mail ou senha incorretos");
      }

      const destination = result.redirectTo || redirectTo;
      const userRole = result.role || "BROKER";

      const roleMessages: Record<string, string> = {
        SUPER_ADMIN: "Painel Administrador",
        PLATFORM_MASTER: "Painel Administrador",
        MANAGER: "Dashboard Imobiliária",
        AGENCY_MASTER: "Dashboard Imobiliária",
        ADMIN: "Dashboard Imobiliária",
        BROKER: "Painel Corretor",
        PARTNER: "Portal Parceiro",
        OWNER: "Portal Proprietário",
      };

      toast.success(`Bem-vindo ao imobWeb!`, {
        description: `Redirecionando para ${roleMessages[userRole] || "Dashboard"}...`,
      });

      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError("email", { message: err.message });
      toast.error("Falha no login", {
        description:
          err.message || "Verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ====================== LADO ESQUERDO - ILUSTRAÇÃO PREMIUM ====================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden items-center justify-center">
        {/* Background sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#10b98120_0%,transparent_70%)]" />

        {/* Ilustração principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-[520px] h-[520px]">
            {/* Mockup do Dashboard */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-12 top-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl w-96 h-[480px] overflow-hidden"
            >
              <div className="bg-emerald-600 h-10 flex items-center px-4 text-white text-[10px] font-black uppercase tracking-widest">
                imobWeb • Dashboard
              </div>
              <div className="p-6 space-y-6">
                <div className="h-8 bg-white/10 rounded-2xl" />
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-white/10 rounded-2xl animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
              </div>
            </motion.div>

            {/* Ícones flutuantes */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 text-emerald-400 opacity-50"
            >
              <Building2 size={80} />
            </motion.div>

            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-12 left-12 text-white"
            >
              <ShieldCheck size={64} className="drop-shadow-2xl opacity-80" />
            </motion.div>
          </div>
        </motion.div>

        {/* Texto overlay */}
        <div className="absolute bottom-12 left-12 text-white max-w-sm">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-5xl font-bold leading-tight"
          >
            O CRM que <span className="text-emerald-400">realmente</span> vende
            imóveis.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 text-lg text-white/70"
          >
            Cadastro único. WhatsApp automático. Vendas mais rápidas.
          </motion.p>
        </div>

        {/* Logo no canto */}
        <div className="absolute top-8 left-8 flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-xl">iW</span>
          </div>
          <span className="text-2xl font-black tracking-tighter">imobWeb</span>
        </div>
      </div>

      {/* ====================== LADO DIREITO - FORMULÁRIO ====================== */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Olá, seja bem-vindo!
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Faça login para acessar sua conta estratégica
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-bold text-xs uppercase tracking-widest text-slate-700"
              >
                E-mail profissional
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                className="h-14 text-base rounded-2xl border-slate-300 bg-white text-slate-900 focus:ring-emerald-500"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-bold mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="font-bold text-xs uppercase tracking-widest text-slate-700"
                >
                  Senha
                </Label>
                <a
                  href="/forgot-password"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="h-14 text-base rounded-2xl border-slate-300 bg-white text-slate-900 focus:ring-emerald-500"
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-bold mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 text-lg font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-xl shadow-emerald-500/20 rounded-2xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Conectando...
                </>
              ) : (
                "Acessar meu Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-10 text-center text-sm text-slate-500">
            Ainda não tem conta?{" "}
            <a
              href="/register"
              className="font-black text-emerald-600 hover:underline uppercase tracking-widest text-xs"
            >
              Criar conta gratuita
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
