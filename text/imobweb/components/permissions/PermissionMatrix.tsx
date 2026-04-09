'use client';

import { useState, useMemo } from 'react';
import { 
  Shield, 
  Check, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ResourceType, 
  PermissionAction, 
  RESOURCE_LABELS, 
  ACTION_LABELS, 
  Role 
} from '../types/permissions';

interface PermissionMatrixProps {
  roles: Role[];
  onSave?: (updates: { roleId: string; permissions: Role['permissions'] }[]) => void;
  onChange?: (roleId: string, resource: ResourceType, actions: PermissionAction[]) => void;
  className?: string;
}

export function PermissionMatrix({ roles, onSave, onChange, className }: PermissionMatrixProps) {
  const [selectedRole, setSelectedRole] = useState<string>(roles[0]?.id || '');
  const [expandedResources, setExpandedResources] = useState<Set<ResourceType>>(new Set());
  const [changes, setChanges] = useState<Map<string, Role['permissions']>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const role = roles.find(r => r.id === selectedRole);
  
  const resources: ResourceType[] = [
    'property', 'lead', 'owner', 'conversation', 'announcement',
    'user', 'team', 'organization', 'franchise', 'billing',
    'report', 'settings', 'api_key', 'webhook', 'integration',
    'notification', 'audit_log', 'document'
  ];

  const actions: PermissionAction[] = [
    'create', 'read', 'update', 'delete', 'execute', 
    'approve', 'export', 'import', 'manage', 'delegate'
  ];

  const toggleResource = (resource: ResourceType) => {
    setExpandedResources(prev => {
      const next = new Set(prev);
      if (next.has(resource)) {
        next.delete(resource);
      } else {
        next.add(resource);
      }
      return next;
    });
  };

  const getRolePermissions = (roleId: string): Role['permissions'] => {
    if (changes.has(roleId)) {
      return changes.get(roleId)!;
    }
    const r = roles.find(r => r.id === roleId);
    return r?.permissions || [];
  };

  const hasPermission = (permissions: Role['permissions'], resource: ResourceType, action: PermissionAction): boolean => {
    for (const perm of permissions) {
      if (perm.resource === '*' || perm.resource === resource) {
        if (perm.actions.includes(action)) {
          return true;
        }
      }
    }
    return false;
  };

  const togglePermission = (resource: ResourceType, action: PermissionAction) => {
    const currentPerms = getRolePermissions(selectedRole);
    const existingIndex = currentPerms.findIndex(p => p.resource === resource);
    
    let newPerms: Role['permissions'];
    
    if (existingIndex >= 0) {
      const existing = currentPerms[existingIndex];
      const hasAction = existing.actions.includes(action);
      
      if (hasAction) {
        const newActions = existing.actions.filter(a => a !== action);
        if (newActions.length === 0) {
          newPerms = currentPerms.filter((_, i) => i !== existingIndex);
        } else {
          newPerms = currentPerms.map((p, i) => 
            i === existingIndex ? { ...p, actions: newActions } : p
          );
        }
      } else {
        newPerms = currentPerms.map((p, i) => 
          i === existingIndex ? { ...p, actions: [...p.actions, action] } : p
        );
      }
    } else {
      newPerms = [...currentPerms, { resource, actions: [action] }];
    }
    
    setChanges(prev => {
      const next = new Map(prev);
      next.set(selectedRole, newPerms);
      return next;
    });
    
    onChange?.(selectedRole, resource, newPerms.find(p => p.resource === resource)?.actions || []);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: { roleId: string; permissions: Role['permissions'] }[] = [];
      
      changes.forEach((permissions, roleId) => {
        updates.push({ roleId, permissions });
      });
      
      await onSave?.(updates);
      setChanges(new Map());
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = changes.size > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Matriz de Permissões</h3>
        </div>
        
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Alterações
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <label className="text-sm font-medium">Selecione a Role:</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="flex-1 max-w-xs px-3 py-2 border rounded-md"
        >
          {roles.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} {r.isSystem && '(Sistema)'}
            </option>
          ))}
        </select>
        
        {hasChanges && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            {changes.size} alteração(ões) pendente(s)
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium sticky left-0 bg-muted/50">
                  Recurso / Ação
                </th>
                {actions.map(action => (
                  <th key={action} className="px-3 py-3 text-center text-xs font-medium">
                    {ACTION_LABELS[action]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {resources.map(resource => {
                const isExpanded = expandedResources.has(resource);
                const permissions = getRolePermissions(selectedRole);
                
                return (
                  <>
                    <tr 
                      key={resource}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => toggleResource(resource)}
                    >
                      <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-background">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          {RESOURCE_LABELS[resource]}
                        </div>
                      </td>
                      {actions.map(action => {
                        const granted = hasPermission(permissions, resource, action);
                        const isChanged = changes.has(selectedRole) && 
                          changes.get(selectedRole)!.some(p => 
                            p.resource === resource && p.actions.includes(action)
                          ) !== granted;

                        return (
                          <td 
                            key={action} 
                            className="px-3 py-3 text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePermission(resource, action);
                            }}
                          >
                            <button
                              className={cn(
                                "w-5 h-5 rounded flex items-center justify-center transition-colors",
                                granted 
                                  ? "bg-green-500 text-white" 
                                  : "bg-muted text-muted-foreground",
                                isChanged && "ring-2 ring-amber-500"
                              )}
                            >
                              {granted && <Check className="w-3 h-3" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>Permitido</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-muted rounded" />
          <span>Não Permitido</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded ring-2 ring-amber-500" />
          <span>Alterado</span>
        </div>
      </div>
    </div>
  );
}

export function RoleCard({ role, onClick, onEdit }: { 
  role: Role; 
  onClick?: () => void; 
  onEdit?: () => void;
}) {
  const permissionCount = role.permissions.reduce((acc, p) => acc + p.actions.length, 0);

  return (
    <div 
      onClick={onClick}
      className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{role.name}</h4>
            {role.isSystem && (
              <span className="text-xs px-2 py-0.5 bg-muted rounded">Sistema</span>
            )}
            {role.isCustom && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Custom</span>
            )}
          </div>
          {role.description && (
            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{permissionCount}</div>
          <div className="text-xs text-muted-foreground">permissões</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground capitalize">
          Nível: {role.level}
        </span>
        
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-xs text-primary hover:underline"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
}

export function PermissionBadge({ 
  action, 
  resource 
}: { 
  action: PermissionAction; 
  resource: ResourceType;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs">
      <span className="w-3 h-3 flex items-center justify-center text-[10px] bg-primary/20 rounded">
        {action.charAt(0).toUpperCase()}
      </span>
      {RESOURCE_LABELS[resource]}
    </span>
  );
}

export default PermissionMatrix;