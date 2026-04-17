export enum UserType {
  AUTONOMOUS_AGENT = "Corretor Autônomo",
  SMALL_AGENCY = "Imobiliária Pequena",
  FRANCHISE_NETWORK = "Rede de Franquias",
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  guideLink?: string; // Link para artigo do Help Center ou vídeo
  videoTutorialId?: string; // ID do vídeo tutorial associado
  required: boolean;
}

export interface OnboardingProgress {
  userId: string;
  agencyId: string; // Para correlacionar com métricas por imobiliária
  userType: UserType;
  completedItems: string[]; // IDs dos itens concluídos
  currentStep: number; // Índice do passo atual no checklist
  startedAt: Date;
  completedAt?: Date;
  lastActivityAt: Date;
}

export interface AdoptionMetrics {
  agencyId: string;
  period: string; // Ex: '2026-W16' (semana 16 de 2026)
  onboardingCompletionRate: number; // % de usuários que completaram onboarding
  keyFeatureUsageRate: number; // % de uso de features chave (publicação, WhatsApp proativo, score de saúde, etc.)
  averageTimeToFirstPublication: number; // Em horas
  lowHealthScorePropertiesPercentage: number; // % de imóveis com score baixo
  totalUsers: number;
  activeUsers: number; // Usuários com login nos últimos 7 dias
}

export const CHECKLISTS: Record<UserType, ChecklistItem[]> = {
  [UserType.AUTONOMOUS_AGENT]: [
    {
      id: "profile-setup",
      title: "Completar Perfil",
      description: "Adicione foto, bio e informações de contato",
      guideLink: "/help/primeiros-passos#perfil",
      required: true,
    },
    {
      id: "first-property",
      title: "Primeiro Imóvel",
      description: "Cadastre seu primeiro imóvel com fotos e descrição",
      guideLink: "/help/cadastro-de-imoveis",
      videoTutorialId: "first-property-tutorial",
      required: true,
    },
    {
      id: "whatsapp-setup",
      title: "Configurar WhatsApp",
      description: "Integre seu WhatsApp para receber leads",
      guideLink: "/help/whatsapp-e-leads#configuracao",
      videoTutorialId: "whatsapp-setup-tutorial",
      required: true,
    },
    {
      id: "first-publication",
      title: "Primeira Publicação",
      description: "Publique seu imóvel em pelo menos um portal",
      guideLink: "/help/publicacao-em-portais",
      videoTutorialId: "first-publication-tutorial",
      required: true,
    },
  ],
  [UserType.SMALL_AGENCY]: [
    {
      id: "team-setup",
      title: "Configurar Equipe",
      description: "Adicione corretores e defina permissões",
      guideLink: "/help/equipe-e-permissoes",
      required: true,
    },
    {
      id: "brand-setup",
      title: "Identidade Visual",
      description: "Personalize com logo e cores da imobiliária",
      guideLink: "/help/marca-e-personalizacao",
      required: true,
    },
    {
      id: "property-template",
      title: "Template de Imóvel",
      description: "Crie modelo padrão para cadastro de imóveis",
      guideLink: "/help/templates-de-imovel",
      required: true,
    },
    {
      id: "whatsapp-broadcast",
      title: "Lista de Transmissão WhatsApp",
      description: "Configure listas para envio de novidades",
      guideLink: "/help/whatsapp-e-leads#listas-transmissao",
      videoTutorialId: "whatsapp-broadcast-tutorial",
      required: true,
    },
  ],
  [UserType.FRANCHISE_NETWORK]: [
    {
      id: "franchise-hierarchy",
      title: "Hierarquia da Rede",
      description: "Configure matriz, filiais e representantes",
      guideLink: "/help/franquias-e-parceiros#hierarquia",
      required: true,
    },
    {
      id: "standardized-processes",
      title: "Processos Padronizados",
      description: "Implementar fluxos de trabalho unificados",
      guideLink: "/help/processos-padronizados",
      required: true,
    },
    {
      id: "commission-rules",
      title: "Regras de Comissão",
      description: "Defina tabelas de comissão por filial/tipo",
      guideLink: "/help/financeiro-e-comissoes#regras",
      required: true,
    },
    {
      id: "network-reporting",
      title: "Relatórios de Rede",
      description: "Configure dashboards consolidados por região",
      guideLink: "/help/relatorios-de-rede",
      required: true,
    },
  ],
};
