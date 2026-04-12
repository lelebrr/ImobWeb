'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  Settings2, 
  ArrowUpDown 
} from 'lucide-react';
import { Property } from '../../types/property';
import { PropertyCard } from '../properties/PropertyCard';
import { cn } from '../../lib/utils';

type ViewMode = 'GRID' | 'LIST' | 'MAP';

interface PresentationWrapperProps {
  properties: Property[];
}

/**
 * PRESENTATION ORCHESTRATOR - IMOBWEB 2026
 * Handles switching between Grid, List, and Map views with high-end transitions.
 */
export const PresentationWrapper: React.FC<PresentationWrapperProps> = ({ properties }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');

  return (
    <div className="w-full space-y-6">
      {/* --- TOOLBAR --- */}
      <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-md p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <ViewButton 
            active={viewMode === 'GRID'} 
            onClick={() => setViewMode('GRID')} 
            icon={LayoutGrid} 
            label="Grade" 
          />
          <ViewButton 
            active={viewMode === 'LIST'} 
            onClick={() => setViewMode('LIST')} 
            icon={List} 
            label="Lista" 
          />
          <ViewButton 
            active={viewMode === 'MAP'} 
            onClick={() => setViewMode('MAP')} 
            icon={MapIcon} 
            label="Mapa" 
          />
        </div>

        <div className="flex items-center gap-4 px-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <span className="hidden md:inline">Ordenar por:</span>
            <button className="flex items-center gap-2 text-white hover:text-indigo-400 transition-colors">
              Relevância
              <ArrowUpDown size={14} />
            </button>
          </div>
          <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait">
          {viewMode === 'GRID' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} viewMode="grid" />
              ))}
            </motion.div>
          )}

          {viewMode === 'LIST' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4"
            >
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} viewMode="list" />
              ))}
            </motion.div>
          )}

          {viewMode === 'MAP' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-[700px] bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden relative flex items-center justify-center"
            >
              {/* Placeholder for Interactive Map */}
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-46.6333,-23.5505,12/1200x800?access_token=MOCK_TOKEN')] bg-cover opacity-50 grayscale" />
              <div className="z-10 bg-slate-950/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center max-w-md shadow-2xl">
                <MapIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Mapa Interativo</h3>
                <p className="text-sm text-slate-400">
                  Integração avançada com Google Maps 2026. 
                  Veja {properties.length} imóveis nesta região.
                </p>
                <button className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition-all">
                  Ativar Visualização
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ViewButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
        : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
    )}
  >
    <Icon size={16} />
    <span className="hidden sm:inline">{label}</span>
  </button>
);
