'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Target,
  ArrowUpRight,
  Info,
  Zap,
  MousePointerClick
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { cn, formatCurrency } from '@/lib/utils';

export default function RoiChannelDashboard() {
  const [investment, setInvestment] = useState(5000);

  const roiData = [
    { channel: 'Facebook Ads', cost: 1200, revenue: 8500, roi: 6.08, leads: 45 },
    { channel: 'Google Search', cost: 2000, revenue: 15400, roi: 6.7, leads: 32 },
    { channel: 'Portais Imob', cost: 1500, revenue: 4200, roi: 1.8, leads: 88 },
    { channel: 'Instagram', cost: 800, revenue: 5100, roi: 5.37, leads: 22 },
    { channel: 'E-mail Marketing', cost: 200, revenue: 9800, roi: 48, leads: 12 },
    { channel: 'LinkedIn', cost: 500, revenue: 1200, roi: 1.4, leads: 5 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Investment Config Row */}
      <Card className="glass-card border-none bg-primary/5 py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               <Zap className="h-5 w-5" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Configuração de ROI</p>
               <p className="text-sm font-black tracking-tight">Investimento Total Mensal (R$)</p>
            </div>
         </div>
         <div className="flex items-center gap-3 bg-white/40 p-1.5 rounded-2xl border border-white/60">
            <input 
               type="number" 
               value={investment} 
               onChange={(e) => setInvestment(Number(e.target.value))}
               className="bg-transparent border-none outline-none font-black text-lg px-4 w-32 tracking-tighter"
            />
            <div className="bg-primary text-white h-10 px-4 flex items-center justify-center rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
               Atualizar Projeções
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROI Comparison Chart */}
        <Card className="lg:col-span-2 glass-card border-none overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Retorno sobre Investimento (ROI)</CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Comparativo de performance financeira por canal de captação</p>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="channel" axisLine={false} tickLine={false} fontSize={9} fontWeight="black" stroke="#94A3B8" />
                <Tooltip 
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                   cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} />
                <Bar name="Custo (R$)" dataKey="cost" fill="#94A3B8" radius={[10, 10, 0, 0]} barSize={20} />
                <Bar name="Retorno (R$)" dataKey="revenue" fill="#3B82F6" radius={[10, 10, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Efficiency Bubble Chart */}
        <Card className="glass-card border-none overflow-hidden h-full">
           <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Matriz de Eficiência</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Retorno (Y) vs Volume de Leads (Z)</p>
           </CardHeader>
           <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis type="category" dataKey="channel" axisLine={false} tickLine={false} fontSize={8} fontWeight="black" />
                    <YAxis type="number" dataKey="roi" axisLine={false} tickLine={false} fontSize={8} fontWeight="black" hide />
                    <ZAxis type="number" dataKey="leads" range={[100, 1000]} />
                    <Tooltip 
                       cursor={{ strokeDasharray: '3 3' }}
                       contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                    />
                    <Scatter name="Canais" data={roiData}>
                       {roiData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#6366F1'][index % 6]} />
                       ))}
                    </Scatter>
                 </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 rounded-2xl bg-white/40 border border-white/60">
                 <div className="flex items-center gap-2 mb-1">
                    <Info className="h-3 w-3 text-blue-500" />
                    <span className="text-[9px] font-black uppercase text-blue-500">Dica de Otimização</span>
                 </div>
                 <p className="text-[10px] font-bold text-muted-foreground leading-tight">
                    Canais como <span className="text-foreground">E-mail Marketing</span> possuem ROI superior mas volume limitado. Recomendamos aumentar o orçamento em <span className="text-foreground">Google Search</span> para escala.
                 </p>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
