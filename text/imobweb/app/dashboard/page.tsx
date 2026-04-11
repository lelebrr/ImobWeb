'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Home,
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    Plus,
    Search,
    Filter,
    Bell,
    TrendingUp,
    Target,
    Clock,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Building2,
    Car,
    Briefcase,
    MapPin,
    Phone,
    Mail,
    Zap,
    Shield,
    Lock,
    Globe,
    Share2,
    Eye
} from 'lucide-react'
import { Button } from '@/components/design-system/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/design-system/card'
import { Input } from '@/components/design-system/input'
import { Badge } from '@/components/design-system/badge'
import { useAuth } from '@/providers'
import { useTheme } from '@/providers/theme-provider'

/**
 * Dashboard Principal
 * Página inicial do CRM com métricas principais e ações rápidas
 */
export default function DashboardPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const { theme } = useTheme()
    const [stats, setStats] = useState({
        totalProperties: 0,
        availableProperties: 0,
        leads: 0,
        conversations: 0,
        views: 0,
        conversions: 0,
    })
    const [recentProperties, setRecentProperties] = useState<any[]>([])
    const [recentLeads, setRecentLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            fetchDashboardData()
        }
    }, [authLoading])

    const fetchDashboardData = async () => {
        try {
            // Simulação de dados - em produção, isso viria da API
            setStats({
                totalProperties: 47,
                availableProperties: 23,
                leads: 156,
                conversations: 89,
                views: 12450,
                conversions: 23,
            })
            setRecentProperties([
                { id: '1', title: 'Apartamento 3 Quartos - Brooklin', price: 850000, status: 'DISPONIVEL', views: 234 },
                { id: '2', title: 'Casa com Piscina - Jardins', price: 2500000, status: 'VENDIDO', views: 567 },
                { id: '3', title: 'Cobertura Duplex - Vila Madalena', price: 3200000, status: 'DISPONIVEL', views: 445 },
            ])
            setRecentLeads([
                { id: '1', name: 'Carlos Silva', email: 'carlos@email.com', status: 'NOVO', source: 'PORTAL' },
                { id: '2', name: 'Ana Oliveira', email: 'ana@email.com', status: 'INTERESSADO', source: 'WEBSITE' },
                { id: '3', name: 'Roberto Santos', email: 'roberto@email.com', status: 'CONTATADO', source: 'INDICATION' },
            ])
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            DISPONIVEL: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            VENDIDO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            ALUGADO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            DESATUALIZADO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            RASCUNHO: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
        }
        return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
    }

    const getSourceIcon = (source: string) => {
        const icons: Record<string, any> = {
            PORTAL: <Globe className="w-4 h-4" />,
            WEBSITE: <Building2 className="w-4 h-4" />,
            INDICATION: <Users className="w-4 h-4" />,
            SOCIAL: <Share2 className="w-4 h-4" />,
            PHONE: <Phone className="w-4 h-4" />,
            WALK_IN: <MapPin className="w-4 h-4" />,
        }
        return icons[source] || <Mail className="w-4 h-4" />
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-slate-600 dark:text-slate-400">Carregando dashboard...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">imobWeb</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">CRM Imobiliário Inteligente</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar imóveis, leads..."
                                    className="pl-10 w-64"
                                />
                            </div>

                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                            </Button>

                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.email?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {user?.email || 'Usuário'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Bem-vindo de volta! 👋
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Aqui está o resumo do seu trabalho hoje
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Imóveis
                                    </CardTitle>
                                    <Home className="w-5 h-5 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.totalProperties}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {stats.availableProperties} disponíveis
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Leads
                                    </CardTitle>
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.leads}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <ArrowUpRight className="w-3 h-3" />
                                        +{Math.floor(Math.random() * 10) + 5} esta semana
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Conversas
                                    </CardTitle>
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.conversations}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        12 não respondidas
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Conversões
                                    </CardTitle>
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.conversions}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        +{Math.floor(Math.random() * 5) + 1} esta semana
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions & Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Quick Actions */}
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-600" />
                                    Ações Rápidas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    className="w-full justify-start"
                                    onClick={() => router.push('/properties/new')}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Novo Imóvel
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => router.push('/leads')}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Ver Leads
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => router.push('/conversations')}
                                >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    WhatsApp
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => router.push('/campaigns')}
                                >
                                    <Target className="mr-2 h-4 w-4" />
                                    Campanhas
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Alerts */}
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    Alertas Importantes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-amber-900 dark:text-amber-100">
                                            5 Imóveis desatualizados
                                        </p>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            Alguns imóveis não foram atualizados há mais de 45 dias
                                        </p>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                        Ver
                                    </Button>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-blue-900 dark:text-blue-100">
                                            12 Novos Leads
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            8 leads novos de portais imobiliários
                                        </p>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                        Ver
                                    </Button>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-green-900 dark:text-green-100">
                                            3 Conversões esta semana
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Vendas e aluguéis fechados
                                        </p>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                        Ver
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Properties & Leads */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Properties */}
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Imóveis Recentes</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => router.push('/properties')}>
                                        Ver todos
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentProperties.map((property) => (
                                        <Link
                                            key={property.id}
                                            href={`/properties/${property.id}`}
                                            className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                                        {property.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(property.price)}
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(property.status)}>
                                                    {property.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {property.views} visualizações
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Leads */}
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Leads Recentes</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => router.push('/leads')}>
                                        Ver todos
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentLeads.map((lead) => (
                                        <Link
                                            key={lead.id}
                                            href={`/leads/${lead.id}`}
                                            className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                                        {lead.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        {lead.email}
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(lead.status)}>
                                                    {lead.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                {getSourceIcon(lead.source)}
                                                <span>{lead.source}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Section */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Desempenho do Sistema
                            </CardTitle>
                            <CardDescription>
                                Métricas de sincronização e integrações
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Sincronização com Portais
                                        </span>
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                            98%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Resposta WhatsApp
                                        </span>
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                            95%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Integração IA
                                        </span>
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                            100%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <Link href="/properties">
                            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Home className="w-6 h-6" />
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">Meus Imóveis</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {stats.totalProperties} cadastrados
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/leads">
                            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors group cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">Leads</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {stats.leads} total
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/conversations">
                            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-colors group cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">WhatsApp</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {stats.conversations} conversas
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/campaigns">
                            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors group cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">Campanhas</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Automatize envios
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </main>
            </header>
        </div>
    )
}
