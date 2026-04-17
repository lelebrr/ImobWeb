import { WhatsAppButton } from "@/types/whatsapp";
import { ProofOfLifeEngine } from "@/lib/ai/proof-of-life-engine";

/**
 * Fluxos de WhatsApp para Prova de Vida
 * Gerencia os fluxos de conversação para solicitar e verificar provas de vida
 */

export class ProofOfLifeFlows {
    /**
     * Gera o fluxo inicial para solicitar prova de vida
     * @param propertyId ID da propriedade
     * @param ownerPhone Telefone do proprietário
     * @param ownerName Nome do proprietário
     * @returns Botões interativos para o WhatsApp
     */
    static async generateInitialFlow(
        propertyId: string,
        ownerPhone: string,
        ownerName: string
    ): Promise<{ message: string; buttons: WhatsAppButton[] }> {
        const buttons = await ProofOfLifeEngine.generateProofRequestFlow(
            propertyId,
            ownerPhone,
            ownerName
        );

        const message = `Olá ${ownerName}! 👋

Para garantir a segurança do seu imóvel e facilitar a venda, precisamos verificar sua identidade. Pode enviar uma prova de vida?

Você pode escolher entre:
📹 Gravar um vídeo curto
📷 Enviar uma foto sua
📄 Enviar um documento válido`;

        return {
            message,
            buttons,
        };
    }

    /**
     * Gera o fluxo para mostrar status da prova
     * @param proofId ID da prova
     * @param ownerPhone Telefone do proprietário
     * @param ownerName Nome do proprietário
     * @returns Botões interativos para o WhatsApp
     */
    static async generateStatusFlow(
        proofId: string,
        ownerPhone: string,
        ownerName: string
    ): Promise<{ message: string; buttons: WhatsAppButton[] }> {
        const buttons = await ProofOfLifeEngine.generateProofStatusFlow(
            proofId,
            ownerPhone,
            ownerName
        );

        const message = `📊 Status da Prova de Vida

Seu documento foi analisado com sucesso! ✅

Você pode:
• Ver os detalhes completos
• Reenviar uma nova prova`;

        return {
            message,
            buttons,
        };
    }

    /**
     * Gera o fluxo para quando a prova é rejeitada
     * @param proofId ID da prova
     * @param ownerPhone Telefone do proprietário
     * @param ownerName Nome do proprietário
     * @returns Botões interativos para o WhatsApp
     */
    static async generateRejectedFlow(
        proofId: string,
        ownerPhone: string,
        ownerName: string
    ): Promise<{ message: string; buttons: WhatsAppButton[] }> {
        const buttons = [
            {
                id: `proof_resend_${proofId}`,
                title: "Reenviar Prova",
            },
            {
                id: `proof_contact_agent_${proofId}`,
                title: "Falar com Corretor",
            },
        ];

        const message = `⚠️ Prova de Vida Não Identificada

Tentamos verificar sua identidade, mas não conseguimos identificar o documento.

Você pode:
• Reenviar uma prova diferente
• Falar com nosso corretor para auxiliar`;

        return {
            message,
            buttons,
        };
    }

    /**
     * Gera o fluxo para quando a prova é aprovada
     * @param proofId ID da prova
     * @param ownerPhone Telefone do proprietário
     * @param ownerName Nome do proprietário
     * @param confidence Nível de confiança da IA
     * @returns Botões interativos para o WhatsApp
     */
    static async generateApprovedFlow(
        proofId: string,
        ownerPhone: string,
        ownerName: string,
        confidence: number
    ): Promise<{ message: string; buttons: WhatsAppButton[] }> {
        const buttons = [
            {
                id: `proof_details_${proofId}`,
                title: "Ver Detalhes",
            },
            {
                id: `proof_next_steps_${proofId}`,
                title: "Próximos Passos",
            },
        ];

        const confidenceMessage = confidence >= 90
            ? "Excelente! ✅"
            : confidence >= 70
                ? "Bom! ✅"
                : "Verificado com cuidado! ✅";

        const message = `${confidenceMessage}

Prova de Vida Confirmada!

Sua identidade foi verificada com ${confidence}% de confiança.

Você pode:
• Ver os detalhes da análise
• Ver os próximos passos para vender seu imóvel`;

        return {
            message,
            buttons,
        };
    }

