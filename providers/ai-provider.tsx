'use client'

import * as React from 'react'
import { OpenAI } from 'openai'

/**
 * Contexto de IA
 * Gerencia a integração com OpenAI para funções de IA
 */
interface AIContextType {
    openai: OpenAI | null
    isReady: boolean
    generateDescription: (propertyData: any) => Promise<string>
    suggestPrice: (propertyData: any, marketData: any) => Promise<number>
    chatWithOwner: (conversationHistory: any[], message: string) => Promise<string>
}

const AIContext = React.createContext<AIContextType | undefined>(undefined)

/**
 * Provider de IA
 * Deve envolver toda a aplicação
 */
export function AIProvider({ children }: { children: React.ReactNode }) {
    const [openai, setOpenAI] = React.useState<OpenAI | null>(null)
    const [isReady, setIsReady] = React.useState(false)

    React.useEffect(() => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
            if (apiKey) {
                const client = new OpenAI({
                    apiKey,
                    dangerouslyAllowBrowser: true,
                })
                setOpenAI(client)
                setIsReady(true)
            }
        } catch (error) {
            console.error('Erro ao inicializar OpenAI:', error)
        }
    }, [])

    /**
     * Gerar descrição do imóvel com IA
     */
    const generateDescription = React.useCallback(async (propertyData: any) => {
        if (!openai) throw new Error('OpenAI não está configurado')

        const prompt = `
      Crie uma descrição atraente e profissional para um imóvel com as seguintes características:
      
      Tipo: ${propertyData.type}
      Negócio: ${propertyData.businessType}
      Título: ${propertyData.title}
      Quartos: ${propertyData.bedrooms}
      Banheiros: ${propertyData.bathrooms}
      Vagas: ${propertyData.garages}
      Área: ${propertyData.area}m²
      Endereço: ${propertyData.city}, ${propertyData.state}
      Preço: ${propertyData.price}
      
      Inclua:
      - Destaque para os pontos fortes do imóvel
      - Use linguagem persuasiva mas profissional
      - Inclua palavras-chave para SEO
      - Deixe entre 300-500 caracteres
    `

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um especialista em marketing imobiliário com experiência em criar descrições atraentes e persuasivas para anúncios de imóveis.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 500,
            temperature: 0.7,
        })

        return response.choices[0]?.message?.content || ''
    }, [openai])

    /**
     * Sugerir preço com base em dados de mercado
     */
    const suggestPrice = React.useCallback(async (propertyData: any, marketData: any) => {
        if (!openai) throw new Error('OpenAI não está configurado')

        const prompt = `
      Analise os dados de mercado e sugira um preço ideal para o imóvel:
      
      Características do imóvel:
      - Tipo: ${propertyData.type}
      - Área: ${propertyData.area}m²
      - Quartos: ${propertyData.bedrooms}
      - Banheiros: ${propertyData.bathrooms}
      - Vagas: ${propertyData.garages}
      - Localização: ${propertyData.city}, ${propertyData.state}
      
      Dados de mercado (imóveis similares):
      ${JSON.stringify(marketData, null, 2)}
      
      Sugira um preço em BRL. Retorne apenas o número.
    `

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um especialista em avaliação imobiliária com acesso a dados de mercado. Forneça apenas o valor numérico sugerido.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 100,
            temperature: 0.3,
        })

        const suggestedPrice = response.choices[0]?.message?.content
        return suggestedPrice ? parseFloat(suggestedPrice.replace(/[^\d.]/g, '')) : 0
    }, [openai])

    /**
     * Chat com proprietário usando IA
     */
    const chatWithOwner = React.useCallback(async (
        conversationHistory: any[],
        message: string
    ) => {
        if (!openai) throw new Error('OpenAI não está configurado')

        const systemPrompt = `
      Você é um assistente virtual profissional para corretores de imóveis.
      Sua função é ajudar a conversar com proprietários de imóveis de forma educada e persuasiva.
      
      Regras:
      - Seja profissional e cortês
      - Use linguagem natural do WhatsApp
      - Não use emojis excessivos
      - Mantenha o tom conversacional
      - Seja direto e objetivo
      - Não prometa resultados não garantidos
    `

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...conversationHistory.map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
            { role: 'user' as const, content: message },
        ]

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            max_tokens: 500,
            temperature: 0.7,
        })

        return response.choices[0]?.message?.content || ''
    }, [openai])

    return (
        <AIContext.Provider
            value={{
                openai,
                isReady,
                generateDescription,
                suggestPrice,
                chatWithOwner,
            }}
        >
            {children}
        </AIContext.Provider>
    )
}

/**
 * Hook para acessar o contexto de IA
 */
export function useAI() {
    const context = React.useContext(AIContext)
    if (context === undefined) {
        throw new Error('useAI deve ser usado dentro de um AIProvider')
    }
    return context
}
