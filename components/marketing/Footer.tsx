'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const footerLinks = {
    product: [
        { name: 'Recursos', href: '#' },
        { name: 'Integrações', href: '#' },
        { name: 'Preços', href: '/pricing' },
        { name: 'Documentação', href: '#' },
    ],
    company: [
        { name: 'Sobre nós', href: '#' },
        { name: 'Carreiras', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Imprensa', href: '#' },
    ],
    support: [
        { name: 'Central de Ajuda', href: '#' },
        { name: 'Contato', href: '#' },
        { name: 'Suporte Premium', href: '#' },
        { name: 'Status do Sistema', href: '#' },
    ],
    legal: [
        { name: 'Privacidade', href: '#' },
        { name: 'Termos de Uso', href: '#' },
        { name: 'LGPD', href: '#' },
        { name: 'Segurança', href: '#' },
    ],
}

const socialLinks = [
    { name: 'Facebook', icon: <Facebook className="h-5 w-5" />, href: '#' },
    { name: 'Twitter', icon: <Twitter className="h-5 w-5" />, href: '#' },
    { name: 'Instagram', icon: <Instagram className="h-5 w-5" />, href: '#' },
    { name: 'LinkedIn', icon: <Linkedin className="h-5 w-5" />, href: '#' },
]

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="py-12">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
                        {/* Logo and description */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded bg-blue-500"></div>
                                <span className="ml-2 text-xl font-bold">imobWeb</span>
                            </div>
                            <p className="mt-4 text-gray-400 max-w-md">
                                Plataforma completa de CRM imobiliário para gerenciar imóveis, clientes e corretores com eficiência.
                            </p>

                            {/* Contact info */}
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center text-gray-400">
                                    <Mail className="mr-2 h-4 w-4" />
                                    contato@imobweb.com.br
                                </div>
                                <div className="flex items-center text-gray-400">
                                    <Phone className="mr-2 h-4 w-4" />
                                    (11) 9999-9999
                                </div>
                                <div className="flex items-center text-gray-400">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    São Paulo, SP
                                </div>
                            </div>

                            {/* Social links */}
                            <div className="mt-6 flex space-x-4">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        aria-label={social.name}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Footer links */}
                        {Object.entries(footerLinks).map(([category, links], index) => (
                            <div key={index}>
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                    {category}
                                </h3>
                                <ul className="mt-4 space-y-2">
                                    {links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <a
                                                href={link.href}
                                                className="text-gray-400 hover:text-white transition-colors"
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

                <div className="border-t border-gray-800 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            &copy; 2026 imobWeb. Todos os direitos reservados.
                        </p>
                        <p className="mt-4 md:mt-0 text-gray-400 text-sm">
                            Powered by Next.js 16 + Supabase + Stripe
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer