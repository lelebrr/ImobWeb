'use client'

import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { FilePlus2, Share2, MessageCircle, FileCheck2, ArrowRight } from 'lucide-react'

const HowItWorks = () => {
    const { t } = useMarketingLanguage()

    const steps = [
        { num: t.howItWorks.step1, title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, icon: FilePlus2 },
        { num: t.howItWorks.step2, title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, icon: Share2 },
        { num: t.howItWorks.step3, title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, icon: MessageCircle },
        { num: t.howItWorks.step4, title: t.howItWorks.step4Title, desc: t.howItWorks.step4Desc, icon: FileCheck2 },
    ]

    return (
        <section id="how-it-works" className="py-24 sm:py-32 bg-[#0c0c14] relative overflow-hidden">
            <div className="absolute top-[60%] left-0 w-full h-[1px] bg-white/5 -z-0 hidden lg:block" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-4">
                            {t.howItWorks.title}
                        </h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-2xl font-black text-xl shadow-lg shadow-indigo-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                {step.num}
                            </div>

                            <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 group-hover:border-indigo-500/30 transition-all duration-500 w-full h-full flex flex-col items-center">
                                <div className="mb-5 p-3 bg-white/5 rounded-xl text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm font-medium">{step.desc}</p>
                            </div>

                            {idx < 3 && (
                                <div className="absolute top-8 -right-4 text-slate-700 hidden lg:block group-hover:text-indigo-500 transition-colors duration-500">
                                    <ArrowRight className="h-6 w-6" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                        <span className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Tempo médio de setup:</span>
                        <span className="text-xs font-black text-indigo-400">2 minutos</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default HowItWorks
