"use client";

/**
 * Financial Summary Widget - ImobWeb 2026
 * 
 * Componente compacto para ser injetado no Dashboard Principal.
 * Mostra saúde financeira rápida e atalho para gestão de inadimplência.
 */

import React from "react";
import { DollarSign, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function FinancialSummaryWidget() {
  const router = useRouter();

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-950 text-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <DollarSign className="text-green-400" /> 
            Saúde Financeira
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-400 border-none font-black text-[10px]">REAL-TIME</Badge>
        </div>
        <CardDescription className="text-slate-400 text-xs">Consolidado de todas as unidades.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Receita (Mês)</div>
            <div className="text-2xl font-black text-white">R$ 142k</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Inadimplência</div>
            <div className="text-2xl font-black text-red-500">2.4%</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Meta Mensal (R$ 200k)</span>
            <span className="text-green-400">71%</span>
          </div>
          <Progress value={71} className="h-1.5 bg-slate-800" indicatorClassName="bg-green-500" />
        </div>

        <div className="flex flex-col gap-2 pt-2">
           <Button 
             variant="ghost" 
             size="sm" 
             className="w-full justify-between text-xs font-bold hover:bg-white/10 text-slate-300"
             onClick={() => router.push('/finance/dashboard')}
           >
             Ver Dashboard Completo
             <ArrowRight size={14} />
           </Button>
           <Button 
             variant="ghost" 
             size="sm" 
             className="w-full justify-between text-xs font-bold hover:bg-red-500/10 text-red-400"
             onClick={() => router.push('/finance/inadimplencia')}
           >
             Gerenciar Inadimplentes (12)
             <AlertCircle size={14} />
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock de Badge para evitar import de shadcn que pode não estar pronto
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${className}`}>
      {children}
    </span>
  );
}
