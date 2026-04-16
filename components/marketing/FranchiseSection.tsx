'use client'

import { Button } from '@/components/ui/button'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion } from 'framer-motion'
import { Building2, Globe, BarChart3, Users2, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

/**
 * FranchiseSection - Psicologia de Design:
 * - Seriedade Enterprise: Tons de cinza escuro e azul profundo.
 * - Hierarquia Visual: Mostra a estrutura Master vs Unidade para transmitir controle.
 * - M\u00e9tricas B2B: Foco em SLA, Seguran\u00e7a e Relat\u00f3rios Consolidados.
 */
const FranchiseSection = () => {
    const { t } = useMarketingLanguage()

    return (
        <section id="franchise" className="py-24 sm:py-32 bg-brand-deep text-white relative overflow-hidden">
            {/* Background Map Texture Concept */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <Globe className="absolute w-[1000px] h-[1000px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-growth blur-[150px] opacity-20" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-brand-growth">
                            <Building2 className="h-4 w-4" />
                            Escalabilidade Enterprise
                        </div>
                        <h2 className="text-4xl lg:text-7xl font-black mb-10 tracking-tighter leading-[0.95]">
                            {t.franchise.title}
                        </h2>
                        <p className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                            {t.franchise.subtitle}
                        </p>

                        <div className="grid gap-8 mb-16">
                            <div className="flex items-start gap-4 group">
                                <div className="bg-brand-growth/10 p-3 rounded-2xl group-hover:bg-brand-growth group-hover:text-brand-deep transition-all duration-500">
                                    <BarChart3 className="h-6 w-6 text-brand-growth group-hover:text-brand-deep" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">Relat\u00f3rios Consolidados</h4>
                                    <p className="text-slate-500 font-medium">Vis\u00e3o 360\u00ba de cada unidade, corretor e lead da sua rede em tempo real.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="bg-brand-growth/10 p-3 rounded-2xl group-hover:bg-brand-growth group-hover:text-brand-deep transition-all duration-500">
                                    <Users2 className="h-6 w-6 text-brand-growth group-hover:text-brand-deep" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">Gest\u00e3o Multi-Tier</h4>
                                    <p className="text-slate-500 font-medium">N\u00edveis hier\u00e1rquicos isolados com controles globais pela Master Franquia.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="bg-brand-growth/10 p-3 rounded-2xl group-hover:bg-brand-growth group-hover:text-brand-deep transition-all duration-500">
                                    <ShieldCheck className="h-6 w-6 text-brand-growth group-hover:text-brand-deep" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">SLA Enterprise</h4>
                                    <p className="text-slate-500 font-medium">Infraestrutura dedicada com seguran\u00e7a banc\u00e1ria e uptime de 99.9%.</p>
                                </div>
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className="h-16 px-12 rounded-2xl text-lg font-black bg-white text-brand-deep hover:bg-brand-growth transition-all hover:scale-105 active:scale-95" 
                            asChild
                        >
                            <Link href="/contact">
                                {t.franchise.cta} <ArrowRight className="ml-3 h-5 w-5" />
                            </Link>
                        </Button>
                    </motion.div>

                    <div className="lg:col-span-6 relative">
                        {/* Visual Mock of High-Tier Dashboard */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="p-10 bg-white/5 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl shadow-3xl"
                        >
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-growth rounded-xl flex items-center justify-center text-brand-deep font-black">MF</div>
                                        <div className="text-sm font-black uppercase tracking-widest text-slate-300">Painel Master</div>
                                    </div>
                                    <div className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-slate-400 font-bold uppercase tracking-widest">Global Live View</div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Unidades Ativas</div>
                                        <div className="text-3xl font-black text-white tracking-tighter">42</div>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-black uppercase mb-2">VGV Total Rede</div>
                                        <div className="text-3xl font-black text-brand-growth tracking-tighter">R$ 1.8B</div>
                                    </div>
                                </div>

                                <div className="bg-brand-growth/10 p-6 rounded-2xl border border-brand-growth/20">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-black text-white uppercase tracking-tighter">Performance M\u00e9dia da Rede</span>
                                        <span className="text-xs font-bold text-brand-growth">+14.2%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '75%' }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-brand-growth shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-brand-growth rounded-full shadow-[0_0_5px_rgba(16,185,129,1)]" />
                                            <span className="font-bold text-white">Unidade S\u00e3o Paulo</span>
                                        </div>
                                        <span className="text-brand-growth font-black">Meta Batida</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-brand-growth rounded-full shadow-[0_0_5px_rgba(16,185,129,1)]" />
                                            <span className="font-bold text-white">Unidade Rio de Janeiro</span>
                                        </div>
                                        <span className="text-brand-growth font-black">Meta Batida</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Decorative background glow */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-growth/20 blur-[130px] rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FranchiseSection
