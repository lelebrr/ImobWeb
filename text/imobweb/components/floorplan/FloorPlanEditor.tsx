'use client';

import React, { useState } from 'react';
import { PresentationFeatureAvailability } from '../../types/presentation';
import { Scaling, Maximize, MousePointer2, Hammer, Grid3x3 } from 'lucide-react';

interface FloorPlanEditorProps {
  floorPlanUrl?: string; // Vector SVG URL usually
  features: PresentationFeatureAvailability;
}

export function FloorPlanEditor({ floorPlanUrl, features }: FloorPlanEditorProps) {
  const [mode, setMode] = useState<'view' | 'measure' | 'furnish'>('view');

  return (
    <div className="relative w-full h-[600px] bg-neutral-100 dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200 dark:border-white/10 shadow-xl flex flex-col md:flex-row">
      
      {/* Sidebar Tools */}
      <div className="w-full md:w-20 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-white/5 flex md:flex-col items-center justify-center p-4 gap-4 z-10 shadow-lg">
         <button 
           onClick={() => setMode('view')}
           className={`p-3 rounded-2xl transition-all ${mode === 'view' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'}`}
           title="Pan & Zoom">
           <MousePointer2 className="w-5 h-5" />
         </button>
         <button 
           onClick={() => setMode('measure')}
           className={`p-3 rounded-2xl transition-all ${mode === 'measure' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'}`}
           title="Measurement Tool">
           <Scaling className="w-5 h-5" />
         </button>
         {features.hasFurniturePlacementAI && (
           <button 
             onClick={() => setMode('furnish')}
             className={`p-3 rounded-2xl transition-all ${mode === 'furnish' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'}`}
             title="AI Furniture">
             <Hammer className="w-5 h-5" />
           </button>
         )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[length:50px_50px] opacity-90 p-8 flex items-center justify-center">
        
        {/* Mocking SVG Floorplan */}
        <div className="relative w-[80%] h-[80%] border-4 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-2xl transition-transform duration-500 hover:scale-[1.02] flex items-center justify-center">
           
           <Grid3x3 className="absolute text-neutral-200 dark:text-neutral-700 w-full h-full p-10 opacity-20" />

           <div className="text-center z-10">
             <h3 className="text-lg font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2">Planta Baixa Interativa</h3>
             <p className="text-sm text-neutral-400 dark:text-neutral-600">
               {mode === 'view' && 'Arraste para explorar o imóvel'}
               {mode === 'measure' && 'Clique em duas paredes para auto-medir'}
               {mode === 'furnish' && 'Arraste móveis do painel para validar dimensões'}
             </p>
           </div>
           
           {/* Mock Dimension Lines */}
           {mode === 'measure' && (
             <div className="absolute top-10 left-10 right-10 h-1 bg-indigo-500/50 flex items-center justify-center">
               <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full absolute -top-3">4.20m</span>
               <div className="w-full h-full flex justify-between">
                 <div className="w-1 h-3 bg-indigo-500 -mt-1" />
                 <div className="w-1 h-3 bg-indigo-500 -mt-1" />
               </div>
             </div>
           )}

           {/* Mock Furniture */}
           {mode === 'furnish' && (
             <div className="absolute bottom-10 right-10 w-32 h-16 bg-emerald-500/20 border-2 border-emerald-500/50 rounded flex items-center justify-center">
               <span className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">Sofa 3 Lugares</span>
             </div>
           )}

        </div>

        {/* Global Tools */}
        <button className="absolute bottom-6 right-6 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg rounded-xl text-neutral-700 dark:text-neutral-300 hover:scale-105 transition-transform">
          <Maximize className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
