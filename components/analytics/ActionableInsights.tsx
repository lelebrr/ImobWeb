'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Building2, 
  UserX, 
  ArrowRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  ChevronRight,
  Compass
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { Badge } from '@/components/design-system/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  getStagnantProperties, 
  getAtRiskAgents, 
  getForgottenLeads, 
  getMarketTrends 
} from '@/app/actions/insights';
import { toast } from 'sonner';

export default function ActionableInsights() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stagnant: any[];
    atRisk: any[];
    forgotten: any[];
    trends: any;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stagnant, atRisk, forgotten, trends] = await Promise.all([
        getStagnantProperties(),
        getAtRiskAgents(),
        getForgottenLeads(),
        getMarketTrends()
      ]);
      setData({ stagnant, atRisk, forgotten, trends });
    } catch (err) {
      toast.error('Erro ao processar insights inteligentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Sparkles className="h-8 w-8 animate-pulse text-primary opacity-40" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40 italic">A IA está analisando sua performance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Intro Hero Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary/10 via-white/5 to-transparent p-10 border border-primary/5">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <Zap className="h-3 w-3 fill-current" />
              Machine Learning Ativado
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-none">
              Insights que <span className="text-primary italic">Geram Ação</span>
            </h2>
            <p className="text-muted-foreground font-medium text-lg leading-snug max-w-xl">
              Não apenas dados — recomendações claras sobre o que fazer agora para otimizar sua operação e fechar mais negócios.
            </p>
          </div>
          <div className="hidden lg:block relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative h-48 w-48 bg-white/40 glass p-8 rounded-[3rem] border border-white/60 flex items-center justify-center shadow-2xl">
              <Sparkles className="h-20 w-20 text-primary animate-bounce fill-primary/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stagnant Properties */}
        <Card className="glass-card border-none overflow-hidden group">
          <CardHeader className="bg-orange-500/5 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/20 text-orange-600 flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Imóveis Parados</CardTitle>
                  <CardDescription className="font-bold text-xs uppercase tracking-tight text-orange-600/60">Ação solicitada: Reativação</CardDescription>
                </div>
              </div>
              <Badge className="bg-orange-500 text-white font-black">{data.stagnant.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {data.stagnant.length > 0 ? data.stagnant.map((prop: any) => (
              <div key={prop.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/40 border border-transparent hover:border-orange-500/20 hover:bg-white/80 transition-all group/item">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/50 text-orange-600 text-[10px] font-black italic">
                    {prop.daysStagnant}d
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight group-hover/item:text-primary transition-colors">{prop.title}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{prop.code} • {formatCurrency(prop.price)}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="text-[9px] font-black text-white bg-orange-500/80 px-2 py-1 rounded-lg uppercase tracking-wider">{prop.suggestion}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black uppercase text-orange-700 hover:text-orange-950">
                    Editar <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-40">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Sua carteira está saudável</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* At Risk Agents */}
        <Card className="glass-card border-none overflow-hidden group">
          <CardHeader className="bg-red-500/5 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-500/20 text-red-600 flex items-center justify-center">
                  <UserX className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Corretores em Risco</CardTitle>
                  <CardDescription className="font-bold text-xs uppercase tracking-tight text-red-600/60">Ação solicitada: Treinamento / Coaching</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {data.atRisk.length > 0 ? data.atRisk.map((agent: any) => (
              <div key={agent.name} className="flex items-center justify-between p-4 rounded-3xl bg-red-50/50 border-2 border-dashed border-red-200 hover:border-red-500/40 hover:bg-white transition-all group/item">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-lg font-black text-red-500 shadow-sm">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">{agent.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase italic line-through opacity-50">{agent.previousRate.toFixed(1)}%</span>
                      <TrendingUp className="h-3 w-3 text-red-500 animate-pulse rotate-180" />
                      <span className="text-[10px] font-black text-red-600 uppercase">{agent.recentRate.toFixed(1)}% Conv.</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-red-600">-{agent.drop.toFixed(1)}%</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase italic tracking-tighter">Queda vs mês anterior</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-40">
                <TrendingUp className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Time em alta performance</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forgotten Leads */}
        <Card className="glass-card border-none overflow-hidden group">
          <CardHeader className="bg-blue-500/5 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-600 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Leads Esquecidos</CardTitle>
                  <CardDescription className="font-bold text-xs uppercase tracking-tight text-blue-600/60">Ação solicitada: Follow-up Prioritário</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {data.forgotten.length > 0 ? data.forgotten.map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/40 border border-transparent hover:border-blue-500/20 hover:bg-white/80 transition-all group/item">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-[10px] font-black uppercase">
                    {lead.daysForgotten}d
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">{lead.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{lead.status} • {lead.whatsapp || 'WhatsApp não cadastrado'}</p>
                  </div>
                </div>
                <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                  Resgatar
                </Button>
              </div>
            )) : (
              <div className="text-center py-10 opacity-40">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">Todos os leads em dia</p>
              </div>
            )}
            {data.forgotten.length > 0 && (
              <Button variant="ghost" className="w-full text-xs font-black uppercase opacity-60 hover:opacity-100 tracking-widest">
                Ver todos os {data.forgotten.length} leads esquecidos
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Market Trends */}
        <Card className="glass-card border-none overflow-hidden group">
          <CardHeader className="bg-emerald-500/5 py-6">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Tendências de Mercado</CardTitle>
                  <CardDescription className="font-bold text-xs uppercase tracking-tight text-emerald-600/60">Benchmarking do Ecossistema</CardDescription>
                </div>
              </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">Conv. Mercado</p>
                <p className="text-3xl font-black tracking-tighter text-emerald-700">{data.trends.conversionBench}%</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600/80">
                  <TrendingUp className="h-3 w-3" />
                  +2.1% este mês
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600/60 mb-1">Ciclo Médio</p>
                <p className="text-3xl font-black tracking-tighter text-slate-700">{data.trends.timeToSaleBench}d</p>
                <p className="text-[10px] font-bold text-slate-500 mt-2 italic px-2 py-0.5 bg-slate-100 rounded-lg inline-block">Média Brasil CRM</p>
              </div>
            </div>

            <div className="mt-6 p-5 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp className="h-20 w-20" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Insight Estratégico</p>
               <h4 className="text-lg font-black tracking-tight mb-2 italic">Aumento na procura por Terrenos em {data.trends.topRegions[0]}</h4>
               <p className="text-xs font-medium text-white/70 leading-relaxed mb-4">
                  O ecossistema detectou um aumento de 18% na busca por este tipo de imóvel. Sugerimos priorizar captações nestas regiões.
               </p>
               <Button className="w-full bg-white text-slate-900 hover:bg-white/90 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl">
                  Explorar Região <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-center py-6">
         <div className="px-6 py-2 rounded-full glass bg-white/20 border border-white/40 flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Motor Predict</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <button 
              onClick={fetchData} 
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors outline-none"
            >
               <RefreshCw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-700" />
               Recalcular Agora
            </button>
         </div>
      </div>
    </div>
  );
}
