'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Map, 
  Home, 
  Layers,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  History
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
  Treemap,
  ComposedChart,
  Line,
  Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { cn } from '@/lib/utils';
import { getPortfolioAnalytics } from '@/app/actions/analytics';

export default function PortfolioDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolioAnalytics().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20 opacity-40 uppercase font-black text-xs tracking-widest animate-pulse">Auditando Leitura de Portfólio...</div>;

  const typeData = [
    {
      name: 'Residencial',
      children: [
        { name: 'Apartamento', size: 45 },
        { name: 'Casa', size: 30 },
        { name: 'Condomínio', size: 15 },
        { name: 'Sítio', size: 5 },
      ],
    },
    {
      name: 'Comercial',
      children: [
        { name: 'Loja', size: 20 },
        { name: 'Galpão', size: 10 },
        { name: 'Escritório', size: 25 },
      ],
    },
  ];

  const priceTrend = [
     { region: 'Centro', avg: 12000, supply: 45 },
     { region: 'Zona Sul', avg: 18500, supply: 62 },
     { region: 'Zona Oeste', avg: 9400, supply: 38 },
     { region: 'Norte', avg: 6200, supply: 25 },
     { region: 'Expansão', avg: 7800, supply: 54 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem title="Imóveis em Carteira" value={data?.totalCount || 0} icon={<Building2 className="h-5 w-5" />} trend="+24 novos" color="blue" />
        <StatItem title="Taxa de Vacância" value="18.5%" icon={<Layers className="h-5 w-5" />} trend="-2.4% melhora" color="emerald" />
        <StatItem title="Ticket Médio" value="R$ 840k" icon={<TrendingUp className="h-5 w-5" />} trend="+12% valorização" color="amber" />
        <StatItem title="Liquidez Média" value="54 dias" icon={<History className="h-5 w-5" />} trend="Estável" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Type Distribution Treemap */}
        <Card className="lg:col-span-2 glass-card border-none overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Composição de Portfólio</CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Leitura hierárquica por tipo e categoria</p>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <Treemap
                   data={typeData}
                   dataKey="size"
                   aspectRatio={4 / 3}
                   stroke="#fff"
                   fill="#3B82F6"
                >
                   <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                   />
                </Treemap>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Region Trends */}
        <Card className="glass-card border-none overflow-hidden">
          <CardHeader>
             <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Micro-Mercado Regional</CardTitle>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valor m² vs Oferta de estoque</p>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={priceTrend} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="region" type="category" axisLine={false} tickLine={false} fontSize={10} fontWeight="black" stroke="#94A3B8" />
                   <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                   />
                   <Bar dataKey="supply" fill="#3B82F6" radius={[0, 10, 10, 0]} barSize={20}>
                      {priceTrend.map((entry, index) => (
                         <Cell key={`cell-${index}`} fillOpacity={0.4} />
                      ))}
                   </Bar>
                   <Line type="monotone" dataKey="avg" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B' }} />
                </ComposedChart>
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
