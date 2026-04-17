"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PropertyScore,
  PortfolioPulse,
  AIRecommendation,
  HealthStats,
  HealthLevel,
} from "@/types/score";

interface UseScoreOptions {
  propertyId?: string;
  organizationId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useScore(options: UseScoreOptions = {}) {
  const {
    propertyId,
    organizationId,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  const [score, setScore] = useState<PropertyScore | null>(null);
  const [pulse, setPulse] = useState<PortfolioPulse | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    [],
  );
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!propertyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/score?propertyId=${propertyId}`);
      const data = await res.json();

      if (res.ok) {
        setScore(data);
      } else {
        setError(data.error || "Erro ao buscar score");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  const fetchRecommendations = useCallback(async () => {
    if (!propertyId) return;

    try {
      const res = await fetch(`/api/score?propertyId=${propertyId}`);
      const data = await res.json();

      if (res.ok) {
        setRecommendations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  }, [propertyId]);

  const fetchPulse = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/score?organizationId=${organizationId}`);
      const data = await res.json();

      if (res.ok) {
        setPulse(data.pulse);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching pulse:", err);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (propertyId) {
      fetchScore();
      fetchRecommendations();
    }
  }, [propertyId, fetchScore, fetchRecommendations]);

  useEffect(() => {
    if (organizationId) {
      fetchPulse();
    }
  }, [organizationId, fetchPulse]);

  useEffect(() => {
    if (autoRefresh && (propertyId || organizationId)) {
      const interval = setInterval(() => {
        if (propertyId) fetchScore();
        if (organizationId) fetchPulse();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [
    autoRefresh,
    propertyId,
    organizationId,
    refreshInterval,
    fetchScore,
    fetchPulse,
  ]);

  const refresh = useCallback(async () => {
    if (propertyId) await fetchScore();
    if (organizationId) await fetchPulse();
  }, [propertyId, organizationId, fetchScore, fetchPulse]);

  return {
    score,
    pulse,
    recommendations,
    stats,
    isLoading,
    error,
    refresh,
  };
}

export function usePropertyHealth(propertyId: string) {
  const { score, recommendations, isLoading, error, refresh } = useScore({
    propertyId,
  });

  const healthLevel: HealthLevel = score?.healthLevel || "healthy";
  const overallScore = score?.overallScore || 0;

  const criticalFactors = score?.factors.filter((f) => f.score < 50) || [];
  const recommendationsByPriority = {
    high: recommendations.filter((r) => r.priority === "high"),
    medium: recommendations.filter((r) => r.priority === "medium"),
    low: recommendations.filter((r) => r.priority === "low"),
  };

  return {
    healthLevel,
    overallScore,
    factors: score?.factors || [],
    criticalFactors,
    recommendations,
    recommendationsByPriority,
    isLoading,
    error,
    refresh,
  };
}

export function usePortfolioHealth(organizationId: string) {
  const { pulse, stats, isLoading, error, refresh } = useScore({
    organizationId,
  });

  const healthBreakdown = pulse
    ? [
        {
          level: "healthy" as HealthLevel,
          count: pulse.healthyCount,
          label: "Saudáveis",
          color: "green",
        },
        {
          level: "warning" as HealthLevel,
          count: pulse.warningCount,
          label: "Em Risco",
          color: "yellow",
        },
        {
          level: "critical" as HealthLevel,
          count: pulse.criticalCount,
          label: "Críticos",
          color: "red",
        },
      ]
    : [];

  const needsAttention = stats?.topIssues?.slice(0, 3) || [];

  return {
    pulse,
    stats,
    healthBreakdown,
    needsAttention,
    isLoading,
    error,
    refresh,
  };
}
