import { Suspense } from 'react'
import { Metadata } from 'next'
import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import ProblemSolution from '@/components/marketing/ProblemSolution'
import HowItWorks from '@/components/marketing/HowItWorks'
import FeaturesGrid from '@/components/marketing/FeaturesGrid'
import MarketplaceTeaser from '@/components/marketing/MarketplaceTeaser'
import FranchiseSection from '@/components/marketing/FranchiseSection'
import Testimonials from '@/components/marketing/Testimonials'
import PricingTable from '@/components/marketing/PricingTable'
import CTASection from '@/components/marketing/CTASection'
import Footer from '@/components/marketing/Footer'
import FloatingWhatsApp from '@/components/marketing/FloatingWhatsApp'
import { PostHogProvider } from '@/lib/analytics/posthog'

/**
 * Metadata & SEO - Psicologia de Autoridade:
 * - T\u00edtulo com ano (2026) transmite que a ferramenta \u00e9 o estado da arte.
 * - Description foca em benef\u00edcios reais (fechar vendas) em vez de apenas recursos.
 */
export const metadata: Metadata = {
    title: 'imobWeb | O CRM Imobili\u00e1rio mais Inteligente do Brasil (2026)',
    description: 'Transforme sua imobili\u00e1ria com IA preditiva, publica\u00e7\u00e3o autom\u00e1tica em portais e WhatsApp proativo. A \u00fanica plataforma que fecha vendas para voc\u00ea.',
    keywords: ['crm imobili\u00e1rio', 'ia para imobili\u00e1rias', 'software imobili\u00e1rio', 'venda de im\u00f3veis', 'brasil', 'proptech'],
    openGraph: {
        title: 'imobWeb 2026 - O Futuro do Mercado Imobili\u00e1rio',
        description: 'Potencialize suas vendas com a nossa IA de \u00faltima gera\u00e7\u00e3o.',
        type: 'website',
        locale: 'pt_BR',
        url: 'https://imobweb.app',
    }
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'imobWeb',
    'operatingSystem': 'Windows, MacOS, Android, iOS',
    'applicationCategory': 'BusinessApplication, RealEstate',
    'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '1240'
    },
    'offers': {
        '@type': 'Offer',
        'price': '0.00',
        'priceCurrency': 'BRL'
    }
}

export default function Home() {
    return (
        <PostHogProvider>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            <Navbar />
            
            <main className="flex flex-col bg-brand-clean min-h-screen">
                <Hero />
                
                <Suspense fallback={<div className="h-96 flex items-center justify-center">...</div>}>
                    <ProblemSolution />
                </Suspense>

                <Suspense fallback={<div className="h-96 flex items-center justify-center">...</div>}>
                    <HowItWorks />
                </Suspense>

                <Suspense fallback={<div className="h-96 flex items-center justify-center">...</div>}>
                    <FeaturesGrid />
                </Suspense>

                <Suspense fallback={<div className="h-96 flex items-center justify-center">...</div>}>
                    <MarketplaceTeaser />
                </Suspense>

                <Suspense fallback={<div className="h-96 flex items-center justify-center">...</div>}>
                    <FranchiseSection />
                </Suspense>

                <Suspense fallback={<div className="h-96 flex items-center justify-center">...</div>}>
                    <Testimonials />
                </Suspense>

                <Suspense fallback={<div className="h-96 flex items-center justify-center text-brand-deep font-black">Carregando planos imbat\u00edveis...</div>}>
                    <PricingTable />
                </Suspense>

                <CTASection />

                <Footer />

                {/* Camada de Convers\u00e3o Adicional */}
                <FloatingWhatsApp />
            </main>
        </PostHogProvider>
    )
}
