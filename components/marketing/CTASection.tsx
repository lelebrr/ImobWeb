'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

const CTASection = () => {
    const { t } = useMarketingLanguage()

    return (
        <section className="relative overflow-hidden bg-slate-900 border-t border-slate-800">
            {/* Background premium pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent -z-10"></div>
            
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-30"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[128px] opacity-30"></div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
                <div className="py-24 md:py-32">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                            {t.cta.title}
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100/80">
                            {t.cta.subtitle}
                        </p>

                        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl shadow-white/10 rounded-full h-14 px-8 text-lg font-bold transition-transform hover:scale-105">
                                <Link href="/login">
                                    {t.cta.button} <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white/20 text-white hover:bg-white/10 rounded-full h-14 px-8 text-lg font-medium transition-transform hover:scale-105"
                                asChild
                            >
                                <Link href="#pricing">{t.nav.pricing}</Link>
                            </Button>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-16 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm font-medium text-blue-200/80">
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-emerald-400" />
                                {t.hero.trust1}
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-emerald-400" />
                                {t.hero.trust2}
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-emerald-400" />
                                {t.hero.trust3}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default CTASection