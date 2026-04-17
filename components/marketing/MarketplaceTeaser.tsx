'use client'

import { Button } from '@/components/ui/button'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, Camera, ShieldCheck, Map, CreditCard, Sparkles } from 'lucide-react'
import Link from 'next/link'

/**
 * MarketplaceTeaser - Psicologia de Design:
 * - Senso de Expans\u00e3o: "Não \u00e9 apenas um CRM, \u00e9 um ecossistema".
 * - Visual Premium: Cards com degrade e \u00edcones que sugerem valor agregado (seguro, 3D, mapas).
 * - CTA Dourada: Direciona para um ambiente de "compras de valor" (SaaS Add-ons).
 */
const MarketplaceTeaser = () => {
    const { t } = useMarketingLanguage()

    const addons = [
        { 
            icon: Camera, 
            name: 'Tour 3D Pro', 
            desc: 'Realidade aumentada para im\u00f3veis de luxo.',
            price: 'R$ 49/m\u00eas'
        },
        { 
            icon: ShieldCheck, 
            name: 'Seguro Fian\u00e7a IA', 
            desc: 'Aprova\u00e7\u00e3o instant\u00e2nea via motor de cr\u00e9dito.',
            price: 'Taxa zero'
        },
        { 
            icon: Map, 
            name: 'Big Data Geo', 
            desc: 'An\u00e1lise de vizinhan\u00e7a e valoriza\u00e7\u00e3o.',
            price: 'R$ 29/m\u00eas'
        },
    ]

    return (
        <section id="marketplace" className="py-24 sm:py-32 bg-brand-clean relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative bg-brand-deep rounded-[3.5rem] p-12 lg:p-24 overflow-hidden shadow-3xl">
                    {/* Background decoration elements */}
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-brand-growth/5 -skew-x-12 translate-x-1/4 -z-0" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />

                    <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-growth/10 text-brand-growth rounded-xl text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-brand-growth/20">
                                    <ShoppingBag className="h-4 w-4" />
                                    Ecossistema de Add-ons
                                </div>
                                <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                                    {t.marketplace.title}
                                </h2>
                                <p className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                                    {t.marketplace.subtitle}
                                </p>
                                <Button 
                                    size="lg" 
                                    className="h-16 px-10 rounded-2xl text-lg font-black bg-brand-action hover:bg-amber-600 text-slate-900 shadow-glow-action transition-all hover:scale-105 active:scale-95" 
                                    asChild
                                >
                                    <Link href="/marketplace">
                                        {t.marketplace.cta} <ArrowRight className="ml-3 h-5 w-5" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        <div className="space-y-6">
                            {addons.map((addon, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                                    className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex items-center justify-between group hover:bg-white/10 hover:border-brand-growth/30 transition-all duration-500 cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="bg-brand-deep p-4 rounded-2xl text-brand-growth group-hover:bg-brand-growth group-hover:text-brand-deep transition-all duration-500 border border-white/5 shadow-inner">
                                            <addon.icon className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-white mb-1 tracking-tight">{addon.name}</h3>
                                            <p className="text-slate-400 text-sm font-medium">{addon.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] font-black text-brand-growth uppercase tracking-widest mb-1">A partir de</div>
                                        <div className="text-sm font-black text-white">{addon.price}</div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {/* Teaser of "More coming" */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center justify-center gap-3 pt-4 text-slate-500 font-bold italic"
                            >
                                <Sparkles className="h-4 w-4 text-brand-growth" />
                                +15 novas integra\u00e7\u00f5es este m\u00eas
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MarketplaceTeaser
