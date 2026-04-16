"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Building2, ShieldCheck, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Digite um e-mail válido"),
    phone: z.string().min(10, "Telefone inválido"),
    creci: z.string().optional(),
    companyName: z.string().min(2, "Nome da imobiliária obrigatório"),
    plan: z.enum(["free", "pro", "enterprise"]),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar os termos",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormInput = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      plan: "free",
      terms: false,
    },
  });

  const selectedPlan = watch("plan");

  const onSubmit = async (data: RegisterFormInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          creci: data.creci,
          companyName: data.companyName,
          plan: data.plan,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta");
      }

      toast.success("Conta criada com sucesso!", {
        description: "Verifique seu e-mail para confirmar conta.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      toast.error("Falha no cadastro", {
        description: err.message || "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#10b98120_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-[520px] h-[520px]">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
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

        <div className="absolute bottom-12 left-12 text-white max-w-sm">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-5xl font-bold leading-tight"
          >
            Comece <span className="text-emerald-400">gratuitamente</span>{" "}
            agora.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 text-lg text-white/70"
          >
            Crie sua conta e revolucione suas vendas com IA.
          </motion.p>
        </div>

        <div className="absolute top-8 left-8 flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-xl">iW</span>
          </div>
          <span className="text-2xl font-black tracking-tighter">imobWeb</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-lg"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Login
          </Link>

          <div className="mb-8">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Criar Conta
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Comece gratuitamente em menos de 2 minutos
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="font-bold text-xs uppercase tracking-widest opacity-70"
                >
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  {...register("name")}
                  className="h-12 text-base rounded-xl border-slate-200"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs font-bold">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="font-bold text-xs uppercase tracking-widest opacity-70"
                >
                  WhatsApp
                </Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  {...register("phone")}
                  className="h-12 text-base rounded-xl border-slate-200"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs font-bold">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-bold text-xs uppercase tracking-widest opacity-70"
              >
                E-mail Profissional
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                className="h-12 text-base rounded-xl border-slate-200"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-bold">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="companyName"
                className="font-bold text-xs uppercase tracking-widest opacity-70"
              >
                Nome da Imobiliária
              </Label>
              <Input
                id="companyName"
                placeholder="Nome da sua imobiliária"
                {...register("companyName")}
                className="h-12 text-base rounded-xl border-slate-200"
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs font-bold">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="creci"
                className="font-bold text-xs uppercase tracking-widest opacity-70"
              >
                CRECI (Opcional)
              </Label>
              <Input
                id="creci"
                placeholder="000.000-F"
                {...register("creci")}
                className="h-12 text-base rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-3">
              <Label className="font-bold text-xs uppercase tracking-widest opacity-70">
                Escolha seu Plano
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "free",
                    label: "Grátis",
                    price: "R$ 0",
                    features: ["1 usuário", "50 leads/mês", "Suporte básico"],
                  },
                  {
                    value: "pro",
                    label: "Pro",
                    price: "R$ 197",
                    popular: true,
                    features: ["5 usuários", "Leads ilimitados", "WhatsApp IA"],
                  },
                  {
                    value: "enterprise",
                    label: "Enterprise",
                    price: "Sob Consulta",
                    features: [
                      "Usuários ilimitados",
                      "White Label",
                      "API completo",
                    ],
                  },
                ].map((plan) => (
                  <label
                    key={plan.value}
                    className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                      selectedPlan === plan.value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={plan.value}
                      {...register("plan")}
                      className="sr-only"
                    />
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Mais Popular
                      </span>
                    )}
                    <div className="text-center">
                      <p className="font-black text-sm">{plan.label}</p>
                      <p className="text-lg font-bold text-emerald-600 mt-1">
                        {plan.price}
                      </p>
                      <ul className="mt-3 space-y-1 text-[10px] text-slate-500">
                        {plan.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-bold text-xs uppercase tracking-widest opacity-70"
                >
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="h-12 text-base rounded-xl border-slate-200"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs font-bold">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="font-bold text-xs uppercase tracking-widest opacity-70"
                >
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="h-12 text-base rounded-xl border-slate-200"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-bold">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("terms")}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-600">
                Eu concordo com os{" "}
                <a href="/terms" className="text-emerald-600 hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="/privacy" className="text-emerald-600 hover:underline">
                  Política de Privacidade
                </a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-500 text-xs font-bold">
                {errors.terms.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-xl shadow-emerald-500/20 rounded-2xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar minha conta grátis"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-black text-emerald-600 hover:underline uppercase tracking-widest text-xs"
            >
              Fazer Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
