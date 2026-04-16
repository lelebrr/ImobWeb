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
 * - Título com ano (2026) transmite que a ferramenta é o estado da arte.
 * - Description foca em benefícios reais (fechar vendas) em vez de apenas recursos.
 */
export const metadata: Metadata = {
    title: 'imobWeb | O CRM Imobiliário mais Inteligente do Brasil (2026)',
    description: 'Transforme sua imobiliária com IA preditiva, publicação automática em portais e WhatsApp proativo. A única plataforma que fecha vendas para você.',
    keywords: ['crm imobiliário', 'ia para imobiliárias', 'software imobiliário', 'venda de imóveis', 'brasil', 'proptech'],
    openGraph: {
        title: 'imobWeb 2026 - O Futuro do Mercado Imobiliário',
        description: 'Potencialize suas vendas com a nossa IA de última geração.',
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

                <Suspense fallback={<div className="h-96 flex items-center justify-center text-brand-deep font-black">Carregando planos imbatíveis...</div>}>
                    <PricingTable />
                </Suspense>

                <CTASection />

                <Footer />

                {/* Camada de Conversão Adicional */}
                <FloatingWhatsApp />
            </main>
        </PostHogProvider>
    )
}