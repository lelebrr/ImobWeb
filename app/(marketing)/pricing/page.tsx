import { Suspense } from 'react'
import PricingTable from '@/components/marketing/PricingTable'

export default function PricingPage() {
    return (
        <main className="flex flex-col min-h-screen">
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Planos e Preços
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                            Escolha o plano perfeito para sua imobiliária e comece a transformar seu negócio hoje.
                        </p>
                    </div>
                </div>
            </section>

            <Suspense fallback={<div>Carregando preços...</div>}>
                <PricingTable />
            </Suspense>
        </main>
    )
}