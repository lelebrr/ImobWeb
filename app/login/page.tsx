"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Usando sonner (configurado no RootProvider)

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@imobweb.com.br",
      password: "admin123",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
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

      // Login bem-sucedido
      toast.success("Login realizado!", {
        description: "Redirecionando para o dashboard...",
      });

      // Redirecionamento seguro (compatível com o novo middleware)
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError("email", { message: err.message });
      toast.error("Erro ao fazer login", {
        description: err.message || "Verifique suas credenciais",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* LADO ESQUERDO - ILUSTRAÇÃO PREMIUM */}
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
            <div className="flex items-center gap-2">
              <ShieldCheck size={28} />
              <span className="text-sm">Segurança</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* LADO DIREITO - FORMULÁRIO */}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <Label htmlFor="email" className="text-slate-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                className="h-14 mt-2 text-base"
              />
              {errors.email && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">
                  Senha
                </Label>
                <a
                  href="/forgot-password"
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="h-14 mt-2 text-base"
              />
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
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
                "Acessar Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <a
              href="/register"
              className="text-emerald-600 hover:underline text-sm font-medium"
            >
              Ainda não tem conta? Criar conta gratuita
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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
