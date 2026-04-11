'use client'

import React, { useState } from 'react'
import { 
  AlertCircle, 
  RotateCcw, 
  Database, 
  CheckCircle2, 
  ShieldAlert,
  StepForward,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

/**
 * Wizard de Recuperação de Desastres (DR) imobWeb
 * Guia o administrador no processo crítico de restauração de banco e arquivos
 */

type Step = 'IDENTIFY' | 'VERIFY' | 'RESTORE' | 'VALIDATE'

export function RecoveryWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('IDENTIFY')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const steps: { key: Step; label: string; description: string }[] = [
    { key: 'IDENTIFY', label: 'Identificar', description: 'Selecionar ponto de restauração' },
    { key: 'VERIFY', label: 'Verificar', description: 'Garantir integridade do snapshot' },
    { key: 'RESTORE', label: 'Restaurar', description: 'Aplicar dados no banco de produção' },
    { key: 'VALIDATE', label: 'Validar', description: 'Teste de consistência pós-recovery' }
  ]

  const handleStartRestore = async () => {
    setIsProcessing(true)
    // Simulação de progresso da restauração em tempo real
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise(r => setTimeout(r, 400))
    }
    setCurrentStep('VALIDATE')
    setIsProcessing(false)
  }

  return (
    <Card className="max-w-4xl mx-auto border-rose-200 shadow-2xl shadow-rose-200/20">
      <CardHeader className="bg-rose-50/50 dark:bg-rose-500/5 px-8 py-6 border-b border-rose-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-rose-600">Disaster Recovery Wizard</CardTitle>
            <CardDescription className="text-rose-500/80 font-medium font-mono text-xs uppercase tracking-widest">
              Critical Infrastructure Recovery Unit v2.0
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Stepper Visual */}
        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
          {steps.map((s, idx) => {
            const isActive = currentStep === s.key
            const isCompleted = steps.findIndex(x => x.key === currentStep) > idx
            
            return (
              <div key={s.key} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive ? "border-rose-500 bg-rose-500 text-white scale-110 shadow-lg shadow-rose-200" : 
                  isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 text-slate-400"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                </div>
                <div className="hidden md:block text-center">
                   <p className={cn("text-xs font-bold", isActive ? "text-rose-600" : "text-slate-400")}>{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'IDENTIFY' && (
            <motion.div 
              key="identify"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Cuidado:</strong> A restauração irá sobrescrever os dados atuais de produção pelo ponto de restauração selecionado. Esta ação é irreversível.
                </p>
              </div>

              <div className="grid gap-3">
                 <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">Pontos de Restauração Estáveis</p>
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 cursor-pointer transition-all flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <Database className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                        <div>
                          <p className="font-bold text-slate-900">Snapshot #{9021-i}</p>
                          <p className="text-xs text-slate-500">10/04/2026 às 23:00 - Integridade 100%</p>
                        </div>
                     </div>
                     <Badge variant="outline" className="group-hover:bg-white">RECOMENDADO</Badge>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'RESTORE' && (
            <motion.div 
              key="restore"
              className="text-center py-12 space-y-6"
            >
              <div className="relative inline-block">
                <RotateCcw className="w-16 h-16 text-rose-500 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Database className="w-6 h-6 text-rose-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Restaurando Snapshot #9021</h3>
                <p className="text-sm text-slate-500">Escaneando volume e reescrevendo tabelas críticas...</p>
              </div>
              <div className="max-w-sm mx-auto">
                <Progress value={progress} className="h-2 bg-rose-100" />
                <p className="mt-4 text-xs font-mono text-rose-500 font-bold">{progress}% COMPLETADO</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-100">
           <Button 
            variant="ghost" 
            onClick={() => setCurrentStep('IDENTIFY')}
            disabled={isProcessing || currentStep === 'IDENTIFY'}
           >
             <ChevronLeft className="w-4 h-4 mr-2" />
             Voltar
           </Button>
           
           {currentStep === 'IDENTIFY' && (
             <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white px-8"
              onClick={() => setCurrentStep('RESTORE')}
             >
               Continuar para Verificação
               <ChevronRight className="w-4 h-4 ml-2" />
             </Button>
           )}

           {currentStep === 'RESTORE' && !isProcessing && (
             <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white px-8"
              onClick={handleStartRestore}
             >
               Iniciar Restauração Agora
               <RotateCcw className="w-4 h-4 ml-2" />
             </Button>
           )}
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
