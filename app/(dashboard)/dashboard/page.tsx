"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  Navigation,
  FileText,
  ShieldCheck,
  Brain,
  Store,
  ShoppingBag,
  Heart,
  Calendar,
  Building2,
  CreditCard,
  LogOut
} from "lucide-react";
import { SaleProbabilityScore } from "@/components/properties/SaleProbabilityScore";
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

// Dashboard sub-components
import FinancialDashboard from "@/components/finance/FinancialDashboard";
import AutomaticSplitDashboard from "@/components/finance/AutomaticSplitDashboard";
import ContractListComponent from "@/components/contracts/ContractListComponent";
import FranchiseDashboard from "@/components/franchise/FranchiseDashboard";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { HealthScoreCard } from "@/components/insights/HealthScoreCard";
import { PredictiveTimeline } from "@/components/insights/PredictiveTimeline";
import { PriceRecommendationCard } from "@/components/insights/PriceRecommendationCard";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { type: "spring" as const, stiffness: 400, damping: 25 } }
};

// Skeleton components
function StatCardSkeleton() {
  return (
    <div className="glass border-none rounded-3xl p-4 sm:p-5 animate-pulse">
      <div className="h-3 w-24 bg-muted rounded-full mb-3" />
      <div className="h-8 w-16 bg-muted rounded-full" />
    </div>
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="glass border-none rounded-[2.5rem] p-5 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded-full" />
          <div className="h-3 w-1/2 bg-muted rounded-full" />
          <div className="h-4 w-1/3 bg-muted rounded-full" />
        </div>
      </div>
      <div className="h-8 bg-muted rounded-full" />
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass border-none rounded-xl p-3 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded-full" />
              <div className="h-3 w-2/3 bg-muted rounded-full" />
            </div>
            <div className="h-3 w-16 bg-muted rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Animated stat card
function AnimatedStatCard({ label, value, color, icon: Icon, delay = 0 }: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="glass border-none rounded-3xl p-4 sm:p-5 group cursor-default"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity", `bg-${color}/10`)}>
          <Icon className={cn("w-4 h-4", `text-${color}`)} />
        </div>
      </div>
      <p className={cn("text-2xl font-black", `text-${color}`)}>
        {value}
      </p>
    </motion.div>
  );
}

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Real data state
  const [properties, setProperties] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch real data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [propsRes, leadsRes, notifRes] = await Promise.allSettled([
          fetch('/api/properties').then(r => r.ok ? r.json() : []),
          fetch('/api/leads').then(r => r.ok ? r.json() : []),
          fetch('/api/notifications').then(r => r.ok ? r.json() : []),
        ]);

        if (propsRes.status === 'fulfilled') {
          const props = Array.isArray(propsRes.value) ? propsRes.value : (propsRes.value?.properties || []);
          setProperties(props.slice(0, 10));
        }
        if (leadsRes.status === 'fulfilled') {
          const lds = Array.isArray(leadsRes.value) ? leadsRes.value : (leadsRes.value?.leads || []);
          setLeads(lds);
        }
        if (notifRes.status === 'fulfilled') {
          const notifs = Array.isArray(notifRes.value) ? notifRes.value : (notifRes.value?.notifications || []);
          setNotifications(notifs.slice(0, 5));
        }
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

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
    { id: "overview", label: "VisÃ£o Geral", icon: BarChart3 },
    { id: "finance", label: "ImobPay", icon: DollarSign },
    { id: "contracts", label: "Contratos", icon: FileText },
    { id: "proof-of-life", label: "Garantia de Vida", icon: ShieldCheck },
    { id: "insights", label: "Insights AI", icon: Brain },
    { id: "franchise", label: "Franquias", icon: Store },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "integrations", label: "IntegraÃ§Ãµes", icon: Database },
    { id: "monitoring", label: "Monitoramento", icon: Activity },
    { id: "alerts", label: "Alertas", icon: AlertCircle },
  ];

  const getPortalStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-emerald-500/10 text-emerald-500";
      case "disconnected": return "bg-slate-400/10 text-slate-400";
      case "error": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-400/10 text-gray-400";
    }
  };

  const getPortalHealthColor = (health: any) => {
    if (!health) return "bg-gray-400/10 text-gray-400";
    if (health.status === "healthy") return "bg-emerald-500/10 text-emerald-500";
    if (health.status === "warning") return "bg-yellow-500/10 text-yellow-500";
    if (health.status === "error") return "bg-red-500/10 text-red-500";
    return "bg-gray-400/10 text-gray-400";
  };

  const getPortalStats = (portal: any) => ({
    totalProperties: portal.stats?.totalProperties || 0,
    activeProperties: portal.stats?.activeProperties || 0,
    totalViews: portal.stats?.totalViews || 0,
    totalLeads: portal.stats?.totalLeads || 0,
    lastSync: portal.syncStatus?.lastSync || null,
    nextSync: portal.syncStatus?.nextSync || null,
    isSyncing: portal.syncStatus?.isSyncing || false,
  });

  const getPortalFeatures = (portal: any) => portal.features || [];
  const getPortalDocumentation = (portal: any) => portal.documentation || {};

  // Hot properties: filter from real data, prioritize high-lead ones
  const hotProperties = properties
    .filter(p => p.status === 'ACTIVE' || p.status === 'DISPONIVEL')
    .slice(0, 3);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrÃ¡s`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrÃ¡s`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrÃ¡s`;
  };

  const renderOverview = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Field Mode Quick Access - Mobile Optimized */}
      <motion.div variants={itemVariants} className="lg:hidden">
        <Link href="/field">
          <div className="glass bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group active:scale-95 transition-all">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <Navigation className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter text-white">Modo Corretor em Campo</h3>
                  <p className="text-blue-200 text-sm">GPS, Voz e CÃ¢mera IA ativados</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-blue-400" />
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          </div>
        </Link>
      </motion.div>

      {/* Stats Cards - Animated */}
      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedStatCard
            label="Portais Ativos"
            value={portals.filter((p) => p.status === "connected").length}
            color="emerald-400"
            icon={Globe}
          />
          <AnimatedStatCard
            label="Propriedades"
            value={analytics?.overview?.totalPropertiesSynced || properties.length || 0}
            color="primary"
            icon={Home}
          />
          <AnimatedStatCard
            label="Leads Hoje"
            value={analytics?.overview?.todayLeads || leads.filter(l => {
              const today = new Date().toDateString();
              return new Date(l.createdAt).toDateString() === today;
            }).length || 0}
            color="primary"
            icon={Users}
          />
          <AnimatedStatCard
            label="VisualizaÃ§Ãµes"
            value={analytics?.overview?.todayViews || 0}
            color="emerald-400"
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Health Overview */}
      <motion.div variants={itemVariants} className="glass border-none rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black tracking-tighter">Status de SaÃºde</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingData ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="glass border-none rounded-2xl p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-muted rounded-full" />
                      <div className="h-3 w-16 bg-muted rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded-full" />
                  <div className="h-3 w-3/4 bg-muted rounded-full" />
                </div>
              </div>
            ))
          ) : (
            portals.map((portal, idx) => (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass border-none rounded-2xl p-4 cursor-default"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getPortalHealthColor(portal.health)}`}>
                      <portal.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{portal.name}</h3>
                      <p className="text-xs text-muted-foreground">{portal.type}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${getPortalStatusColor(portal.status)}`}>
                    {portal.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Propriedades Ativas</span>
                    <span className="font-black">{getPortalStats(portal).activeProperties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ãšltima SincronizaÃ§Ã£o</span>
                    <span className="font-medium">
                      {portal.syncStatus?.lastSync
                        ? new Date(portal.syncStatus.lastSync).toLocaleString("pt-BR")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status de SaÃºde</span>
                    <span className="font-medium">{portal.health?.status || "N/A"}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Hot Properties (Probabilidade de Venda) */}
      <motion.div variants={itemVariants} className="glass border-none rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-black tracking-tighter">
              ImÃ³veis Quentes <span className="text-muted-foreground font-medium text-sm ml-2">Chance {'>'} 70%</span>
            </h2>
          </div>
          <Link href="/properties">
            <Button variant="ghost" size="sm" className="text-primary font-bold">
              Ver Todos <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : hotProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotProperties.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass border-none rounded-[2.5rem] p-5 relative overflow-hidden group"
              >
                <Link href={`/properties/${property.slug || property.id}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={property.media?.[0]?.url || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        alt={property.title}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm tracking-tight truncate">{property.title}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">
                        {property.address?.neighborhood || property.neighborhood || ''}
                      </p>
                      <p className="text-sm font-black text-primary mt-1">
                        {formatCurrency(property.price?.amount || property.price || 0)}
                      </p>
                    </div>
                  </div>
                </Link>
                <SaleProbabilityScore
                  propertyId={property.id}
                  variant="compact"
                  className="w-full bg-white/5"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum imÃ³vel ativo encontrado</p>
            <Link href="/properties/new">
              <Button className="mt-4" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Adicionar ImÃ³vel
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="glass border-none rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black tracking-tighter">Atividade Recente</h2>
          <Button variant="outline" size="sm" onClick={() => setShowLogs(!showLogs)}>
            {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showLogs ? "Esconder" : "Mostrar"}
          </Button>
        </div>
        <AnimatePresence>
          {showLogs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                {loadingLogs ? (
                  <ActivitySkeleton />
                ) : logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass border-none rounded-xl p-3 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {portals.find((p) => p.id === log.portalId)?.icon || "ðŸ“„"}
                            </span>
                            <span className="font-medium text-sm">{log.action}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              log.status === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400"
                              : log.status === "ERROR" ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {log.message} {log.property?.title && ` - ${log.property.title}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  const renderIntegrations = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar portal ou aÃ§Ã£o..."
            className="pl-12 glass border-none h-12 sm:h-14 rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portals.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((portal, idx) => (
          <motion.div
            key={portal.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass border-none rounded-2xl p-5 group transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getPortalHealthColor(portal.health)}`}>
                  <portal.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{portal.name}</h3>
                  <p className="text-xs text-muted-foreground">{portal.type}</p>
                </div>
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${getPortalStatusColor(portal.status)}`}>
                {portal.status}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Propriedades Ativas</span>
                <span className="font-medium">{getPortalStats(portal).activeProperties}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VisualizaÃ§Ãµes</span>
                <span className="font-medium">{getPortalStats(portal).totalViews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leads</span>
                <span className="font-medium">{getPortalStats(portal).totalLeads}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {portal.syncStatus?.lastSync
                    ? new Date(portal.syncStatus.lastSync).toLocaleString("pt-BR")
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="ghost" size="sm" onClick={() => setSelectedPortal(portal.id)}>
                  <Settings className="w-3 h-3 mr-1.5" /> Configurar
                </Button>
                <Button variant="outline" size="sm" onClick={() => refreshLogs()}>
                  <ActivityIcon className="w-3 h-3 mr-1.5" /> Testar
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderMonitoring = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="glass border-none rounded-3xl p-6">
        <h2 className="text-xl font-black tracking-tighter mb-4">MÃ©tricas de SaÃºde</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Uptime", value: analytics?.uptime || "99.9%", color: "emerald", icon: ActivityIcon },
            { label: "Taxa de SincronizaÃ§Ã£o", value: analytics?.syncRate || "98.2%", color: "blue", icon: TrendingUp },
            { label: "Erros", value: analytics?.errorRate || "0.8%", color: "yellow", icon: AlertCircle },
            { label: "Cobertura", value: analytics?.coverage || "92.5%", color: "green", icon: DollarSign },
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass border-none rounded-xl p-4 cursor-default"
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-5 h-5 text-${metric.color}-500`} />
                <span className={`text-xs font-bold uppercase tracking-widest text-${metric.color}-500`}>
                  {metric.label}
                </span>
              </div>
              <p className={`text-2xl font-black text-${metric.color}-400`}>{metric.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass border-none rounded-3xl p-6">
        <h2 className="text-xl font-black tracking-tighter mb-4">Velocidade de Processamento (Sinc)</h2>
        <div className="h-64 rounded-xl p-4 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { time: "00:00", val: 400 }, { time: "04:00", val: 300 },
              { time: "08:00", val: 600 }, { time: "12:00", val: 800 },
              { time: "16:00", val: 500 }, { time: "20:00", val: 700 },
              { time: "23:59", val: 900 },
            ]}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#60a5fa' }} />
              <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderAlerts = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="glass border-none rounded-3xl p-6">
        <h2 className="text-xl font-black tracking-tighter mb-4">Alertas e NotificaÃ§Ãµes</h2>
        <div className="space-y-3">
          {portals.some(p => p.status === "error") && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass border-none rounded-xl p-4 border-l-4 border-red-500"
            >
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">Portais com Erros</p>
                  <p className="text-xs text-red-600 mt-1">Verifique os logs para portais com status de erro</p>
                </div>
              </div>
            </motion.div>
          )}
          {portals.some(p => (p.syncStatus as any)?.isSyncing || p.syncStatus?.status === 'syncing') && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass border-none rounded-xl p-4 border-l-4 border-yellow-500"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-700">SincronizaÃ§Ã£o Pendente</p>
                  <p className="text-xs text-yellow-600 mt-1">Portais com sincronizaÃ§Ãµes agendadas para o dia</p>
                </div>
              </div>
            </motion.div>
          )}
          {portals.every(p => p.status === "connected") && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass border-none rounded-xl p-4 border-l-4 border-green-500"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700">Tudo Funcionando</p>
                  <p className="text-xs text-green-600 mt-1">Todos os portais estÃ£o conectados e sincronizados</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderFinance = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <FinancialDashboard />
      </motion.div>
      <motion.div variants={itemVariants} className="mt-12">
        <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Split Inteligente ImobPay
        </h2>
        <AutomaticSplitDashboard data={analytics?.finance || { stats: [], recentInvoices: [] }} />
      </motion.div>
    </motion.div>
  );

  const renderContracts = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight">GestÃ£o de Contratos</h2>
        <Link href="/contracts">
          <Button className="rounded-2xl font-bold">
            <FileText className="w-4 h-4 mr-2" /> Novo Contrato
          </Button>
        </Link>
      </motion.div>
      <motion.div variants={itemVariants}>
        {contracts.length > 0 ? (
          <ContractListComponent
            contracts={contracts}
            columns={[
              { accessorKey: "numero" as const, header: "NÂº Contrato" },
              { accessorKey: "cliente" as const, header: "Cliente" },
              { accessorKey: "imovel" as const, header: "ImÃ³vel" },
              { accessorKey: "valor" as const, header: "Valor" },
              { accessorKey: "status" as const, header: "Status" },
            ]}
          />
        ) : (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground text-sm">Crie seu primeiro contrato para comeÃ§ar.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderProofOfLife = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="glass border-none rounded-3xl p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter">Garantia de Vida AI</h2>
              <p className="text-blue-200 text-sm">Anti-fraude e VerificaÃ§Ã£o de Status Ativos</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { label: "Verificados de Hoje", value: "24", progress: "80%", color: "blue" },
              { label: "Aguardando Resposta", value: "7", progress: "30%", color: "yellow" },
              { label: "Alertas de Fraude", value: "0", progress: "0%", color: "emerald" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5 cursor-default"
              >
                <p className={`text-xs font-bold text-${stat.color}-300 uppercase tracking-widest mb-1`}>{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
                <div className={`h-1 w-full bg-${stat.color}-500/30 rounded-full mt-3 overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: stat.progress }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className={`h-full bg-${stat.color}-500`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      <motion.div variants={itemVariants} className="glass border-none rounded-3xl p-6">
        <h3 className="text-lg font-black mb-4">Monitoramento em Tempo Real</h3>
        <p className="text-muted-foreground text-sm mb-6">Lista de imÃ³veis em ciclo de verificaÃ§Ã£o ativa via WhatsApp.</p>
        <div className="space-y-3">
          {properties.slice(0, 5).map((property, idx) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden shadow-inner">
                  <img
                    src={property.media?.[0]?.url || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    alt={property.title}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm tracking-tight">{property.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    Ãšltima prova: {idx === 0 ? "Agora" : `${idx * 2}h atrÃ¡s`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Status Ativo</p>
                  <p className="text-xs font-black text-emerald-500">CONFIRMADO</p>
                </div>
                <Badge className={cn(
                  "border-none font-black text-[10px] px-3 py-1 rounded-full",
                  idx === 2 ? "bg-yellow-500/10 text-yellow-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  {idx === 2 ? "PENDENTE" : "VERIFICADO"}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderInsights = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <PredictiveTimeline data={{
            probability: leads.length > 0 ? 0.75 : 0,
            expectedDays: 21,
            engagementScore: Math.min(95, leads.length * 12)
          }} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceRecommendationCard recommendation={{
              suggestedPrice: properties[0]?.price?.amount || 850000,
              minPrice: (properties[0]?.price?.amount || 850000) * 0.96,
              maxPrice: (properties[0]?.price?.amount || 850000) * 1.05,
              confidence: 0.88,
              marketAverage: (properties[0]?.price?.amount || 850000) * 1.02,
              reasoning: [
                "Alta demanda por 3 dormitÃ³rios na regiÃ£o",
                "Acabamento superior Ã  mÃ©dia local",
                "Proximidade com infraestrutura de transporte"
              ],
              comparablesCount: Math.max(5, properties.length)
            }} />
            <HealthScoreCard scoreData={{
              score: Math.min(95, 60 + properties.length * 3),
              factors: [
                { label: "Qualidade das Fotos", impact: 15, description: "Fotos em HDR aumentam conversÃ£o" },
                { label: "DescriÃ§Ã£o Completa", impact: 10, description: "Meta-tags otimizadas para SEO" },
                { label: "PreÃ§o vs Mercado", impact: -5, description: "Levemente acima da mÃ©dia local" }
              ],
              recommendations: [
                "Adicionar tour virtual 360Â°",
                "Incluir valor do IPTU no cabeÃ§alho"
              ]
            }} />
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="glass border-none rounded-3xl p-6 bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-black">IA Strategist</h3>
            </div>
            <p className="text-sm text-balance">
              {properties.length > 0
                ? `Baseado nos dados da Ãºltima semana, notei que ${properties[0]?.address?.neighborhood || 'sua regiÃ£o'} estÃ¡ com demanda ativa. Recomendo manter preÃ§os competitivos.`
                : "Cadastre seus primeiros imÃ³veis para receber anÃ¡lises inteligentes da IA."
              }
            </p>
            <Link href="/properties">
              <Button className="w-full mt-4 rounded-xl text-xs font-bold" variant="outline">
                {properties.length > 0 ? "Ver AnÃ¡lise Completa" : "Adicionar ImÃ³veis"}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderFranchise = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <FranchiseDashboard franchises={[]} />
      </motion.div>
    </motion.div>
  );

  const renderMarketplace = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Marketplace de Oportunidades</h2>
          <p className="text-muted-foreground text-sm">ColaboraÃ§Ã£o e troca de leads entre parceiros da rede.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold text-xs">Meus AnÃºncios</Button>
          <Button className="rounded-xl font-bold text-xs text-white">Criar Oferta</Button>
        </div>
      </motion.div>
      <motion.div variants={itemVariants}>
        <MarketplaceGrid />
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">Dashboard</h1>
                <p className="text-[10px] text-slate-500 font-medium">GestÃ£o de IntegraÃ§Ãµes</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30"
                    >
                      {notifications.filter(n => !n.read).length}
                    </motion.span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] rounded-2xl shadow-2xl border border-white/5 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">NotificaÃ§Ãµes</h3>
                        {notifications.length > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); handleClearNotifications(); }}
                            className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            Limpar Todas
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhuma notificaÃ§Ã£o</p>
                          </div>
                        ) : (
                          notifications.map((notification, idx) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notification.read ? 'bg-indigo-500/5' : ''}`}
                              onClick={() => { handleMarkAsRead(notification.id); setShowNotifications(false); }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'alert' ? 'bg-red-500' :
                                  notification.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-slate-400'}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                                  <p className="text-xs text-slate-600 mt-2">
                                    {notification.createdAt ? formatRelativeTime(notification.createdAt) : notification.time}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-white">{user?.name || "UsuÃ¡rio"}</p>
                    <p className="text-[10px] text-slate-500">{organization?.name || "OrganizaÃ§Ã£o"}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[#12121a] rounded-2xl shadow-2xl border border-white/5 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
                            {(user?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{user?.name || "UsuÃ¡rio"}</p>
                            <p className="text-[10px] text-slate-500">{organization?.name || "OrganizaÃ§Ã£o"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        {[
                          { href: "/settings/profile", icon: Settings, label: "ConfiguraÃ§Ãµes da Conta" },
                          { href: "/settings/organization", icon: Building2, label: "OrganizaÃ§Ã£o" },
                          { href: "/settings/billing", icon: CreditCard, label: "Faturamento" },
                        ].map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <div className="border-t border-white/5 my-1" />
                        <button
                          onClick={() => { setShowUserMenu(false); toast.success("Saindo..."); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sair</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <User className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-400">
            {user?.name || "UsuÃ¡rio"} - {organization?.name}
          </span>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-hide pb-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
