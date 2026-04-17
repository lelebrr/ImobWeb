'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Facebook,
  Instagram,
  SmartphoneNfc,
  Cpu,
  Sparkles,
  Laptop,
  ArrowRight,
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
  Mail,
  Shield,
  BarChart3,
  Webhook,
  Database,
  Zap,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { cn } from '@/lib/responsive/tailwind-utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/design-system/label'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  category: 'communication' | 'portals' | 'automation' | 'analytics' | 'security'
  status: 'connected' | 'disconnected' | 'error'
  premium: boolean
  lastSync?: string
  stats?: { label: string; value: string }
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'whatsapp-ai',
    name: 'WhatsApp IA',
    description: 'Atendimento automático inteligente para seus leads 24/7 com IA conversacional.',
    icon: MessageSquare,
    category: 'communication',
    status: 'connected',
    premium: false,
    lastSync: '2 min atrás',
    stats: { label: 'Mensagens Hoje', value: '142' }
  },
  {
    id: 'zapimóveis',
    name: 'ZapImóveis',
    description: 'Integração com o maior portal imobiliário do Brasil. Sincronização automática de anúncios.',
    icon: Globe,
    category: 'portals',
    status: 'connected',
    premium: false,
    lastSync: '15 min atrás',
    stats: { label: 'Anúncios Ativos', value: '32' }
  },
  {
    id: 'vivareal',
    name: 'Viva Real',
    description: 'Publique seus imóveis automaticamente no Viva Real com fotos otimizadas.',
    icon: Globe,
    category: 'portals',
    status: 'connected',
    premium: false,
    lastSync: '20 min atrás',
    stats: { label: 'Views Semana', value: '1.2k' }
  },
  {
    id: 'olx',
    name: 'OLX Imóveis',
    description: 'Alcance milhões de compradores com integração direta ao OLX.',
    icon: Globe,
    category: 'portals',
    status: 'disconnected',
    premium: false,
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing (Resend)',
    description: 'Automação de emails transacionais e sequências de nutrição de leads.',
    icon: Mail,
    category: 'communication',
    status: 'connected',
    premium: false,
    lastSync: '1h atrás',
    stats: { label: 'Enviados Mês', value: '847' }
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Gestão de assinaturas, cobrança recorrente e pagamentos de comissão.',
    icon: Shield,
    category: 'automation',
    status: 'connected',
    premium: true,
    lastSync: '5 min atrás',
    stats: { label: 'Receita Mês', value: 'R$ 24.5k' }
  },
  {
    id: 'posthog',
    name: 'PostHog Analytics',
    description: 'Product analytics avançado com funis de conversão e heatmaps.',
    icon: BarChart3,
    category: 'analytics',
    status: 'connected',
    premium: false,
    lastSync: 'Real-time',
    stats: { label: 'Eventos Hoje', value: '3.4k' }
  },
  {
    id: 'webhooks',
    name: 'Webhooks Customizados',
    description: 'Receba notificações em tempo real sobre eventos da plataforma.',
    icon: Webhook,
    category: 'automation',
    status: 'disconnected',
    premium: true,
  },
  {
    id: 'supabase',
    name: 'Supabase Auth & DB',
    description: 'Autenticação segura e banco de dados em tempo real para seus dados.',
    icon: Database,
    category: 'security',
    status: 'connected',
    premium: false,
    lastSync: 'Real-time',
    stats: { label: 'Usuários Ativos', value: '156' }
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Conecte a imobWeb com mais de 5.000 apps e automatize fluxos de trabalho.',
    icon: Zap,
    category: 'automation',
    status: 'disconnected',
    premium: true,
  },
  {
    id: 'mobile-push',
    name: 'Notificações Push',
    description: 'Envie alertas instantâneos para o app mobile dos corretores.',
    icon: Smartphone,
    category: 'communication',
    status: 'connected',
    premium: false,
    lastSync: 'Automático',
    stats: { label: 'Enviadas Hoje', value: '67' }
  },
  {
    id: 'facebook',
    name: 'Facebook Pixel & Ads',
    description: 'Rastreie conversões e otimize suas campanhas de tráfego pago para imóveis.',
    icon: Facebook,
    category: 'communication',
    status: 'disconnected',
    premium: false,
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    description: 'Integre mensagens diretas e automação de comentários para seus posts.',
    icon: Instagram,
    category: 'communication',
    status: 'disconnected',
    premium: false,
  },
  {
    id: 'sms-gateway',
    name: 'Portal SMS',
    description: 'Envio de alertas por SMS para leads e notificações críticas de sistema.',
    icon: SmartphoneNfc,
    category: 'communication',
    status: 'disconnected',
    premium: true,
  },
  {
    id: 'website-integration',
    name: 'Meu Website',
    description: 'Conecte seu site próprio para captura automática de leads e tracking.',
    icon: Laptop,
    category: 'communication',
    status: 'disconnected',
    premium: false,
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini Pro',
    description: 'Processamento de linguagem natural ultra-rápido para análise de documentos.',
    icon: Sparkles,
    category: 'automation',
    status: 'disconnected',
    premium: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    description: 'Raciocínio lógico avançado e extração de dados técnicos de contratos.',
    icon: Cpu,
    category: 'automation',
    status: 'disconnected',
    premium: true,
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    description: 'Motor de IA para geração de descrições, sugestão de preços e chat inteligente.',
    icon: Zap,
    category: 'automation',
    status: 'connected',
    premium: true,
    lastSync: 'Sob demanda',
    stats: { label: 'Tokens Mês', value: '256k' }
  },
]

