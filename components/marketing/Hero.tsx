'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Star, CheckCircle2, Zap } from 'lucide-react'
import Link from 'next/link'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import Image from 'next/image'

const Hero = () => {
    const { t } = useMarketingLanguage()

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden bg-[#0a0a0f]">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-500/5 blur-[150px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full -z-10" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-16 items-center">
                    {/* Left Column */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
                                <Star className="h-3.5 w-3.5 fill-indigo-400" />
                                {t.hero.badge}
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-8">
                                {t.hero.titlePart1}
                                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-3">
                                    {t.hero.titleHighlight}
                                </span>
                            </h1>

                            <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-xl font-medium">
                                {t.hero.subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto h-14 px-10 rounded-2xl text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                                    asChild
                                >
                                    <Link href="/login">
                                        {t.hero.ctaPrimary} <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto h-14 px-10 rounded-2xl text-base font-semibold text-white border-white/10 hover:bg-white/5 transition-all hover:scale-[1.02]"
                                    asChild
                                >
                                    <Link href="#pricing">{t.hero.ctaSecondary}</Link>
                                </Button>
                            </div>

                            {/* Trust Signals */}
                            <div className="flex flex-wrap items-center gap-8">
                                {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((trust, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <div className="p-1 bg-indigo-500/10 rounded-lg">
                                            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{trust}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Dashboard Preview */}
                    <div className="lg:col-span-5 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="relative z-10"
                        >
                            <div className="animate-float">
                                <div className="relative p-2 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl overflow-hidden">
                                    {/* Floating Notification */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-10 -right-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-5 rounded-2xl shadow-xl shadow-indigo-500/30 z-30"
                                    >
                                        <div className="text-[10px] uppercase font-bold mb-1 opacity-70 tracking-wider">Leads de Hoje</div>
                                        <div className="text-3xl font-black">+124</div>
                                        <div className="text-[10px] font-bold mt-1 text-indigo-200">+18% vs ontem</div>
                                    </motion.div>

                                    <Image
                                        src="/imobweb_dashboard_mockup.png"
                                        alt="imobWeb Dashboard"
                                        width={1024}
                                        height={1024}
                                        priority
                                        className="rounded-[2.8rem] w-full h-auto shadow-2xl relative z-10 brightness-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                                    />

                                    {/* AI Overlay */}
                                    <div className="absolute bottom-8 left-8 bg-[#0a0a0f]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 z-20 flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                                            <Zap className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">IA Assistente</div>
                                            <div className="text-xs text-white font-medium">Recomendando ajuste de preço...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative Elements */}
                        <div className="absolute -z-10 -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
                        <div className="absolute -z-10 -top-20 -right-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
