import { getSigningSession } from '@/app/actions/signing';
import SignatureWizard from '@/components/contracts/SignatureWizard';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/design-system/button';
import Link from 'next/link';

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { party, error } = await getSigningSession(token);

  if (error || !party) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center space-y-6">
        <div className="h-20 w-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 border border-red-200 shadow-xl">
           <AlertTriangle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
           <h1 className="text-3xl font-black tracking-tighter">Ocorreu um Erro</h1>
           <p className="text-muted-foreground font-medium max-w-xs mx-auto leading-tight">{error || 'Este link de assinatura não é mais válido.'}</p>
        </div>
        <Link href="/">
           <Button variant="outline" className="h-12 rounded-2xl font-black uppercase tracking-widest px-8">
              Voltar para Início
           </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
       <SignatureWizard party={party} token={token} />
       
       {/* Trust Badge Footer */}
       <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
          <div className="max-w-md mx-auto flex items-center justify-center gap-2 opacity-30 grayscale contrast-150">
             <Home className="h-4 w-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Powered by ImobWeb Intelligence</span>
          </div>
       </div>
    </div>
  );
}
