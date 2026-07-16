'use client'

import { Button } from '@/components/ui/button'
import { Check, Star, Zap, ShieldCheck, Heart } from 'lucide-react'
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
            features: ['Até 10 imóveis', 'Até 100 contatos', 'Suporte básico', 'Sincronização de portais manual'],
            cta: t.pricing.startFree,
        },
        {
            name: t.pricing.professional,
            description: t.pricing.professionalDesc,
            price: 'R$ 99',
            period: t.pricing.perMonth,
            featured: true,
            features: ['Imóveis ilimitados', 'Contatos ilimitados', 'WhatsApp Proativo IA', 'Relatórios de IA Preditiva', 'Sincronização Automática', 'Suporte 24h Prioritário'],
            cta: t.pricing.startPro,
        },
        {
            name: t.pricing.enterprise,
            description: t.pricing.enterpriseDesc,
            price: 'Custom',
            period: 'Preço sob consulta',
            featured: false,
            features: ['Tudo do Professional', 'Unidades/Filiais ilimitadas', 'SSO e Segurança Enterprise', 'Gerente de Conta dedicado', 'SLA de 99.99%', 'Onboarding Presencial'],
            cta: t.pricing.contactSales,
        },
    ]

    return (
        <section id="pricing" className="py-24 sm:py-32 bg-[#0a0a0f] relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tighter mb-6 leading-none">
                            {t.pricing.title}
                        </h2>
                        <p className="text-xl text-slate-400 font-medium">{t.pricing.subtitle}</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className={`relative flex flex-col rounded-3xl p-8 transition-all duration-500 group ${
                                plan.featured
                                    ? 'bg-gradient-to-b from-indigo-600/20 to-purple-600/20 text-white scale-[1.02] z-10 border border-indigo-500/30 shadow-xl shadow-indigo-500/10'
                                    : 'bg-white/[0.03] border border-white/5 hover:border-white/10'
                            }`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <div className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-indigo-500/30 uppercase tracking-widest">
                                        <Star className="mr-1.5 h-3 w-3 fill-white" /> Recomendado
                                    </div>
                                </div>
                            )}

                            <div className="mb-8 text-center">
                                <h3 className={`text-xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-white'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm font-medium h-8 ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-8 flex flex-col items-center gap-1">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-5xl font-black tracking-tighter ${plan.featured ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent' : 'text-white'}`}>
                                        {plan.price}
                                    </span>
                                    {plan.price !== 'Custom' && (
                                        <span className="text-sm font-semibold text-slate-500">/{t.pricing.perMonth}</span>
                                    )}
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    {plan.price === 'Custom' ? 'VGV sob consulta' : 'Ilimitado p/ Sempre'}
                                </div>
                            </div>

                            <Button
                                asChild
                                size="lg"
                                className={`h-12 rounded-xl font-bold text-sm mb-8 transition-all ${
                                    plan.featured
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 border-0'
                                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                }`}
                            >
                                <Link href="/onboarding">{plan.cta}</Link>
                            </Button>

                            <ul className="space-y-3 flex-1">
                                {plan.features.map((feature, fi) => (
                                    <li key={fi} className="flex items-start gap-3">
                                        <div className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${
                                            plan.featured ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400'
                                        }`}>
                                            <Check className="h-3 w-3 stroke-[3]" />
                                        </div>
                                        <span className={`text-sm font-medium ${plan.featured ? 'text-slate-300' : 'text-slate-400'}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {plan.featured && (
                                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400/60">
                                    <Zap className="h-3 w-3" /> IA NATIVA ATIVADA
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-40">
                    <div className="flex items-center gap-2 font-bold text-white tracking-widest text-[10px] uppercase">
                        <ShieldCheck className="h-4 w-4" /> SSL SECURE
                    </div>
                    <div className="flex items-center gap-2 font-bold text-white tracking-widest text-[10px] uppercase">
                        <Zap className="h-4 w-4" /> CLOUD DEPLOY
                    </div>
                    <div className="flex items-center gap-2 font-bold text-white tracking-widest text-[10px] uppercase">
                        <Heart className="h-4 w-4" /> 100% Brazilian
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PricingTable
