'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

const Hero = () => {
    const { t } = useMarketingLanguage()

    return (
        <div className="relative overflow-hidden bg-white">
            {/* Background Premium Patterns */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
            </div>
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10"></div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="py-24 md:py-32 lg:py-40">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        {/* Premium Badge */}
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center rounded-full border border-blue-200/50 bg-blue-50/50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8 shadow-sm backdrop-blur-sm"
                        >
                            <Star className="mr-2 h-4 w-4 fill-blue-600 text-blue-600" />
                            {t.hero.badge}
                        </motion.div>

                        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl lg:max-w-5xl mx-auto leading-tight">
                            {t.hero.titlePart1}
                            <span className="relative whitespace-nowrap text-blue-600 ml-3">
                                <span className="relative z-10">{t.hero.titleHighlight}</span>
                                <svg className="absolute -bottom-2 left-0 w-full h-3 -z-10 text-blue-200" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.0003 7.00007C35.539 -1.63753 133.003 -1.82173 198.001 7.00007" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                        </h1>

                        <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-slate-600 leading-relaxed">
                            {t.hero.subtitle}
                        </p>

                        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-full h-14 px-8 text-lg font-medium transition-transform hover:scale-105">
                                <Link href="/login">
                                    {t.hero.ctaPrimary} <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>

                            <Button variant="outline" size="lg" asChild className="rounded-full h-14 px-8 text-lg font-medium border-slate-200 hover:bg-slate-50 transition-transform hover:scale-105">
                                <Link href="#pricing">{t.hero.ctaSecondary}</Link>
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
                            <div className="flex items-center text-slate-600 font-medium">
                                <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
                                {t.hero.trust1}
                            </div>
                            <div className="flex items-center text-slate-600 font-medium">
                                <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
                                {t.hero.trust2}
                            </div>
                            <div className="flex items-center text-slate-600 font-medium">
                                <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
                                {t.hero.trust3}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
            </div>
        </div>
    )
}

export default Hero