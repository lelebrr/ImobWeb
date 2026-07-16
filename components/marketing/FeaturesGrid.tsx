'use client'

import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { Brain, FileText, ShieldCheck, TrendingUp, Cpu, Globe, Zap, Smartphone } from 'lucide-react'

const FeaturesGrid = () => {
    const { t } = useMarketingLanguage()

    const features = [
        { title: t.featuresGrid.f1Title, desc: t.featuresGrid.f1Desc, icon: Brain },
        { title: t.featuresGrid.f2Title, desc: t.featuresGrid.f2Desc, icon: FileText },
        { title: t.featuresGrid.f3Title, desc: t.featuresGrid.f3Desc, icon: ShieldCheck },
        { title: t.featuresGrid.f4Title, desc: t.featuresGrid.f4Desc, icon: TrendingUp },
        { title: t.featuresGrid.f5Title, desc: t.featuresGrid.f5Desc, icon: Cpu },
        { title: t.featuresGrid.f6Title, desc: t.featuresGrid.f6Desc, icon: Globe },
    ]

    return (
        <section id="features" className="py-24 sm:py-32 bg-[#0a0a0f] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tighter">
                            {t.featuresGrid.title}
                        </h2>
                        <p className="text-xl text-slate-400 font-medium">{t.featuresGrid.subtitle}</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.08 }}
                            className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 backdrop-blur-sm"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-transparent transition-all duration-500 rounded-3xl" />

                            <div className="relative z-10">
                                <div className="inline-flex p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/20">
                                    <feature.icon className="h-6 w-6" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-indigo-400 transition-colors">
                                    {feature.title}
                                </h3>

                                <p className="text-slate-400 leading-relaxed text-sm font-medium">
                                    {feature.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-semibold backdrop-blur-md">
                        <Smartphone className="h-5 w-5 text-indigo-400" />
                        <span className="text-sm">Pronto para o seu bolso. Aplicativo PWA incluído em todos os planos.</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default FeaturesGrid
