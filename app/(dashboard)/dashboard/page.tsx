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
  Navigation
} from "lucide-react";
import { SaleProbabilityScore } from "@/components/properties/SaleProbabilityScore";
import { SaleProbabilityScore as SaleProbabilityType } from "@/types/ai";
import { MOCK_PROPERTIES } from "@/lib/data/mock-properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/responsive/tailwind-utils";
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

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: BarChart3 },
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
          <Button variant="outline" size="sm" onClick={() => refreshLogs()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
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

      {/* Performance Chart */}
      <div className="glass border-none rounded-3xl p-6">
        <h2 className="text-xl font-black tracking-tighter mb-4">
          Desempenho de Sincronização
        </h2>
        <div className="h-64 bg-white/5 rounded-xl p-4">
          <p className="text-center text-gray-400">
            Gráfico de desempenho a ser implementado
          </p>
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
        {activeTab === "integrations" && renderIntegrations()}
        {activeTab === "monitoring" && renderMonitoring()}
        {activeTab === "alerts" && renderAlerts()}
      </div>
    </div>
  );
}
