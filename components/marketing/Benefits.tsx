'use client'

import { Building2, MessageSquare, Shield, GitMerge } from 'lucide-react'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'

const Benefits = () => {
    const { t } = useMarketingLanguage()

    return (
        <section className="py-24 bg-slate-50 relative">
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
                        {t.benefits.title}
                    </h2>
                    <p className="mx-auto mt-4 text-lg text-slate-600">
                        {t.benefits.subtitle}
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
                    {/* Feature 1 */}
                    <motion.div whileHover={{ y: -5 }} className="relative group">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 opacity-20 blur transition group-hover:opacity-40"></div>
                        <div className="relative flex flex-col items-start rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
                            <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100 mb-6">
                                <Building2 className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{t.benefits.b1Title}</h3>
                            <p className="mt-3 text-slate-600 leading-relaxed text-lg">{t.benefits.b1Desc}</p>
                        </div>
                    </motion.div>

                    {/* Feature 2 */}
                    <motion.div whileHover={{ y: -5 }} className="relative group">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-400 opacity-20 blur transition group-hover:opacity-40"></div>
                        <div className="relative flex flex-col items-start rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
                            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 mb-6">
                                <MessageSquare className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{t.benefits.b2Title}</h3>
                            <p className="mt-3 text-slate-600 leading-relaxed text-lg">{t.benefits.b2Desc}</p>
                        </div>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div whileHover={{ y: -5 }} className="relative group">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-500 opacity-20 blur transition group-hover:opacity-40"></div>
                        <div className="relative flex flex-col items-start rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
                            <div className="rounded-2xl bg-purple-50 p-4 ring-1 ring-purple-100 mb-6">
                                <GitMerge className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{t.benefits.b3Title}</h3>
                            <p className="mt-3 text-slate-600 leading-relaxed text-lg">{t.benefits.b3Desc}</p>
                        </div>
                    </motion.div>

                    {/* Feature 4 */}
                    <motion.div whileHover={{ y: -5 }} className="relative group">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-400 opacity-20 blur transition group-hover:opacity-40"></div>
                        <div className="relative flex flex-col items-start rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
                            <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100 mb-6">
                                <Shield className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{t.benefits.b4Title}</h3>
                            <p className="mt-3 text-slate-600 leading-relaxed text-lg">{t.benefits.b4Desc}</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Benefits