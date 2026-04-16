'use client'

import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Zap, AlertTriangle, TrendingUp } from 'lucide-react'

/**
 * ProblemSolution - Psicologia de Design:
 * - Contraste Doloroso vs Alivio: O "Antigo" \u00e9 cinza/opaco (dor), o "Futuro imobWeb" \u00e9 verde vibrante (vida/crescimento).
 * - FOCO EM CONVERS\u00c3O: Mostra n\u00fameros de perda (60% leads) para gerar senso de urg\u00eancia (fear of missing out).
 */
const ProblemSolution = () => {
    const { t } = useMarketingLanguage()

    return (
        <section className="py-24 sm:py-32 bg-brand-clean relative overflow-hidden">
            {/* Elementos Graficos de Fundo */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-24 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tighter text-brand-deep">
                            {t.problemSolution.title}
                        </h2>
                        <p className="text-xl text-slate-500 leading-relaxed font-medium">
                            {t.problemSolution.subtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                    {/* The OLD Way - A DOR */}
                    <motion.div 
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="p-10 rounded-[3rem] border border-slate-200 bg-white shadow-sm relative group overflow-hidden"
                    >
                        <div className="absolute top-6 right-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-4 py-1.5 rounded-full">O Modelo Antigo</div>
                        
                        <div className="space-y-16 mt-10">
                            <div className="flex gap-6">
                                <div className="bg-slate-100 p-4 rounded-2xl h-fit">
                                    <AlertTriangle className="h-7 w-7 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3">{t.problemSolution.prob1}</h3>
                                    <p className="text-lg text-slate-500 leading-relaxed">{t.problemSolution.prob1Desc}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-6">
                                <div className="bg-slate-100 p-4 rounded-2xl h-fit">
                                    <Clock className="h-7 w-7 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-3">{t.problemSolution.prob2}</h3>
                                    <p className="text-lg text-slate-500 leading-relaxed">{t.problemSolution.prob2Desc}</p>
                                </div>
                            </div>
                        </div>

                        {/* Indicador de Perda Subliminar */}
                        <div className="mt-16 pt-8 border-t border-slate-100 flex items-center gap-4 text-slate-400">
                            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-[70%] bg-slate-300" />
                            </div>
                            <span className="text-sm font-bold">Alta Fric\u00e7\u00e3o</span>
                        </div>
                    </motion.div>

                    {/* The imobWeb Way - O ALIVIO */}
                    <motion.div 
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="p-10 rounded-[3rem] bg-brand-deep text-white relative shadow-3xl shadow-brand-deep/20 overflow-hidden"
                    >
                        {/* Glow Gradient de Crescimento */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-growth/20 blur-[80px] rounded-full" />
                        
                        <div className="absolute top-6 right-6 text-[10px] font-black text-brand-growth uppercase tracking-[0.2em] bg-brand-growth/10 px-4 py-1.5 rounded-full">O Padr\u00e3o 2026</div>
                        
                        <div className="space-y-16 mt-10 relative z-10">
                            <div className="flex gap-6">
                                <div className="bg-brand-growth p-4 rounded-2xl h-fit shadow-glow-growth rotate-3">
                                    <CheckCircle2 className="h-7 w-7 text-brand-deep" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-3">{t.problemSolution.sol1}</h3>
                                    <p className="text-lg text-slate-400 leading-relaxed">{t.problemSolution.sol1Desc}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-6">
                                <div className="bg-brand-growth p-4 rounded-2xl h-fit shadow-glow-growth -rotate-2">
                                    <Zap className="h-7 w-7 text-brand-deep" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-3">{t.problemSolution.sol2}</h3>
                                    <p className="text-lg text-slate-400 leading-relaxed">{t.problemSolution.sol2Desc}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-16 pt-8 border-t border-white/10 relative z-10">
                            <div className="bg-brand-growth/10 border border-brand-growth/20 rounded-2xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-brand-growth p-2 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-brand-deep" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white uppercase tracking-tighter">Retorno Garantido</div>
                                        <div className="text-xs text-brand-growth font-bold">Vendas +300% em 6 meses</div>
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-brand-growth inline-flex items-center">
                                    3x
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default ProblemSolution
