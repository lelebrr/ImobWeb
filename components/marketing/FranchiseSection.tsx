'use client'

import { Button } from '@/components/ui/button'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { Building2, Globe, BarChart3, Users2, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const FranchiseSection = () => {
    const { t } = useMarketingLanguage()

    return (
        <section id="franchise" className="py-24 sm:py-32 bg-[#0c0c14] text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <Globe className="absolute w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 blur-[150px] opacity-20" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest mb-6 text-indigo-400">
                            <Building2 className="h-4 w-4" />
                            Escalabilidade Enterprise
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tighter leading-[0.95]">
                            {t.franchise.title}
                        </h2>
                        <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">
                            {t.franchise.subtitle}
                        </p>

                        <div className="grid gap-6 mb-12">
                            {[
                                { icon: BarChart3, title: 'Relatórios Consolidados', desc: 'Visão 360° de cada unidade, corretor e lead da sua rede em tempo real.' },
                                { icon: Users2, title: 'Gestão Multi-Tier', desc: 'Níveis hierárquicos isolados com controles globais pela Master Franquia.' },
                                { icon: ShieldCheck, title: 'SLA Enterprise', desc: 'Infraestrutura dedicada com segurança bancária e uptime de 99.9%.' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 group">
                                    <div className="bg-indigo-500/10 p-3 rounded-xl group-hover:bg-indigo-500 transition-all duration-500 border border-indigo-500/20">
                                        <item.icon className="h-5 w-5 text-indigo-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" className="h-12 px-8 rounded-xl text-sm font-bold bg-white text-[#0a0a0f] hover:bg-slate-200 transition-all" asChild>
                            <Link href="/contact">
                                {t.franchise.cta} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>

                    <div className="lg:col-span-6 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-sm"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">MF</div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Painel Master</div>
                                    </div>
                                    <div className="text-[9px] bg-white/5 px-3 py-1 rounded-full text-slate-500 font-bold uppercase tracking-widest border border-white/5">Global Live</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Unidades Ativas</div>
                                        <div className="text-2xl font-black text-white">42</div>
                                    </div>
                                    <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">VGV Total Rede</div>
                                        <div className="text-2xl font-black text-indigo-400">R$ 1.8B</div>
                                    </div>
                                </div>

                                <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Performance Média</span>
                                        <span className="text-[10px] font-bold text-indigo-400">+14.2%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '75%' }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {['Unidade São Paulo', 'Unidade Rio de Janeiro'].map((unit) => (
                                        <div key={unit} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                                                <span className="text-xs font-bold text-white">{unit}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-400">Meta Batida</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 blur-[130px] rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FranchiseSection
