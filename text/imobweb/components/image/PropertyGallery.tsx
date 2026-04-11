'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  Info,
  Maximize
} from 'lucide-react';
import { PropertyMedia } from '../../types/property';
import { cn } from '../../lib/utils';

interface PropertyGalleryProps {
  media: PropertyMedia[];
  title: string;
}

/**
 * PREMIUM PROPERTY GALLERY - IMOBWEB 2026
 * Features:
 * - High-end grid layout
 * - Interactive Lightbox
 * - Framer Motion animations
 * - AI Insight display
 * - Comparison Mode (placeholder)
 */
export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ media, title }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % media.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + media.length) % media.length);
  };

  if (!media.length) return null;

  const mainMedia = media[0];
  const secondaryMedia = media.slice(1, 5);
  const hasMore = media.length > 5;

  return (
    <div className="w-full space-y-4">
      {/* --- GRID VIEW --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl group/gallery">
        {/* Main Image */}
        <div 
          className="md:col-span-2 md:row-span-2 relative cursor-pointer overflow-hidden"
          onClick={() => setSelectedIdx(0)}
        >
          <Image
            src={mainMedia.url}
            alt={mainMedia.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover/gallery:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover/gallery:bg-black/0" />
          
          {mainMedia.aiMetadata?.isEnhanced && (
            <div className="absolute top-4 left-4 z-10 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              AI ENHANCED
            </div>
          )}
        </div>

        {/* Secondary Images */}
        {secondaryMedia.map((item, idx) => (
          <div 
            key={item.id} 
            className="relative cursor-pointer overflow-hidden hidden md:block"
            onClick={() => setSelectedIdx(idx + 1)}
          >
            <Image
              src={item.url}
              alt={item.alt}
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
              sizes="25vw"
            />
            {idx === 3 && hasMore && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white font-bold transition-backdrop duration-300 hover:bg-black/20">
                <span className="text-2xl">+{media.length - 5}</span>
                <span className="text-xs uppercase tracking-widest mt-1">Ver todos</span>
              </div>
            )}
          </div>
        ))}

        {/* Desktop View All Button */}
        <button 
          onClick={() => setSelectedIdx(0)}
          className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-xl hover:bg-white hover:scale-105 transition-all text-sm"
        >
          <Maximize2 className="w-4 h-4" />
          Ver todas as fotos
        </button>
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl flex flex-col"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') handleNext();
              if (e.key === 'ArrowLeft') handlePrev();
              if (e.key === 'Escape') setSelectedIdx(null);
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 text-white overflow-hidden">
              <div>
                <h3 className="text-lg font-bold truncate max-w-[250px] md:max-w-md">{title}</h3>
                <p className="text-sm text-slate-400">
                  Foto {selectedIdx + 1} de {media.length} • {media[selectedIdx].category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className={cn(
                    "p-2.5 rounded-full transition-all",
                    showAIInsights ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  )}
                  title="AI Insights"
                >
                  <Info className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setSelectedIdx(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-2.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden">
              {/* Navigation Buttons */}
              <button 
                onClick={handlePrev}
                className="absolute left-4 md:left-8 z-20 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-lg transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-4 md:right-8 z-20 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-lg transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Image Display */}
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, scale: 0.9, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="relative w-full h-full max-w-6xl max-h-[80vh]"
                >
                  <Image
                    src={media[selectedIdx].url}
                    alt={media[selectedIdx].alt}
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>

                {/* AI Insights Sidebar (Overlaid) */}
                <AnimatePresence>
                  {showAIInsights && media[selectedIdx].aiMetadata && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl w-72 shadow-2xl"
                    >
                      <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold text-sm">
                        <Sparkles className="w-4 h-4" />
                        AI QUALITY REPORT
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Detected Feature</p>
                          <p className="text-white font-medium">{media[selectedIdx].aiMetadata?.detectedType}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Quality Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(media[selectedIdx].aiMetadata?.qualityScore || 0) * 100}%` }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                              />
                            </div>
                            <span className="text-xs text-white">
                              {Math.round((media[selectedIdx].aiMetadata?.qualityScore || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">AI Description</p>
                          <p className="text-sm text-slate-300 italic leading-relaxed">
                            "{media[selectedIdx].aiMetadata?.description}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Thumbnails Footer */}
            <div className="p-6 bg-slate-900/50 backdrop-blur-md overflow-x-auto no-scrollbar">
              <div className="flex gap-3 justify-start md:justify-center min-w-max px-4">
                {media.map((item, idx) => (
                  <button 
                    key={item.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={cn(
                      "relative w-20 h-14 rounded-lg overflow-hidden transition-all border-2",
                      selectedIdx === idx ? "border-indigo-500 scale-105" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
