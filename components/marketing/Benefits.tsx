'use client'

import { CheckCircle, Users, Building2, MessageSquare, BarChart3, Zap } from 'lucide-react'

const features = [
    {
        icon: <Users className="h-8 w-8" />,
        title: 'Gestão de Corretores',
        description: 'Cadastre, gerencie e acompanhe o desempenho de toda sua equipe de corretores em um só lugar.',
        color: 'bg-blue-500',
    },
    {
        icon: <Building2 className="h-8 w-8" />,
        title: 'Controle de Imóveis',
        description: 'Cadastre, organize e gerencie todos os imóveis com fotos, detalhes e histórico completo.',
        color: 'bg-green-500',
    },
    {
        icon: <MessageSquare className="h-8 w-8" />,
        title: 'Integração WhatsApp',
        description: 'Automatize conversas, envie lembretes e mantenha o contato com clientes de forma profissional.',
        color: 'bg-purple-500',
    },
    {
        icon: <BarChart3 className="h-8 w-8" />,
        title: 'Análise de Desempenho',
        description: 'Relatórios detalhados sobre conversões, taxa de fechamento e ROI por corretor e imóvel.',
        color: 'bg-yellow-500',
    },
    {
        icon: <Zap className="h-8 w-8" />,
        title: 'Rápido e Intuitivo',
        description: 'Interface moderna e responsiva, projetada para agilizar seu trabalho diário e aumentar produtividade.',
        color: 'bg-red-500',
    },
    {
        icon: <CheckCircle className="h-8 w-8" />,
        title: 'Segurança e Conformidade',
        description: 'Dados armazenados com segurança total, backups automáticos e conformidade com LGPD.',
        color: 'bg-indigo-500',
    },
]

const Benefits = () => {
    return (
        <section className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Tudo que sua imobiliária precisa em uma plataforma
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                        Recursos completos para gerenciar imóveis, corretores e clientes com eficiência e profissionalismo.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-2xl border border-gray-200 p-8 transition-all hover:shadow-lg hover:border-blue-300"
                        >
                            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.color} text-white`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                            <p className="mt-2 text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-lg text-gray-600">
                        Pronto para transformar sua imobiliária?
                    </p>
                    <button className="mt-4 rounded-md bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors">
                        Comece sua teste grátis
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Benefits