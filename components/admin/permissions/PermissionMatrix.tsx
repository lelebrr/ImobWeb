"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Role,
  ResourceType,
  PermissionAction,
  ROLE_PERMISSIONS,
  RESOURCE_LABELS,
  ACTION_LABELS,
  PLATFORM_ROLES,
  AGENCY_ROLES,
} from "@/types/permissions";

interface PermissionMatrixProps {
  role: Role;
  onSave?: (updatedRole: Role) => void;
  isEditable?: boolean;
}

export function PermissionMatrix({
  role,
  onSave,
  isEditable = false,
}: PermissionMatrixProps) {
  const [localRole, setLocalRole] = useState<Role>(role);
  const [selectedResource, setSelectedResource] = useState<
    ResourceType | "all"
  >("all");

  const resources: ResourceType[] = [
    "property",
    "lead",
    "owner",
    "conversation",
    "announcement",
    "user",
    "team",
    "organization",
    "contract",
    "billing",
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
  ];

  const actions: PermissionAction[] = [
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
  ];

  const hasPermission = (
    resource: ResourceType,
    action: PermissionAction,
  ): boolean => {
    const permission = localRole.permissions.find(
      (p) => p.resource === resource || p.resource === "*",
    );
    return permission?.actions.includes(action) || false;
  };

  const togglePermission = (
    resource: ResourceType,
    action: PermissionAction,
  ) => {
    if (!isEditable) return;

    setLocalRole((prev) => {
      const newPermissions = [...prev.permissions];
      const permIndex = newPermissions.findIndex(
        (p) => p.resource === resource,
      );

      if (permIndex >= 0) {
        const actionIndex = newPermissions[permIndex].actions.indexOf(action);
        if (actionIndex >= 0) {
          newPermissions[permIndex].actions = newPermissions[
            permIndex
          ].actions.filter((a) => a !== action);
          if (newPermissions[permIndex].actions.length === 0) {
            newPermissions.splice(permIndex, 1);
          }
        } else {
          newPermissions[permIndex].actions = [
            ...newPermissions[permIndex].actions,
            action,
          ];
        }
      } else {
        newPermissions.push({ resource, actions: [action] });
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const filteredResources =
    selectedResource === "all" ? resources : [selectedResource];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{role.name}</h3>
          <p className="text-sm text-gray-500">{role.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filtrar:</label>
          <select
            value={selectedResource}
            onChange={(e) =>
              setSelectedResource(e.target.value as ResourceType | "all")
            }
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
          >
            <option value="all">Todos os recursos</option>
            {resources.map((r) => (
              <option key={r} value={r}>
                {RESOURCE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                Recurso
              </th>
              {actions.map((action) => (
                <th
                  key={action}
                  className="text-center text-xs font-medium text-gray-500 uppercase px-2 py-3"
                >
                  {ACTION_LABELS[action]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredResources.map((resource) => (
              <motion.tr
                key={resource}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {RESOURCE_LABELS[resource]}
                </td>
                {actions.map((action) => (
                  <td key={action} className="px-2 py-3 text-center">
                    <button
                      onClick={() => togglePermission(resource, action)}
                      disabled={!isEditable}
                      className={`
                        w-5 h-5 rounded border-2 transition-all
                        ${
                          hasPermission(resource, action)
                            ? "bg-gray-900 border-gray-900"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        }
                        ${!isEditable ? "cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      {hasPermission(resource, action) && (
                        <svg
                          className="w-3 h-3 text-white mx-auto"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </button>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditable && onSave && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onSave(localRole)}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Salvar Permissões
          </button>
        </div>
      )}
    </div>
  );
}

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (roleId: string) => void;
  userCount?: number;
}

export function RoleCard({
  role,
  onEdit,
  onDelete,
  userCount = 0,
}: RoleCardProps) {
  const isSystem = role.isSystem;
  const isPlatform = role.level === "platform";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{role.name}</h3>
            <span
              className={`
              text-xs px-2 py-0.5 rounded-full
              ${isPlatform ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}
            `}
            >
              {isPlatform ? "Plataforma" : "Imobiliária"}
            </span>
            {isSystem && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                Sistema
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{role.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {role.permissions.length} recursos
          </span>
          <span className="text-xs text-gray-500">{userCount} usuários</span>
        </div>

        {!isSystem && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(role)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete?.(role.id)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface RoleListProps {
  roles: Role[];
  onEdit?: (role: Role) => void;
  onDelete?: (roleId: string) => void;
}

export function RoleList({ roles, onEdit, onDelete }: RoleListProps) {
  const platformRoles = roles.filter((r) => r.level === "platform");
  const agencyRoles = roles.filter((r) => r.level === "agency");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full" />
          Roles de Plataforma
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          Roles de Imobiliária
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencyRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
