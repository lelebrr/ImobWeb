'use client'

import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Zap, AlertTriangle, TrendingUp } from 'lucide-react'

const ProblemSolution = () => {
    const { t } = useMarketingLanguage()

    return (
        <section className="py-24 sm:py-32 bg-[#0a0a0f] relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20 max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tighter text-white">
                            {t.problemSolution.title}
                        </h2>
                        <p className="text-xl text-slate-400 leading-relaxed font-medium">
                            {t.problemSolution.subtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    {/* The OLD Way */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] relative overflow-hidden"
                    >
                        <div className="absolute top-5 right-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            O Modelo Antigo
                        </div>

                        <div className="space-y-12 mt-8">
                            <div className="flex gap-5">
                                <div className="bg-white/5 p-3 rounded-xl h-fit border border-white/5">
                                    <AlertTriangle className="h-6 w-6 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{t.problemSolution.prob1}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{t.problemSolution.prob1Desc}</p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <div className="bg-white/5 p-3 rounded-xl h-fit border border-white/5">
                                    <Clock className="h-6 w-6 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{t.problemSolution.prob2}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{t.problemSolution.prob2Desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-white/5 flex items-center gap-3">
                            <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[70%] bg-slate-600 rounded-full" />
                            </div>
                            <span className="text-xs font-bold text-slate-500">Alta Fricção</span>
                        </div>
                    </motion.div>

                    {/* The imobWeb Way */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 relative overflow-hidden"
                    >
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 blur-[80px] rounded-full" />

                        <div className="absolute top-5 right-5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                            O Padrão 2026
                        </div>

                        <div className="space-y-12 mt-8 relative z-10">
                            <div className="flex gap-5">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl h-fit shadow-lg shadow-indigo-500/20">
                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{t.problemSolution.sol1}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{t.problemSolution.sol1Desc}</p>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl h-fit shadow-lg shadow-indigo-500/20">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{t.problemSolution.sol2}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{t.problemSolution.sol2Desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-white/10 relative z-10">
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                                        <TrendingUp className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white uppercase tracking-wider">Retorno Garantido</div>
                                        <div className="text-[11px] text-indigo-400 font-semibold">Vendas +300% em 6 meses</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-indigo-400">3x</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default ProblemSolution
