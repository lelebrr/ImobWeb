"use client";

import React from "react";
import { Download, FileText, Calendar, Filter, User, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock de comissões por corretor
const commissions = [
  { id: "C1", broker: "Carlos Eduardo", property: "Ed. Horizon - Ap 402", date: "15/03/2026", gross: 12500.00, irrf: 187.50, net: 12312.50 },
  { id: "C2", broker: "Adriana Lima", property: "Casa Jardins - Venda", date: "22/03/2026", gross: 45000.00, irrf: 675.00, net: 44325.00 },
  { id: "C3", broker: "Marcos Paulo", property: "Cond. Vert - Aluguel", date: "28/03/2026", gross: 1200.00, irrf: 0, net: 1200.00 },
];

export default function CommissionsPage() {
  return (
    <div className="p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight">Comissões e Repasses</h1>
          <p className="text-muted-foreground italic tracking-tight">Extratos de ganhos e informe de rendimentos para corretores.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-bold border-2">
              <Download className="mr-2 h-4 w-4" /> Exportar (IR 2026)
           </Button>
           <Button className="font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bruto", value: "R$ 58.700", sub: "+12% vs mês ant.", color: "text-slate-900" },
          { label: "Repasses Pendentes", value: "R$ 15.200", sub: "7 corretores aguardando", color: "text-amber-600" },
          { label: "Retenção IRRF", value: "R$ 862,50", sub: "Pronto para DIRF", color: "text-slate-500" },
          { label: "Eficiência Payout", value: "98.2%", sub: "Delay de 1.2 dias", color: "text-green-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="p-4 pb-0">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</span>
            </CardHeader>
            <CardContent className="p-4 pt-1">
               <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
               <p className="text-[10px] font-bold text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Histórico de Comissões</CardTitle>
            <CardDescription>Detalhamento de vendas e locações do período atual.</CardDescription>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
             <Button variant="ghost" size="sm" className="font-bold h-7 px-3">Mensal</Button>
             <Button variant="ghost" size="sm" className="font-bold h-7 px-3 text-slate-400">Trimestral</Button>
             <Button variant="ghost" size="sm" className="font-bold h-7 px-3 text-slate-400">Anual (IR)</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commissions.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-xl hover:border-blue-500/50 transition-all group">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                      <DollarSign size={20} />
                   </div>
                   <div>
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100">{item.property}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                         <span className="font-bold text-blue-600">{item.broker}</span>
                         <span>•</span>
                         <span>{item.date}</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-12 text-right">
                   <div className="hidden md:block">
                      <div className="text-[10px] font-black uppercase text-muted-foreground text-right opacity-50">Bruto / IRRF</div>
                      <div className="text-xs font-bold text-slate-500">
                         R$ {item.gross.toLocaleString('pt-BR')} / R$ {item.irrf.toLocaleString('pt-BR')}
                      </div>
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase text-green-600 text-right">Líquido a Pagar</div>
                      <div className="text-lg font-black text-green-600">R$ {item.net.toLocaleString('pt-BR')}</div>
                   </div>
                   <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <FileText size={18} />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