    /**
     * Processa a resposta do usuário para um botão de prova de vida
     * @param buttonId ID do botão clicado
     * @param propertyId ID da propriedade
     * @param ownerPhone Telefone do proprietário
     * @param ownerName Nome do proprietário
     * @returns Ação a ser executada
     */
    static async processButtonResponse(
        buttonId: string,
        propertyId: string,
        ownerPhone: string,
        ownerName: string
    ): Promise<{
        action: "SHOW_FLOW" | "SHOW_INPUT" | "SHOW_ERROR";
        flowType?: string;
        message?: string;
        buttons?: WhatsAppButton[];
    }> {
        const [action, type, ...params] = buttonId.split("_");

        switch (action) {
            case "proof":
                if (type === "video") {
                    return {
                        action: "SHOW_INPUT",
                        message: "📹 Gravando vídeo... Por favor, mantenha a câmera ativa e mostre seu rosto.",
                        flowType: "VIDEO_UPLOAD",
                    };
                } else if (type === "photo") {
                    return {
                        action: "SHOW_INPUT",
                        message: "📷 Envie uma foto sua segurando um documento de identidade.",
                        flowType: "PHOTO_UPLOAD",
                    };
                } else if (type === "document") {
                    return {
                        action: "SHOW_INPUT",
                        message: "📄 Envie uma foto do seu documento de identidade (RG ou CNH).",
                        flowType: "DOCUMENT_UPLOAD",
                    };
                } else if (type === "later") {
                    return {
                        action: "SHOW_FLOW",
                        message: "Ok! Você pode enviar a prova quando quiser. Ficarei aguardando! 👋",
                        flowType: "CLOSED",
                    };
                }
                break;

            case "proof_details":
                return {
                    action: "SHOW_FLOW",
                    message: "📊 Detalhes da Prova de Vida",
                    flowType: "DETAILS",
                };

            case "proof_resend":
                return {
                    action: "SHOW_FLOW",
                    message: "Reenviando a prova de vida...",
                    flowType: "RESEND",
                };

            case "proof_contact_agent":
                return {
                    action: "SHOW_FLOW",
                    message: "Vou conectar você com nosso corretor. Aguarde! 📞",
                    flowType: "CONTACT_AGENT",
                };

            case "proof_next_steps":
                return {
                    action: "SHOW_FLOW",
                    message: "📋 Próximos Passos para Vender seu Imóvel",
                    flowType: "NEXT_STEPS",
                };

            default:
                return {
                    action: "SHOW_ERROR",
                    message: "Desculpe, não entendi sua escolha. Por favor, tente novamente.",
                };
        }

        return {
            action: "SHOW_ERROR",
            message: "Desculpe, não entendi sua escolha. Por favor, tente novamente.",
        };
    }
}

// Exportando funções individuais para compatibilidade
export const generateInitialFlow = ProofOfLifeFlows.generateInitialFlow.bind(
    ProofOfLifeFlows
);
export const generateStatusFlow = ProofOfLifeFlows.generateStatusFlow.bind(
    ProofOfLifeFlows
);
export const generateRejectedFlow = ProofOfLifeFlows.generateRejectedFlow.bind(
    ProofOfLifeFlows
);
export const generateApprovedFlow = ProofOfLifeFlows.generateApprovedFlow.bind(
    ProofOfLifeFlows
);
export const processButtonResponse = ProofOfLifeFlows.processButtonResponse.bind(
    ProofOfLifeFlows
);
