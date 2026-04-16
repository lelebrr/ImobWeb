'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  Building2,
  Users,
  DollarSign,
  FileText,
  Target,
  Activity,
  PieChart,
  Settings2,
  FileSpreadsheet,
  FileJson
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { cn, formatCurrency } from '@/lib/utils';
import { formatKpiValue, KPI_DEFINITIONS } from '@/lib/analytics/kpi-definitions';
import type { KpiValue, KpiTrend, KpiCategory } from '@/types/analytics';
import { ReportService } from '@/lib/analytics/report-service';
import { DASHBOARD_WIDGETS, WidgetDefinition } from '@/lib/analytics/widget-registry';
import { getRichAnalyticsStats, getDashboardConfig, saveDashboardConfig } from '@/app/actions/dashboard';
import { toast } from 'sonner';

interface KpiCardProps {
  kpiId: string;
  value: number;
  trend?: string;
  trendPercentage?: number;
  title: string;
  icon: React.ReactNode;
}

function KpiCard({ kpiId, value, trend, trendPercentage, title, icon }: KpiCardProps) {
  const definition = KPI_DEFINITIONS.find(d => d.id === kpiId);
  const unit = definition?.unit || 'number';

  const getTrendIcon = (t?: string) => {
    switch (t) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (t?: string) => {
    switch (t) {
      case 'up': return 'text-green-600 bg-green-50/50';
      case 'down': return 'text-red-600 bg-red-50/50';
      default: return 'text-gray-600 bg-gray-50/50';
    }
  };

  return (
    <Card className="glass-card hover:shadow-xl transition-all border-none group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-0.5">{title}</p>
              <p className="text-2xl font-black tracking-tighter text-foreground">
                {formatKpiValue(value, unit)}
              </p>
            </div>
          </div>
          {trendPercentage !== undefined && (
            <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black italic', getTrendColor(trend))}>
              {getTrendIcon(trend)}
              <span>{Math.abs(trendPercentage).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  span?: number;
}

function ChartCard({ title, children, span = 1 }: ChartCardProps) {
  return (
    <Card className={cn("glass-card border-none overflow-hidden", span > 1 && "lg:col-span-" + span)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-black uppercase tracking-tighter opacity-80">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function ExecutiveDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const fetchStatsAndConfig = async () => {
    setLoading(true);
    try {
      const [statsData, configData] = await Promise.all([
        getRichAnalyticsStats(),
        getDashboardConfig()
      ]);
      
      setStats(statsData);
      
      if (configData && configData.length > 0) {
        setVisibleWidgets(configData);
      } else {
        setVisibleWidgets(DASHBOARD_WIDGETS.filter(w => w.defaultVisible).map(w => w.id));
      }
    } catch (err) {
      toast.error('Erro ao buscar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndConfig();
  }, [timeRange]);

  const toggleWidget = async (id: string) => {
    const newConfig = visibleWidgets.includes(id) 
      ? visibleWidgets.filter(w => w !== id) 
      : [...visibleWidgets, id];
    
    setVisibleWidgets(newConfig);
    
    // Save to DB
    const res = await saveDashboardConfig(newConfig);
    if (!res.success) {
      toast.error('Erro ao salvar preferência');
    }
  };

  const handleExportPdf = () => {
    toast.promise(ReportService.exportToPdf('executive-dashboard-container'), {
      loading: 'Gerando PDF...',
      success: 'PDF exportado com sucesso!',
      error: 'Erro ao gerar PDF'
    });
  };

  const handleExportExcel = () => {
    if (!stats) return;
    const data = ReportService.prepareExcelData(stats);
    ReportService.exportToExcel(data, `dashboard-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel exportado com sucesso!');
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary opacity-20" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">Processando Inteligência de Dados...</p>
      </div>
    );
  }

  const activeKpis = DASHBOARD_WIDGETS.filter(w => w.type === 'stat' && visibleWidgets.includes(w.id));
  const activeCharts = DASHBOARD_WIDGETS.filter(w => w.type !== 'stat' && visibleWidgets.includes(w.id));

  return (
    <div id="executive-dashboard-container" className="space-y-8 animate-in fade-in duration-700">
      {/* Dashboard Sub-Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 p-6 rounded-[2rem] border border-white/40">
        <div className="flex items-center gap-4">
          <div className="h-12 w-1 border-l-4 border-primary rounded-full" />
          <div>
            <h2 className="text-xl font-black tracking-tighter">Visão Operacional Elite</h2>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">Status gerado em {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-10 px-4 rounded-xl border-none glass font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-white/60 transition-colors outline-none"
          >
            <option value="week">Semana</option>
            <option value="month">Mês</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Ano</option>
          </select>

          <Button 
            variant="outline" 
            className="h-10 glass border-none font-bold text-[10px] uppercase tracking-widest"
            onClick={() => setIsConfiguring(!isConfiguring)}
          >
            <Settings2 className={cn("mr-2 h-4 w-4", isConfiguring && "text-primary animate-pulse")} />
            Personalizar
          </Button>

          <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block" />

          <Button 
            variant="outline" 
            className="h-10 glass border-none font-bold text-[10px] uppercase tracking-widest"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
            Excel
          </Button>

          <Button 
            className="h-10 shadow-lg shadow-primary/20 bg-primary font-black text-[10px] uppercase tracking-widest rounded-xl px-6"
            onClick={handleExportPdf}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF Expert
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      {isConfiguring && (
        <Card className="glass border-primary/20 animate-in slide-in-from-top duration-500 overflow-hidden">
          <CardHeader className="bg-primary/5 py-4">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Configurar Widgets de Visibilidade</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {DASHBOARD_WIDGETS.map(widget => (
              <div 
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border-2",
                  visibleWidgets.includes(widget.id) 
                    ? "bg-primary/10 border-primary shadow-sm" 
                    : "bg-white/20 border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                )}
              >
                <widget.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-tight">{widget.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {activeKpis.map(widget => (
          <KpiCard 
            key={widget.id}
            kpiId={widget.id}
            title={widget.title}
            icon={<widget.icon className="h-6 w-6" />}
            value={
              widget.id === 'total_leads' ? stats.totalLeads :
              widget.id === 'active_properties' ? stats.activeProperties :
              widget.id === 'monthly_revenue' ? 185000 : 
              widget.id === 'total_revenue' ? stats.totalProperties * 10000 :
              stats.totalLeads * 0.1
            }
            trend="up"
            trendPercentage={12.4}
          />
        ))}
      </div>

      {/* Major Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {visibleWidgets.includes('revenue_growth') && (
          <div className="lg:col-span-2">
            <ChartCard title="Evolução de Performance Financeira" span={1}>
              <div className="h-[350px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.4} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        )}

        {visibleWidgets.includes('leads_funnel') && (
          <ChartCard title="Funil Dinâmico de Conversão">
            <div className="h-[350px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.leadsFunnel} layout="vertical" barGap={12}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} fontWeight="black" width={80} axisLine={false} tickLine={false} />
                  <Tooltip 
                     cursor={{fill: 'transparent'}}
                     contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                    {stats.leadsFunnel.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {visibleWidgets.includes('portal_performance') && (
           <ChartCard title="Market Share & Canais Digitais">
              <div className="h-[300px] mt-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                       <Pie
                          data={stats.sources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={5}
                       >
                          {stats.sources.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#6366f1'][index % 5]} />
                          ))}
                       </Pie>
                       <Tooltip />
                       <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                    </RechartsPieChart>
                 </ResponsiveContainer>
              </div>
           </ChartCard>
        )}

        {visibleWidgets.includes('top_agents') && (
          <ChartCard title="Ranking de Performance Humana">
            <div className="space-y-4 mt-4">
               {stats.topAgents.map((agent: any, i: number) => (
                 <div key={agent.name} className="flex items-center justify-between p-4 rounded-3xl bg-white/40 hover:bg-white/80 transition-all border border-transparent hover:border-primary/10 group">
                    <div className="flex items-center gap-4">
                       <span className={cn(
                         "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black",
                         i === 0 ? "bg-yellow-400 text-yellow-900" : "bg-primary/10 text-primary"
                       )}>{i + 1}</span>
                       <div>
                          <p className="text-sm font-black tracking-tight">{agent.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{agent.deals} negócios concluídos</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-primary">{formatCurrency(agent.revenue)}</p>
                       <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full italic">{agent.conversion}% conv.</span>
                    </div>
                 </div>
               ))}
            </div>
          </ChartCard>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-gray-200/50 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
         <p>ImobWeb Intelligence Platform v2.0</p>
         <div className="flex gap-6 mt-4 md:mt-0">
            <span>Sincronizado com Prisma ORM</span>
            <span>Segurança High-End Ativada</span>
         </div>
      </div>
    </div>
  );
}
