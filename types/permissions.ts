import { z } from "zod";

/**
 * ============================================
 * TIPOS DE AÇÕES DE PERMISSÃO
 * ============================================
 * Define todas as ações possíveis que um usuário pode executar no sistema.
 * Cada ação representa uma capacidade específica de interação com recursos.
 */
export const PermissionActionSchema = z.enum([
  "create", // Criar novos registros
  "read", // Visualizar registros
  "update", // Editar registros existentes
  "delete", // Excluir registros
  "execute", // Executar ações específicas (ex: executar automação)
  "approve", // Aprovar operações sensíveis
  "export", // Exportar dados do sistema
  "import", // Importar dados para o sistema
  "manage", // Gerenciar configurações e recursos
  "delegate", // Delegar permissões a outros usuários
]);

export type PermissionAction = z.infer<typeof PermissionActionSchema>;

/**
 * ============================================
 * TIPOS DE RECURSOS DO SISTEMA
 * ============================================
 * Todos os recursos do sistema que podem ser protegidos por permissões.
 * Cada recurso representa uma área funcional do imobWeb.
 */
export const ResourceTypeSchema = z.enum([
  // Recursos principais
  "property", // Imóveis
  "lead", // Leads
  "owner", // Proprietários
  "conversation", // Conversas WhatsApp
  "announcement", // Anúncios em portais

  // Recursos de gestão
  "user", // Usuários do sistema
  "team", // Equipes
  "organization", // Organizações/Imobiliárias

  // Recursos de negócio
  "franchise", // Franquias
  "contract", // Contratos
  "billing", // Cobranças e pagamentos
  "invoice", // Faturas

  // Recursos de análise
  "report", // Relatórios
  "analytics", // Análises e métricas

  // Recursos de sistema
  "settings", // Configurações gerais
  "api_key", // Chaves de API
  "webhook", // Webhooks
  "integration", // Integrações externas

  // Recursos de comunicação
  "notification", // Notificações
  "campaign", // Campanhas WhatsApp
  "template", // Templates de mensagem

  // Recursos de segurança e auditoria
  "audit_log", // Logs de auditoria
  "permission", // Permissões
  "role", // Roles

  // Recursos de plataforma (apenas PLATFORM_MASTER)
  "platform", // Configurações da plataforma
  "feature_flag", // Feature flags globais
  "design_system", // Design system
  "marketplace", // Marketplace de addons
  "addon", // Addons/plugins

  // Recursos genéricos
  "document", // Documentos
  "*", // Acesso total (apenas para PLATFORM_MASTER)
]);

export type ResourceType = z.infer<typeof ResourceTypeSchema>;

/**
 * ============================================
 * TIPOS DE NÍVEL DE ACESSO
 * ============================================
 * Define o nível hierárquico de uma role no sistema.
 * Usado para validar escopo de acesso.
 */
export const AccessLevelSchema = z.enum([
  "platform", // Nível de plataforma (PLATFORM_MASTER)
  "agency", // Nível de agência/imobiliária (AGENCY_MASTER)
  "team", // Nível de equipe
  "user", // Nível de usuário individual
]);

export type AccessLevel = z.infer<typeof AccessLevelSchema>;

/**
 * ============================================
 * TIPOS DE ROLE DO SISTEMA
 * ============================================
 * Define os tipos principais de roles no sistema:
 * - PLATFORM: Roles de nível de plataforma (equipe ImobWeb)
 * - AGENCY: Roles de nível de agência/imobiliária
 * - CUSTOM: Roles personalizadas criadas por usuários
 */
export const RoleTypeSchema = z.enum([
  "platform", // Roles de plataforma
  "agency", // Roles de agência
  "custom", // Roles personalizadas
]);

export type RoleType = z.infer<typeof RoleTypeSchema>;

/**
 * ============================================
 * SCHEMA DE PERMISSÃO INDIVIDUAL
 * ============================================
 * Uma permissão individual define quais ações um role pode executar
 * em um recurso específico, opcionalmente com condições.
 */
export const PermissionSchema = z.object({
  resource: ResourceTypeSchema,
  actions: z.array(PermissionActionSchema),
  conditions: z.record(z.string(), z.unknown()).optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;

/**
 * ============================================
 * SCHEMA DE ROLE
 * ============================================
 * Define um role completo com suas permissões associadas.
 */
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: RoleTypeSchema,
  level: AccessLevelSchema,
  permissions: z.array(PermissionSchema),
  isSystem: z.boolean().optional(),
  isCustom: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
  createdBy: z.string().optional(),
});

export type Role = z.infer<typeof RoleSchema>;

