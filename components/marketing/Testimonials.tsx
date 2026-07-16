'use client'

import { Star, Quote, TrendingUp } from 'lucide-react'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

const Testimonials = () => {
    const { t } = useMarketingLanguage()

    const testimonials = [
        { content: t.testimonials.t1, author: 'Carlos Silva', role: t.testimonials.role1, avatar: 'CS', metric: '+215% Leads', metricDesc: 'em 3 meses' },
        { content: t.testimonials.t2, author: 'Ana Oliveira', role: t.testimonials.role2, avatar: 'AO', metric: '8h poupadas', metricDesc: 'por semana' },
        { content: t.testimonials.t3, author: 'Roberto Santos', role: t.testimonials.role3, avatar: 'RS', metric: '3x mais ROI', metricDesc: 'nos portais' },
    ]

    return (
        <section id="testimonials" className="py-24 sm:py-32 bg-[#0c0c14] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-white mb-6">
                            {t.testimonials.title}
                        </h2>
                        <p className="text-xl text-slate-400 font-medium">{t.testimonials.subtitle}</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/[0.03] backdrop-blur-sm rounded-3xl p-8 border border-white/5 hover:border-indigo-500/20 transition-all duration-500"
                        >
                            <Quote className="absolute top-8 right-8 h-8 w-8 text-white/5" />

                            <div className="mb-6 flex gap-0.5 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>

                            <p className="text-base leading-relaxed text-slate-300 font-medium mb-8">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 mb-6">
                                <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                                <span className="text-[11px] font-bold text-white uppercase tracking-wider">{testimonial.metric}</span>
                                <span className="text-[10px] text-slate-500 font-medium">{testimonial.metricDesc}</span>
                            </div>

                            <div className="flex items-center gap-3 pt-5 border-t border-white/5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{testimonial.author}</p>
                                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{testimonial.role}</p>
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
