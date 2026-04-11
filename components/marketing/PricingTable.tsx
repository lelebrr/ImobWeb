'use client'

import { Button } from '@/components/ui/button'
import { Check, Star } from 'lucide-react'
import Link from 'next/link'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

const PricingTable = () => {
    const { t } = useMarketingLanguage()

    const pricingPlans = [
        {
            name: t.pricing.starter,
            description: t.pricing.starterDesc,
            price: 'R$ 0',
            period: t.pricing.perMonth,
            featured: false,
            features: [
                'Até 10 imóveis',
                'Até 100 contatos',
                'Suporte básico',
                'Relatórios simples',
            ],
            cta: t.pricing.startFree,
            ctaVariant: 'outline',
        },
        {
            name: t.pricing.professional,
            description: t.pricing.professionalDesc,
            price: 'R$ 99',
            period: t.pricing.perMonth,
            featured: true,
            features: [
                'Imóveis ilimitados',
                'Contatos ilimitados',
                'Integração WhatsApp',
                'Relatórios avançados',
                'Suporte prioritário',
                'API de integração',
            ],
            cta: t.pricing.startPro,
            ctaVariant: 'default',
        },
        {
            name: t.pricing.enterprise,
            description: t.pricing.enterpriseDesc,
            price: 'Custom',
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
            cta: t.pricing.contactSales,
            ctaVariant: 'outline',
        },
    ]

    return (
        <section className="py-24 bg-white relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        {t.pricing.title}
                    </h2>
                    <p className="mx-auto mt-4 text-lg text-slate-600">
                        {t.pricing.subtitle}
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            whileHover={{ y: -8 }}
                            key={index}
                            className={`relative flex flex-col rounded-3xl p-8 shadow-sm ring-1 transition-shadow hover:shadow-xl ${plan.featured
                                    ? 'bg-slate-900 ring-slate-900 text-white shadow-2xl'
                                    : 'bg-white ring-slate-200'
                                }`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                                        <Star className="mr-1 inline h-4 w-4 fill-white" /> {t.pricing.save20}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-2xl font-bold ${plan.featured ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                                <p className={`mt-2 text-sm ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}>{plan.description}</p>
                            </div>

                            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                                {plan.price}
                                <span className={`ml-1 text-xl font-medium ${plan.featured ? 'text-slate-300' : 'text-slate-500'}`}>{plan.period}</span>
                            </div>

                            <Button
                                asChild
                                size="lg"
                                className={`mt-8 w-full rounded-full font-semibold transition-colors ${plan.featured 
                                    ? 'bg-blue-500 text-white hover:bg-blue-400' 
                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    }`}
                                variant={plan.ctaVariant as any}
                            >
                                <Link href="/onboarding">{plan.cta}</Link>
                            </Button>

                            <ul className="mt-8 space-y-4 flex-1">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start">
                                        <Check className={`mr-3 h-5 w-5 flex-shrink-0 ${plan.featured ? 'text-blue-400' : 'text-blue-500'}`} />
                                        <span className={`text-sm ${plan.featured ? 'text-slate-300' : 'text-slate-600'}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default PricingTable