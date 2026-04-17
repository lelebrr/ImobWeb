"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PortfolioPulse,
  HealthLevel,
  HEALTH_LEVEL_COLORS,
  HEALTH_LEVEL_LABELS,
} from "@/types/score";
import { HealthScoreRing } from "./HealthScoreCard";

interface PortfolioPulseProps {
  data: PortfolioPulse;
  onFilterChange?: (filters: PortfolioPulse["filters"]) => void;
  onPropertyClick?: (propertyId: string) => void;
  isLoading?: boolean;
}

export function PortfolioPulse({
  data,
  onFilterChange,
  onPropertyClick,
  isLoading = false,
}: PortfolioPulseProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      const newFilters = { ...data.filters };
      if (filter !== "all") {
        newFilters.byBusinessType = filter === "all" ? undefined : filter;
      }
      onFilterChange(newFilters);
    }
  };

  const filters = ["all", "VENDA", "LOCACAO"];

  const healthItems = [
    {
      level: "healthy" as HealthLevel,
      count: data.healthyCount,
      percentage:
        data.totalProperties > 0
          ? Math.round((data.healthyCount / data.totalProperties) * 100)
          : 0,
    },
    {
      level: "warning" as HealthLevel,
      count: data.warningCount,
      percentage:
        data.totalProperties > 0
          ? Math.round((data.warningCount / data.totalProperties) * 100)
          : 0,
    },
    {
      level: "critical" as HealthLevel,
      count: data.criticalCount,
      percentage:
        data.totalProperties > 0
          ? Math.round((data.criticalCount / data.totalProperties) * 100)
          : 0,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Pulse da Carteira
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {data.totalProperties} imóveis monitorados
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Última atualização</p>
          <p className="text-sm font-medium text-gray-600">
            {new Date(data.calculatedAt).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
          <HealthScoreRing
            score={data.averageScore}
            size={140}
            strokeWidth={12}
          />
          <p className="text-sm text-gray-600 mt-2">Score Médio</p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {healthItems.map((item) => (
            <motion.div
              key={item.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: HEALTH_LEVEL_COLORS[item.level] }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {HEALTH_LEVEL_LABELS[item.level]}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: HEALTH_LEVEL_COLORS[item.level] }}
                  >
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: HEALTH_LEVEL_COLORS[item.level] }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">
            Filtrar por:
          </span>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  activeFilter === filter
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter === "all"
                  ? "Todos"
                  : filter === "VENDA"
                    ? "Venda"
                    : "Locação"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {data.healthyCount}
            </p>
            <p className="text-xs text-green-700">Saudáveis</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {data.warningCount}
            </p>
            <p className="text-xs text-yellow-700">Em Risco</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">
              {data.criticalCount}
            </p>
            <p className="text-xs text-red-700">Críticos</p>
          </div>
        </div>
      </div>

      {data.totalProperties === 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500">
            Nenhum imóvel encontrado com os filtros selecionados.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

interface PortfolioPulseSkeletonProps {}

export function PortfolioPulseSkeleton({}: PortfolioPulseSkeletonProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 bg-gray-200 rounded w-40 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>
        <div className="text-right">
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
          <div className="w-32 h-32 rounded-full border-8 border-gray-200" />
          <div className="h-4 bg-gray-100 rounded w-20 mt-2" />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-4 h-4 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-200 rounded-full w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PropertyHealthSummaryProps {
  properties: Array<{
    id: string;
    title: string;
    score: number;
    healthLevel: HealthLevel;
  }>;
  onPropertyClick?: (id: string) => void;
}

export function PropertyHealthSummary({
  properties,
  onPropertyClick,
}: PropertyHealthSummaryProps) {
  const criticalProperties = properties
    .filter((p) => p.healthLevel === "critical")
    .slice(0, 5);
  const warningProperties = properties
    .filter((p) => p.healthLevel === "warning")
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {criticalProperties.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h3 className="text-sm font-semibold text-red-800">
              Atenção Urgente
            </h3>
            <span className="text-xs text-red-600">
              ({criticalProperties.length} imóveis)
            </span>
          </div>
          <div className="space-y-2">
            {criticalProperties.map((property) => (
              <button
                key={property.id}
                onClick={() => onPropertyClick?.(property.id)}
                className="w-full flex items-center justify-between p-2 bg-white rounded-md hover:bg-red-50 transition-colors text-left"
              >
                <span className="text-sm text-gray-700 truncate">
                  {property.title}
                </span>
                <span className="text-xs font-bold text-red-600">
                  {property.score}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {warningProperties.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
            <h3 className="text-sm font-semibold text-yellow-800">
              Precisa de Atenção
            </h3>
            <span className="text-xs text-yellow-600">
              ({warningProperties.length} imóveis)
            </span>
          </div>
          <div className="space-y-2">
            {warningProperties.map((property) => (
              <button
                key={property.id}
                onClick={() => onPropertyClick?.(property.id)}
                className="w-full flex items-center justify-between p-2 bg-white rounded-md hover:bg-yellow-50 transition-colors text-left"
              >
                <span className="text-sm text-gray-700 truncate">
                  {property.title}
                </span>
                <span className="text-xs font-bold text-yellow-600">
                  {property.score}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {properties.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum imóvel encontrado.</p>
        </div>
      )}
    </div>
  );
}
