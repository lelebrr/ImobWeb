'use client'

import { Star } from 'lucide-react'

const testimonials = [
    {
        name: 'Carlos Mendes',
        company: 'Imóveis Premium',
        role: 'Proprietário',
        content: 'O imobWeb revolucionou nosso processo de vendas. A integração com WhatsApp economiza pelo menos 5 horas por dia.',
        rating: 5,
    },
    {
        name: 'Ana Silva',
        company: 'Imobiliária Alpha',
        role: 'Corretora',
        content: 'A plataforma é intuitiva e poderosa. Finalmente consigo acompanhar todos meus clientes e imóveis de forma organizada.',
        rating: 5,
    },
    {
        name: 'Roberto Oliveira',
        company: 'Casa & Cia',
        role: 'Gerente',
        content: 'Os relatórios de desempenho nos ajudaram a identificar gargalos e otimizar nossa equipe. Recomendo!',
        rating: 4,
    },
    {
        name: 'Juliana Costa',
        company: 'Dream Properties',
        role: 'Corretora Sênior',
        content: 'O suporte é excepcional e a ferramenta evolui constantemente. Já aumentamos nossas vendas em 30%.',
        rating: 5,
    },
]

const Testimonials = () => {
    return (
        <section className="py-24 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        O que nossos clientes dizem
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                        Milhares de corretores e imobiliárias confiam no imobWeb para gerenciar seu negócio.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                            <div className="flex items-center">
                                <div className="mr-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                        <Star className="mr-1 h-4 w-4" />
                        Avaliação média 4.8/5 estrelas
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Testimonials