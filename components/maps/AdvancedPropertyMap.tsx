'use client';

import React, { useState } from 'react';
import { PresentationFeatureAvailability } from '../../types/presentation';
import { Layers, MapPin, Navigation, Info, DollarSign, Sun, Glasses } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion'; 
// Assumindo uso puro de framer-motion ou classes Tailwind. Aqui focamos nas classes de animação e layoyut v4.

interface AdvancedPropertyMapProps {
  lat: number;
  lng: number;
  features: PresentationFeatureAvailability;
}

type MapLayer = 'street-view' | 'neighborhood' | 'price' | 'accessibility' | 'energy';

export function AdvancedPropertyMap({ lat, lng, features }: AdvancedPropertyMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayer | null>(null);

  const toggleLayer = (layer: MapLayer) => {
    setActiveLayer(prev => prev === layer ? null : layer);
  };

  return (
    <div className="relative w-full h-[600px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 isolate group">
      
      {/* Background Simulating Map rendering */}
      <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-23.5505,-46.6333&zoom=15&size=1200x800&scale=2&maptype=roadmap&style=visibility:on|hue:0x202124|lightness:-70&key=MOCK')] bg-cover bg-center opacity-80" />
      
      {/* Dynamic Overlay logic based on layer */}
      <div className={`absolute inset-0 transition-all duration-700 pointer-events-none 
          ${activeLayer === 'price' ? 'bg-indigo-500/20 mix-blend-color-dodge' : ''}
          ${activeLayer === 'energy' ? 'bg-gradient-to-tr from-amber-500/30 to-red-500/30 mix-blend-overlay' : ''}
          ${activeLayer === 'neighborhood' ? 'backdrop-blur-[2px]' : ''}
      `} />

      {/* Main Property Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col animate-bounce">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] border-4 border-indigo-500">
           <MapPin className="text-indigo-600 w-6 h-6" />
        </div>
        <div className="mt-2 px-3 py-1 bg-neutral-900/90 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/20 whitespace-nowrap">
           Sua nova casa
        </div>
      </div>

      {/* 2026 Floating Controls Panel */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 flex gap-4 overflow-x-auto max-w-[90vw] touch-pan-x snap-x shadow-2xl">
        
        <button 
          onClick={() => toggleLayer('neighborhood')}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 font-medium text-sm
            ${activeLayer === 'neighborhood' ? 'bg-white text-black shadow-lg scale-105' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
        >
          <Layers className="w-4 h-4" />
          <span className="hidden md:block">Neighborhood Intelligence</span>
        </button>

        <button 
          onClick={() => toggleLayer('price')}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 font-medium text-sm
            ${activeLayer === 'price' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
        >
          <DollarSign className="w-4 h-4" />
          <span className="hidden md:block">Price Overlay m²</span>
        </button>

        <button 
          onClick={() => toggleLayer('energy')}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 font-medium text-sm
            ${activeLayer === 'energy' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
        >
          <Sun className="w-4 h-4" />
          <span className="hidden md:block">Energy Efficiency</span>
        </button>

        <button 
          onClick={() => toggleLayer('accessibility')}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 font-medium text-sm
            ${activeLayer === 'accessibility' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
        >
          <Glasses className="w-4 h-4" />
          <span className="hidden md:block">Accessibility Sim</span>
        </button>
      </div>

      {/* Layer Content Modals / UI Extensions based on active state */}
      {activeLayer === 'neighborhood' && (
        <div className="absolute top-6 left-6 w-72 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl animate-in fade-in slide-in-from-left-8 duration-500">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            Índice de Qualidade
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-400"><span className="text-white">Escolas VIP</span><span>95% matcher</span></div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[95%]" /></div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-400"><span className="text-white">Segurança 24h</span><span>Alto</span></div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[100%]" /></div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-400"><span className="text-white">Conveniência</span><span>Raio de 2km</span></div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[80%]" /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
