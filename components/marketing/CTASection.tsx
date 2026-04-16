'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

/**
 * CTASection - Psicologia de Design:
 * - Urg\u00eancia Suave: "Cadastro Gr\u00e1tis" com destaque supremo no botão Amber/Gold.
 * - Segurança Final: Refor\u00e7o de que n\u00e3o precisa de cart\u00e3o e o setup \u00e9 r\u00e1pido.
 * - Fundo Deep Blue: Garante que o CTA "salte" da tela no final do scroll.
 */
const CTASection = () => {
    const { t } = useMarketingLanguage()

    return (
        <section id="cta" className="relative py-24 sm:py-32 bg-brand-clean overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative p-12 lg:p-24 rounded-[4rem] bg-brand-deep text-white overflow-hidden shadow-3xl"
                >
                    {/* Background effects subliminares */}
                    <div className="absolute top-0 left-0 w-full h-full -z-10">
                        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-brand-growth/20 blur-[120px] rounded-full" />
                        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-blue-600/10 blur-[100px] rounded-full" />
                    </div>

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl lg:text-8xl font-black mb-10 tracking-tighter leading-[0.9] italic"
                        >
                            {t.cta.title}
                        </motion.h2>
                        
                        <p className="text-xl lg:text-2xl text-slate-400 mb-16 leading-relaxed font-medium">
                            {t.cta.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20">
                            <Button 
                                size="lg" 
                                className="h-24 px-16 rounded-[2rem] text-2xl font-black bg-brand-action hover:bg-amber-600 text-slate-900 shadow-glow-action transition-all hover:scale-110 active:scale-95 group" 
                                asChild
                            >
                                <Link href="/login">
                                    {t.cta.button} 
                                    <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-10">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-brand-growth" />
                                <span className="text-sm font-black uppercase tracking-widest text-slate-300">{t.cta.noCreditCard}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Zap className="h-6 w-6 text-brand-growth" />
                                <span className="text-sm font-black uppercase tracking-widest text-slate-300">Acesso Imediato</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-brand-growth" />
                                <span className="text-sm font-black uppercase tracking-widest text-slate-300">Setup em 2 min</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default CTASection