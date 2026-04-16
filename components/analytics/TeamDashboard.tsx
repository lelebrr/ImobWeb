'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Activity, 
  TrendingUp,
  UserCheck,
  Zap,
  Star
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { cn } from '@/lib/utils';
import { getTeamAnalytics } from '@/app/actions/analytics';

export default function TeamDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamAnalytics().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20 opacity-40 uppercase font-black text-xs tracking-widest animate-pulse">Analisando Performance da Equipe...</div>;

  const radarData = [
    { subject: 'Vendas', A: 120, fullMark: 150 },
    { subject: 'Leads', A: 98, fullMark: 150 },
    { subject: 'Visitas', A: 86, fullMark: 150 },
    { subject: 'Agilidade', A: 99, fullMark: 150 },
    { subject: 'Satisfação', A: 85, fullMark: 150 },
    { subject: 'Retenção', A: 65, fullMark: 150 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking Table */}
        <Card className="lg:col-span-2 glass-card border-none overflow-hidden h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Ranking de Corretores</CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Desempenho por conversão e volume</p>
            </div>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-4">
              {data?.ranking?.map((agent: any, i: number) => (
                <div 
                  key={agent.name} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-[2rem] transition-all border border-transparent group",
                    i === 0 ? "bg-primary/5 border-primary/10 shadow-lg shadow-primary/5" : "bg-white/40 hover:bg-white/60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-black",
                      i === 0 ? "bg-yellow-400 text-yellow-900" : i === 1 ? "bg-slate-200 text-slate-700" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary"
                    )}>
                      {i + 1}º
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight">{agent.name}</p>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">{agent.conversions} fechados</span>
                         <span className="h-1 w-1 rounded-full bg-gray-300" />
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">{agent.leads} leads</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">{agent.conversionRate.toFixed(1)}%</p>
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 italic">Taxa de Conversão</span>
                  </div>
                </div>
              ))}
              {(!data?.ranking || data?.ranking.length === 0) && (
                <div className="py-10 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.2em]">Sem dados de corretores ativos</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Global Team Stats */}
        <div className="space-y-6">
           <Card className="glass-card border-none bg-primary text-white overflow-hidden relative">
              <CardHeader className="relative z-10">
                 <CardTitle className="text-sm font-black uppercase tracking-tighter text-white/90">Eficácia da Equipe</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pb-8">
                 <p className="text-4xl font-black tracking-tighter mb-1">84.2<span className="text-xl opacity-60">/100</span></p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-6">Média de pontuação operacional</p>
                 <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[84%]" />
                 </div>
              </CardContent>
              <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-white/10" />
           </Card>

           <Card className="glass-card border-none">
              <CardHeader>
                 <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">Equilíbrio Atuarial</CardTitle>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Análise 360º de competências</p>
              </CardHeader>
              <CardContent>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#E2E8F0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 'black', fill: '#94A3B8' }} />
                          <Radar
                             name="Equipe"
                             dataKey="A"
                             stroke="#3B82F6"
                             fill="#3B82F6"
                             fillOpacity={0.6}
                          />
                       </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
