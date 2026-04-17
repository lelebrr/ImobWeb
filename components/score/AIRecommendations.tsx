"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AIRecommendation, RECOMMENDATION_TYPE_LABELS } from "@/types/score";
import { HealthScoreRing } from "@/components/score/HealthScoreCard";

interface AIRecommendationsPanelProps {
  propertyId: string;
  onAction?: (recommendation: AIRecommendation) => void;
}

export function AIRecommendationsPanel({
  propertyId,
  onAction,
}: AIRecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch(`/api/score?propertyId=${propertyId}`);
        const data = await res.json();
        setRecommendations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 bg-gray-100 rounded-lg" />
        <div className="h-20 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma recomendação no momento.</p>
        <p className="text-sm mt-1">O imóvel está com boa saúde!</p>
      </div>
    );
  }

  const priorityColors = {
    high: "border-red-500 bg-red-50",
    medium: "border-yellow-500 bg-yellow-50",
    low: "border-blue-500 bg-blue-50",
  };

  const priorityLabels = {
    high: "Urgente",
    medium: "Recomendado",
    low: "Sugerido",
  };

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-lg border-l-4 ${priorityColors[rec.priority]}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-semibold uppercase text-gray-600">
                {RECOMMENDATION_TYPE_LABELS[rec.type]}
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white border">
                +{rec.potentialScoreGain} pts
              </span>
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                rec.priority === "high"
                  ? "text-red-600 bg-red-100"
                  : rec.priority === "medium"
                    ? "text-yellow-600 bg-yellow-100"
                    : "text-blue-600 bg-blue-100"
              }`}
            >
              {priorityLabels[rec.priority]}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{rec.message}</p>

          {rec.actionUrl && (
            <button
              onClick={() => onAction?.(rec)}
              className="text-sm font-medium text-gray-900 hover:underline"
            >
              Ver detalhes →
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

interface ScoreDashboardProps {
  organizationId: string;
}

export function ScoreDashboard({ organizationId }: ScoreDashboardProps) {
  const [pulse, setPulse] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/score?organizationId=${organizationId}`);
        const data = await res.json();
        setPulse(data.pulse);
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching score data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [organizationId]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">Score Médio</p>
          <div className="flex items-center gap-2 mt-2">
            <HealthScoreRing
              score={stats?.averageScore || 0}
              size={60}
              strokeWidth={6}
              showLabel={false}
            />
            <span className="text-2xl font-bold">
              {stats?.averageScore || 0}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">Imóveis Saudáveis</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {stats?.healthyPercentage || 0}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">Em Risco</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {stats?.warningPercentage || 0}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">Críticos</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {stats?.criticalPercentage || 0}%
          </p>
        </div>
      </div>

      {stats?.topIssues && stats.topIssues.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-3">
            Principais Problemas
          </h3>
          <div className="space-y-2">
            {stats.topIssues.map((issue: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600">
                  {issue.issue.replace("_", " ")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{issue.count} imóveis</span>
                  <span className="text-xs text-gray-400">
                    - {issue.averageImpact}pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