/**
 * ============================================
 * SCHEMA DE PERMISSÕES DE USUÁRIO
 * ============================================
 * Armazena as permissões efetivas de um usuário,
 * incluindo roles e permissões customizadas.
 */
export const UserPermissionsSchema = z.object({
  userId: z.string(),
  roles: z.array(z.string()),
  customPermissions: z.array(PermissionSchema).optional(),
  teamId: z.string().optional(),
  organizationId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type UserPermissions = z.infer<typeof UserPermissionsSchema>;

/**
 * ============================================
 * SCHEMA DE CONDIÇÃO
 * ============================================
 * Condições para permissões contextuais (ABAC).
 * Permite permissões baseadas em atributos do contexto.
 */
export const ConditionSchema = z.object({
  field: z.string(), // Campo a avaliar (ex: 'organizationId')
  operator: z.enum([
    // Operador de comparação
    "eq", // Igual
    "neq", // Diferente
    "in", // Em lista
    "not_in", // Não em lista
    "gt", // Maior que
    "gte", // Maior ou igual
    "lt", // Menor que
    "lte", // Menor ou igual
    "contains", // Contém
    "starts_with", // Começa com
    "ends_with", // Termina com
    "regex", // Expressão regular
    "exists", // Existe
  ]),
  value: z.unknown(), // Valor esperado
});

export type Condition = z.infer<typeof ConditionSchema>;

/**
 * ============================================
 * INTERFACE DE VERIFICAÇÃO DE PERMISSÃO
 * ============================================
 * Parâmetros para verificar se um usuário tem permissão.
 */
export interface PermissionCheck {
  userId: string;
  action: PermissionAction;
  resource: ResourceType;
  resourceId?: string;
  context?: Record<string, unknown>;
  teamId?: string;
  organizationId?: string;
}

/**
 * ============================================
 * RESULTADO DE VERIFICAÇÃO
 * ============================================
 * Retorno da verificação de permissão.
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  conditions?: Condition[];
}

/**
 * ============================================
 * TIPO DE USUÁRIO DO BANCO DE DADOS
 * ============================================
 * Tipo retornado pelo Prisma com relacionamentos.
 */
export interface UserWithRelations {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    isPlatform: boolean;
  };
  roles?: Role[];
  userRoles?: { roleId: string }[];
}

/**
 * ============================================
 * CONTEXTO DE IMPERSONAÇÃO
 * ============================================
 * Armazena informações quando um PLATFORM_MASTER
 * está impersonando outro usuário.
 */
export interface ImpersonationContext {
  isImpersonating: boolean;
  originalUserId: string;
  impersonatedUserId: string;
  startedAt: number;
}

/**
 * ============================================
 * RÓTULOS E LEGENDAS DO SISTEMA
 * ============================================
 * Mapeamento de IDs técnicos para nomes amigáveis.
 */

// Rótulos de recursos
export const RESOURCE_LABELS: Record<ResourceType, string> = {
  property: "Imóveis",
  lead: "Leads",
  owner: "Proprietários",
  conversation: "Conversas",
  announcement: "Anúncios",
  user: "Usuários",
  team: "Equipes",
  organization: "Organizações",
  franchise: "Franquias",
  contract: "Contratos",
  billing: "Cobranças",
  invoice: "Faturas",
  report: "Relatórios",
  analytics: "Análises",
  settings: "Configurações",
  api_key: "Chaves de API",
  webhook: "Webhooks",
  integration: "Integrações",
  notification: "Notificações",
  campaign: "Campanhas",
  template: "Templates",
  audit_log: "Auditoria",
  permission: "Permissões",
  role: "Roles",
  platform: "Plataforma",
  feature_flag: "Feature Flags",
  design_system: "Design System",
  marketplace: "Marketplace",
  addon: "Addons",
  document: "Documentos",
  "*": "Acesso Total",
};

// Rótulos de ações
export const ACTION_LABELS: Record<PermissionAction, string> = {
  create: "Criar",
  read: "Visualizar",
  update: "Editar",
  delete: "Excluir",
  execute: "Executar",
  approve: "Aprovar",
  export: "Exportar",
  import: "Importar",
  manage: "Gerenciar",
  delegate: "Delegar",
};

// Rótulos de nível de acesso
export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  platform: "Plataforma",
  agency: "Imobiliária",
  team: "Equipe",
  user: "Usuário",
};

// Rótulos de tipo de role
export const ROLE_TYPE_LABELS: Record<RoleType, string> = {
  platform: "Plataforma",
  agency: "Imobiliária",
  custom: "Personalizado",
};

