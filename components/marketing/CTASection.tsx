'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

const CTASection = () => {
    const { t } = useMarketingLanguage()

    return (
        <section id="cta" className="relative py-24 sm:py-32 bg-[#0a0a0f] overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative p-12 lg:p-20 rounded-[3rem] bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 overflow-hidden"
                >
                    {/* Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-full -z-10">
                        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-indigo-500/10 blur-[120px] rounded-full" />
                        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-purple-500/10 blur-[100px] rounded-full" />
                    </div>

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl lg:text-7xl font-black mb-8 tracking-tighter leading-[0.9] text-white"
                        >
                            {t.cta.title}
                        </motion.h2>

                        <p className="text-lg lg:text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                            {t.cta.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                            <Button
                                size="lg"
                                className="h-14 px-12 rounded-2xl text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-0 group"
                                asChild
                            >
                                <Link href="/login">
                                    {t.cta.button}
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-8">
                            {[
                                { icon: ShieldCheck, label: t.cta.noCreditCard },
                                { icon: Zap, label: 'Acesso Imediato' },
                                { icon: CheckCircle2, label: 'Setup em 2 min' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4 text-indigo-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default CTASection
