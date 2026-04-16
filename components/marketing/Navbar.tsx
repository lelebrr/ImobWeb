'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, Menu, X, Globe } from 'lucide-react'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Navbar - Psicologia de Design:
 * - Fundo Azul Profundo: Transmite autoridade, seguran\u00e7a e solidez.
 * - Logo \u00e0 Esquerda: Ponto de partida visual para construir confian\u00e7a (leitura ocidental).
 * - CTA Laranja/Dourado: Destaque visual supremo que convida \u00e0 a\u00e7\u00e3o valiosa.
 */
const Navbar = () => {
    const { t, language, setLanguage } = useMarketingLanguage()
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: t.nav.features, href: '#features' },
        { name: t.nav.pricing, href: '#pricing' },
        { name: 'Marketplace', href: '/marketplace' },
        { name: 'Franquias', href: '/franchise' },
    ]

    return (
        <header 
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                scrolled 
                ? 'bg-brand-deep/95 backdrop-blur-md py-3 shadow-lg border-b border-white/5' 
                : 'bg-brand-deep py-6'
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo - Trust Position (Left) */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-brand-growth text-white p-2 rounded-xl shadow-glow-growth group-hover:rotate-12 transition-transform duration-500">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter">
                            imob<span className="text-brand-growth">Web</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation - Central for Balance */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href} 
                                className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-growth transition-all group-hover:w-1/2" />
                            </Link>
                        ))}
                    </nav>

                    {/* Actions - Desire/Action Position (Right) */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Selector de l\u00edngua sutil */}
                        <div className="flex items-center gap-2 text-slate-400">
                            <button 
                                onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
                                className="flex items-center gap-1.5 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                <Globe className="h-3.5 w-3.5" />
                                {language}
                            </button>
                        </div>
                        
                        <Link 
                            href="/login" 
                            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                        >
                            {t.nav.login}
                        </Link>
                        
                        <Button 
                            className="bg-brand-action hover:bg-amber-600 text-slate-900 shadow-glow-action rounded-full px-8 font-black border-none h-11"
                        >
                            {t.nav.startFree}
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-white"
                        >
                            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden bg-brand-deep border-t border-white/5 overflow-hidden fixed inset-x-0 top-[72px] bottom-0 z-40"
                    >
                        <div className="px-6 py-12 flex flex-col gap-8">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.name} 
                                    href={link.href} 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-3xl font-black text-white hover:text-brand-growth transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-auto flex flex-col gap-4">
                                <Link 
                                    href="/login" 
                                    className="w-full py-5 text-center font-bold text-white border border-white/10 rounded-2xl"
                                >
                                    {t.nav.login}
                                </Link>
                                <Button className="w-full py-8 text-xl font-black rounded-2xl bg-brand-action text-slate-900">
                                    {t.nav.startFree}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}

export default Navbar

