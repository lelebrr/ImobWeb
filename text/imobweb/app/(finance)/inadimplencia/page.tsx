"use client";

import React, { useState } from "react";
import { AlertCircle, Send, Search, Filter, MessageSquare, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock de inadimplentes
const initialInadimplentes = [
  { id: "1", client: "João da Silva", amount: 2450.00, overdueDays: 12, status: "pending", phone: "11999999999" },
  { id: "2", client: "Imobiliária Prime", amount: 8900.00, overdueDays: 5, status: "notified", phone: "11888888888" },
  { id: "3", client: "Condomínio Solaris", amount: 1200.00, overdueDays: 45, status: "legal", phone: "11777777777" },
];

export default function InadimplenciaPage() {
  const [list, setList] = useState(initialInadimplentes);

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Gestão de Inadimplência</h1>
        <p className="text-muted-foreground italic">Controle de atrasos e automação de cobranças via WhatsApp.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-600 uppercase tracking-widest">Total em Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-red-600">R$ 12.550,00</div>
            <p className="text-xs text-red-700/70 mt-1 flex items-center gap-1 font-bold">
              <AlertCircle size={14} /> 12 títulos vencidos acumulados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Novos Atrasos (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">2</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Contratos recém-vencidos</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-green-700 uppercase tracking-widest">Recuperado este mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-green-700">R$ 54.300,00</div>
            <p className="text-xs text-green-700/70 mt-1 font-bold">Acordos pagos com sucesso</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Listagem de Inadimplentes</CardTitle>
            <CardDescription>Ações rápidas para notificação e regularização.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
               <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
               <MessageSquare className="mr-2 h-4 w-4" /> Cobrança em Massa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-tighter">Cliente</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-tighter">Valor</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-tighter">Atraso</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-tighter">Status</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase tracking-tighter">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-black">{item.client}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-bold">R$ {item.amount.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      <span className={item.overdueDays > 30 ? "text-red-600 font-bold underline" : "text-amber-600 font-bold"}>
                        {item.overdueDays} dias
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === 'legal' ? 'destructive' : 'outline'} className="font-bold uppercase text-[10px]">
                        {item.status === 'notified' ? 'Notificado 👋' : item.status === 'legal' ? 'Jurídico ⚖️' : 'Pendente ⏳'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 font-bold gap-2">
                          <Send size={14} /> WhatsApp
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
