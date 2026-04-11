'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, Globe, Menu, X } from 'lucide-react'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

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

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition-colors">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">imob<span className="text-blue-600">Web</span></span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            {t.nav.features}
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            {t.nav.pricing}
                        </Link>
                        <Link href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            {t.nav.testimonials}
                        </Link>
                    </nav>

                    {/* Actions & Language Switcher */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Language Selection */}
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full border border-gray-200">
                            <button
                                onClick={() => setLanguage('pt')}
                                className={`flex items-center justify-center h-8 w-8 rounded-full transition-all ${language === 'pt' ? 'bg-white shadow-sm ring-1 ring-gray-200 opacity-100 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                title="Português"
                            >
                                🇧🇷
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex items-center justify-center h-8 w-8 rounded-full transition-all ${language === 'en' ? 'bg-white shadow-sm ring-1 ring-gray-200 opacity-100 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                title="English"
                            >
                                🇺🇸
                            </button>
                        </div>

                        <div className="h-6 w-px bg-gray-200 mx-1"></div>

                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            {t.nav.login}
                        </Link>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 rounded-full px-6">
                            {t.nav.startFree}
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        {/* Mobile Language Selection */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full">
                            <button onClick={() => setLanguage('pt')} className={`h-6 w-6 rounded-full text-sm ${language === 'pt' ? 'bg-white shadow opacity-100' : 'opacity-50'}`}>🇧🇷</button>
                            <button onClick={() => setLanguage('en')} className={`h-6 w-6 rounded-full text-sm ${language === 'en' ? 'bg-white shadow opacity-100' : 'opacity-50'}`}>🇺🇸</button>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 p-2"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 md:hidden"
                    >
                        <div className="px-4 py-6 flex flex-col gap-4">
                            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-900 p-2 hover:bg-gray-50 rounded-lg">
                                {t.nav.features}
                            </Link>
                            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-900 p-2 hover:bg-gray-50 rounded-lg">
                                {t.nav.pricing}
                            </Link>
                            <Link href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-900 p-2 hover:bg-gray-50 rounded-lg">
                                {t.nav.testimonials}
                            </Link>
                            <hr className="my-2 border-gray-100" />
                            <Link href="/login" className="text-base font-medium text-center text-gray-900 p-2 border border-gray-200 rounded-lg">
                                {t.nav.login}
                            </Link>
                            <Button className="w-full bg-blue-600 py-6 text-base rounded-lg">
                                {t.nav.startFree}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}

export default Navbar
