'use client'

import { useMarketingLanguage } from '@/lib/i18n/MarketingLanguageContext'
import Navbar from './Navbar'
import Hero from './Hero'
import ProblemSolution from './ProblemSolution'
import HowItWorks from './HowItWorks'
import FeaturesGrid from './FeaturesGrid'
import MarketplaceTeaser from './MarketplaceTeaser'
import FranchiseSection from './FranchiseSection'
import Testimonials from './Testimonials'
import PricingTable from './PricingTable'
import CTASection from './CTASection'
import Footer from './Footer'
import FloatingWhatsApp from './FloatingWhatsApp'

export default function MarketingWrapper() {
    const { t, language, setLanguage } = useMarketingLanguage()

    return (
        <>
            <Navbar />
            <Hero />
            <ProblemSolution />
            <HowItWorks />
            <FeaturesGrid />
            <MarketplaceTeaser />
            <FranchiseSection />
            <Testimonials />
            <PricingTable />
            <CTASection />
            <Footer />
            <FloatingWhatsApp />
        </>
    )
}