const CATEGORIES = [
  { id: 'all', label: 'Todas', count: INTEGRATIONS.length },
  { id: 'communication', label: 'Comunicação', count: INTEGRATIONS.filter(i => i.category === 'communication').length },
  { id: 'portals', label: 'Portais', count: INTEGRATIONS.filter(i => i.category === 'portals').length },
  { id: 'automation', label: 'Automação', count: INTEGRATIONS.filter(i => i.category === 'automation').length },
  { id: 'analytics', label: 'Analytics', count: INTEGRATIONS.filter(i => i.category === 'analytics').length },
  { id: 'security', label: 'Segurança', count: INTEGRATIONS.filter(i => i.category === 'security').length },
]

export default function IntegrationsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS)
  const [loading, setLoading] = useState(true)
  const [configOpen, setConfigOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations/status')
      const data = await res.json()

      if (data.integrations) {
        setIntegrations(prev => prev.map(integration => ({
          ...integration,
          status: data.integrations[integration.id]?.status || integration.status,
          config: data.integrations[integration.id]?.config
        })))
      }
    } catch (err) {
      console.error('Failed to fetch integrations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'connected' ? 'disconnected' : 'connected'

    try {
      const res = await fetch('/api/integrations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: id, status: newStatus })
      })

      if (res.ok) {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
        toast.success(`Integração ${newStatus === 'connected' ? 'conectada' : 'desconectada'} com sucesso!`)
      }
    } catch (err) {
      toast.error('Erro ao atualizar status da integração.')
    }
  }

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || i.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const totalCount = integrations.length

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">Automações & Integrações</h1>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
              {connectedCount}/{totalCount} Ativas
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium text-sm">Conecte seus portais, automações e ferramentas de IA para escalar suas vendas.</p>
        </div>
        <Button variant="outline" className="glass border-none w-full sm:w-auto">
          <Settings className="w-4 h-4 mr-2" /> Gerenciar API Keys
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass border-none rounded-3xl p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Integrações Ativas</p>
          <p className="text-2xl font-black text-emerald-400">{connectedCount}</p>
        </div>
        <div className="glass border-none rounded-3xl p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Eventos Hoje</p>
          <p className="text-2xl font-black text-primary">3.847</p>
        </div>
        <div className="glass border-none rounded-3xl p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Uptime</p>
          <p className="text-2xl font-black text-emerald-400">99.9%</p>
        </div>
        <div className="glass border-none rounded-3xl p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Última Sync</p>
          <p className="text-2xl font-black">2 min</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar integração..."
            className="pl-12 glass border-none h-12 sm:h-14 rounded-2xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shrink-0",
                activeCategory === cat.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "glass border-none text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredIntegrations.map((integration, idx) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <IntegrationCard
              integration={integration}
              onConfigure={() => {
                setSelectedIntegration(integration)
                setConfigOpen(true)
              }}
              onToggle={() => handleToggleStatus(integration.id, integration.status)}
            />
          </motion.div>
        ))}
      </div>

      <ConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        integration={selectedIntegration}
        onSave={() => {
          fetchIntegrations()
          setConfigOpen(false)
        }}
      />

      {filteredIntegrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-black tracking-tighter">Nenhuma integração encontrada</h3>
          <p className="text-muted-foreground text-sm mt-1">Tente buscar com outros termos.</p>
        </div>
      )}
    </div>
  )
}

