"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X, Globe, Zap } from "lucide-react";
import { useMarketingLanguage } from "@/lib/i18n/MarketingLanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { t, language, setLanguage } = useMarketingLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.features, href: "#features" },
    { name: t.nav.pricing, href: "#pricing" },
    { name: "Marketplace", href: "/marketplace" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-xl py-3 border-b border-white/5 shadow-2xl shadow-black/20"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-110 transition-all duration-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              imob<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Web</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest p-2 rounded-lg hover:bg-white/5"
            >
              <Globe className="h-3.5 w-3.5" />
              {language}
            </button>

            <Link
              href="/login"
              className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
            >
              {t.nav.login}
            </Link>

            <Link href="/login">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 rounded-xl px-6 font-semibold h-10 text-[13px] border-0 transition-all">
                {t.nav.startFree}
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5 fixed inset-x-0 top-[60px] bottom-0 z-40"
          >
            <div className="px-6 py-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-white hover:text-indigo-400 transition-colors py-3 px-4 rounded-xl hover:bg-white/5"
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-auto pt-8 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-4 text-center font-semibold text-white border border-white/10 rounded-2xl hover:bg-white/5 transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full py-7 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/20">
                    {t.nav.startFree}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
