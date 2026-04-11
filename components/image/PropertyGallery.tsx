'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  Info,
  Layers,
  Search
} from 'lucide-react';
import { PropertyImage } from '../../types/property';
import { cn } from '../../lib/utils'; // Assuming global util

interface PropertyGalleryProps {
  images: PropertyImage[];
  showAIInfo?: boolean;
}

/**
 * Premium Property Gallery Component
 * Features: Lightbox, AI Enhancement Preview, Zoom, Motion Transitions
 */
export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ 
  images, 
  showAIInfo = true 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAIComparison, setShowAIComparison] = useState(false);

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const activeImage = images[selectedIndex];

  return (
    <div className="relative w-full space-y-4">
      {/* Main Display Area */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative h-full w-full"
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt || 'Property Image'}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                showAIComparison && "brightness-125 contrast-110 saturate-110 blur-[0.5px]"
              )}
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            
            {/* AI Comparison Overlay */}
            {showAIComparison && (
              <div className="absolute top-4 right-4 z-10">
                <span className="flex items-center gap-1.5 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-lg">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI ENHANCED (PREVIEW)
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 transform-gpu">
          <button
            onClick={() => setShowAIComparison(!showAIComparison)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xl hover:bg-indigo-500 transition-all active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            {showAIComparison ? 'Original' : 'AI Enhance'}
          </button>
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-xl hover:bg-white/30 transition-all border border-white/20 active:scale-95"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        {/* Image Info / Tags */}
        {showAIInfo && activeImage.metadata.aiTags && (
          <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-[60%]">
            {activeImage.metadata.aiTags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-lg bg-black/40 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white/90 border border-white/10 uppercase tracking-wider">
                {tag.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Strip */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative min-w-[120px] aspect-video overflow-hidden rounded-xl bg-slate-800 transition-all ring-offset-2 ring-offset-slate-950",
              selectedIndex === index ? "ring-2 ring-indigo-500 scale-95 opacity-100" : "opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={img.thumbnailUrl || img.url}
              alt={img.alt || 'Thumbnail'}
              fill
              className="object-cover"
              sizes="120px"
            />
            {img.type === 'TOUR_360' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Layers className="h-5 w-5 text-white drop-shadow-md" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black backdrop-blur-xl p-4 md:p-10"
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="relative h-full w-full flex items-center justify-center">
               <motion.div 
                 className="relative w-full max-w-6xl aspect-[4/3] max-h-screen"
                 layoutId={`img-${activeImage.id}`}
               >
                 <Image
                    src={activeImage.url}
                    alt={activeImage.alt || 'Full Preview'}
                    fill
                    className="object-contain"
                    quality={100}
                 />
               </motion.div>

               {/* Large Controls */}
               <button
                onClick={prevImage}
                className="absolute left-0 p-6 text-white/40 hover:text-white transition-all hover:scale-110"
               >
                <ChevronLeft className="h-12 w-12" />
               </button>
               <button
                onClick={nextImage}
                className="absolute right-0 p-6 text-white/40 hover:text-white transition-all hover:scale-110"
               >
                <ChevronRight className="h-12 w-12" />
               </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-white font-medium">{activeImage.alt || 'Property View'}</p>
              <p className="text-white/50 text-sm mt-1">Image {selectedIndex + 1} of {images.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