/**
 * ============================================
 * DEFINIÇÕES DE ROLES DO SISTEMA
 * ============================================
 * Roles nativos do sistema com todas as permissões.
 * Estes roles não podem ser excluídos.
 */

// Roles de Plataforma (equipe ImobWeb)
export const PLATFORM_ROLES: Record<string, Role> = {
  PLATFORM_MASTER: {
    id: "PLATFORM_MASTER",
    name: "Master Admin",
    description:
      "Acesso total ao sistema. Pode gerenciar todas as imobiliárias, configurações globais, e impersonar qualquer usuário.",
    type: "platform",
    level: "platform",
    isSystem: true,
    isCustom: false,
    permissions: [
      {
        resource: "*",
        actions: [
          "create",
          "read",
          "update",
          "delete",
          "execute",
          "approve",
          "export",
          "import",
          "manage",
          "delegate",
        ],
      },
    ],
  },
  PLATFORM_ADMIN: {
    id: "PLATFORM_ADMIN",
    name: "Administrador de Plataforma",
    description:
      "Pode gerenciar configurações da plataforma, mas não pode acessar dados das imobiliárias.",
    type: "platform",
    level: "platform",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "platform", actions: ["read", "update", "manage"] },
      {
        resource: "feature_flag",
        actions: ["create", "read", "update", "delete", "manage"],
      },
      { resource: "design_system", actions: ["read", "update", "manage"] },
      { resource: "addon", actions: ["read", "manage"] },
      { resource: "user", actions: ["read", "update"] },
      { resource: "organization", actions: ["read"] },
    ],
  },
  PLATFORM_FINANCE: {
    id: "PLATFORM_FINANCE",
    name: "Financeiro da Plataforma",
    description: "Acesso ao financeiro de todas as imobiliárias.",
    type: "platform",
    level: "platform",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "billing", actions: ["read", "export"] },
      { resource: "invoice", actions: ["read", "export"] },
      { resource: "organization", actions: ["read"] },
      { resource: "report", actions: ["read", "export"] },
    ],
  },
  PLATFORM_MARKETING: {
    id: "PLATFORM_MARKETING",
    name: "Marketing da Plataforma",
    description: "Gerencia marketing da plataforma, marketplace e conteúdo.",
    type: "platform",
    level: "platform",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "marketplace", actions: ["read", "update", "manage"] },
      {
        resource: "addon",
        actions: ["create", "read", "update", "delete", "manage"],
      },
      { resource: "report", actions: ["read", "export"] },
    ],
  },
  PLATFORM_SUPPORT: {
    id: "PLATFORM_SUPPORT",
    name: "Suporte da Plataforma",
    description: "Acesso ao suporte com visibilidade limitada.",
    type: "platform",
    level: "platform",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "user", actions: ["read"] },
      { resource: "organization", actions: ["read"] },
      { resource: "audit_log", actions: ["read"] },
    ],
  },
};

