"use client";

/**
 * Gestures Utility - ImobWeb 2026
 * 
 * Componentes de alto nível para interações por toque (swipes).
 * Utiliza Framer Motion para animações fluidas de 60fps+.
 */

import React, { ReactNode } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Trash2, Archive, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableItemProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActionIcon?: React.ElementType;
  rightActionIcon?: React.ElementType;
  className?: string;
}

export function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionIcon: LeftIcon = Archive,
  rightActionIcon: RightIcon = Trash2,
  className
}: SwipeableItemProps) {
  const x = useMotionValue(0);
  
  // Mapeia o deslocamento X para cores e opacidade do background
  const background = useTransform(
    x,
    [-100, 0, 100],
    ["#ef4444", "#ffffff00", "#10b981"]
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onSwipeLeft?.();
    } else if (info.offset.x > 100) {
      onSwipeRight?.();
    }
  };

  return (
    <div className={cn("relative overflow-hidden list-none touch-pan-x", className)}>
      {/* Background Actions */}
      <motion.div 
        style={{ background }}
        className="absolute inset-0 flex items-center justify-between px-6 -z-10 rounded-xl"
      >
        <div className="text-white flex items-center gap-2">
          <RightIcon size={20} />
          <span className="text-xs font-bold">Arquivar</span>
        </div>
        <div className="text-white flex items-center gap-2">
          <span className="text-xs font-bold">Concluído</span>
          <LeftIcon size={20} />
        </div>
      </motion.div>

      {/* Foreground Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * PullToRefresh - Componente para atualizar dados no mobile
 */
export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>, children: ReactNode }) {
  const y = useMotionValue(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (info.offset.y > 80 && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  return (
    <div className="relative">
      <motion.div
        style={{ y, opacity: useTransform(y, [0, 80], [0, 1]) }}
        className="absolute top-0 left-0 right-0 flex justify-center py-4 pointer-events-none"
      >
        <Check size={24} className="text-primary animate-bounce" />
      </motion.div>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
