"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Organization, User } from "@prisma/client";

interface AdminUsersPageProps {
  params: { organizationId: string };
}

export default function AdminUsersPage({ params }: AdminUsersPageProps) {
  const [activeTab, setActiveTab] = useState<"agencies" | "users" | "platform">(
    "agencies",
  );

  const mockAgencies = [
    {
      id: "1",
      name: "Imobiliária Centro",
      cnpj: "12.345.678/0001-90",
      users: 5,
      properties: 45,
      status: "active",
    },
    {
      id: "2",
      name: "Imobiliária Sul",
      cnpj: "23.456.789/0001-01",
      users: 8,
      properties: 120,
      status: "active",
    },
    {
      id: "3",
      name: "Imobiliária Norte",
      cnpj: "34.567.890/0001-12",
      users: 3,
      properties: 22,
      status: "pending",
    },
  ];

  const mockUsers = [
    {
      id: "1",
      name: "Admin Master",
      email: "admin@imobweb.com",
      role: "PLATFORM_MASTER",
      lastLogin: "2026-04-16",
    },
    {
      id: "2",
      name: "Suporte João",
      email: "joao@imobweb.com",
      role: "PLATFORM_SUPPORT",
      lastLogin: "2026-04-15",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin - Gestão Global
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie todas as imobiliárias e usuários da plataforma
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("agencies")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "agencies"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Imobiliárias
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Usuários Plataforma
            </button>
            <button
              onClick={() => setActiveTab("platform")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "platform"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Configurações
            </button>
          </div>
        </div>

        {activeTab === "agencies" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Buscar imobiliárias..."
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                + Nova Imobiliária
              </button>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Nome
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    CNPJ
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Usuários
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Imóveis
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
                {mockAgencies.map((agency) => (
                  <motion.tr
                    key={agency.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {agency.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {agency.cnpj}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {agency.users}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {agency.properties}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          agency.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {agency.status === "active" ? "Ativo" : "Pendente"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-gray-600 hover:text-gray-900 mr-3">
                        Editar
                      </button>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Impersonar
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                    Último Login
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "platform" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Configurações da Plataforma
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Modo Manutenção</span>
                  <button className="w-12 h-6 bg-gray-200 rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Novas Imobiliárias</span>
                  <button className="w-12 h-6 bg-green-500 rounded-full relative">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Marketplace Ativo</span>
                  <button className="w-12 h-6 bg-green-500 rounded-full relative">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Estatísticas Globais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">156</p>
                  <p className="text-xs text-gray-500">Imobiliárias</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">2.340</p>
                  <p className="text-xs text-gray-500">Usuários</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">8.450</p>
                  <p className="text-xs text-gray-500">Imóveis</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">45.200</p>
                  <p className="text-xs text-gray-500">Leads</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
