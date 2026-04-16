import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dashboard-gradient">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-4">Recuperar Senha</h1>
        <p className="text-muted-foreground mb-8">Em breve!</p>
        <Link href="/login" className="text-primary hover:underline">
          Voltar para Login
        </Link>
      </div>
    </div>
  );
}
