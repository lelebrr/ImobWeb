'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Shield, CheckCircle2, Zap } from 'lucide-react'
import Link from 'next/link'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import Image from 'next/image'

/**
 * Hero - Psicologia de Design:
 * - Titulo Emocional: Foca no benef\u00edcio direto (vender mais) e na simplicidade (cadastro 1x).
 * - Divis\u00e3o 7/5: Dá espa\u00e7o para a narrativa \u00e0 esquerda e o desejo visual \u00e0 direita.
 * - Elementos de Confian\u00e7a: Badge de #1, estrelas e n\u00fameros reais (+500 imobili\u00e1rias).
 * - Anima\u00e7\u00e3o de Flutua\u00e7\u00e3o: Passa sensa\u00e7\u00e3o de tecnologia leve e moderna.
 */
const Hero = () => {
    const { t } = useMarketingLanguage()

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden bg-brand-deep">
            {/* Efeitos de Ilumina\u00e7\u00e3o Subliminares */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-growth/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-16 items-center">
                    {/* Coluna da Esquerda: CONFIAN\u00c7A E ARGUMENTA\u00c7\u00c3O */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-growth/10 text-brand-growth border border-brand-growth/20 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                                <Star className="h-3.5 w-3.5 fill-brand-growth" />
                                {t.hero.badge}
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1] mb-8">
                                {t.hero.titlePart1}
                                <span className="block text-brand-growth mt-2">
                                    {t.hero.titleHighlight}
                                </span>
                            </h1>

                            <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-xl">
                                {t.hero.subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-5 mb-16">
                                <Button 
                                    size="lg" 
                                    className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black bg-brand-action hover:bg-amber-600 text-slate-900 shadow-glow-action transition-all hover:scale-105 active:scale-95" 
                                    asChild
                                >
                                    <Link href="/login" aria-label="Começar grátis fazendo login">
                                        {t.hero.ctaPrimary} <ArrowRight className="ml-3 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold text-white border-white/30 hover:bg-white/10 transition-all hover:scale-105" 
                                    asChild
                                >
                                    <Link href="#pricing" aria-label="Ver demonstração dos planos e preços">{t.hero.ctaSecondary}</Link>
                                </Button>
                            </div>

                            {/* Trust Signals em F-Pattern */}
                            <div className="flex flex-wrap items-center gap-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-brand-growth/20 rounded-lg">
                                        <CheckCircle2 className="h-4 w-4 text-brand-growth" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{t.hero.trust1}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-brand-growth/20 rounded-lg">
                                        <CheckCircle2 className="h-4 w-4 text-brand-growth" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{t.hero.trust2}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-brand-growth/20 rounded-lg">
                                        <CheckCircle2 className="h-4 w-4 text-brand-growth" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{t.hero.trust3}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Coluna da Direita: DESEJO E VISUALIZA\u00c7\u00c3O */}
                    <div className="lg:col-span-5 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="relative z-10"
                        >
                            <div className="animate-float">
                                <div className="relative p-2 rounded-[3.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl overflow-hidden">
                                    {/* Glass Overlay Superior */}
                                    <div className="absolute top-8 left-8 right-8 h-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 z-20 hidden sm:block" />
                                    
                                    {/* Notifica\u00e7\u00e3o Flutuante de Sucesso (Gatilho Social) */}
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-10 -right-4 bg-brand-growth text-slate-900 p-6 rounded-3xl shadow-glow-growth z-30"
                                    >
                                        <div className="text-[10px] uppercase font-black mb-1 opacity-70 tracking-tighter">Leads de Hoje</div>
                                        <div className="text-3xl font-black">+124</div>
                                        <div className="text-[10px] font-bold mt-1">+18% vs ontem</div>
                                    </motion.div>

                                    <img 
                                        src="/imobweb_dashboard_mockup.png" 
                                        alt="imobWeb Premium Dashboard" 
                                        className="rounded-[2.8rem] w-full shadow-2xl relative z-10 brightness-110"
                                    />
                                    
                                    {/* IA Assistant Overlay */}
                                    <div className="absolute bottom-8 left-8 bg-brand-deep/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 z-20 flex items-center gap-3">
                                        <div className="bg-brand-growth p-2 rounded-full">
                                            <Zap className="h-4 w-4 text-slate-900" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">IA Assistente</div>
                                            <div className="text-xs text-white font-medium">Recomendando ajuste de pre\u00e7o...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Elementos decorativos de profundidade */}
                        <div className="absolute -z-10 -bottom-20 -left-20 w-64 h-64 bg-brand-growth/10 blur-[100px] rounded-full" />
                        <div className="absolute -z-10 -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero