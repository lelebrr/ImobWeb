"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Plus,
  GripVertical,
  ChevronRight,
  Calendar,
  TrendingUp,
  FileText,
  Phone,
  MessageCircle,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/design-system/button";
import { cn } from "@/lib/utils";
import type { Deal, DealPipelineStage } from "@/types/contracts";

interface DealPipelineProps {
  stages: DealPipelineStage[];
  deals: Deal[];
  onMoveDeal?: (dealId: string, newStageId: string) => void;
  onCreateDeal?: () => void;
  onViewDeal?: (dealId: string) => void;
  onEditDeal?: (dealId: string) => void;
}

export function DealPipeline({
  stages,
  deals,
  onMoveDeal,
  onCreateDeal,
  onViewDeal,
  onEditDeal,
}: DealPipelineProps) {
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (stageId: string) => {
    if (draggedDeal) {
      onMoveDeal?.(draggedDeal, stageId);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter((d) => d.currentStageId === stageId);
  };

  // Since our Deal type doesn't have a value property, we'll calculate it differently
  // In a real implementation, this would come from the contract's totalValue
  const getStageValue = (stageId: string) => {
    // This is a placeholder - in reality, we'd fetch the contract value
    return getDealsByStage(stageId).length * 100000; // Placeholder value
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Placeholder activity icon function
  const getActivityIcon = () => {
    return "📌"; // Default placeholder
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageDeals = getDealsByStage(stage.id);
        const stageValue = getStageValue(stage.id);

        return (
          <div
            key={stage.id}
            className={cn(
              "flex w-72 flex-shrink-0 flex-col rounded-lg border bg-gray-50 transition-colors",
              dragOverStage === stage.id && "border-blue-500 bg-blue-50",
            )}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(stage.id)}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: "#6366f1" }} // Default color
                />
                <span className="font-medium text-gray-900">{stage.name}</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  {stageDeals.length}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-500">
                {formatCurrency(stageValue)}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => handleDragStart(deal.id)}
                  onClick={() => onViewDeal?.(deal.id)}
                  className={cn(
                    "cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
                    draggedDeal === deal.id && "opacity-50",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        Contrato #{deal.contractId}
                      </p>
                      <p className="text-sm text-gray-500">
                        Negócio em andamento
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDeal?.(deal.id);
                      }}
                      className="rounded p-1 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(stageValue / stageDeals.length || 0)}
                    </span>
                    {/* Placeholder for probability */}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3" />
                      80%
                    </span>
                  </div>

                  {/* Placeholder for recent activity */}
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <span>📝</span>
                    <span className="line-clamp-1">Atualizado há 2 dias</span>
                  </div>

                  {/* Placeholder for expected close date */}
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {/* In a real app, this would come from deal metadata or contract */}
                      15/05/2026
                    </span>
                  </div>
                </div>
              ))}

              {stageDeals.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400">
                  <span className="text-sm">Nenhum negócio</span>
                </div>
              )}
            </div>

            {!stage.isFinal && (
              <div className="border-t border-gray-200 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-500"
                  onClick={onCreateDeal}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Novo negócio
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Simple deal card component
interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">
            Contrato #{deal.contractId}
          </p>
          <p className="text-sm text-gray-500">Negócio ativo</p>
        </div>
        <span className="font-semibold text-green-600">R$ 150.000</span>
      </div>
      <div className="mt-2 text-xs text-gray-500">Previsão: 15/05/2026</div>
    </div>
  );
}
