import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Onboarding - imobWeb',
    description: 'Comece sua jornada com a imobWeb. Configure sua imobiliária, convide corretores e escolha seu plano.',
    keywords: 'onboarding imobweb, cadastro imobiliária, configuração imobweb',
}

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
                    {children}
                </div>
            </body>
        </html>
    )
}