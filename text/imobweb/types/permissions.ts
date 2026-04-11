import { z } from 'zod';

export const PermissionActionSchema = z.enum([
  'create',
  'read',
  'update',
  'delete',
  'execute',
  'approve',
  'export',
  'import',
  'manage',
  'delegate',
]);

export type PermissionAction = z.infer<typeof PermissionActionSchema>;

export const ResourceTypeSchema = z.enum([
  'property',
  'lead',
  'owner',
  'conversation',
  'announcement',
  'user',
  'team',
  'organization',
  'franchise',
  'billing',
  'report',
  'settings',
  'api_key',
  'webhook',
  'integration',
  'notification',
  'audit_log',
  'document',
  '*',
]);

export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.object({
    resource: ResourceTypeSchema,
    actions: z.array(PermissionActionSchema),
    conditions: z.record(z.unknown()).optional(),
  })),
  isSystem: z.boolean().default(false),
  isCustom: z.boolean().default(true),
  level: z.enum(['global', 'franchise', 'branch', 'team', 'user']).default('team'),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export type Role = z.infer<typeof RoleSchema>;

export const UserPermissionsSchema = z.object({
  userId: z.string(),
  roles: z.array(z.string()),
  customPermissions: z.array(z.object({
    resource: ResourceTypeSchema,
    actions: z.array(PermissionActionSchema),
    conditions: z.record(z.unknown()).optional(),
  })).optional(),
  teamId: z.string().optional(),
  organizationId: z.string().optional(),
  franchiseId: z.string().optional(),
  branchId: z.string().optional(),
  region: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type UserPermissions = z.infer<typeof UserPermissionsSchema>;

export const ConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'contains', 'starts_with', 'ends_with']),
  value: z.unknown(),
});

export type Condition = z.infer<typeof ConditionSchema>;

export interface PermissionCheck {
  userId: string;
  action: PermissionAction;
  resource: ResourceType;
  resourceId?: string;
  context?: Record<string, unknown>;
  teamId?: string;
  organizationId?: string;
  franchiseId?: string;
  branchId?: string;
  region?: string;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  conditions?: Condition[];
}

export const ROLE_PERMISSIONS: Record<string, Role> = {
  global_admin: {
    id: 'global_admin',
    name: 'Administrador Global',
    description: 'Acesso completo a todas as organizações e franquias',
    isSystem: true,
    isCustom: false,
    level: 'global',
    permissions: [
      { resource: '*', actions: ['create', 'read', 'update', 'delete', 'execute', 'approve', 'export', 'import', 'manage', 'delegate'] },
    ],
  },
  franchise_admin: {
    id: 'franchise_admin',
    name: 'Administrador de Franquia',
    description: 'Administrador de uma rede de franquias',
    isSystem: true,
    isCustom: false,
    level: 'franchise',
    permissions: [
      { resource: 'organization', actions: ['create', 'read', 'update', 'manage'] },
      { resource: 'user', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'team', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'property', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'lead', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'billing', actions: ['read', 'manage'] },
      { resource: 'report', actions: ['read', 'export', 'manage'] },
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'audit_log', actions: ['read'] },
    ],
  },
  branch_manager: {
    id: 'branch_manager',
    name: 'Gerente de Filial',
    description: 'Gerencia uma filial específica',
    isSystem: true,
    isCustom: false,
    level: 'branch',
    permissions: [
      { resource: 'user', actions: ['create', 'read', 'update', 'manage'] },
      { resource: 'team', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'property', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'lead', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'report', actions: ['read', 'export'] },
      { resource: 'audit_log', actions: ['read'] },
    ],
  },
  team_leader: {
    id: 'team_leader',
    name: 'Líder de Equipe',
    description: 'Líder de uma equipe de corretores',
    isSystem: true,
    isCustom: false,
    level: 'team',
    permissions: [
      { resource: 'team', actions: ['read', 'update'] },
      { resource: 'property', actions: ['create', 'read', 'update'] },
      { resource: 'lead', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'report', actions: ['read'] },
    ],
  },
  agent: {
    id: 'agent',
    name: 'Corretor',
    description: 'Corretor de imóveis padrão',
    isSystem: true,
    isCustom: false,
    level: 'user',
    permissions: [
      { resource: 'property', actions: ['create', 'read', 'update'] },
      { resource: 'lead', actions: ['create', 'read', 'update'] },
      { resource: 'conversation', actions: ['create', 'read', 'update'] },
      { resource: 'report', actions: ['read'] },
    ],
  },
  readonly: {
    id: 'readonly',
    name: 'Somente Leitura',
    description: 'Acesso apenas para visualização',
    isSystem: true,
    isCustom: false,
    level: 'user',
    permissions: [
      { resource: 'property', actions: ['read'] },
      { resource: 'lead', actions: ['read'] },
      { resource: 'report', actions: ['read'] },
    ],
  },
};

export type RoleId = keyof typeof ROLE_PERMISSIONS;

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  property: 'Imóveis',
  lead: 'Leads',
  owner: 'Proprietários',
  conversation: 'Conversas',
  announcement: 'Anúncios',
  user: 'Usuários',
  team: 'Equipes',
  organization: 'Organizações',
  franchise: 'Franquias',
  billing: 'Faturamento',
  report: 'Relatórios',
  settings: 'Configurações',
  api_key: 'Chaves de API',
  webhook: 'Webhooks',
  integration: 'Integrações',
  notification: 'Notificações',
  audit_log: 'Auditoria',
  document: 'Documentos',
  '*': 'Acesso Total',
};

export const ACTION_LABELS: Record<PermissionAction, string> = {
  create: 'Criar',
  read: 'Visualizar',
  update: 'Editar',
  delete: 'Excluir',
  execute: 'Executar',
  approve: 'Aprovar',
  export: 'Exportar',
  import: 'Importar',
  manage: 'Gerenciar',
  delegate: 'Delegar',
};