// Roles de Agência/Imobiliária
export const AGENCY_ROLES: Record<string, Role> = {
  AGENCY_MASTER: {
    id: "AGENCY_MASTER",
    name: "Administrador da Imobiliária",
    description:
      "Dono/administrador da conta. Pode gerenciar todos os dados da imobiliária, usuários e configurações.",
    type: "agency",
    level: "agency",
    isSystem: true,
    isCustom: false,
    isDefault: true,
    permissions: [
      {
        resource: "property",
        actions: ["create", "read", "update", "delete", "export", "import"],
      },
      {
        resource: "lead",
        actions: ["create", "read", "update", "delete", "export", "import"],
      },
      {
        resource: "owner",
        actions: ["create", "read", "update", "delete", "export"],
      },
      {
        resource: "conversation",
        actions: ["create", "read", "update", "delete", "execute"],
      },
      {
        resource: "announcement",
        actions: ["create", "read", "update", "delete", "execute"],
      },
      {
        resource: "user",
        actions: ["create", "read", "update", "delete", "manage", "delegate"],
      },
      {
        resource: "team",
        actions: ["create", "read", "update", "delete", "manage"],
      },
      { resource: "organization", actions: ["read", "update"] },
      {
        resource: "contract",
        actions: ["create", "read", "update", "delete", "approve"],
      },
      { resource: "billing", actions: ["create", "read", "update", "manage"] },
      { resource: "invoice", actions: ["create", "read", "update", "delete"] },
      { resource: "report", actions: ["read", "export", "manage"] },
      { resource: "analytics", actions: ["read", "export"] },
      { resource: "settings", actions: ["read", "update", "manage"] },
      {
        resource: "api_key",
        actions: ["create", "read", "update", "delete", "manage"],
      },
      {
        resource: "webhook",
        actions: ["create", "read", "update", "delete", "manage"],
      },
      {
        resource: "integration",
        actions: ["create", "read", "update", "delete", "manage"],
      },
      {
        resource: "notification",
        actions: ["create", "read", "update", "delete"],
      },
      {
        resource: "campaign",
        actions: ["create", "read", "update", "delete", "execute"],
      },
      { resource: "template", actions: ["create", "read", "update", "delete"] },
      { resource: "audit_log", actions: ["read", "export"] },
      { resource: "permission", actions: ["read", "manage"] },
      { resource: "role", actions: ["read", "manage"] },
    ],
  },
  AGENCY_GERENTE: {
    id: "AGENCY_GERENTE",
    name: "Gerente",
    description:
      "Gerente da imobiliária. Pode gerenciar equipes, leads e imóveis.",
    type: "agency",
    level: "agency",
    isSystem: true,
    isCustom: false,
    permissions: [
      {
        resource: "property",
        actions: ["create", "read", "update", "delete", "export"],
      },
      {
        resource: "lead",
        actions: ["create", "read", "update", "delete", "export"],
      },
      { resource: "owner", actions: ["create", "read", "update", "export"] },
      {
        resource: "conversation",
        actions: ["create", "read", "update", "execute"],
      },
      {
        resource: "announcement",
        actions: ["create", "read", "update", "execute"],
      },
      { resource: "user", actions: ["read", "update"] },
      {
        resource: "team",
        actions: ["create", "read", "update", "delete", "manage"],
      },
      { resource: "contract", actions: ["create", "read", "update"] },
      { resource: "report", actions: ["read", "export"] },
      { resource: "analytics", actions: ["read", "export"] },
      { resource: "audit_log", actions: ["read"] },
    ],
  },
  AGENCY_MARKETING: {
    id: "AGENCY_MARKETING",
    name: "Marketing",
    description: "Responsável por marketing, campanhas e announcements.",
    type: "agency",
    level: "agency",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "property", actions: ["read", "update"] },
      { resource: "lead", actions: ["read", "export"] },
      {
        resource: "announcement",
        actions: ["create", "read", "update", "delete", "execute"],
      },
      {
        resource: "campaign",
        actions: ["create", "read", "update", "delete", "execute"],
      },
      { resource: "template", actions: ["create", "read", "update", "delete"] },
      { resource: "report", actions: ["read", "export"] },
      { resource: "analytics", actions: ["read", "export"] },
    ],
  },
  AGENCY_RH: {
    id: "AGENCY_RH",
    name: "RH / Gestão de Pessoas",
    description: "Responsável pela gestão de usuários e equipes.",
    type: "agency",
    level: "agency",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "user", actions: ["create", "read", "update", "delete"] },
      {
        resource: "team",
        actions: ["create", "read", "update", "delete", "manage"],
      },
      { resource: "lead", actions: ["read", "export"] },
      { resource: "property", actions: ["read"] },
      { resource: "report", actions: ["read", "export"] },
    ],
  },
  AGENCY_CORRETOR: {
    id: "AGENCY_CORRETOR",
    name: "Corretor",
    description:
      "Corretor de imóveis padrão. Pode gerenciar seus próprios leads e imóveis.",
    type: "agency",
    level: "user",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "property", actions: ["create", "read", "update"] },
      { resource: "lead", actions: ["create", "read", "update"] },
      {
        resource: "conversation",
        actions: ["create", "read", "update", "execute"],
      },
      { resource: "owner", actions: ["create", "read"] },
      { resource: "report", actions: ["read"] },
    ],
  },
  AGENCY_FINANCE: {
    id: "AGENCY_FINANCE",
    name: "Financeiro",
    description: "Responsável por cobranças, faturas e contratos.",
    type: "agency",
    level: "agency",
    isSystem: true,
    isCustom: false,
    permissions: [
      {
        resource: "contract",
        actions: ["create", "read", "update", "delete", "approve"],
      },
      { resource: "billing", actions: ["create", "read", "update", "manage"] },
      { resource: "invoice", actions: ["create", "read", "update", "delete"] },
      { resource: "report", actions: ["read", "export"] },
      { resource: "analytics", actions: ["read", "export"] },
    ],
  },
  AGENCY_ASSISTENTE: {
    id: "AGENCY_ASSISTENTE",
    name: "Assistente",
    description: "Acesso limitado para auxiliar atividades.",
    type: "agency",
    level: "user",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "property", actions: ["read"] },
      { resource: "lead", actions: ["read", "create"] },
      { resource: "conversation", actions: ["create", "read", "update"] },
      { resource: "report", actions: ["read"] },
    ],
  },
  AGENCY_LEITOR: {
    id: "AGENCY_LEITOR",
    name: "Somente Leitura",
    description: "Acesso apenas para visualização, sem alterações.",
    type: "agency",
    level: "user",
    isSystem: true,
    isCustom: false,
    permissions: [
      { resource: "property", actions: ["read"] },
      { resource: "lead", actions: ["read"] },
      { resource: "conversation", actions: ["read"] },
      { resource: "user", actions: ["read"] },
      { resource: "report", actions: ["read"] },
    ],
  },
};

