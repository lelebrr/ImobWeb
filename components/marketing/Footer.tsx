'use client'

import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'

const Footer = () => {
    const { t } = useMarketingLanguage()

    const footerLinks = {
        [t.footer.product]: [
            { name: t.footer.features, href: '#features' },
            { name: 'API', href: '#' },
            { name: t.footer.pricing, href: '#pricing' },
            { name: 'Marketplace', href: '#' },
        ],
        [t.footer.company]: [
            { name: t.footer.aboutUs, href: '#' },
            { name: t.footer.blog, href: '#' },
            { name: t.footer.contact, href: '#' },
            { name: t.footer.helpCenter, href: '#' },
        ],
        [t.footer.legal]: [
            { name: t.footer.privacy, href: '#' },
            { name: t.footer.terms, href: '#' },
            { name: 'LGPD / GDPR', href: '#' },
            { name: 'Security', href: '#' },
        ],
    }

    const socialLinks = [
        { name: 'Facebook', icon: <Facebook className="h-5 w-5" />, href: '#' },
        { name: 'Twitter', icon: <Twitter className="h-5 w-5" />, href: '#' },
        { name: 'Instagram', icon: <Instagram className="h-5 w-5" />, href: '#' },
        { name: 'LinkedIn', icon: <Linkedin className="h-5 w-5" />, href: '#' },
    ]

    return (
        <footer className="bg-slate-950 text-slate-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="py-20">
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
                        {/* Logo and description */}
                        <div className="lg:col-span-2">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-500 transition-colors">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-white">imob<span className="text-blue-500">Web</span></span>
                            </Link>
                            <p className="mt-6 text-slate-400 max-w-sm leading-relaxed text-sm">
                                {t.footer.desc}
                            </p>

                            {/* Contact info */}
                            <div className="mt-8 space-y-3">
                                <div className="flex items-center text-slate-400 text-sm hover:text-white transition-colors cursor-pointer">
                                    <Mail className="mr-3 h-4 w-4 text-blue-500" />
                                    contato@imobweb.com.br
                                </div>
                                <div className="flex items-center text-slate-400 text-sm hover:text-white transition-colors cursor-pointer">
                                    <Phone className="mr-3 h-4 w-4 text-blue-500" />
                                    +55 (11) 99999-9999
                                </div>
                                <div className="flex items-center text-slate-400 text-sm hover:text-white transition-colors cursor-pointer">
                                    <MapPin className="mr-3 h-4 w-4 text-blue-500" />
                                    São Paulo, SP - {t.footer.company}
                                </div>
                            </div>
                        </div>

                        {/* Footer links */}
                        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
                            {Object.entries(footerLinks).map(([category, links], index) => (
                                <div key={index}>
                                    <h3 className="text-sm font-semibold text-white tracking-wider">
                                        {category}
                                    </h3>
                                    <ul className="mt-6 space-y-4">
                                        {links.map((link, linkIndex) => (
                                            <li key={linkIndex}>
                                                <a
                                                    href={link.href}
                                                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
                                                >
                                                    {link.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800/60 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} imobWeb. {t.footer.rights}
                    </p>
                    {/* Social links */}
                    <div className="flex space-x-6">
                        {socialLinks.map((social, index) => (
                            <a
                                key={index}
                                href={social.href}
                                className="text-slate-500 hover:text-white transition-all hover:scale-110"
                                aria-label={social.name}
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer