'use client'

import { Button } from '@/components/ui/button'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, Camera, ShieldCheck, Map, Sparkles } from 'lucide-react'
import Link from 'next/link'

const MarketplaceTeaser = () => {
    const { t } = useMarketingLanguage()

    const addons = [
        { icon: Camera, name: 'Tour 3D Pro', desc: 'Realidade aumentada para imóveis de luxo.', price: 'R$ 49/mês' },
        { icon: ShieldCheck, name: 'Seguro Fiança IA', desc: 'Aprovação instantânea via motor de crédito.', price: 'Taxa zero' },
        { icon: Map, name: 'Big Data Geo', desc: 'Análise de vizinhança e valorização.', price: 'R$ 29/mês' },
    ]

    return (
        <section id="marketplace" className="py-24 sm:py-32 bg-[#0a0a0f] relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative bg-gradient-to-br from-white/[0.03] to-transparent rounded-3xl p-10 lg:p-16 overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-indigo-500/5 -skew-x-12 translate-x-1/4 -z-0" />

                    <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div>
                            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-[10px] font-bold uppercase tracking-widest mb-6 border border-indigo-500/20">
                                    <ShoppingBag className="h-4 w-4" />
                                    Ecossistema de Add-ons
                                </div>
                                <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tighter leading-tight">
                                    {t.marketplace.title}
                                </h2>
                                <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">
                                    {t.marketplace.subtitle}
                                </p>
                                <Button size="lg" className="h-12 px-8 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 border-0" asChild>
                                    <Link href="/marketplace">
                                        {t.marketplace.cta} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        <div className="space-y-4">
                            {addons.map((addon, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/[0.06] hover:border-indigo-500/20 transition-all duration-500"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/5 p-3 rounded-xl text-indigo-400 group-hover:bg-indigo-500/10 transition-all border border-white/5">
                                            <addon.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm mb-0.5">{addon.name}</h3>
                                            <p className="text-slate-500 text-xs font-medium">{addon.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">A partir de</div>
                                        <div className="text-xs font-bold text-white">{addon.price}</div>
                                    </div>
                                </motion.div>
                            ))}

                            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-2 pt-4 text-slate-600 font-semibold text-xs">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                +15 novas integrações este mês
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MarketplaceTeaser
