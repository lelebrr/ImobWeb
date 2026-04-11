'use client';

import React, { useState } from 'react';
import { PresentationFeatureAvailability } from '../../types/presentation';
import { Sun, Moon, Maximize2, Camera, User, CloudSun, CloudSnow } from 'lucide-react';

interface Property3DViewerProps {
  modelUrl?: string;
  features: PresentationFeatureAvailability;
}

export function Property3DViewer({ modelUrl, features }: Property3DViewerProps) {
  const [dayNightToggle, setDayNightToggle] = useState<'day' | 'night'>('day');
  const [season, setSeason] = useState<'summer' | 'winter'>('summer');
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  return (
    <div className="relative w-full h-[700px] bg-neutral-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group">
      
      {/* MOCK 3D Canvas Area */}
      <div className={`absolute inset-0 transition-opacity duration-1000
        ${dayNightToggle === 'night' ? 'opacity-80' : 'opacity-100'}`}>
        <div className="w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-900 flex items-center justify-center">
          <div className="relative">
            <span className="text-white/20 text-sm font-mono uppercase tracking-[0.2em] font-medium block mb-2 text-center">
              WebGL Engine 2026
            </span>
            <div className={`w-64 h-64 border border-white/10 rounded-full bg-transparent flex items-center justify-center shadow-inner
              ${season === 'winter' ? 'shadow-white/20 blur-[1px]' : 'shadow-amber-500/10'}`}>
              <Camera className="w-8 h-8 text-white/30 animate-pulse" />
            </div>
            
            {/* Visualizer text */}
            {isComparisonMode && (
              <div className="absolute top-1/2 -right-full bg-black border border-white/10 p-4 rounded-xl text-white ml-8">
                Propriedade B - 3D Render
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cinematic Frame Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Top Bar - Presentation Info */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
        <div>
          <h2 className="text-white text-xl font-medium tracking-tight">Experiência Imersiva</h2>
          <p className="text-white/60 text-sm mt-1">Interaja livremente com o ambiente</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsComparisonMode(!isComparisonMode)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 transition backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/10 flex items-center gap-2">
            Comparison Mode
          </button>
          <button className="w-10 h-10 bg-white/10 hover:bg-white/20 transition backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Innovation Controls (Right) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
        <button 
           onClick={() => setDayNightToggle(dayNightToggle === 'day' ? 'night' : 'day')}
           className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-300
             ${dayNightToggle === 'day' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
           {dayNightToggle === 'day' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
           onClick={() => setSeason(season === 'summer' ? 'winter' : 'summer')}
           className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-300
             ${season === 'summer' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
           {season === 'summer' ? <CloudSun className="w-5 h-5" /> : <CloudSnow className="w-5 h-5" />}
        </button>
      </div>

      {/* Bottom Bar - Smart Home / Guided Tour */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
        <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 w-80">
          <div className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">AI Voice-over Active</div>
          <p className="text-white text-sm leading-relaxed">
            "Bem-vindo. Esta sala de estar possui pé-direito duplo e recebe iluminação natural direta durante a manhã."
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/3 animate-[pulse_2s_ease-in-out_infinite]" />
            </div>
            <span className="text-white/40 text-xs font-mono">0:12</span>
          </div>
        </div>

        <button className="w-14 h-14 bg-white hover:scale-105 transition-transform duration-300 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] text-black">
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