function IntegrationCard({
  integration,
  onConfigure,
  onToggle
}: {
  integration: Integration,
  onConfigure: () => void,
  onToggle: () => void
}) {
  const Icon = integration.icon
  const statusConfig = {
    connected: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Conectado', icon: CheckCircle2 },
    disconnected: { color: 'text-slate-400', bg: 'bg-slate-400/10', label: 'Desconectado', icon: Power },
    error: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Erro', icon: AlertTriangle },
  }
  const status = statusConfig[integration.status]
  const StatusIcon = status.icon

  return (
    <div className="glass border-none rounded-[2rem] p-5 sm:p-6 group hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", status.bg)}>
            <Icon className={cn("w-6 h-6", integration.status === 'connected' ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm truncate">{integration.name}</h3>
              {integration.premium && (
                <Badge className="bg-amber-500/20 text-amber-400 border-none text-[8px] font-black uppercase px-1.5 py-0 shrink-0">PRO</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <StatusIcon className={cn("w-3 h-3", status.color)} />
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", status.color)}>{status.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-2 flex-1">{integration.description}</p>

      {/* Stats */}
      {integration.stats && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{integration.stats.label}</span>
          <span className="text-sm font-black text-foreground">{integration.stats.value}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        {integration.lastSync && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            <span className="text-[10px] font-medium">{integration.lastSync}</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {integration.status === 'connected' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onConfigure}
              className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5"
            >
              <Settings className="w-3 h-3 mr-1.5" />
            </Button>
          )}
          <Button
            variant={integration.status === 'connected' ? 'ghost' : 'default'}
            size="sm"
            onClick={onToggle}
            className={cn(
              "h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest",
              integration.status === 'connected'
                ? "hover:bg-white/5"
                : "shadow-lg shadow-primary/20"
            )}
          >
            {integration.status === 'connected' ? (
              <><Power className="w-3 h-3 mr-1.5" /> Desconectar</>
            ) : (
              <><ArrowRight className="w-3 h-3 mr-1.5" /> Conectar</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConfigDialog({
  open,
  onOpenChange,
  integration,
  onSave
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  integration: Integration | null,
  onSave: () => void
}) {
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!integration) return
    setLoading(true)

    try {
      const res = await fetch('/api/integrations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: integration.id,
          status: 'connected',
          settings: { apiKey, provider }
        })
      })

      if (res.ok) {
        toast.success('Configurações salvas e integração conectada!')
        onSave()
      }
    } catch (err) {
      toast.error('Erro ao salvar configurações.')
    } finally {
      setLoading(false)
    }
  }

  if (!integration) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-none sm:max-w-[425px] rounded-[2rem] p-6">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <integration.icon className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tighter">Configurar {integration.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
            Preencha as informações necessárias para ativar esta integração no seu dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {integration.id.includes('sms') && (
            <div className="grid gap-2">
              <Label htmlFor="provider" className="text-[10px] font-black uppercase tracking-widest ml-1">Provedor</Label>
              <Input
                id="provider"
                placeholder="Ex: Twilio, TotalVoice..."
                className="glass border-none rounded-xl"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="apiKey" className="text-[10px] font-black uppercase tracking-widest ml-1">
              {integration.id.includes('facebook') || integration.id.includes('instagram') ? 'Token de Acesso / Script ID' : 'Chave de API (API Key)'}
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="••••••••••••••••"
              className="glass border-none rounded-xl"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <p className="text-[10px] text-muted-foreground leading-tight italic">
            * Seus dados são criptografados e armazenados com segurança máxima.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full h-12 rounded-2xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Salvar e Ativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
