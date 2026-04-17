'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NearbyMapProps {
  currentLocation: { lat: number, lng: number } | null;
  properties: any[];
}

/**
 * NEARBY RADAR - IMOBWEB 2026
 * Lightweight, zero-map-api-cost proximity visualization.
 */
export function NearbyMap({ currentLocation, properties }: NearbyMapProps) {
  // Simulate property positions relative to current location
  const radarItems = useMemo(() => {
    return properties.map((p, i) => ({
      ...p,
      // Random positions for the radar visualization (simulation)
      top: 50 + Math.sin(i * 1.5) * 35,
      left: 50 + Math.cos(i * 1.5) * 35,
      distance: (Math.random() * 2 + 0.1).toFixed(1)
    }));
  }, [properties]);

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Radar de Imóveis</h2>
        </div>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
          RAIO 5KM
        </Badge>
      </div>

      {/* Radar Visualizer */}
      <div className="relative w-full aspect-square max-w-[300px] mx-auto mb-8 flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute inset-0 rounded-full border border-slate-800/50 scale-[0.3]" />
        <div className="absolute inset-0 rounded-full border border-slate-800/50 scale-[0.6]" />
        <div className="absolute inset-0 rounded-full border border-slate-700/50 scale-[1]" />
        
        {/* Radar Sweep */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-blue-500/20 bg-gradient-to-tr from-transparent to-blue-500/10"
        />

        {/* User Location */}
        <div className="relative z-10 w-4 h-4 bg-white rounded-full border-4 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]" />

        {/* Nearby Properties */}
        {radarItems.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="absolute z-20"
            style={{ top: `${p.top}%`, left: `${p.left}%` }}
          >
            <div className="group relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 hidden group-hover:block z-30">
                <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg shadow-2xl text-[10px]">
                  <p className="font-bold text-white truncate">{p.title}</p>
                  <p className="text-slate-400">{p.distance} km de distância</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick List & Navigation */}
      <div className="space-y-4">
        {radarItems.slice(0, 2).map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-slate-800/40 p-3 rounded-2xl border border-slate-800/50">
            <div>
              <p className="text-sm font-bold text-white leading-tight">{p.title}</p>
              <p className="text-xs text-slate-500">{p.distance} km • {p.address.neighborhood}</p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-slate-900 border-slate-700 h-9"
              onClick={() => openInGoogleMaps(-19.932, -43.937)} // Cooldown to Savassi BH for demo
            >
              <Navigation className="w-4 h-4 mr-2" />
              Ir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
