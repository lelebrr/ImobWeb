'use client'

import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { FilePlus2, Share2, MessageCircle, FileCheck2, ArrowRight } from 'lucide-react'

/**
 * HowItWorks - Psicologia de Design:
 * - Passos Visuais Claros: Reduz o esfor\u00e7o cognitivo do visitante.
 * - N\u00fameros em Verde: Associa cada etapa ao "crescimento" e "seguran\u00e7a".
 * - Linha de Conex\u00e3o: Guia o olhar no sentido de leitura natural (Z-pattern).
 */
const HowItWorks = () => {
    const { t } = useMarketingLanguage()

    const steps = [
        {
            num: t.howItWorks.step1,
            title: t.howItWorks.step1Title,
            desc: t.howItWorks.step1Desc,
            icon: FilePlus2,
        },
        {
            num: t.howItWorks.step2,
            title: t.howItWorks.step2Title,
            desc: t.howItWorks.step2Desc,
            icon: Share2,
        },
        {
            num: t.howItWorks.step3,
            title: t.howItWorks.step3Title,
            desc: t.howItWorks.step3Desc,
            icon: MessageCircle,
        },
        {
            num: t.howItWorks.step4,
            title: t.howItWorks.step4Title,
            desc: t.howItWorks.step4Desc,
            icon: FileCheck2,
        }
    ]

    return (
        <section id="how-it-works" className="py-24 sm:py-32 bg-white relative overflow-hidden">
            {/* Linha de conex\u00e3o decorativa (desktop) */}
            <div className="absolute top-[60%] left-0 w-full h-[1px] bg-slate-100 -z-0 hidden lg:block" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black text-brand-deep tracking-tighter mb-4">
                            {t.howItWorks.title}
                        </h2>
                        <div className="h-1.5 w-24 bg-brand-growth mx-auto rounded-full" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            {/* N\u00famero com Psicologia de Crescimento */}
                            <div className="w-16 h-16 bg-brand-growth text-brand-deep flex items-center justify-center rounded-2xl font-black text-2xl shadow-glow-growth mb-8 group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-0">
                                {step.num}
                            </div>
                            
                            <div className="p-6 bg-brand-clean rounded-[2.5rem] border border-slate-100 group-hover:border-brand-growth/30 transition-all duration-500 shadow-sm group-hover:shadow-xl w-full h-full flex flex-col items-center">
                                <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm text-brand-deep group-hover:text-brand-growth transition-colors">
                                    <step.icon className="h-10 w-10" />
                                </div>
                                
                                <h3 className="text-2xl font-black text-brand-deep mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </div>

                            {/* Setas direcionais (desktop) */}
                            {idx < 3 && (
                                <div className="absolute top-8 -right-10 text-slate-200 hidden lg:block group-hover:text-brand-growth transition-colors duration-500">
                                    <ArrowRight className="h-8 w-8" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 text-center"
                >
                    <div className="inline-flex items-center gap-3 px-8 py-4 bg-brand-deep text-white rounded-2xl shadow-2xl">
                        <span className="h-2 w-2 bg-brand-growth rounded-full animate-pulse shadow-[0_0_10px_#10B981]" />
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-300">Tempo m\u00e9dio de setup:</span>
                        <span className="text-sm font-black text-brand-growth">2 minutos</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default HowItWorks
