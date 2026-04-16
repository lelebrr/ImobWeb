'use client';

import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Share2, 
  MousePointer2, 
  Users,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Globe
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
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { cn } from '@/lib/utils';
import { getMarketingAnalytics } from '@/app/actions/analytics';

export default function MarketingDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketingAnalytics().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20 opacity-40 uppercase font-black text-xs tracking-widest animate-pulse">Cruzando Dados de Marketing...</div>;

  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#6366F1'];

  const trendData = [
    { day: 'Seg', leads: 12, cost: 450 },
    { day: 'Ter', leads: 18, cost: 520 },
    { day: 'Qua', leads: 15, cost: 480 },
    { day: 'Qui', leads: 22, cost: 600 },
    { day: 'Sex', leads: 28, cost: 750 },
    { day: 'Sab', leads: 20, cost: 550 },
    { day: 'Dom', leads: 14, cost: 400 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem title="Origem Dominante" value="WebSite" icon={<Globe className="h-5 w-5" />} trend="+8% vs p.a." color="blue" />
        <StatItem title="Custo por Lead (CPL)" value="R$ 24,50" icon={<MousePointer2 className="h-5 w-5" />} trend="-12% economia" color="emerald" />
        <StatItem title="Saturacão Social" value="Medio" icon={<Share2 className="h-5 w-5" />} trend="Estável" color="amber" />
        <StatItem title="Leads Ativos" value={data?.sources?.reduce((a:any, b:any) => a + b.value, 0) || 0} icon={<Users className="h-5 w-5" />} trend="+154" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <Card className="glass-card border-none overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Market Share por Canal</CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Distribuição de captação de leads</p>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                     data={data?.sources}
                     cx="50%"
                     cy="50%"
                     innerRadius={80}
                     outerRadius={120}
                     paddingAngle={5}
                     dataKey="value"
                     animationDuration={1500}
                  >
                     {data?.sources?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                     verticalAlign="bottom" 
                     align="center"
                     iconType="circle"
                     wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }}
                  />
               </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acquisition Trend */}
        <Card className="glass-card border-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Fluidez de Conversão</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ritmo diários de novos leads vs investimento</p>
            </div>
            <LineIcon className="h-5 w-5 text-primary opacity-20" />
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} fontWeight="black" stroke="#94A3B8" />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                />
                <Line 
                   type="monotone" 
                   dataKey="leads" 
                   stroke="#3B82F6" 
                   strokeWidth={4} 
                   dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                   activeDot={{ r: 8, strokeWidth: 0 }}
                   animationDuration={2000}
                />
                <Line 
                   type="monotone" 
                   dataKey="cost" 
                   stroke="#8B5CF6" 
                   strokeWidth={2} 
                   strokeDasharray="5 5"
                   dot={false}
                   animationDuration={3000}
                />
              </LineChart>
            </ResponsiveContainer>
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
