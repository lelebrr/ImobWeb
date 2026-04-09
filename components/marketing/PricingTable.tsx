'use client'

import { Button } from '@/components/ui/button'
import { Check, X, Star } from 'lucide-react'
import Link from 'next/link'

const pricingPlans = [
    {
        name: 'Grátis',
        description: 'Perfeito para corretores autônomos começando',
        price: 'R$ 0',
        period: '/mês',
        featured: false,
        features: [
            'Até 10 imóveis',
            'Até 100 contatos',
            'Suporte básico',
            'Relatórios simples',
        ],
        cta: 'Comece Grátis',
        ctaVariant: 'default',
    },
    {
        name: 'Professional',
        description: 'Ideal para pequenas e médias imobiliárias',
        price: 'R$ 99',
        period: '/mês',
        featured: true,
        features: [
            'Imóveis ilimitados',
            'Contatos ilimitados',
            'Integração WhatsApp',
            'Relatórios avançados',
            'Suporte prioritário',
            'API de integração',
        ],
        cta: 'Experimente 7 dias grátis',
        ctaVariant: 'default',
    },
    {
        name: 'Enterprise',
        description: 'Para imobiliárias de grande porte',
        price: 'Personalizado',
        period: '',
        featured: false,
        features: [
            'Tudo do Professional',
            'Suporte dedicado',
            'Personalizações exclusivas',
            'Treinamento da equipe',
            'SLA garantido',
            'Integrações customizadas',
        ],
        cta: 'Fale com um especialista',
        ctaVariant: 'outline',
    },
]

const PricingTable = () => {
    return (
        <section className="py-24 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Planos para cada necessidade
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                        Escolha o plano perfeito para sua imobiliária e comece a transformar seu negócio hoje.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl border p-8 ${plan.featured
                                    ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                                    : 'border-gray-200'
                                }`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
                                    <Star className="mr-1 inline h-4 w-4" /> Mais Popular
                                </div>
                            )}

                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                                <p className="mt-2 text-gray-600">{plan.description}</p>

                                <div className="mt-6 flex justify-center items-baseline">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                                        {plan.price}
                                    </span>
                                    <span className="ml-2 text-gray-600">{plan.period}</span>
                                </div>

                                <Button
                                    asChild
                                    className={`mt-8 w-full ${plan.featured ? 'bg-blue-600 hover:bg-blue-700' : ''
                                        } ${plan.ctaVariant === 'outline' ? 'border border-gray-300' : ''}`}
                                    variant={plan.ctaVariant as any}
                                >
                                    <Link href="/onboarding">{plan.cta}</Link>
                                </Button>
                            </div>

                            <ul className="mt-8 space-y-4">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start">
                                        <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-lg text-gray-600">
                        Precisa de um plano customizado? <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Fale com nosso time</a>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default PricingTable