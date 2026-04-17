"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  HealthLevel,
  HEALTH_LEVEL_LABELS,
  HEALTH_LEVEL_COLORS,
} from "@/types/score";

interface HealthScoreCardProps {
  score: number;
  healthLevel: HealthLevel;
  propertyTitle: string;
  propertyId: string;
  factors?: {
    factor: string;
    score: number;
    details?: string;
  }[];
  onClick?: () => void;
  showDetails?: boolean;
}

export function HealthScoreCard({
  score,
  healthLevel,
  propertyTitle,
  propertyId,
  factors = [],
  onClick,
  showDetails = false,
}: HealthScoreCardProps) {
  const healthColor = HEALTH_LEVEL_COLORS[healthLevel];
  const healthLabel = HEALTH_LEVEL_LABELS[healthLevel];

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#22c55e";
    if (s >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Ótimo";
    if (s >= 50) return "Atenção";
    return "Crítico";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer transition-all hover:shadow-md ${
        onClick ? "hover:border-gray-200" : ""
      }`}
      onClick={onClick}
      style={{ borderLeftColor: healthColor, borderLeftWidth: "4px" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-sm">
            {propertyTitle}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            ID: {propertyId.slice(0, 8)}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: healthColor }}
          >
            {score}
          </div>
          <span
            className="text-xs font-medium mt-1 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${healthColor}20`, color: healthColor }}
          >
            {healthLabel}
          </span>
        </div>
      </div>

      {showDetails && factors.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700">Fatores:</p>
          {factors.slice(0, 4).map((factor, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-gray-600 capitalize">
                {factor.factor.replace("_", " ")}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${factor.score}%`,
                      backgroundColor: getScoreColor(factor.score),
                    }}
                  />
                </div>
                <span
                  className="font-medium"
                  style={{ color: getScoreColor(factor.score) }}
                >
                  {factor.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {score < 50 && (
        <div className="absolute -top-1 -right-1">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}
    </motion.div>
  );
}

interface HealthScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function HealthScoreBadge({
  score,
  size = "md",
  showLabel = true,
}: HealthScoreBadgeProps) {
  const healthLevel: HealthLevel =
    score >= 80 ? "healthy" : score >= 50 ? "warning" : "critical";
  const healthColor = HEALTH_LEVEL_COLORS[healthLevel];
  const healthLabel = HEALTH_LEVEL_LABELS[healthLevel];

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold`}
        style={{ backgroundColor: healthColor }}
      >
        {score}
      </div>
      {showLabel && (
        <span className="text-sm font-medium" style={{ color: healthColor }}>
          {healthLabel}
        </span>
      )}
    </div>
  );
}

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function HealthScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
}: HealthScoreRingProps) {
  const healthLevel: HealthLevel =
    score >= 80 ? "healthy" : score >= 50 ? "warning" : "critical";
  const healthColor = HEALTH_LEVEL_COLORS[healthLevel];
  const healthLabel = HEALTH_LEVEL_LABELS[healthLevel];
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={healthColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold" style={{ color: healthColor }}>
            {score}
          </span>
          <span className="text-xs text-gray-500">{healthLabel}</span>
        </div>
      )}
    </div>
  );
}

interface PropertyScoreListProps {
  properties: Array<{
    id: string;
    title: string;
    score: number;
    healthLevel: HealthLevel;
  }>;
  onPropertyClick?: (id: string) => void;
}

export function PropertyScoreList({
  properties,
  onPropertyClick,
}: PropertyScoreListProps) {
  const sortedProperties = [...properties].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-2">
      {sortedProperties.map((property) => (
        <HealthScoreCard
          key={property.id}
          score={property.score}
          healthLevel={property.healthLevel}
          propertyTitle={property.title}
          propertyId={property.id}
          onClick={() => onPropertyClick?.(property.id)}
        />
      ))}
    </div>
  );
}
