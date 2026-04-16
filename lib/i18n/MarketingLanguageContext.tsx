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
    problemSolution: {
        title: string
        subtitle: string
        prob1: string
        prob1Desc: string
        sol1: string
        sol1Desc: string
        prob2: string
        prob2Desc: string
        sol2: string
        sol2Desc: string
    }
    howItWorks: {
        title: string
        step1: string
        step1Title: string
        step1Desc: string
        step2: string
        step2Title: string
        step2Desc: string
        step3: string
        step3Title: string
        step3Desc: string
        step4: string
        step4Title: string
        step4Desc: string
    }
    featuresGrid: {
        title: string
        subtitle: string
        f1Title: string
        f1Desc: string
        f2Title: string
        f2Desc: string
        f3Title: string
        f3Desc: string
        f4Title: string
        f4Desc: string
        f5Title: string
        f5Desc: string
        f6Title: string
        f6Desc: string
    }
    marketplace: {
        title: string
        subtitle: string
        cta: string
    }
    franchise: {
        title: string
        subtitle: string
        cta: string
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
            badge: 'Plataforma #1 em Conversão Imobiliária (2026)',
            titlePart1: 'Cadastro 1x. WhatsApp Automático.',
            titleHighlight: ' Venda 3x mais.',
            subtitle: 'O imobWeb é o único CRM que proativamente busca o fechamento. IA preditiva, publicação em todos os portais e WhatsApp proativo para proprietários.',
            ctaPrimary: 'Começar Grátis Agora',
            ctaSecondary: 'Ver Demonstração',
            trust1: 'Líder em 2026',
            trust2: '+500 Imobiliárias',
            trust3: 'Setup em 2 minutos'
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
            features: 'Recursos',
            pricing: 'Preços',
            resources: 'Recursos',
            blog: 'Blog',
            helpCenter: 'Suporte',
            company: 'Empresa',
            aboutUs: 'Sobre Nós',
            contact: 'Contato',
            legal: 'Legal',
            privacy: 'Privacidade',
            terms: 'Termos',
            rights: 'Todos os direitos reservados.',
            desc: 'A plataforma definitiva para imobiliárias de alta performance.'
        },
        problemSolution: {
            title: 'Por que as imobiliárias perdem 60% dos leads?',
            subtitle: 'A resposta está na demora e na falta de proatividade. O imobWeb resolve isso com automação extrema.',
            prob1: 'Cadastro Lento',
            prob1Desc: 'Horas perdidas cadastrando em vários portais.',
            sol1: 'Publicação 1-Click',
            sol1Desc: 'Cadastre uma vez, publique em todos os portais e redes sociais instantaneamente.',
            prob2: 'Leads Esquecidos',
            prob2Desc: 'Corretores demoram horas para responder e perdem o "timing".',
            sol2: 'WhatsApp Proativo',
            sol2Desc: 'Nossa IA aborda o prospecto em segundos e já qualifica o lead para você.'
        },
        howItWorks: {
            title: 'Como funciona o imobWeb',
            step1: '01',
            step1Title: 'Cadastro Único',
            step1Desc: 'Insira os dados do imóvel em uma interface ultra-rápida.',
            step2: '02',
            step2Title: 'Multidifusão IA',
            step2Desc: 'IA otimiza a descrição e publica em +20 portais automaticamente.',
            step3: '03',
            step3Title: 'Atendimento Pró-ativo',
            step3Desc: 'Leads recebem contato via WhatsApp em menos de 10 segundos.',
            step4: '04',
            step4Title: 'Fechamento Digital',
            step4Desc: 'Contratos e assinaturas resolvidos em minutos dentro da plataforma.'
        },
        featuresGrid: {
            title: 'Tecnologia de ponta em cada detalhe',
            subtitle: 'Mais de 20 módulos de IA trabalhando para o seu sucesso.',
            f1Title: 'IA Preditiva de Preços',
            f1Desc: 'Sugestões baseadas em dados reais do mercado local.',
            f2Title: 'Contratos Inteligentes',
            f2Desc: 'Assinatura digital e gestão de documentos em conformidade com a LGPD.',
            f3Title: 'Score de Saúde do Imóvel',
            f3Desc: 'Saiba quais imóveis estão prontos para vender ou precisam de ajuste.',
            f4Title: 'Financeiro Completo',
            f4Desc: 'Controle de comissões, repasses e fluxo de caixa automatizado.',
            f5Title: 'Add-ons Marketplace',
            f5Desc: 'Potencialize seu CRM com ferramentas de parceiros integradas.',
            f6Title: 'Multi-tenant e Franquias',
            f6Desc: 'Gestão isolada de múltiplas unidades com visão consolidada.'
        },
        marketplace: {
            title: 'Maximize seu potencial com Add-ons',
            subtitle: 'De tours 3D a seguros fiança, tudo a um clique de distância.',
            cta: 'Explorar Marketplace'
        },
        franchise: {
            title: 'Para Redes e Franquias',
            subtitle: 'O controle que a franqueadora precisa, com a autonomia que o franqueado deseja.',
            cta: 'Agendar Demo Enterprise'
        }
    },
    en: {
        problemSolution: {
            title: 'Simplify Your Real Estate Operations',
            subtitle: 'From lead generation to closing, we provide all the tools you need to succeed.',
            prob1: 'Managing multiple portals, tracking leads, and coordinating teams can be overwhelming.',
            prob1Desc: 'Without a centralized system, you risk losing leads and missing opportunities.',
            sol1: 'Our all-in-one platform centralizes everything you need.',
            sol1Desc: 'Manage properties, leads, and teams from a single dashboard.',
            prob2: 'Manual processes waste valuable time and resources.',
            prob2Desc: 'Spending hours on administrative tasks instead of closing deals.',
            sol2: 'Automated workflows save you time and increase efficiency.',
            sol2Desc: 'Let our AI handle repetitive tasks while you focus on growth.'
        },
        howItWorks: {
            title: 'How It Works',
            step1: 'Sign Up',
            step1Title: 'Create your account in seconds',
            step1Desc: 'No credit card required',
            step2: 'Connect',
            step2Title: 'Integrate your portals',
            step2Desc: 'Link your existing real estate platforms',
            step3: 'Launch',
            step3Title: 'Start managing your properties',
            step3Desc: 'Begin tracking leads and closing deals',
            step4: 'Scale',
            step4Title: 'Grow your business',
            step4Desc: 'Add more features as you need them'
        },
        featuresGrid: {
            title: 'Powerful Features for Real Estate Professionals',
            subtitle: 'Everything you need to manage your business effectively',
            f1Title: 'Multi-Portal Management',
            f1Desc: 'Manage multiple real estate portals from one dashboard',
            f2Title: 'AI-Powered Lead Scoring',
            f2Desc: 'Automatically prioritize leads based on engagement',
            f3Title: 'WhatsApp Integration',
            f3Desc: 'Seamless communication with clients',
            f4Title: 'Automated Reports',
            f4Desc: 'Generate insights with one click',
            f5Title: 'Custom Portals',
            f5Desc: 'White-label solutions for your brand',
            f6Title: 'Mobile Access',
            f6Desc: 'Manage your business on the go'
        },
        marketplace: {
            title: 'Maximize Your Potential with Add-ons',
            subtitle: 'From 3D tours to guarantee insurance, everything is a click away.',
            cta: 'Explore Marketplace'
        },
        franchise: {
            title: 'For Networks and Franchises',
            subtitle: 'The control franchisees need, with the autonomy franchisees desire.',
            cta: 'Schedule Enterprise Demo'
        },
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
