import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'imobWeb - Plataforma CRM Imobiliário Completa',
    description: 'Sistema de CRM imobiliário multi-tenant com gestão de imóveis, clientes e corretores. Comece grátis para corretores autônomos.',
    keywords: 'crm imobiliário, gestão imóveis, plataforma corretores, software imobiliário',
    openGraph: {
        title: 'imobWeb - Plataforma CRM Imobiliário Completa',
        description: 'Sistema de CRM imobiliário multi-tenant com gestão de imóveis, clientes e corretores. Comece grátis para corretores autônomos.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'imobWeb - Plataforma CRM Imobiliário Completa',
        description: 'Sistema de CRM imobiliário multi-tenant com gestão de imóveis, clientes e corretores. Comece grátis para corretores autônomos.',
    },
}

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
                    {children}
                </div>
            </body>
        </html>
    )
}