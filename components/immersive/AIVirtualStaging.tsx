'use client';

import React, { useState } from 'react';
import { Sofa, Wand2, RefreshCcw, Download } from 'lucide-react';
import { AIStagingStyle } from '../../types/presentation';

export function AIVirtualStaging() {
  const [isStaged, setIsStaged] = useState(true);
  const [activeStyle, setActiveStyle] = useState<AIStagingStyle>('modern');

  const styles: { id: AIStagingStyle, name: string }[] = [
    { id: 'modern', name: 'Moderno' },
    { id: 'scandinavian', name: 'Escandinavo' },
    { id: 'industrial', name: 'Industrial' },
    { id: 'bohemian', name: 'Boho' },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 bg-transparent">
      {/* Left: Configuration Panel */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-6 relative">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">AI Virtual Staging</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Transforme espaços vazios</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* View State Toggle */}
            <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl flex relative">
              <button 
                onClick={() => setIsStaged(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all z-10 ${!isStaged ? 'text-black' : 'text-neutral-500'}`}>
                Vazio (Original)
              </button>
              <button 
                onClick={() => setIsStaged(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all z-10 ${isStaged ? 'text-white' : 'text-neutral-500'}`}>
                Decorado (IA)
              </button>
              {/* Sliding Background */}
              <div 
                className={`absolute inset-1 w-[calc(50%-4px)] bg-white dark:bg-neutral-700 rounded-xl shadow-sm transition-transform duration-300 ease-out z-0`}
                style={{ transform: `translateX(${isStaged ? '100%' : '0%'})` }}
              />
            </div>

            {/* Design Style Pick */}
            <div className={`transition-opacity duration-300 ${!isStaged ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 block">Design Style</label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setActiveStyle(style.id)}
                    className={`py-3 px-3 text-sm font-medium rounded-2xl flex flex-col items-center gap-2 border transition-all
                      ${activeStyle === style.id 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-700'}`}
                  >
                    <Sofa className="w-5 h-5 opacity-70" />
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Re-Gerar com IA
            </button>
          </div>
        </div>
      </div>

      {/* Right: The Viewport (After/Before slider conceptual layout) */}
      <div className="flex-1 relative bg-neutral-200 dark:bg-neutral-800 rounded-3xl overflow-hidden min-h-[500px] border border-neutral-200 dark:border-neutral-800 shadow-inner group">
        
        {/* Placeholder rendering */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className={`transition-all duration-700 text-center ${isStaged ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
              <span className="block text-neutral-400 dark:text-neutral-500 font-mono text-sm mb-2">
                [{isStaged ? 'STAGED_' + activeStyle.toUpperCase() : 'RAW_EMPTY_ROOM'}]
              </span>
              <div className={`w-32 h-32 mx-auto rounded-full border-2 border-dashed flex items-center justify-center
                ${isStaged ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-neutral-400 dark:border-neutral-600'}`}>
                <Wand2 className={`w-8 h-8 ${isStaged ? 'text-indigo-500' : 'text-neutral-500'}`} />
              </div>
           </div>
        </div>

        {/* Floating actions */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-neutral-900 dark:text-white transition border border-white/20">
             <Download className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}
