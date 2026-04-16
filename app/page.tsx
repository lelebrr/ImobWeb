import { Metadata } from 'next'
import MarketingWrapper from '@/components/marketing/MarketingWrapper'
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
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="flex flex-col bg-brand-clean min-h-screen">
                <MarketingWrapper />
            </main>
        </>
    )
}