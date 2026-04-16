"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Loader2,
  Building2,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type ForgotPasswordFormInput = z.infer<typeof forgotPasswordSchema>;

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, "Código deve ter 6 dígitos"),
    password: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ResetPasswordFormInput = z.infer<typeof resetPasswordSchema>;

function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm<ForgotPasswordFormInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmitEmail = async (data: ForgotPasswordFormInput) => {
    setIsLoading(true);
    setEmail(data.email);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, action: "request" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar código");
      }

      toast.success("Código enviado!", {
        description: "Verifique seu e-mail e insira o código de 6 dígitos.",
      });

      setStep("reset");
    } catch (err: any) {
      toast.error("Erro", {
        description: err.message || "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data: ResetPasswordFormInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: data.code,
          newPassword: data.password,
          action: "reset",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao redefinir senha");
      }

      toast.success("Senha redefinida!", {
        description: "Faça login com sua nova senha.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      toast.error("Erro", {
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
            Esqueceu sua <span className="text-emerald-400">senha</span>?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 text-lg text-white/70"
          >
            Sem problemas. Vamos recuperar rapidinho.
          </motion.p>
        </div>

        <div className="absolute top-8 left-8 flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-xl">iW</span>
          </div>
          <span className="text-2xl font-black tracking-tighter">imobWeb</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Login
          </Link>

          {step === "email" ? (
            <>
              <div className="mb-8">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  Recuperar Senha
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  Digite seu e-mail para receber o código de recuperação
                </p>
              </div>

              <form
                onSubmit={handleSubmitEmail(onSubmitEmail)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="font-bold text-xs uppercase tracking-widest opacity-70"
                  >
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      {...registerEmail("email")}
                      className="h-14 pl-12 text-base rounded-2xl border-slate-200"
                    />
                  </div>
                  {errorsEmail.email && (
                    <p className="text-red-500 text-xs font-bold">
                      {errorsEmail.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-xl shadow-emerald-500/20 rounded-2xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Código <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    Código enviado!
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                  Nova Senha
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  Enviamos um código de 6 dígitos para{" "}
                  <span className="font-bold text-slate-900">{email}</span>
                </p>
              </div>

              <form
                onSubmit={handleSubmitReset(onSubmitReset)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="code"
                    className="font-bold text-xs uppercase tracking-widest opacity-70"
                  >
                    Código de 6 dígitos
                  </Label>
                  <Input
                    id="code"
                    placeholder="000000"
                    maxLength={6}
                    {...registerReset("code")}
                    className="h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-2xl border-slate-200"
                  />
                  {errorsReset.code && (
                    <p className="text-red-500 text-xs font-bold">
                      {errorsReset.code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="font-bold text-xs uppercase tracking-widest opacity-70"
                  >
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...registerReset("password")}
                      className="h-14 pl-12 text-base rounded-2xl border-slate-200"
                    />
                  </div>
                  {errorsReset.password && (
                    <p className="text-red-500 text-xs font-bold">
                      {errorsReset.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="font-bold text-xs uppercase tracking-widest opacity-70"
                  >
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...registerReset("confirmPassword")}
                      className="h-14 pl-12 text-base rounded-2xl border-slate-200"
                    />
                  </div>
                  {errorsReset.confirmPassword && (
                    <p className="text-red-500 text-xs font-bold">
                      {errorsReset.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-xl shadow-emerald-500/20 rounded-2xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      Redefinir Senha <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
