"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Role,
  ROLE_PERMISSIONS,
  RESOURCE_LABELS,
  ACTION_LABELS,
  PLATFORM_ROLES,
  AGENCY_ROLES,
} from "@/types/permissions";
import { useParams } from "next/navigation";

export default function UsersPage() {
  const params = useParams();
  const organizationId = params.organizationId as string;
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const roles = Object.values(ROLE_PERMISSIONS);

  const mockUsers = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@imob.com",
      role: "AGENCY_MASTER",
      status: "active",
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@imob.com",
      role: "AGENCY_CORRETOR",
      status: "active",
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@imob.com",
      role: "AGENCY_GERENTE",
      status: "active",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestão de Usuários e Permissões
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie usuários, roles e permissões da sua imobiliária
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Usuários
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "roles"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Roles e Permissões
            </button>
          </div>
        </div>

        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                + Novo Usuário
              </button>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Nome
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        Editar
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "roles" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Roles do Sistema
                </h3>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedRole?.id === role.id
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="font-medium">{role.name}</div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedRole?.id === role.id
                            ? "text-gray-300"
                            : "text-gray-500"
                        }`}
                      >
                        {role.permissions.length} permissões
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedRole ? (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                      {selectedRole.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedRole.description}
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedRole.level === "platform"
                            ? "bg-purple-100 text-purple-700"
                            : selectedRole.level === "agency"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedRole.level === "platform"
                          ? "Plataforma"
                          : selectedRole.level === "agency"
                            ? "Imobiliária"
                            : selectedRole.level === "team"
                              ? "Equipe"
                              : "Usuário"}
                      </span>
                      {selectedRole.isSystem && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          Sistema
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Permissões
                    </h4>
                    <div className="space-y-3">
                      {selectedRole.permissions.map((perm, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {RESOURCE_LABELS[
                                perm.resource as keyof typeof RESOURCE_LABELS
                              ] || perm.resource}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {perm.actions.map((action) => (
                              <span
                                key={action}
                                className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded"
                              >
                                {
                                  ACTION_LABELS[
                                    action as keyof typeof ACTION_LABELS
                                  ]
                                }
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                  <p className="text-gray-500">
                    Selecione uma role para ver as permissões
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
