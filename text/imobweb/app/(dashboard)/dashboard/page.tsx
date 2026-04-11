'use client'

import { useEffect, useState } from 'react'
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

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Simulação de carregamento
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-10 w-48 bg-secondary rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary rounded-2xl" />)}
        </div>
        <div className="h-64 bg-secondary rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
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
          value="47" 
          icon={Home}
          color="blue"
          change={{ value: "12%", positive: true }}
          description="8 novos esta semana"
        />
        <StatsCard 
          title="Leads Novos" 
          value="156" 
          icon={Users}
          color="purple"
          change={{ value: "24%", positive: true }}
          description="Média de 22 por dia"
        />
        <StatsCard 
          title="Mensagens" 
          value="89" 
          icon={MessageSquare}
          color="green"
          change={{ value: "5%", positive: false }}
          description="12 aguardando resposta"
        />
        <StatsCard 
          title="Vendas" 
          value="R$ 4.2M" 
          icon={TrendingUp}
          color="amber"
          change={{ value: "8%", positive: true }}
          description="Meta de R$ 5M próxima"
        />
      </div>

      {/* Main Grid: Alerts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Important Alerts */}
        <Card className="glass lg:col-span-2 border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertas Críticos
            </CardTitle>
            <CardDescription>Ações que requerem sua atenção imediata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 group hover:bg-amber-500/15 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-100">Imóveis Desatualizados</p>
                  <p className="text-sm text-amber-700/80 dark:text-amber-300/80 font-medium">5 imóveis sem atualização há mais de 30 dias.</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="hover:bg-amber-500/20">Revisar</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 group hover:bg-blue-500/15 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-100">Sincronização de Portais</p>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80 font-medium">VivaReal reportou erro em 2 anúncios exclusivas.</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="hover:bg-blue-500/20">Corrigir</Button>
            </div>
          </CardContent>
        </Card>

        {/* System Integration Health */}
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Saúde das integrações diretas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>WhatsApp API</span>
                <span className="text-emerald-500">Conectado</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[95%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Portais XML</span>
                <span className="text-emerald-500">98% Sincro</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[98%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>IA Engine</span>
                <span className="text-amber-500">Processando</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[100%] animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Imóveis Recentes</CardTitle>
            <Button variant="link" onClick={() => router.push('/properties')}>Ver todos</Button>
          </CardHeader>
          <CardContent className="space-y-4">
             {[
               { id: 1, title: 'Apartamento Brooklin', price: 'R$ 850k', status: 'Disponível', views: 234 },
               { id: 2, title: 'Casa Jardins com Piscina', price: 'R$ 2.5M', status: 'Vendido', views: 567 },
               { id: 3, title: 'Cobertura Vila Madalena', price: 'R$ 3.2M', status: 'Disponível', views: 445 }
             ].map((item) => (
               <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-muted-foreground">IMG</div>
                    <div>
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-xs text-primary font-black uppercase">{item.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.status === 'Vendido' ? 'secondary' : 'default'} className="mb-1">{item.status}</Badge>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1"><Eye className="w-3 h-3" /> {item.views}</p>
                  </div>
               </div>
             ))}
          </CardContent>
        </Card>

        <Card className="glass border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Novos Leads</CardTitle>
            <Button variant="link" onClick={() => router.push('/leads')}>Ver todos</Button>
          </CardHeader>
          <CardContent className="space-y-4">
             {[
               { id: 1, name: 'Carlos Silva', source: 'Zap Imóveis', time: 'Há 5m' },
               { id: 2, name: 'Ana Oliveira', source: 'Website', time: 'Há 12m' },
               { id: 3, name: 'Roberto Santos', source: 'WhatsApp', time: 'Há 1h' }
             ].map((item) => (
               <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center font-bold text-primary">{item.name[0]}</div>
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">{item.source}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-bold">{item.time}</p>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] font-black uppercase">Atender</Button>
                  </div>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
