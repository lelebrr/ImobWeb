'use client'

import { Star, Quote, TrendingUp } from 'lucide-react'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

/**
 * Testimonials - Psicologia de Design:
 * - Prova Social Extrema: Uso de fotos (simuladas por iniciais premium), nomes reais e cargos de autoridade.
 * - M\u00e9tricas de Sucesso: Tags de crescimento (+400% ROI) para validar o valor financeiro.
 * - Design Premium: Fundo azul profundo com glassmorphism refor\u00e7a a solidez da empresa.
 */
const Testimonials = () => {
    const { t } = useMarketingLanguage()

    const testimonials = [
        {
            content: t.testimonials.t1,
            author: 'Carlos Silva',
            role: t.testimonials.role1,
            avatar: 'CS',
            metric: '+215% Leads',
            metricDesc: 'em 3 meses'
        },
        {
            content: t.testimonials.t2,
            author: 'Ana Oliveira',
            role: t.testimonials.role2,
            avatar: 'AO',
            metric: '8h poupadas',
            metricDesc: 'por semana'
        },
        {
            content: t.testimonials.t3,
            author: 'Roberto Santos',
            role: t.testimonials.role3,
            avatar: 'RS',
            metric: '3x mais ROI',
            metricDesc: 'nos portais'
        },
    ]

    return (
        <section id="testimonials" className="py-24 sm:py-32 bg-brand-deep relative overflow-hidden">
            {/* Efeitos de profundidade */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-growth/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-white mb-6">
                            {t.testimonials.title}
                        </h2>
                        <p className="text-xl text-slate-400 font-medium">
                            {t.testimonials.subtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 relative group hover:bg-white/10 transition-all duration-500"
                        >
                            <Quote className="absolute top-10 right-10 h-10 w-10 text-white/5 group-hover:text-brand-growth transition-colors" />
                            
                            <div className="mb-8 flex gap-1 text-brand-growth">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>

                            <p className="text-lg leading-relaxed text-slate-300 font-medium italic mb-10">
                                "{testimonial.content}"
                            </p>

                            <div className="mt-auto">
                                {/* Tag de M\u00e9trica - Psicologia de Resultado */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-growth/10 rounded-xl border border-brand-growth/20 mb-8">
                                    <TrendingUp className="h-4 w-4 text-brand-growth" />
                                    <span className="text-xs font-black text-white uppercase tracking-wider">{testimonial.metric}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{testimonial.metricDesc}</span>
                                </div>

                                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-growth text-xl font-black text-brand-deep shadow-glow-growth">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-white tracking-tight">{testimonial.author}</p>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials