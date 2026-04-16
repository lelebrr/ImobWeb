'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Scale,
  CalendarDays
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
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { cn, formatCurrency } from '@/lib/utils';
import { getFinancialAnalytics } from '@/app/actions/analytics';
import { getFinancialDashboardData } from '@/app/actions/finance';
import AutomaticSplitDashboard from '@/components/finance/AutomaticSplitDashboard';

export default function FinancialDashboard() {
  const [data, setData] = useState<any>(null);
  const [splitData, setSplitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [analytics, split] = await Promise.all([
        getFinancialAnalytics(),
        getFinancialDashboardData('mock-org-id') // Mocked for demonstration
      ]);
      setData(analytics);
      setSplitData(split);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="text-center py-20 opacity-40 uppercase font-black text-xs tracking-widest animate-pulse">Consolidando Auditoria Financeira...</div>;

  const cashflowData = [
    { month: 'Jan', revenue: 185000, expenses: 142000, profit: 43000 },
    { month: 'Fev', revenue: 210000, expenses: 148000, profit: 62000 },
    { month: 'Mar', revenue: 195000, expenses: 155000, profit: 40000 },
    { month: 'Abr', revenue: 245000, expenses: 162000, profit: 83000 },
    { month: 'Mai', revenue: 280000, expenses: 175000, profit: 105000 },
    { month: 'Jun', revenue: 320000, expenses: 182000, profit: 138000 },
  ];

  const projections = [
     { name: 'Jul', value: 350000 },
     { name: 'Ago', value: 385000 },
     { name: 'Set', value: 420000 },
     { name: 'Out', value: 410000 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem title="Receita Bruta" value={formatCurrency(data?.totalRevenue || 0)} icon={<DollarSign className="h-5 w-5" />} trend="+18.5%" color="blue" />
        <StatItem title="Comissões Estimadas" value={formatCurrency((data?.totalRevenue || 0) * 0.05)} icon={<Wallet className="h-5 w-5" />} trend="+R$ 12k" color="emerald" />
        <StatItem title="Inadimplência" value="2.1%" icon={<TrendingDown className="h-5 w-5" />} trend="-0.4% melhora" color="amber" />
        <StatItem title="EBITDA" value="R$ 138k" icon={<Scale className="h-5 w-5" />} trend="+24% margem" color="purple" />
      </div>

      {/* Automatic Split Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-6">
           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Operacional Financeiro em Tempo Real</p>
        </div>
        <AutomaticSplitDashboard data={splitData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Chart */}
        <Card className="lg:col-span-2 glass-card border-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Fluxo de Caixa Consolidado</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Comparativo de Receita vs Despesas operacionais</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-1 text-[9px] font-black uppercase"><div className="h-2 w-2 rounded-full bg-blue-500" /> Receita</div>
               <div className="flex items-center gap-1 text-[9px] font-black uppercase"><div className="h-2 w-2 rounded-full bg-red-400" /> Despesas</div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} fontWeight="black" stroke="#94A3B8" />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} fill="url(#colorRev)" animationDuration={1500} />
                <Area type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2} fill="transparent" strokeDasharray="5 5" animationDuration={2500} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projections */}
        <Card className="glass-card border-none overflow-hidden h-full">
          <CardHeader>
             <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Projeção de Faturamento</CardTitle>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Análise preditiva para o próximo quadrimestre</p>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-between">
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={projections}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="black" stroke="#94A3B8" />
                      <Tooltip 
                         contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                      />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[10, 10, 0, 0]} barSize={30}>
                         {projections.map((entry, index) => (
                            <Cell key={`cell-${index}`} fillOpacity={0.4 + (index * 0.2)} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                   <CalendarDays className="h-4 w-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary">Aviso Estratégico</span>
                </div>
                <p className="text-[11px] font-bold leading-relaxed text-muted-foreground italic">
                   "Crescimento projetado de <span className="text-primary">12.5%</span> mantendo o ritmo atual de captação de leads e taxa de conversão."
                </p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatItem({ title, value, icon, trend, color }: any) {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50'
  };

  return (
    <Card className="glass-card border-none hover:shadow-xl transition-all group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", colors[color])}>
            {icon}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black italic text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            {trend}
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{title}</p>
        <p className="text-2xl font-black tracking-tighter">{value}</p>
      </CardContent>
    </Card>
  );
}
