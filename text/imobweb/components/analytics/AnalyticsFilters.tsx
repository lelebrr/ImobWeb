'use client';

import { useState, useCallback } from 'react';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';
import type { DashboardFilter } from '@/types/analytics';

interface AnalyticsFiltersProps {
  filters: DashboardFilter[];
  onFilterChange: (filterId: string, value: string | string[]) => void;
  onReset?: () => void;
  activeFilters?: Record<string, string | string[]>;
}

export function AnalyticsFilters({
  filters,
  onFilterChange,
  onReset,
  activeFilters = {}
}: AnalyticsFiltersProps) {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key] && (Array.isArray(activeFilters[key]) ? (activeFilters[key] as string[]).length > 0 : true)
  ).length;

  const handleFilterClick = (filterId: string) => {
    setExpandedFilter(expandedFilter === filterId ? null : filterId);
  };

  const handleValueSelect = (filterId: string, value: string) => {
    const currentValue = activeFilters[filterId];
    let newValue: string | string[];

    if (Array.isArray(currentValue)) {
      newValue = currentValue.includes(value)
        ? currentValue.filter(v => v !== value)
        : [...currentValue, value];
    } else {
      newValue = value;
    }

    onFilterChange(filterId, newValue);
  };

  const renderFilterOptions = (filter: DashboardFilter) => {
    const options = filter.options || getDefaultOptions(filter.type);
    const currentValue = activeFilters[filter.id];

    return (
      <div className="space-y-2">
        {options.map(option => {
          const isSelected = Array.isArray(currentValue)
            ? currentValue.includes(option.value)
            : currentValue === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                'flex items-center gap-2 cursor-pointer rounded-md px-3 py-2 transition-colors',
                isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              )}
            >
              <input
                type={filter.type === 'agent' || filter.type === 'portal' ? 'checkbox' : 'radio'}
                name={filter.id}
                value={option.value}
                checked={isSelected}
                onChange={() => handleValueSelect(filter.id, option.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          );
        })}
      </div>
    );
  };

  const getDefaultOptions = (type: string) => {
    switch (type) {
      case 'agent':
        return [
          { value: 'all', label: 'Todos os corretores' },
          { value: 'agent-1', label: 'Carlos Silva' },
          { value: 'agent-2', label: 'Ana Santos' },
          { value: 'agent-3', label: 'Pedro Oliveira' }
        ];
      case 'region':
        return [
          { value: 'all', label: 'Todas as regiões' },
          { value: 'zona-sul', label: 'Zona Sul' },
          { value: 'zona-oeste', label: 'Zona Oeste' },
          { value: 'centro', label: 'Centro' },
          { value: 'zona-leste', label: 'Zona Leste' }
        ];
      case 'property_type':
        return [
          { value: 'all', label: 'Todos os tipos' },
          { value: 'apartment', label: 'Apartamento' },
          { value: 'house', label: 'Casa' },
          { value: 'commercial', label: 'Comercial' },
          { value: 'land', label: 'Terreno' }
        ];
      case 'portal':
        return [
          { value: 'all', label: 'Todos os portais' },
          { value: 'zap', label: 'Zap Imóveis' },
          { value: 'viva', label: 'Viva Real' },
          { value: 'olx', label: 'OLX' }
        ];
      case 'status':
        return [
          { value: 'all', label: 'Todos os status' },
          { value: 'active', label: 'Ativo' },
          { value: 'sold', label: 'Vendido' },
          { value: 'rented', label: 'Locado' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map(filter => {
        const isExpanded = expandedFilter === filter.id;
        const hasValue = activeFilters[filter.id] && 
          (Array.isArray(activeFilters[filter.id]) 
            ? (activeFilters[filter.id] as string[]).length > 0 
            : true);

        return (
          <div key={filter.id} className="relative">
            <Button
              variant={hasValue ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterClick(filter.id)}
              className={cn(
                'gap-2',
                hasValue && 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              <Filter className="h-4 w-4" />
              {filter.label}
              {hasValue && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                  {Array.isArray(activeFilters[filter.id]) 
                    ? (activeFilters[filter.id] as string[]).length 
                    : '1'}
                </span>
              )}
              <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
            </Button>

            {isExpanded && (
              <div className="absolute z-50 mt-1 w-56 rounded-lg border bg-white shadow-lg">
                <div className="p-2">
                  {renderFilterOptions(filter)}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-500">
          <X className="mr-1 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

interface DateRangePickerProps {
  value: { start: Date; end: Date };
  onChange: (value: { start: Date; end: Date }) => void;
  presets?: Array<{ label: string; value: string; getValue: () => { start: Date; end: Date } }>;
}

export function DateRangePicker({ value, onChange, presets }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const defaultPresets = [
    { label: 'Hoje', value: 'today', getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: 'Ontem', value: 'yesterday', getValue: () => ({ start: new Date(Date.now() - 86400000), end: new Date(Date.now() - 86400000) }) },
    { label: 'Últimos 7 dias', value: 'last7', getValue: () => ({ start: new Date(Date.now() - 7 * 86400000), end: new Date() }) },
    { label: 'Últimos 30 dias', value: 'last30', getValue: () => ({ start: new Date(Date.now() - 30 * 86400000), end: new Date() }) },
    { label: 'Este mês', value: 'thisMonth', getValue: () => ({ start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date() }) },
    { label: 'Mês passado', value: 'lastMonth', getValue: () => ({ start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), end: new Date(new Date().getFullYear(), new Date().getMonth(), 0) }) }
  ];

  const allPresets = presets || defaultPresets;

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
  };

  const handlePresetSelect = (preset: typeof allPresets[0]) => {
    const range = preset.getValue();
    onChange(range);
    setSelectedPreset(preset.value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        {formatDateRange(value.start, value.end)}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 rounded-lg border bg-white p-2 shadow-lg">
          <div className="space-y-1">
            {allPresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                  selectedPreset === preset.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-2 border-t pt-2">
            <p className="px-3 py-1 text-xs text-gray-500">Personalizado</p>
            <div className="grid grid-cols-2 gap-2 px-3">
              <input
                type="date"
                value={value.start.toISOString().split('T')[0]}
                onChange={(e) => onChange({ ...value, start: new Date(e.target.value) })}
                className="rounded border px-2 py-1 text-xs"
              />
              <input
                type="date"
                value={value.end.toISOString().split('T')[0]}
                onChange={(e) => onChange({ ...value, end: new Date(e.target.value) })}
                className="rounded border px-2 py-1 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
