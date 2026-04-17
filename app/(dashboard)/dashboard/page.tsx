"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import {
  BarChart3,
  Database,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Search,
  Settings,
  Power,
  RefreshCw,
  Loader2,
  MessageSquare,
  Globe,
  SmartphoneNfc,
  Cpu,
  Sparkles,
  Laptop,
  ArrowRight,
  Home,
  Users,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  Bell,
  User,
  Shield,
  Webhook,
  Database as DatabaseIcon,
  Activity as ActivityIcon,
  Zap,
  Smartphone,
  Flame,
  Navigation,
  FileText,
  ShieldCheck,
  Brain,
  Store,
  ShoppingBag,
  Heart,
  Calendar
} from "lucide-react";
import { SaleProbabilityScore } from "@/components/properties/SaleProbabilityScore";
import { SaleProbabilityScore as SaleProbabilityType } from "@/types/ai";
import { MOCK_PROPERTIES } from "@/lib/data/mock-properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/responsive/tailwind-utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";
import { usePortals } from "@/providers/portal-provider";
import { useLogs } from "@/providers/log-provider";
import { useAnalytics } from "@/providers/analytics-provider";

// New Components for Dashboard
import FinancialDashboard from "@/components/finance/FinancialDashboard";
import AutomaticSplitDashboard from "@/components/finance/AutomaticSplitDashboard";
import ContractListComponent from "@/components/contracts/ContractListComponent";
import FranchiseDashboard from "@/components/franchise/FranchiseDashboard";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { HealthScoreCard } from "@/components/insights/HealthScoreCard";
import { PredictiveTimeline } from "@/components/insights/PredictiveTimeline";
import { PriceRecommendationCard } from "@/components/insights/PriceRecommendationCard";

const MOCK_CONTRACTS = [
  { id: 1, numero: "2024-001", cliente: "João Silva", imovel: "Apartamento Itaim", valor: 5500, status: "Ativo" },
  { id: 2, numero: "2024-002", cliente: "Maria Souza", imovel: "Casa Jardim Europa", valor: 12000, status: "Aguardando Assinatura" },
  { id: 3, numero: "2024-003", cliente: "Pedro Oliveira", imovel: "Studio Pinheiros", valor: 3200, status: "Finalizado" }
];

const CONTRACT_COLUMNS = [
  { accessorKey: "numero" as const, header: "Nº Contrato" },
  { accessorKey: "cliente" as const, header: "Cliente" },
  { accessorKey: "imovel" as const, header: "Imóvel" },
  { accessorKey: "valor" as const, header: "Valor" },
  { accessorKey: "status" as const, header: "Status" }
];

const SALES_PROB_DATA = {
  probability: 0.85,
  expectedDays: 14,
  engagementScore: 92
};

const PRICE_REC_DATA = {
  suggestedPrice: 850000,
  minPrice: 820000,
  maxPrice: 890000,
  confidence: 0.94,
  marketAverage: 865000,
  reasoning: [
    "Alta demanda por 3 dormitórios na região",
    "Acabamento superior à média local",
    "Proximidade com nova estação de metrô"
  ],
  comparablesCount: 12
};

const HEALTH_SCORE_DATA = {
  score: 88,
  factors: [
    { label: "Qualidade das Fotos", impact: 15, description: "Fotos em HDR aumentam conversão" },
    { label: "Descrição Completa", impact: 10, description: "Meta-tags otimizadas para SEO" },
    { label: "Preço vs Mercado", impact: -5, description: "Levemente acima da média local" }
  ],
  recommendations: [
    "Adicionar tour virtual 360°",
    "Incluir valor do IPTU no cabeçalho"
  ]
};

const MOCK_FRANCHISES: any[] = [
  {
    id: 'f1',
    name: 'ImobWeb Jardins',
    city: 'São Paulo',
    state: 'SP',
    status: 'active',
    metrics: { totalProperties: 145, totalLeads: 450, convertedLeads: 22, mrr: 25000, activeUsers: 12 },
    royalties: { percentage: 8, pendingAmount: 2000 }
  },
  {
    id: 'f2',
    name: 'ImobWeb Barra',
    city: 'Rio de Janeiro',
    state: 'RJ',
    status: 'active',
    metrics: { totalProperties: 98, totalLeads: 310, convertedLeads: 15, mrr: 18000, activeUsers: 8 },
    royalties: { percentage: 8, pendingAmount: 1440 }
  }
];

