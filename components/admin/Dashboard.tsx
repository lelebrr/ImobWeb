'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Users,
    Building2,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    BarChart3,
    Activity,
    Eye,
    MessageSquare
} from 'lucide-react'
import { trackAdminEvent } from '@/lib/analytics/events'

// Mock data - em uma implementação real, viria do banco de dados
const statsData = {
    totalOrganizations: 156,
    activeOrganizations: 142,
    totalMRR: 125000,
    newMRR: 8500,
    churnedMRR: 1200,
    churnRate: 1.2,
    growthRate: 15.6,
}

const recentActivity = [
    {
        id: '1',
        type: 'new_organization',
        title: 'Nova organização criada',
        description: 'Imobiliária Alpha Premium',
        timestamp: '2 minutos atrás',
        icon: <Building2 className="h-5 w-5 text-green-500" />,
    },
    {
        id: '2',
        type: 'subscription_upgraded',
        title: 'Plano upgraded',
        description: 'Imobiliária Beta mudou para Professional',
        timestamp: '15 minutos atrás',
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
    },
    {
        id: '3',
        type: 'subscription_canceled',
        title: 'Cancelamento de assinatura',
        description: 'Imobiliária Gamma cancelou',
        timestamp: '1 hora atrás',
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
    },
    {
        id: '4',
        type: 'billing_issue',
        title: 'Problema de faturamento',
        description: 'Imobiliária Delta com pagamento pendente',
        timestamp: '3 horas atrás',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    },
]

const topOrganizations = [
    {
        id: '1',
        name: 'Imobiliária Alpha Premium',
        plan: 'Professional',
        mrr: 2990,
        growth: 12.5,
        properties: 245,
        users: 12,
    },
    {
        id: '2',
        name: 'Imobiliária Beta Solutions',
        plan: 'Professional',
        mrr: 1980,
        growth: 8.3,
        properties: 180,
        users: 8,
    },
    {
        id: '3',
        name: 'Imobiliário Gamma Ltda',
        plan: 'Free',
        mrr: 0,
        growth: 0,
        properties: 45,
        users: 3,
    },
]

const Dashboard = () => {
    // Track dashboard view
    trackAdminEvent('Admin Dashboard Viewed')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Global</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Visão geral de todas as imobiliárias na plataforma imobWeb
                </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Organizações</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsData.totalOrganizations}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+{statsData.activeOrganizations - statsData.totalOrganizations + statsData.totalOrganizations}</span> ativas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {statsData.totalMRR.toLocaleString('pt-BR')}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+{statsData.growthRate}%</span> do mês passado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novo MRR</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {statsData.newMRR.toLocaleString('pt-BR')}</div>
                        <p className="text-xs text-muted-foreground">
                            Este mês
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsData.churnRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-600">-{statsData.churnedMRR.toLocaleString('pt-BR')}</span> perdido
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and activity */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Top organizations */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Principais Organizações</CardTitle>
                        <CardDescription>
                            Organizações com maior MRR e crescimento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topOrganizations.map((org) => (
                                <div key={org.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{org.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {org.properties} imóveis • {org.users} usuários
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {org.mrr > 0 ? `R$ ${org.mrr.toLocaleString('pt-BR')}/mês` : 'Grátis'}
                                        </p>
                                        {org.growth > 0 && (
                                            <p className="text-sm text-green-600">
                                                +{org.growth}% crescimento
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Atividade Recente</CardTitle>
                        <CardDescription>
                            Últimas atividades na plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div>{activity.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>
                        Ações comuns para gerenciamento administrativo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <Button variant="outline" className="h-20 flex-col">
                            <Users className="h-6 w-6 mb-2" />
                            Gerenciar Usuários
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                            <Building2 className="h-6 w-6 mb-2" />
                            Organizações
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                            <BarChart3 className="h-6 w-6 mb-2" />
                            Analytics
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                            <MessageSquare className="h-6 w-6 mb-2" />
                            Broadcast
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Dashboard