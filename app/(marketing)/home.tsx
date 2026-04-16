import { Suspense } from 'react'
import Navbar from '@/components/marketing/Navbar'
import Hero from '@/components/marketing/Hero'
import FeaturedProperties from '@/components/marketing/FeaturedProperties'
import Benefits from '@/components/marketing/Benefits'
import Testimonials from '@/components/marketing/Testimonials'
import PricingTable from '@/components/marketing/PricingTable'
import CTASection from '@/components/marketing/CTASection'
import Footer from '@/components/marketing/Footer'
import { PostHogProvider } from '@/lib/analytics/posthog'

export default function Home() {
    return (
        <PostHogProvider>
            <Navbar />
            <main className="flex flex-col pt-20">
                <section id="hero">
                    <Hero />
                </section>

                <FeaturedProperties />

                <section id="features">
                    <Benefits />
                </section>

                <section id="testimonials">
                    <Testimonials />
                </section>

                <section id="pricing">
                    <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
                        <PricingTable />
                    </Suspense>
                </section>

                <section id="cta">
                    <CTASection />
                </section>

                <footer>
                    <Footer />
                </footer>
            </main>
        </PostHogProvider>
    )
}