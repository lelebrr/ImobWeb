import OpenAI from "openai";

/**
 * Cliente de API do OpenAI com configurações padrão (v4)
 * ImobWeb 2026 - Premium AI SaaS
 */
export class OpenAIClient {
    private static instance: OpenAI;

    /**
     * Construtor privado para evitar instâncias diretas
     */
    private constructor() { }

    /**
     * Obtém a instância única do cliente
     */
    public static getInstance(): OpenAI {
        if (!OpenAIClient.instance) {
            OpenAIClient.instance = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
        return OpenAIClient.instance;
    }

    /**
     * Gera uma resposta de chat
     */
    public static async generateChatResponse(
        messages: any[],
        model: string = "gpt-4o",
        maxTokens: number = 1000,
        temperature: number = 0.3
    ): Promise<any> {
        const openai = this.getInstance();
        try {
            const response = await openai.chat.completions.create({
                model,
                messages,
                max_tokens: maxTokens,
                temperature,
            });
            return response.choices[0].message;
        } catch (error) {
            console.error("Erro ao chamar a API do OpenAI:", error);
            throw new Error("Falha na comunicação com a API do OpenAI");
        }
    }

    /**
     * Gera uma resposta de imagem
     */
    public static async generateImage(
        prompt: string,
        model: string = "dall-e-3",
        size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024",
        quality: "standard" | "hd" = "standard",
        n: number = 1
    ): Promise<any> {
        const openai = this.getInstance();
        try {
            const response = await openai.images.generate({
                prompt,
                model,
                size,
                quality,
                n,
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao gerar imagem:", error);
            throw new Error("Falha na geração de imagem");
        }
    }
}