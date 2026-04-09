import { Suspense } from 'react'
import Hero from '@/components/marketing/Hero'
import Benefits from '@/components/marketing/Benefits'
import Testimonials from '@/components/marketing/Testimonials'
import PricingTable from '@/components/marketing/PricingTable'
import CTASection from '@/components/marketing/CTASection'
import Footer from '@/components/marketing/Footer'
import { PostHogProvider } from '@/lib/analytics/posthog'

export default function Home() {
    return (
        <PostHogProvider>
            <main className="flex flex-col">
                <section id="hero">
                    <Hero />
                </section>

                <section id="benefits">
                    <Benefits />
                </section>

                <section id="testimonials">
                    <Testimonials />
                </section>

                <section id="pricing">
                    <Suspense fallback={<div>Carregando preços...</div>}>
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