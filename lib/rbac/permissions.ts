// Definição das permissões por role

export interface Permission {
    resource: string
    action: 'create' | 'read' | 'update' | 'delete' | 'manage'
    conditions?: Record<string, any>
}

export const rolePermissions: Record<string, Permission[]> = {
    superadmin: [
        // Organizações
        { resource: 'organizations', action: 'create' },
        { resource: 'organizations', action: 'read' },
        { resource: 'organizations', action: 'update' },
        { resource: 'organizations', action: 'delete' },
        { resource: 'organizations', action: 'manage' },

        // Usuários
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'update' },
        { resource: 'users', action: 'delete' },
        { resource: 'users', action: 'manage' },

        // Assinaturas
        { resource: 'subscriptions', action: 'create' },
        { resource: 'subscriptions', action: 'read' },
        { resource: 'subscriptions', action: 'update' },
        { resource: 'subscriptions', action: 'delete' },
        { resource: 'subscriptions', action: 'manage' },

        // Faturamento
        { resource: 'billing', action: 'create' },
        { resource: 'billing', action: 'read' },
        { resource: 'billing', action: 'update' },
        { resource: 'billing', action: 'delete' },
        { resource: 'billing', action: 'manage' },

        // Analytics
        { resource: 'analytics', action: 'read' },
        { resource: 'analytics', action: 'manage' },

        // Broadcast
        { resource: 'broadcast', action: 'create' },
        { resource: 'broadcast', action: 'read' },
        { resource: 'broadcast', action: 'update' },
        { resource: 'broadcast', action: 'delete' },
        { resource: 'broadcast', action: 'manage' },

        // Configurações
        { resource: 'settings', action: 'read' },
        { resource: 'settings', action: 'update' },
        { resource: 'settings', action: 'manage' },
    ],

    owner: [
        // Organização
        { resource: 'organizations', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'organizations', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'organizations', action: 'manage', conditions: { ownOrganization: true } },

        // Usuários
        { resource: 'users', action: 'create', conditions: { ownOrganization: true } },
        { resource: 'users', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'users', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'users', action: 'delete', conditions: { ownOrganization: true } },
        { resource: 'users', action: 'manage', conditions: { ownOrganization: true } },

        // Assinaturas
        { resource: 'subscriptions', action: 'create', conditions: { ownOrganization: true } },
        { resource: 'subscriptions', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'subscriptions', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'subscriptions', action: 'delete', conditions: { ownOrganization: true } },
        { resource: 'subscriptions', action: 'manage', conditions: { ownOrganization: true } },

        // Faturamento
        { resource: 'billing', action: 'create', conditions: { ownOrganization: true } },
        { resource: 'billing', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'billing', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'billing', action: 'delete', conditions: { ownOrganization: true } },
        { resource: 'billing', action: 'manage', conditions: { ownOrganization: true } },

        // Analytics
        { resource: 'analytics', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'analytics', action: 'manage', conditions: { ownOrganization: true } },

        // Broadcast
        { resource: 'broadcast', action: 'create', conditions: { ownOrganization: true } },
        { resource: 'broadcast', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'broadcast', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'broadcast', action: 'delete', conditions: { ownOrganization: true } },
        { resource: 'broadcast', action: 'manage', conditions: { ownOrganization: true } },

        // Configurações
        { resource: 'settings', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'settings', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'settings', action: 'manage', conditions: { ownOrganization: true } },
    ],

    manager: [
        // Usuários (apenas os que não são owners)
        { resource: 'users', action: 'create', conditions: { ownOrganization: true, notOwner: true } },
        { resource: 'users', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'users', action: 'update', conditions: { ownOrganization: true, notOwner: true } },
        { resource: 'users', action: 'delete', conditions: { ownOrganization: true, notOwner: true } },

        // Imóveis
        { resource: 'properties', action: 'create', conditions: { ownOrganization: true } },
        { resource: 'properties', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'properties', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'properties', action: 'delete', conditions: { ownOrganization: true } },

        // Clientes
        { resource: 'clients', action: 'create', conditions: { ownOrganization: true } },
        { resource: 'clients', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'clients', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'clients', action: 'delete', conditions: { ownOrganization: true } },

        // WhatsApp
        { resource: 'whatsapp', action: 'create', conditions: { ownOrganization: true } },
        { resource: 'whatsapp', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'whatsapp', action: 'update', conditions: { ownOrganization: true } },
        { resource: 'whatsapp', action: 'delete', conditions: { ownOrganization: true } },

        // Analytics
        { resource: 'analytics', action: 'read', conditions: { ownOrganization: true } },

        // Configurações
        { resource: 'settings', action: 'read', conditions: { ownOrganization: true } },
        { resource: 'settings', action: 'update', conditions: { ownOrganization: true, notSystem: true } },
    ],

    broker: [
        // Imóveis (apenas os que são atribuídos a eles)
        { resource: 'properties', action: 'create', conditions: { assignedBroker: true } },
        { resource: 'properties', action: 'read', conditions: { assignedBroker: true } },
        { resource: 'properties', action: 'update', conditions: { assignedBroker: true } },
        { resource: 'properties', action: 'delete', conditions: { assignedBroker: true } },

        // Clientes
        { resource: 'clients', action: 'create', conditions: { assignedBroker: true } },
        { resource: 'clients', action: 'read', conditions: { assignedBroker: true } },
        { resource: 'clients', action: 'update', conditions: { assignedBroker: true } },
        { resource: 'clients', action: 'delete', conditions: { assignedBroker: true } },

        // WhatsApp
        { resource: 'whatsapp', action: 'create', conditions: { assignedBroker: true } },
        { resource: 'whatsapp', action: 'read', conditions: { assignedBroker: true } },
        { resource: 'whatsapp', action: 'update', conditions: { assignedBroker: true } },
        { resource: 'whatsapp', action: 'delete', conditions: { assignedBroker: true } },

        // Analytics
        { resource: 'analytics', action: 'read', conditions: { assignedBroker: true } },

        // Configurações
        { resource: 'settings', action: 'read', conditions: { ownProfile: true } },
    ],
}

// Recursos adicionais
export const additionalResources = [
    'properties',
    'clients',
    'whatsapp',
    'leads',
    'contracts',
    'documents',
    'reports',
    'notifications',
    'integrations',
]