'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'pt' | 'en'

interface TranslationDict {
    nav: {
        features: string
        pricing: string
        testimonials: string
        contact: string
        login: string
        startFree: string
    }
    hero: {
        badge: string
        titlePart1: string
        titleHighlight: string
        subtitle: string
        ctaPrimary: string
        ctaSecondary: string
        trust1: string
        trust2: string
        trust3: string
    }
    benefits: {
        title: string
        subtitle: string
        b1Title: string
        b1Desc: string
        b2Title: string
        b2Desc: string
        b3Title: string
        b3Desc: string
        b4Title: string
        b4Desc: string
    }
    pricing: {
        title: string
        subtitle: string
        monthly: string
        annually: string
        save20: string
        starter: string
        starterDesc: string
        professional: string
        professionalDesc: string
        enterprise: string
        enterpriseDesc: string
        startFree: string
        startPro: string
        contactSales: string
        features: string
        perMonth: string
    }
    testimonials: {
        title: string
        subtitle: string
        role1: string
        role2: string
        role3: string
        t1: string
        t2: string
        t3: string
    }
    cta: {
        title: string
        subtitle: string
        button: string
        noCreditCard: string
    }
    footer: {
        product: string
        features: string
        pricing: string
        resources: string
        blog: string
        helpCenter: string
        company: string
        aboutUs: string
        contact: string
        legal: string
        privacy: string
        terms: string
        rights: string
        desc: string
    }
}