// Todos os roles do sistema
export const ROLE_PERMISSIONS: Record<string, Role> = {
  ...PLATFORM_ROLES,
  ...AGENCY_ROLES,
};

export type RoleId = keyof typeof ROLE_PERMISSIONS;

/**
 * ============================================
 * MAPEAMENTO DE USERROLE LEGADO PARA ROLES
 * ============================================
 * Mantém compatibilidade com o enum UserRole do Prisma.
 */
export const LEGACY_ROLE_MAPPING: Record<string, RoleId> = {
  PLATFORM_MASTER: "PLATFORM_MASTER",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  PLATFORM_MARKETING: "PLATFORM_MARKETING",
  PLATFORM_FINANCE: "PLATFORM_FINANCE",
  PLATFORM_SUPPORT: "PLATFORM_SUPPORT",
  AGENCY_MASTER: "AGENCY_MASTER",
  AGENCY_GERENTE: "AGENCY_GERENTE",
  AGENCY_MARKETING: "AGENCY_MARKETING",
  AGENCY_RH: "AGENCY_RH",
  AGENCY_CORRETOR: "AGENCY_CORRETOR",
  AGENCY_FINANCE: "AGENCY_FINANCE",
  AGENCY_ASSISTENTE: "AGENCY_ASSISTENTE",
  ADMIN: "AGENCY_MASTER",
  GERENTE: "AGENCY_GERENTE",
  CORRETOR: "AGENCY_CORRETOR",
  ASSISTENTE: "AGENCY_ASSISTENTE",
};

/**
 * ============================================
 * PERMISSÕES AGRUPADAS POR MÓDULO
 * ============================================
 * Útil para criar matrizes de permissões em UI.
 */
export const MODULE_PERMISSIONS: Record<string, ResourceType[]> = {
  Imóveis: ["property"],
  Clientes: ["lead", "owner"],
  Comunicação: ["conversation", "campaign", "template", "notification"],
  Gestão: ["user", "team", "organization"],
  Negócio: ["contract", "billing", "invoice"],
  Análise: ["report", "analytics"],
  Integrações: ["api_key", "webhook", "integration"],
  Sistema: ["settings", "audit_log", "permission", "role"],
  Plataforma: [
    "platform",
    "feature_flag",
    "design_system",
    "marketplace",
    "addon",
  ],
};

/**
 * ============================================
 * CONSTANTES ÚTEIS
 * ============================================
 */

// Roles que podem ser atribuídos apenas por PLATFORM_MASTER
export const PLATFORM_ONLY_ROLES: RoleId[] = [
  "PLATFORM_MASTER",
  "PLATFORM_ADMIN",
  "PLATFORM_FINANCE",
  "PLATFORM_MARKETING",
  "PLATFORM_SUPPORT",
];

// Roles que podem ser atribuídos por AGENCY_MASTER
export const AGENCY_ASSIGNABLE_ROLES: RoleId[] = [
  "AGENCY_MASTER",
  "AGENCY_GERENTE",
  "AGENCY_MARKETING",
  "AGENCY_RH",
  "AGENCY_CORRETOR",
  "AGENCY_FINANCE",
  "AGENCY_ASSISTENTE",
  "AGENCY_LEITOR",
];

// Recursos que apenas PLATFORM_MASTER pode gerenciar
export const PLATFORM_ONLY_RESOURCES: ResourceType[] = [
  "platform",
  "feature_flag",
  "design_system",
  "marketplace",
  "addon",
  "*",
];

// Recursos que AGENCY_MASTER pode gerenciar
export const AGENCY_MANAGEABLE_RESOURCES: ResourceType[] = [
  "property",
  "lead",
  "owner",
  "conversation",
  "announcement",
  "user",
  "team",
  "contract",
  "billing",
  "invoice",
  "report",
  "analytics",
  "settings",
  "api_key",
  "webhook",
  "integration",
  "notification",
  "campaign",
  "template",
  "audit_log",
  "permission",
  "role",
  "organization",
];
