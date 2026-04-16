'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign, 
  CircleDollarSign,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { formatCurrency } from '@/lib/utils';
import { getSalesAnalytics } from '@/app/actions/analytics';

export default function SalesDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalesAnalytics().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20 opacity-40 uppercase font-black text-xs tracking-widest animate-pulse">Calculando Performance de Vendas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sales Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem 
          title="VGV Total" 
          value={formatCurrency(data?.vgvTotal || 0)} 
          icon={<DollarSign className="h-5 w-5" />} 
          trend="+14.2%" 
          color="blue"
        />
        <StatItem 
          title="Ciclo de Vendas" 
          value={`${data?.avgCycle || 0} dias`} 
          icon={<Clock className="h-5 w-5" />} 
          trend="-2 dias" 
          color="purple"
        />
        <StatItem 
          title="Taxa de Conversão" 
          value={`${data?.conversionRate || 0}%`} 
          icon={<Target className="h-5 w-5" />} 
          trend="+1.5%" 
          color="emerald"
        />
        <StatItem 
          title="Ticket Médio" 
          value={formatCurrency((data?.vgvTotal || 0) / 10)} // Estimate
          icon={<CircleDollarSign className="h-5 w-5" />} 
          trend="+5.2%" 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart */}
        <Card className="lg:col-span-2 glass-card border-none shadow-2xl shadow-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Evolução do VGV</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acompanhamento mensal de volume geral</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenueData}>
                  <defs>
                    <linearGradient id="colorVgv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" stroke="#94A3B8" />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vgv" 
                    stroke="#3B82F6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorVgv)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Goals */}
        <Card className="glass-card border-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
             <Target className="h-32 w-32" />
          </div>
          <CardHeader>
             <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Meta Atuarial</CardTitle>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progresso vs Objetivo Mensal</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
             <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                   <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-gray-100"
                   />
                   <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={440}
                      strokeDashoffset={440 * (1 - 0.68)}
                      strokeLinecap="round"
                      className="text-blue-500 transition-all duration-1000 ease-out"
                   />
                </svg>
                <div className="absolute flex flex-col items-center">
                   <span className="text-3xl font-black tracking-tighter">68%</span>
                   <span className="text-[9px] font-bold text-muted-foreground uppercase">Atingido</span>
                </div>
             </div>
             <div className="mt-8 w-full space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                   <span>Atual</span>
                   <span>R$ 1.2M / R$ 1.8M</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[68%]" />
                </div>
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
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{title}</p>
        <p className="text-2xl font-black tracking-tighter">{value}</p>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';
