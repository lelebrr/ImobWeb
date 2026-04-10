'use client';

import { useState, useCallback } from 'react';
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
  Pencil
} from 'lucide-react';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import type { Deal, DealStage } from '@/types/contracts';

interface DealPipelineProps {
  stages: DealStage[];
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
  onEditDeal
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
    return deals.filter(d => d.stageId === stageId);
  };

  const getStageValue = (stageId: string) => {
    return getDealsByStage(stageId).reduce((sum, d) => sum + d.value, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getActivityIcon = (type: Deal['activities'][0]['type']) => {
    switch (type) {
      case 'note': return '📝';
      case 'call': return '📞';
      case 'meeting': return '📅';
      case 'document': return '📄';
      case 'signature': return '✍️';
      case 'payment': return '💰';
      default: return '📌';
    }
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
              'flex w-72 flex-shrink-0 flex-col rounded-lg border bg-gray-50 transition-colors',
              dragOverStage === stage.id && 'border-blue-500 bg-blue-50'
            )}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(stage.id)}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
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
                    'cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md',
                    draggedDeal === deal.id && 'opacity-50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {deal.property?.address || 'Imóvel'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {deal.client?.name || 'Cliente'}
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
                      {formatCurrency(deal.value)}
                    </span>
                    {deal.probability > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp className="h-3 w-3" />
                        {deal.probability}%
                      </span>
                    )}
                  </div>

                  {deal.activities.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <span>{getActivityIcon(deal.activities[deal.activities.length - 1].type)}</span>
                      <span className="line-clamp-1">
                        {deal.activities[deal.activities.length - 1].title}
                      </span>
                    </div>
                  )}

                  {deal.expectedCloseDate && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
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

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
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
            {deal.property?.address || 'Imóvel'}
          </p>
          <p className="text-sm text-gray-500">{deal.client?.name}</p>
        </div>
        <span className="font-semibold text-green-600">
          {formatCurrency(deal.value)}
        </span>
      </div>
      {deal.expectedCloseDate && (
        <div className="mt-2 text-xs text-gray-500">
          Previsão: {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  );
}