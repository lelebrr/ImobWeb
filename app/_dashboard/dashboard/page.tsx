'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Plus,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Globe,
  MapPin,
  Mail,
  Share2,
  Eye,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/design-system/card'
import { Badge } from '@/components/design-system/badge'
import { StatsCard } from '@/components/dashboard/stats-card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getDashboardStats, getDashboardLeads, getDashboardProperties } from '@/app/actions/dashboard'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { analytics } from '@/lib/analytics/posthog'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalLeads: 0, totalProperties: 0, activeProperties: 0 })
  const [recentLeads, setRecentLeads] = useState<any[]>([])
  const [recentProperties, setRecentProperties] = useState<any[]>([])

  // Tracking e Simulação de carregamento
  useEffect(() => {
    analytics.capture('view_dashboard')
    async function load() {
       try {
         const [st, ld, pr] = await Promise.all([
           getDashboardStats(),
           getDashboardLeads(),
           getDashboardProperties()
         ])
         setStats(st)
         setRecentLeads(ld.slice(0, 3))
         setRecentProperties(pr.slice(0, 3))
       } finally {
         setLoading(false)
       }
    }
    load()
  }, [])
  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-10 w-48 bg-secondary rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary rounded-2xl" />)}
        </div>
        <div className="h-96 bg-secondary rounded-2xl" />
      </div>
    )
  }

  // Derived stats handled in state now

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Resumo do Dia</h1>
          <p className="text-muted-foreground font-medium">Bem-vindo de volta, aqui estão as métricas da sua imobiliária.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/properties/new')} className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Novo Imóvel
          </Button>
          <Button variant="outline" className="glass bg-white/5">
            <Zap className="w-4 h-4 mr-2 text-amber-500" /> IA Co-pilot
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Imóveis Ativos"
          value={stats.activeProperties.toString()}
          icon={Home}
          color="blue"
          change={{ value: "15%", positive: true }}
          description="Foco em captação comercial"
        />
        <StatsCard
          title="Leads Novos"
          value={stats.totalLeads.toString()}
          icon={Users}
          color="purple"
          change={{ value: "42%", positive: true }}
          description="Campanhas Ads ativas"
        />
        <StatsCard
          title="Taxa de Resp."
          value="94%"
          icon={CheckCircle2}
          color="green"
          change={{ value: "2%", positive: true }}
          description="IA atendendo 24/7"
        />
        <StatsCard
          title="Vendas"
          value="R$ 14.2M"
          icon={TrendingUp}
          color="amber"
          change={{ value: "12%", positive: true }}
          description="Propostas em aberto"
        />
      </div>

      {/* Main Grid: Funnel and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Funnel Visual */}
        <Card className="glass lg:col-span-2 border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={120} className="text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary fill-primary" /> Funil de Conversão (Real-time)
            </CardTitle>
            <CardDescription className="font-medium">Acompanhe a jornada dos seus leads através do pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Novos Contatos', value: stats.totalLeads, color: 'bg-primary' },
                { label: 'Interessados', value: Math.floor(stats.totalLeads * 0.4), color: 'bg-indigo-500' },
                { label: 'Visitas Agendadas', value: Math.floor(stats.totalLeads * 0.15), color: 'bg-purple-500' },
                { label: 'Propostas', value: Math.floor(stats.totalLeads * 0.05), color: 'bg-emerald-500' }
              ].map((step, idx) => (
                <div key={step.label} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">{step.label}</span>
                    <span className="text-sm font-bold">{step.value}</span>
                  </div>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: (stats?.totalLeads || 0) > 0 ? `${(step.value / (stats?.totalLeads || 0)) * 100}%` : '0%' }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full ${step.color} shadow-lg shadow-indigo-500/20`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Taxa de Conversão</p>
                <p className="text-2xl font-black text-emerald-400">12.5%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Ticket Médio</p>
                <p className="text-2xl font-black text-indigo-400">R$ 2.4M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health / News */}
        <div className="space-y-8">
          <Card className="glass border-none h-full">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tighter">Saúde do Ecossistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>Sincronização Portais</span>
                  <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> 100% OK</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>WhatsApp Agent IA</span>
                  <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> Ativo</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[98%]" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-bold text-amber-500 flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} /> Alerta de Performance
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                  Seu portal ZapImóveis está com o feed XML lento. Recomenda-se atualizar manualmente os destaques.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activities Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties List */}
        <Card className="glass border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black tracking-tighter">Imóveis Recém-adicionados</CardTitle>
              <CardDescription className="font-medium">Últimas captações na sua carteira</CardDescription>
            </div>
            <Link href="/properties">
              <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/10">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {(recentProperties || []).map((property) => (
              <div key={property.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-xl">
                    <img src={property.media[0]?.url} alt={property.title} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight line-clamp-1">{property.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-primary uppercase">{property.price?.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'Consulte'}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">•</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{property.address?.neighborhood || 'Bairro'}</span>
                    </div>
                  </div>
                </div>
                <Link href={`/properties/${property.slug}`}>
                  <Button size="icon" variant="ghost" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={18} />
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Leads List */}
        <Card className="glass border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black tracking-tighter">Novos Leads</CardTitle>
              <CardDescription className="font-medium">Oportunidades recentes aguardando atenção</CardDescription>
            </div>
            <Link href="/leads">
              <Button variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest text-primary hover:bg-primary/10">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {(recentLeads || []).map((lead) => (
              <div key={lead.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {lead.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">{lead.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                      <span className="text-[10px] font-bold">{lead.source}</span>
                      <span className="text-[10px] font-bold">•</span>
                      <span className="text-[10px] font-bold">
                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest glass border-none text-primary">
                    {lead.status}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all rounded-lg">Atender</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