const translations: Record<Language, TranslationDict> = {
    pt: {
        nav: {
            features: 'Recursos',
            pricing: 'Preços',
            testimonials: 'Depoimentos',
            contact: 'Contato',
            login: 'Entrar',
            startFree: 'Comece Grátis'
        },
        hero: {
            badge: 'Plataforma premiada em CRM imobiliário',
            titlePart1: 'CRM Imobiliário Completo para',
            titleHighlight: ' Corretores e Imobiliárias',
            subtitle: 'Sistema multi-tenant com gestão de imóveis, clientes, corretoras e integração WhatsApp. Comece grátis com plano para corretores autônomos.',
            ctaPrimary: 'Comece Agora',
            ctaSecondary: 'Ver Planos',
            trust1: '7 dias grátis',
            trust2: 'Sem cartão necessário',
            trust3: 'Cancelamento livre'
        },
        benefits: {
            title: 'Tudo que você precisa para vender mais',
            subtitle: 'Nossa plataforma oferece ferramentas completas para gerenciar sua imobiliária, desde a captação até o fechamento do contrato.',
            b1Title: 'Gestão Inteligente',
            b1Desc: 'Controle total sobre seus imóveis, leads e comissões em um dashboard intuitivo.',
            b2Title: 'Integração WhatsApp',
            b2Desc: 'Responda clientes e agende visitas diretamente pela plataforma com AI integrada.',
            b3Title: 'Multi-Tenant (White Label)',
            b3Desc: 'Crie portais personalizados para franquias e corretores associados com sua marca.',
            b4Title: 'Relatórios Avançados',
            b4Desc: 'Métricas em tempo real sobre desempenho de vendas, funil e conversões.'
        },
        pricing: {
            title: 'Planos Transparentes e Escaláveis',
            subtitle: 'Escolha o plano ideal para o tamanho do seu negócio',
            monthly: 'Mensal',
            annually: 'Anual',
            save20: 'Economize 20%',
            starter: 'Iniciante',
            starterDesc: 'Ideal para corretores autônomos.',
            professional: 'Profissional',
            professionalDesc: 'Para pequenas e médias imobiliárias.',
            enterprise: 'Enterprise',
            enterpriseDesc: 'Para grandes redes e franquias completas.',
            startFree: 'Comece Grátis',
            startPro: 'Assine Profissional',
            contactSales: 'Falar com Vendas',
            features: 'Recursos inclusos:',
            perMonth: '/mês'
        },
        testimonials: {
            title: 'O que nossos clientes dizem',
            subtitle: 'Descubra como a imobWeb revolucionou as operações de nossos parceiros.',
            role1: 'Corretor Autônomo',
            role2: 'Diretora de Vendas',
            role3: 'CEO da ImobTech',
            t1: '"O melhor CRM que já utilizei. As integrações me poupam horas preciosas de trabalho manual e fecho negócios muito mais rápido."',
            t2: '"Conseguimos organizar nossa equipe de 20 corretores perfeitamente. A visão de funil e os relatórios nos ajudaram a triplicar as vendas."',
            t3: '"A função White Label transformou o nosso modelo de franquias. Cada unidade tem seu próprio sistema personalizado."'
        },
        cta: {
            title: 'Pronto para transformar sua imobiliária?',
            subtitle: 'Junte-se a milhares de parceiros que já usam a imobWeb.',
            button: 'Criar Conta Gratuita',
            noCreditCard: 'Nenhum cartão de crédito necessário'
        },
        footer: {
            product: 'Produto',
            features: 'Funcionalidades',
            pricing: 'Planos',
            resources: 'Recursos',
            blog: 'Blog',
            helpCenter: 'Central de Ajuda',
            company: 'Empresa',
            aboutUs: 'Sobre Nós',
            contact: 'Contato',
            legal: 'Legal',
            privacy: 'Privacidade',
            terms: 'Termos de Uso',
            rights: 'Todos os direitos reservados.',
            desc: 'Revolucionando o mercado imobiliário com tecnologia e inovação.'
        }
    },
    en: {
        nav: {
            features: 'Features',
            pricing: 'Pricing',
            testimonials: 'Testimonials',
            contact: 'Contact',
            login: 'Log in',
            startFree: 'Start Free'
        },
        hero: {
            badge: 'Award-winning Real Estate CRM Platform',
            titlePart1: 'Complete Real Estate CRM for',
            titleHighlight: ' Agents and Agencies',
            subtitle: 'Multi-tenant system with robust property, client, and agency management. Get started for free with our autonomous agent plan.',
            ctaPrimary: 'Get Started',
            ctaSecondary: 'View Plans',
            trust1: '7-day free trial',
            trust2: 'No credit card required',
            trust3: 'Cancel anytime'
        },
        benefits: {
            title: 'Everything you need to sell more',
            subtitle: 'Our platform offers comprehensive tools to manage your real estate business, from lead capture to closing.',
            b1Title: 'Smart Management',
            b1Desc: 'Total control over your properties, leads, and commissions in one intuitive dashboard.',
            b2Title: 'WhatsApp Integration',
            b2Desc: 'Reply to clients and schedule visits directly from the platform with built-in AI.',
            b3Title: 'Multi-Tenant (White Label)',
            b3Desc: 'Create customized portals for franchises and associated agents with your own brand.',
            b4Title: 'Advanced Reports',
            b4Desc: 'Real-time metrics on sales performance, funnels, and conversion rates.'
        },
        pricing: {
            title: 'Transparent & Scalable Pricing',
            subtitle: 'Choose the ideal plan for your business size',
            monthly: 'Monthly',
            annually: 'Annually',
            save20: 'Save 20%',
            starter: 'Starter',
            starterDesc: 'Perfect for independent real estate agents.',
            professional: 'Professional',
            professionalDesc: 'For small to medium real estate agencies.',
            enterprise: 'Enterprise',
            enterpriseDesc: 'For large networks and robust franchises.',
            startFree: 'Start for Free',
            startPro: 'Get Professional',
            contactSales: 'Contact Sales',
            features: 'Included features:',
            perMonth: '/mo'
        },
        testimonials: {
            title: 'What our clients say',
            subtitle: 'Discover how imobWeb revolutionized the operations of our partners.',
            role1: 'Independent Agent',
            role2: 'Sales Director',
            role3: 'ImobTech CEO',
            t1: '"The best CRM I\'ve ever used. The integrations save me precious hours of manual work and I close deals much faster now."',
            t2: '"We managed to organize our 20-agent team flawlessly. The funnel view and reports helped us triple our sales this year."',
            t3: '"The White Label feature transformed our franchise model. Each unit now runs their own custom-branded system."'
        },
        cta: {
            title: 'Ready to transform your real estate agency?',
            subtitle: 'Join thousands of partners already using imobWeb.',
            button: 'Create Free Account',
            noCreditCard: 'No credit card required.'
        },
        footer: {
            product: 'Product',
            features: 'Features',
            pricing: 'Pricing',
            resources: 'Resources',
            blog: 'Blog',
            helpCenter: 'Help Center',
            company: 'Company',
            aboutUs: 'About Us',
            contact: 'Contact',
            legal: 'Legal',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            rights: 'All rights reserved.',
            desc: 'Revolutionizing the real estate market with technology and innovation.'
        }
    }
}

interface LanguageContextProps {
    language: Language
    setLanguage: (lang: Language) => void
    t: TranslationDict
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export const MarketingLanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('pt')

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useMarketingLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useMarketingLanguage must be used within a MarketingLanguageProvider')
    }
    return context
}
