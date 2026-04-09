'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const CTASection = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]"></div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="py-24 md:py-32">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                            Pronto para transformar sua imobiliária?
                        </h2>

                        <p className="mx-auto mt-4 max-w-2xl text-xl text-blue-100">
                            Junte-se a mais de 10.000 corretores e imobiliárias que já aumentaram sua produtividade com o imobWeb.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                <Link href="/onboarding">
                                    Comece sua teste grátis <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-blue-600"
                                asChild
                            >
                                <Link href="#pricing">Ver planos</Link>
                            </Button>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-16 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-blue-100">
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                                7 dias grátis sem cartão
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                                Sem compromisso
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                                Suporte 24/7
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                                Cancelamento anytime
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute top-0 left-0 h-64 w-64 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </section>
    )
}

export default CTASection