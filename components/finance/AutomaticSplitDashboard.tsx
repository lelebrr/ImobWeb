'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  ArrowRight, 
  Building2, 
  User, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  Split
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/design-system/card';
import { Badge } from '@/components/design-system/badge';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface FinData {
  stats: any[];
  recentInvoices: any[];
}

export default function AutomaticSplitDashboard({ data }: { data: FinData }) {
  const [activeStep, setActiveStep] = useState(0);

  // Derived stats
  const totalRevenue = useMemo(() => {
    return data.stats.reduce((acc, curr) => acc + Number(curr._sum.amount), 0);
  }, [data.stats]);

  const agencyRevenue = useMemo(() => {
    return data.stats
      .filter(s => s.recipientType === 'AGENCY')
      .reduce((acc, curr) => acc + Number(curr._sum.amount), 0);
  }, [data.stats]);

  const pendingPayouts = useMemo(() => {
    return data.stats
      .filter(s => s.status === 'PENDING')
      .reduce((acc, curr) => acc + Number(curr._sum.amount), 0);
  }, [data.stats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Premium Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="group relative p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
               <TrendingUp className="h-20 w-20" />
            </div>
            <div className="relative space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Processado</p>
               <h3 className="text-3xl font-black tracking-tighter">R$ {totalRevenue.toLocaleString()}</h3>
               <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" /> +12.5% vs mÃªs anterior
               </div>
            </div>
         </div>

         <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
               <Building2 className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ComissÃ£o ImobiliÃ¡ria</p>
            <h3 className="text-2xl font-black tracking-tighter">R$ {agencyRevenue.toLocaleString()}</h3>
            <p className="text-[10px] font-medium text-muted-foreground italic">Taxa mÃ©dia: 10%</p>
         </div>

         <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 mb-2">
               <Clock className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Repasses Pendentes</p>
            <h3 className="text-2xl font-black tracking-tighter text-orange-600">R$ {pendingPayouts.toLocaleString()}</h3>
            <p className="text-[10px] font-medium text-muted-foreground italic">PrÃ³ximo repasse: D+1</p>
         </div>

         <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-500 mb-2">
               <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ConciliaÃ§Ã£o</p>
            <h3 className="text-2xl font-black tracking-tighter text-emerald-600">100%</h3>
            <p className="text-[10px] font-medium text-muted-foreground italic">Zero divergÃªncias</p>
         </div>
      </div>

      {/* Main Flow Visualization */}
      <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
        <CardHeader className="p-10 pb-0">
          <div className="flex justify-between items-start">
             <div>
                <CardTitle className="text-3xl font-black tracking-tighter">Fluxo <span className="text-primary italic">AutomÃ¡tico</span></CardTitle>
                <CardDescription className="text-sm font-medium">VisualizaÃ§Ã£o em tempo real da divisiÃ£o de fundos via ImobPay.</CardDescription>
             </div>
             <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest px-4 py-2 rounded-xl">Ativo em 100% dos Contratos</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-4">
           {/* Money Flow Diagram */}
           <div className="relative py-20 px-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 border-dashed mb-10 overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                 {/* Tenant Node */}
                 <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-slate-600 border border-slate-100">
                       <Wallet className="h-10 w-10" />
                    </div>
                    <div className="text-center">
                       <p className="text-xs font-black uppercase text-slate-900 leading-none">Inquilino</p>
                       <p className="text-[10px] font-medium text-muted-foreground uppercase mt-1">Pagamento (PIX/Boleto)</p>
                    </div>
                 </motion.div>

                 {/* Flow Lines */}
                 <div className="flex-1 px-8 relative h-10">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: '100%' }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="absolute inset-y-0 left-0 bg-primary/20 rounded-full"
                    />
                    <div className="absolute inset-y-0 left-0 w-full flex items-center justify-center">
                       <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                 </div>

                 {/* Split Engine Node */}
                 <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="h-24 w-24 rounded-[2.5rem] bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center relative">
                       <Split className="h-12 w-12" />
                       <div className="absolute inset-0 rounded-[2.5rem] border-4 border-white opacity-20" />
                    </div>
                    <div className="text-center">
                       <p className="text-xs font-black uppercase text-primary leading-none tracking-widest">Split Engine</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase mt-1 italic">ImobPay Split</p>
                    </div>
                 </motion.div>

                 {/* Flow Lines */}
                 <div className="flex-1 px-8 relative h-20">
                    <div className="absolute top-0 left-0 w-full h-1/2 border-b-2 border-r-2 border-primary/20 border-dashed rounded-br-[2rem]" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 border-t-2 border-r-2 border-emerald-500/20 border-dashed rounded-tr-[2rem]" />
                    <div className="absolute inset-y-0 right-0 flex flex-col justify-between py-2">
                       <ArrowRight className="h-4 w-4 text-primary" />
                       <ArrowRight className="h-4 w-4 text-emerald-500" />
                    </div>
                 </div>

                 {/* Recipient Nodes */}
                 <div className="flex flex-col gap-12">
                     <motion.div whileHover={{ x: 10 }} className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-lg">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                           <Building2 className="h-6 w-6" />
                        </div>
                        <div className="pr-4">
                           <p className="text-[10px] font-black uppercase text-slate-400 leading-none">ImobiliÃ¡ria</p>
                           <p className="text-sm font-black text-slate-900 mt-1">10% ComissÃ£o</p>
                        </div>
                     </motion.div>
                     <motion.div whileHover={{ x: 10 }} className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-emerald-100 shadow-lg border-l-4 border-l-emerald-500">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                           <User className="h-6 w-6" />
                        </div>
                        <div className="pr-4">
                           <p className="text-[10px] font-black uppercase text-slate-400 leading-none">ProprietÃ¡rio</p>
                           <p className="text-sm font-black text-slate-900 mt-1">90% LÃ­quido</p>
                        </div>
                     </motion.div>
                 </div>
              </div>

              {/* Decorative Glows */}
              <div className="absolute -top-20 -left-20 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-emerald-500/5 blur-[100px] rounded-full" />
           </div>

           {/* Charts Section */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">EficiÃªncia de Repasse</h4>
                    <Badge variant="outline" className="text-[9px] font-bold">Últimos 30 dias</Badge>
                 </div>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" hide />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Tempo de LiquidaÃ§Ã£o</h4>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600">
                       <CheckCircle2 className="h-3 w-3" /> 85% em D+1
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="space-y-1">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span>ProprietÃ¡rios (D+1)</span>
                          <span>85%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-emerald-500" />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span>ImobiliÃ¡ria (InstatÃ¢neo)</span>
                          <span>100%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-primary" />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span>Terceiros (D+5)</span>
                          <span>15%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} className="h-full bg-slate-300" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Manual Action & Reconciliation */}
      <div className="flex flex-col md:flex-row gap-6">
         <Card className="flex-1 rounded-[2.5rem] border-slate-100 shadow-sm">
            <CardHeader className="p-8">
               <CardTitle className="text-xl font-black tracking-tight">ConciliaÃ§Ã£o AutomÃ¡tica</CardTitle>
               <CardDescription className="text-xs font-medium uppercase tracking-tight">Status da integraÃ§Ã£o com 34+ bancos.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black uppercase">API BancÃ¡ria Nativa</span>
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px]">ONLINE</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-black uppercase">Webhooks Financeiros</span>
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px]">ATIVO</Badge>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="flex-1 rounded-[2.5rem] border-primary/20 shadow-sm bg-primary/5">
            <CardHeader className="p-8">
               <CardTitle className="text-xl font-black tracking-tight text-primary italic">AÃ§Ã£o IA Predict</CardTitle>
               <CardDescription className="text-xs font-medium uppercase tracking-tight text-primary/60">Insight gerado automaticamente pelo ImobWeb.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
               <div className="p-6 rounded-[2rem] bg-white border border-primary/10 shadow-xl space-y-4">
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                     Detectamos um repasse de <span className="text-primary font-black underline decoration-primary/20 underline-offset-4">R$ 15.420</span> previsto para amanhÃ£ que pode impactar seu fluxo de caixa positivamente. Deseja antecipar a comissÃ£o para hoje?
                  </p>
                  <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px]">
                     Antecipar ComissÃ£o <DollarSign className="ml-2 h-4 w-4" />
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

const chartData = [
  { name: 'Dia 1', amount: 4000 },
  { name: 'Dia 2', amount: 3000 },
  { name: 'Dia 3', amount: 2000 },
  { name: 'Dia 4', amount: 2780 },
  { name: 'Dia 5', amount: 1890 },
  { name: 'Dia 6', amount: 2390 },
  { name: 'Dia 7', amount: 3490 },
  { name: 'Dia 8', amount: 4000 },
  { name: 'Dia 9', amount: 3000 },
  { name: 'Dia 10', amount: 2000 },
];
