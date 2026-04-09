'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const Hero = () => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-blue-100 [mask-image:linear-gradient(0deg,white,transparent)]"></div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="py-24 md:py-32">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-6">
                            <Star className="mr-1 h-4 w-4" />
                            Plataforma premiada em CRM imobiliário
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                            CRM Imobiliário Completo para
                            <span className="text-blue-600"> Corretores e Imobiliárias</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
                            Sistema multi-tenant com gestão de imóveis, clientes, corretoras e integração WhatsApp.
                            Comece grátis com plano para corretores autônomos.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/onboarding">
                                    Comece Agora <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button variant="outline" size="lg" asChild>
                                <Link href="#pricing">Ver Planos</Link>
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="mt-16 flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                            <div className="flex items-center text-gray-600">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                7 dias grátis
                            </div>
                            <div className="flex items-center text-gray-600">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                Sem cartão necessário
                            </div>
                            <div className="flex items-center text-gray-600">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                Cancelamento quando quiser
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
            <div className="absolute top-0 right-0 h-64 w-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute top-0 left-0 h-64 w-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>
    )
}

export default Hero