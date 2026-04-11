'use client'

import { Star } from 'lucide-react'

const testimonials = [
    {
        name: 'Carlos Mendes',
        company: 'Imóveis Premium',
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

const Testimonials = () => {
    const { t } = useMarketingLanguage()

    const testimonials = [
        {
            content: t.testimonials.t1,
            author: 'Carlos Silva',
            role: t.testimonials.role1,
            avatar: 'CS',
        },
        {
            content: t.testimonials.t2,
            author: 'Ana Oliveira',
            role: t.testimonials.role2,
            avatar: 'AO',
        },
        {
            content: t.testimonials.t3,
            author: 'Roberto Santos',
            role: t.testimonials.role3,
            avatar: 'RS',
        },
    ]

    return (
        <section className="py-24 bg-slate-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        {t.testimonials.title}
                    </h2>
                    <p className="mx-auto mt-4 text-lg text-slate-300">
                        {t.testimonials.subtitle}
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            whileHover={{ y: -5 }}
                            key={index}
                            className="flex flex-col justify-between rounded-3xl bg-white/10 backdrop-blur-lg p-8 ring-1 ring-white/20 shadow-xl"
                        >
                            <div>
                                <div className="flex gap-1 text-amber-400 mb-6">
                                    <Star className="h-5 w-5 fill-current" />
                                    <Star className="h-5 w-5 fill-current" />
                                    <Star className="h-5 w-5 fill-current" />
                                    <Star className="h-5 w-5 fill-current" />
                                    <Star className="h-5 w-5 fill-current" />
                                </div>
                                <p className="text-lg leading-relaxed text-slate-200 font-medium italic">
                                    {testimonial.content}
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white shadow-lg">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{testimonial.author}</p>
                                    <p className="text-sm text-slate-400">{testimonial.role}</p>
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