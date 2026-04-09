'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Rocket, 
  Building2, 
  Users, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const steps = [
  {
    view: 'welcome',
    title: 'Seja bem-vindo ao imobWeb! 🚀',
    description: 'Vamos configurar sua conta para você começar a vender mais em menos de 5 minutos.',
    icon: Sparkles,
  },
  {
    view: 'profile',
    title: 'Sua Imobiliária',
    description: 'Como devemos chamar seu negócio? Isso será usado nos portais e no seu site.',
    icon: Building2,
  },
  {
    view: 'team',
    title: 'Traga seu Time',
    description: 'O imobWeb brilha quando sua equipe trabalha junta. Adicione seus primeiros corretores.',
    icon: Users,
  },
  {
    view: 'whatsapp',
    title: 'Conexão Mágica',
    description: 'Conecte seu WhatsApp para que nossa IA comece a qualificar seus leads automaticamente.',
    icon: MessageSquare,
  },
  {
    view: 'ready',
    title: 'Tudo Pronto!',
    description: 'Sua base está montada. Agora vamos cadastrar seu primeiro imóvel?',
    icon: Rocket,
  }
];

export const InteractiveOnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const current = steps[currentStep];

  return (
    <div className="flex items-center justify-center min-h-[600px] p-4 bg-slate-950/50 rounded-3xl backdrop-blur-xl border border-slate-800">
      <Card className="w-full max-w-2xl bg-slate-900/80 border-slate-800 text-slate-100 shadow-2xl overflow-hidden relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full">
          <Progress value={progress} className="h-1 rounded-none bg-slate-800 transition-all duration-500" />
        </div>

        <CardHeader className="pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
                <current.icon className="w-10 h-10 text-indigo-400" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight">{current.title}</CardTitle>
              <p className="text-slate-400 max-w-md">{current.description}</p>
            </motion.div>
          </AnimatePresence>
        </CardHeader>

        <CardContent className="h-48 flex items-center justify-center">
            {/* Aqui entrariam os inputs específicos de cada passo */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="w-full max-w-xs space-y-4"
            >
                {currentStep === 1 && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome da Imobiliária</label>
                        <input className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 ring-indigo-500" placeholder="Ex: Imóveis do Futuro" />
                    </div>
                )}
                {currentStep === 3 && (
                     <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 bg-slate-950 rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center">
                            <span className="text-[10px] text-slate-600 font-bold uppercase">QR Code Mock</span>
                        </div>
                        <p className="text-xs text-indigo-400 font-bold animate-pulse">Aguardando conexão...</p>
                     </div>
                )}
                {currentStep !== 1 && currentStep !== 3 && (
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-indigo-500 opacity-20" />
                    </div>
                )}
            </motion.div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-800/50 pt-6">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Button 
            onClick={nextStep}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
          >
            {currentStep === steps.length - 1 ? 'Começar Agora!' : 'Próximo'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
