'use client'

import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { 
    Brain, 
    MessageCircle, 
    FileText, 
    TrendingUp, 
    Layers, 
    ShieldCheck,
    Cpu,
    Smartphone,
    Globe,
    Zap
} from 'lucide-react'

/**
 * FeaturesGrid - Psicologia de Design:
 * - Grid de 6 Cards: Transmite a sensa\u00e7\u00e3o de um sistema completo e robusto.
 * - Glassmorphism Profundo: Utiliza transpar\u00eancia e blur para um toque premium e high-tech.
 * - Iconografia em Verde: Refor\u00e7a a ideia de crescimento, sa\u00fade e sucesso em cada m\u00f3dulo.
 */
const FeaturesGrid = () => {
    const { t } = useMarketingLanguage()

    const features = [
        {
            title: t.featuresGrid.f1Title,
            desc: t.featuresGrid.f1Desc,
            icon: Brain,
            color: 'bg-brand-growth',
        },
        {
            title: t.featuresGrid.f2Title,
            desc: t.featuresGrid.f2Desc,
            icon: FileText,
            color: 'bg-brand-growth',
        },
        {
            title: t.featuresGrid.f3Title,
            desc: t.featuresGrid.f3Desc,
            icon: ShieldCheck,
            color: 'bg-brand-growth',
        },
        {
            title: t.featuresGrid.f4Title,
            desc: t.featuresGrid.f4Desc,
            icon: TrendingUp,
            color: 'bg-brand-growth',
        },
        {
            title: t.featuresGrid.f5Title,
            desc: t.featuresGrid.f5Desc,
            icon: Cpu,
            color: 'bg-brand-growth',
        },
        {
            title: t.featuresGrid.f6Title,
            desc: t.featuresGrid.f6Desc,
            icon: Globe,
            color: 'bg-brand-growth',
        }
    ]

    return (
        <section id="features" className="py-24 sm:py-32 bg-brand-deep relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter">
                            {t.featuresGrid.title}
                        </h2>
                        <p className="text-xl text-slate-400 font-medium">
                            {t.featuresGrid.subtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="group relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-brand-growth/50 transition-all duration-500 backdrop-blur-sm"
                        >
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-brand-growth/0 group-hover:bg-brand-growth/5 transition-colors duration-500 rounded-[2.5rem]" />
                            
                            <div className={`inline-flex p-4 rounded-2xl bg-brand-growth/10 text-brand-growth mb-8 group-hover:scale-110 group-hover:bg-brand-growth group-hover:text-brand-deep transition-all duration-500 shadow-glow-growth`}>
                                <feature.icon className="h-7 w-7" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-brand-growth transition-colors">
                                {feature.title}
                            </h3>
                            
                            <p className="text-slate-400 leading-relaxed font-medium">
                                {feature.desc}
                            </p>
                            
                            {/* Premium indicator in corner */}
                            <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Zap className="h-5 w-5 text-brand-growth" />
                            </div>
                        </motion.div>
                    ))}
                </div>
                
                {/* Visual indicator of "PWA" */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 text-center"
                >
                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-bold backdrop-blur-md shadow-2xl">
                        <Smartphone className="h-6 w-6 text-brand-growth animate-pulse" />
                        Pronto para o seu bolso. Aplicativo PWA inclu\u00eddo em todos os planos.
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default FeaturesGrid
