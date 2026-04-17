'use client'

import { Button } from '@/components/ui/button'
import { Check, Star, Zap, ShieldCheck, Heart } from 'lucide-react'
import Link from 'next/link'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

/**
 * PricingTable - Psicologia de Design:
 * - Efeito Ancoragem: Tr\u00eas planos para destacar o "Professional" como o melhor custo-benef\u00edcio.
 * - FOCO EM A\u00c7\u00c3O: Bot\u00e3o Amber/Gold apenas no plano Professional para maximizar cliques.
 * - Gatilho de Escassez/Status: Selo "Recomendado" com anima\u00e7\u00e3o suave.
 */
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
                'At\u00e9 10 im\u00f3veis',
                'At\u00e9 100 contatos',
                'Suporte b\u00e1sico',
                'Sincroniza\u00e7\u00e3o de portais manual',
            ],
            cta: t.pricing.startFree,
            ctaVariant: 'outline' as const,
        },
        {
            name: t.pricing.professional,
            description: t.pricing.professionalDesc,
            price: 'R$ 99',
            period: t.pricing.perMonth,
            featured: true,
            features: [
                'Im\u00f3veis ilimitados',
                'Contatos ilimitados',
                'WhatsApp Proativo IA',
                'Relat\u00f3rios de IA Predetiva',
                'Sincroniza\u00e7\u00e3o Autom\u00e1tica',
                'Suporte 24h Priorit\u00e1rio',
            ],
            cta: t.pricing.startPro,
            ctaVariant: 'default' as const,
        },
        {
            name: t.pricing.enterprise,
            description: t.pricing.enterpriseDesc,
            price: 'Custom',
            period: 'Pre\u00e7o sob consulta',
            featured: false,
            features: [
                'Tudo do Professional',
                'Unidades/Filiais ilimitadas',
                'SSO e Seguran\u00e7a Enterprise',
                'Gerente de Conta dedicado',
                'SLA de 99.99%',
                'Onboarding Presencial',
            ],
            cta: t.pricing.contactSales,
            ctaVariant: 'outline' as const,
        },
    ]

    return (
        <section id="pricing" className="py-24 sm:py-32 bg-brand-clean relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-7xl font-black text-brand-deep tracking-tighter mb-8 leading-none">
                            {t.pricing.title}
                        </h2>
                        <p className="text-xl text-slate-500 font-medium">
                            {t.pricing.subtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 items-stretch">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className={`relative flex flex-col rounded-[3rem] p-10 transition-all duration-500 group ${plan.featured
                                    ? 'bg-brand-deep text-white shadow-3xl scale-105 z-10 border-brand-growth/30'
                                    : 'bg-white border-slate-200 hover:border-brand-growth/50 shadow-sm'
                                }`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-6 left-0 right-0 flex justify-center">
                                    <div className="inline-flex items-center rounded-full bg-brand-growth px-6 py-2 text-xs font-black text-brand-deep shadow-glow-growth uppercase tracking-[0.2em]">
                                        <Star className="mr-2 h-4 w-4 fill-brand-deep" /> Recomendado
                                    </div>
                                </div>
                            )}

                            <div className="mb-10 text-center">
                                <h3 className={`text-2xl font-black mb-3 ${plan.featured ? 'text-white' : 'text-brand-deep'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm font-medium h-10 ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-10 flex flex-col items-center gap-1">
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-6xl font-black tracking-tighter ${plan.featured ? 'text-brand-growth' : 'text-brand-deep'}`}>
                                        {plan.price}
                                    </span>
                                    {plan.price !== 'Custom' && (
                                        <span className={`text-lg font-bold ${plan.featured ? 'text-slate-400' : 'text-slate-400'}`}>
                                            /{t.pricing.perMonth}
                                        </span>
                                    )}
                                </div>
                                <div className={`text-xs font-bold uppercase tracking-widest ${plan.featured ? 'text-brand-growth/60' : 'text-slate-400'}`}>
                                    {plan.price === 'Custom' ? 'VGV sob consulta' : 'Ilimitado p/ Sempre'}
                                </div>
                            </div>

                            <Button
                                asChild
                                size="lg"
                                className={`h-16 rounded-2xl font-black text-lg mb-10 transition-all hover:scale-105 active:scale-95 shadow-xl ${plan.featured 
                                    ? 'bg-brand-action text-slate-900 hover:bg-amber-600 shadow-glow-action border-none' 
                                    : 'bg-brand-deep text-white hover:bg-slate-800'
                                    }`}
                            >
                                <Link href="/onboarding" aria-label={`Comece grátis com o plano ${plan.name}`}>{plan.cta}</Link>
                            </Button>

                            <ul className="space-y-6 flex-1">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-start gap-4">
                                        <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center shrink-0 border ${plan.featured ? 'bg-brand-growth/10 border-brand-growth/20 text-brand-growth' : 'bg-brand-growth/5 border-brand-growth/10 text-brand-growth'}`}>
                                            <Check className="h-3.5 w-3.5 stroke-[4]" />
                                        </div>
                                        <span className={`text-sm font-bold ${plan.featured ? 'text-slate-300' : 'text-slate-600'}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            {plan.featured && (
                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-growth/50">
                                    <Zap className="h-3 w-3" /> IA NATIVA ATIVADA
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
                
                {/* Visual Trust Indicators Under Pricing */}
                <div className="mt-24 flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-2 font-black text-brand-deep tracking-widest text-xs uppercase">
                        <ShieldCheck className="h-4 w-4" /> SSL SECURE
                    </div>
                    <div className="flex items-center gap-2 font-black text-brand-deep tracking-widest text-xs uppercase">
                        <Zap className="h-4 w-4" /> CLOUD DEPLOY
                    </div>
                    <div className="flex items-center gap-2 font-black text-brand-deep tracking-widest text-xs uppercase">
                        <Heart className="h-4 w-4" /> 100% Brazilian
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PricingTable