export default function DashboardPage() {

  const { user } = useAuth();
  const { organization } = useOrganization();
  const { portals, loadingPortals } = usePortals();
  const { logs, loadingLogs, refreshLogs } = useLogs();
  const { analytics } = useAnalytics();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.promise(refreshLogs(), {
      loading: 'Sincronizando dados...',
      success: 'Dados atualizados com sucesso!',
      error: 'Erro ao sincronizar dados.',
    });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: BarChart3 },
    { id: "finance", label: "ImobPay", icon: DollarSign },
    { id: "contracts", label: "Contratos", icon: FileText },
    { id: "proof-of-life", label: "Garantia de Vida", icon: ShieldCheck },
    { id: "insights", label: "Insights AI", icon: Brain },
    { id: "franchise", label: "Franquias", icon: Store },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "integrations", label: "Integrações", icon: Database },
    { id: "monitoring", label: "Monitoramento", icon: Activity },
    { id: "alerts", label: "Alertas", icon: AlertCircle },
  ];

  const getPortalStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-emerald-500/10 text-emerald-500";
      case "disconnected":
        return "bg-slate-400/10 text-slate-400";
      case "error":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-400/10 text-gray-400";
    }
  };

  const getPortalHealthColor = (health: any) => {
    if (!health) return "bg-gray-400/10 text-gray-400";
    if (health.status === "healthy")
      return "bg-emerald-500/10 text-emerald-500";
    if (health.status === "warning") return "bg-yellow-500/10 text-yellow-500";
    if (health.status === "error") return "bg-red-500/10 text-red-500";
    return "bg-gray-400/10 text-gray-400";
  };

  const getPortalStats = (portal: any) => {
    return {
      totalProperties: portal.stats?.totalProperties || 0,
      activeProperties: portal.stats?.activeProperties || 0,
      totalViews: portal.stats?.totalViews || 0,
      totalLeads: portal.stats?.totalLeads || 0,
      lastSync: portal.syncStatus?.lastSync || null,
      nextSync: portal.syncStatus?.nextSync || null,
      isSyncing: portal.syncStatus?.isSyncing || false,
    };
  };

  const getPortalFeatures = (portal: any) => {
    return portal.features || [];
  };

  const getPortalDocumentation = (portal: any) => {
    return portal.documentation || {};
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Field Mode Quick Access - Mobile Optimized */}
      <div className="lg:hidden">
        <Link href="/field">
          <div className="glass bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group active:scale-95 transition-all">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <Navigation className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter text-white">Modo Corretor em Campo</h3>
                  <p className="text-blue-200 text-sm">GPS, Voz e Câmera IA ativados</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
            </div>
            
            {/* Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass border-none rounded-3xl p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Portais Ativos
          </p>
          <p className="text-2xl font-black text-emerald-400">
            {portals.filter((p) => p.status === "connected").length}
          </p>
        </div>
        <div className="glass border-none rounded-3xl p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Propriedades Sincronizadas
          </p>
          <p className="text-2xl font-black text-primary">
            {analytics?.overview?.totalPropertiesSynced || 0}
          </p>
        </div>
        <div className="glass border-none rounded-3xl p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Visualizações Hoje
          </p>
          <p className="text-2xl font-black text-emerald-400">
            {analytics?.overview?.todayViews || 0}
          </p>
        </div>
        <div className="glass border-none rounded-3xl p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Leads Hoje
          </p>
          <p className="text-2xl font-black text-primary">
            {analytics?.overview?.todayLeads || 0}
          </p>
        </div>
      </div>

      {/* Health Overview */}
      <div className="glass border-none rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black tracking-tighter">
            Status de Saúde
          </h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portals.map((portal) => (
            <div key={portal.id} className="glass border-none rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getPortalHealthColor(portal.health)}`}
                  >
                    <portal.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{portal.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {portal.type}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${getPortalStatusColor(portal.status)}`}
                >
                  {portal.status}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Propriedades Ativas
                  </span>
                  <span className="font-black">
                    {getPortalStats(portal).activeProperties}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Última Sincronização
                  </span>
                  <span className="font-medium">
                    {portal.syncStatus?.lastSync
                      ? new Date(portal.syncStatus.lastSync).toLocaleString(
                        "pt-BR",
                      )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status de Saúde</span>
                  <span className="font-medium">
                    {portal.health?.status || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Properties (Probabilidade de Venda) */}
      <div className="glass border-none rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-black tracking-tighter">
              Imóveis Quentes <span className="text-muted-foreground font-medium text-sm ml-2">Chance {'>'} 70%</span>
            </h2>
          </div>
          <Button variant="ghost" size="sm" className="text-primary font-bold">
            Ver Todos <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROPERTIES.slice(0, 3).map((property, idx) => (
            <div key={property.id} className="glass border-none rounded-[2.5rem] p-5 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={property.media[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    alt={property.title} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm tracking-tight truncate">{property.title}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">{property.address.neighborhood}</p>
                  <p className="text-sm font-black text-primary mt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price.amount)}
                  </p>
                </div>
              </div>

              <SaleProbabilityScore 
                propertyId={property.id}
                variant="compact"
                className="w-full bg-white/5"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass border-none rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black tracking-tighter">
            Atividade Recente
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {showLogs ? "Esconder" : "Mostrar"}
          </Button>
        </div>
        {showLogs && (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="glass border-none rounded-xl p-3 border border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {portals.find((p) => p.id === log.portalId)?.icon ||
                          "📄"}
                      </span>
                      <span className="font-medium text-sm">{log.action}</span>
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${log.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : log.status === "ERROR"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.message}{" "}
                      {log.property?.title && ` - ${log.property.title}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs text-muted-foreground">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Portal: {log.portalId}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar portal ou ação..."
            className="pl-12 glass border-none h-12 sm:h-14 rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portals.map((portal) => (
          <div
            key={portal.id}
            className="glass border-none rounded-2xl p-5 group hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getPortalHealthColor(portal.health)}`}
                >
                  <portal.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{portal.name}</h3>
                  <p className="text-xs text-muted-foreground">{portal.type}</p>
                </div>
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-widest ${getPortalStatusColor(portal.status)}`}
              >
                {portal.status}
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Propriedades Ativas
                </span>
                <span className="font-medium">
                  {getPortalStats(portal).activeProperties}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visualizações</span>
                <span className="font-medium">
                  {getPortalStats(portal).totalViews}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leads</span>
                <span className="font-medium">
                  {getPortalStats(portal).totalLeads}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {portal.syncStatus?.lastSync
                    ? new Date(portal.syncStatus.lastSync).toLocaleString(
                      "pt-BR",
                    )
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPortal(portal.id)}
                >
                  <Settings className="w-3 h-3 mr-1.5" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshLogs()}
                >
                  <ActivityIcon className="w-3 h-3 mr-1.5" />
                  Testar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      {/* Health Metrics */}
      <div className="glass border-none rounded-3xl p-6">
        <h2 className="text-xl font-black tracking-tighter mb-4">
          Métricas de Saúde
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass border-none rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <ActivityIcon className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                Uptime
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-400">
              {analytics?.uptime || "99.9%"}
            </p>
          </div>
          <div className="glass border-none rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
                Taxa de Sincronização
              </span>
            </div>
            <p className="text-2xl font-black text-blue-400">
              {analytics?.syncRate || "98.2%"}
            </p>
          </div>
          <div className="glass border-none rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">
                Erros
              </span>
            </div>
            <p className="text-2xl font-black text-yellow-400">
              {analytics?.errorRate || "0.8%"}
            </p>
          </div>
          <div className="glass border-none rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-green-500">
                Cobertura
              </span>
            </div>
            <p className="text-2xl font-black text-green-400">
              {analytics?.coverage || "92.5%"}
            </p>
          </div>
        </div>
      </div>

      <div className="glass border-none rounded-3xl p-6">
        <h2 className="text-xl font-black tracking-tighter mb-4">
          Velocidade de Processamento (Sinc)
        </h2>
        <div className="h-64 rounded-xl p-4 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { time: "00:00", val: 400 },
                { time: "04:00", val: 300 },
                { time: "08:00", val: 600 },
                { time: "12:00", val: 800 },
                { time: "16:00", val: 500 },
                { time: "20:00", val: 700 },
                { time: "23:59", val: 900 },
              ]}
            >
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="glass border-none rounded-3xl p-6">
        <h2 className="text-xl font-black tracking-tighter mb-4">
          Alertas e Notificações
        </h2>
        <div className="space-y-3">
          <div className="glass border-none rounded-xl p-4 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Portais com Erros
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Verifique os logs para portais com status de erro
                </p>
              </div>
            </div>
          </div>
          <div className="glass border-none rounded-xl p-4 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-700">
                  Sincronização Pendente
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Portais com sincronizações agendadas para o dia
                </p>
              </div>
            </div>
          </div>
          <div className="glass border-none rounded-xl p-4 border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">
                  Sincronização Sucesso
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Todas as operações de hoje foram bem-sucedidas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6">
      <FinancialDashboard />
      <div className="mt-12">
        <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Split Inteligente ImobPay
        </h2>
        <AutomaticSplitDashboard data={analytics?.finance || { stats: [], recentInvoices: [] }} />

      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight">Gestão de Contratos</h2>
        <Button className="rounded-2xl font-bold">
          <FileText className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>
      <ContractListComponent contracts={MOCK_CONTRACTS} columns={CONTRACT_COLUMNS} />

    </div>
  );

  const renderProofOfLife = () => (
    <div className="space-y-6">
      <div className="glass border-none rounded-3xl p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter">Garantia de Vida AI</h2>
              <p className="text-blue-200 text-sm">Anti-fraude e Verificação de Status Ativos</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Verificados de Hoje</p>
              <p className="text-3xl font-black">24</p>
              <div className="h-1 w-full bg-blue-500/30 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-blue-500 w-[80%]" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5">
              <p className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-1">Aguardando Resposta</p>
              <p className="text-3xl font-black">7</p>
              <div className="h-1 w-full bg-yellow-500/30 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-yellow-500 w-[30%]" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5">
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Alertas de Fraude</p>
              <p className="text-3xl font-black">0</p>
              <div className="h-1 w-full bg-emerald-500/30 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 w-0" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>
      
      <div className="glass border-none rounded-3xl p-6">
        <h3 className="text-lg font-black mb-4">Monitoramento em Tempo Real</h3>
        <p className="text-muted-foreground text-sm mb-6">Lista de imóveis em ciclo de verificação ativa via WhatsApp.</p>
        <div className="space-y-3">
          {MOCK_PROPERTIES.slice(0, 5).map((property, i) => (
            <div key={property.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden shadow-inner">
                  <img src={property.media[0]?.url || `https://images.unsplash.com/photo-1512917${i}774080-9991f1c4c750`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="font-bold text-sm tracking-tight">{property.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Última prova: {i === 0 ? "Agora" : `${i * 2}h atrás`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Status Ativo</p>
                  <p className="text-xs font-black text-emerald-500">CONFIRMADO</p>
                </div>
                <Badge className={cn(
                  "border-none font-black text-[10px] px-3 py-1 rounded-full",
                  i === 2 ? "bg-yellow-500/10 text-yellow-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  {i === 2 ? "PENDENTE" : "VERIFICADO"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PredictiveTimeline data={SALES_PROB_DATA} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceRecommendationCard recommendation={PRICE_REC_DATA} />
            <HealthScoreCard scoreData={HEALTH_SCORE_DATA} />
          </div>

        </div>
        <div className="space-y-6">
          <div className="glass border-none rounded-3xl p-6 bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-black">IA Strategist</h3>
            </div>
            <p className="text-sm text-balance">
              "Baseado nos dados da última semana, notei que o **Itaim Bibi** está com alta demanda mas seu estoque lá diminuiu 15%. Recomendo focar captação nesta região."
            </p>
            <Button className="w-full mt-4 rounded-xl text-xs font-bold" variant="outline">Ver Análise Completa</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFranchise = () => (
    <div className="space-y-6">
      <FranchiseDashboard franchises={MOCK_FRANCHISES} />

    </div>
  );

  const renderMarketplace = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Marketplace de Oportunidades</h2>
          <p className="text-muted-foreground text-sm">Colaboração e troca de leads entre parceiros da rede.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold text-xs">Meus Anúncios</Button>
          <Button className="rounded-xl font-bold text-xs text-white">Criar Oferta</Button>
        </div>
      </div>
      <MarketplaceGrid />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Home className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-black tracking-tighter">
                Dashboard de Gestão de Integrações
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {user?.name || "Usuário"} - {organization?.name}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "glass text-gray-600 hover:text-gray-900"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "finance" && renderFinance()}
        {activeTab === "contracts" && renderContracts()}
        {activeTab === "proof-of-life" && renderProofOfLife()}
        {activeTab === "insights" && renderInsights()}
        {activeTab === "franchise" && renderFranchise()}
        {activeTab === "marketplace" && renderMarketplace()}
        {activeTab === "integrations" && renderIntegrations()}
        {activeTab === "monitoring" && renderMonitoring()}
        {activeTab === "alerts" && renderAlerts()}
      </div>
    </div>
  );
}
