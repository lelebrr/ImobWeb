'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Send, 
  RefreshCcw, 
  Wifi, 
  WifiOff, 
  Navigation,
  ChevronRight,
  Clock,
  Plus,
  MessageCircle,
  Database,
  Search,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FieldSyncStatus } from '@/types/field-mode';
import { FieldEngine } from '@/lib/field-mode/field-engine';
import { db } from '@/lib/field-mode/db';
import { cn } from '@/lib/utils';
import { VoicePropertyCreator } from '@/components/field-mode/VoicePropertyCreator';
import { SmartCamera } from '@/components/field-mode/SmartCamera';
import { NearbyMap } from '@/components/field-mode/NearbyMap';
import { SyncCenter } from '@/components/field-mode/SyncCenter';
import { VisitNotes } from '@/components/field-mode/VisitNotes';

/**
 * FIELD MODE DASHBOARD v2.0 - IMOBWEB 2026
 * The ultimate mobile tool for real estate brokers. Optimized & Expanded.
 */
export function FieldModeDashboard() {
  const [syncStatus, setSyncStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [nearbyProperty, setNearbyProperty] = useState<any>(null);
  
  // Overlays
  const [showVoiceCreator, setShowVoiceCreator] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSyncCenter, setShowSyncCenter] = useState(false);
  const [showVisitNotes, setShowVisitNotes] = useState(false);
  
  const engine = FieldEngine.getInstance();

  useEffect(() => {
    // Initial sync count
    const updatePending = async () => {
      const count = await db.sync_queue.count();
      setPendingSyncCount(count);
    };
    updatePending();
    const syncInterval = setInterval(updatePending, 5000);

    // Initial online status
    const updateOnline = () => setSyncStatus(navigator.onLine ? 'ONLINE' : 'OFFLINE');
    updateOnline();
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    // Start GPS tracking
    engine.startTracking(
      (coords) => setCurrentLocation(coords),
      (prop) => setNearbyProperty(prop)
    );

    // Mock nearby property for demonstration
    setTimeout(() => {
      setNearbyProperty({
        id: '1',
        title: 'Apartamento Luxo Savassi',
        address: { neighborhood: 'Savassi', city: 'Belo Horizonte' }
      });
    }, 3000);

    return () => {
      engine.stopTracking();
      clearInterval(syncInterval);
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const sendWhatAppProposal = () => {
    const text = "Olá! Tenho uma proposta para o seu imóvel na Savassi. Podemos conversar?";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans select-none overflow-x-hidden">
      {/* Header & Status */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter">
            IMOBWEB FIELD
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Sincronizado há 2m • v2.1
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSyncCenter(true)}
            className="relative bg-slate-900 border border-slate-800 rounded-full"
          >
            <Database className="w-4 h-4 text-slate-400" />
            {pendingSyncCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-slate-950">
                {pendingSyncCount}
              </span>
            )}
          </Button>
          <Badge 
            variant="outline" 
            className={cn(
              "flex gap-2 py-1 px-3 border-slate-800 rounded-full",
              syncStatus === 'ONLINE' ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
            )}
          >
            {syncStatus === 'ONLINE' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {syncStatus}
          </Badge>
        </div>
      </header>

      {/* Main Actions - Optimized for Field Performance */}
      <section className="grid grid-cols-1 gap-4 mb-8">
        <Button 
          onClick={() => setShowVoiceCreator(true)}
          className="h-32 bg-blue-600 hover:bg-blue-500 border-none shadow-2xl shadow-blue-500/30 active:scale-95 transition-all text-xl font-black flex flex-col gap-2 rounded-3xl"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-1">
            <Mic className="w-7 h-7" />
          </div>
          Cadastrar por Voz
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => setShowCamera(true)}
            variant="outline"
            className="h-28 border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-white flex flex-col gap-2 text-lg font-black active:scale-95 rounded-3xl"
          >
            <Camera className="w-6 h-6 text-emerald-400" />
            Câmera IA
          </Button>
          <Button 
            onClick={() => setShowVisitNotes(true)}
            variant="outline"
            className="h-28 border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-white flex flex-col gap-2 text-lg font-black active:scale-95 rounded-3xl"
          >
            <Plus className="w-6 h-6 text-indigo-400" />
            Nova Visita
          </Button>
        </div>
      </section>

      {/* Nearby Map Radar */}
      <NearbyMap 
        currentLocation={currentLocation} 
        properties={MOCK_PROPERTIES_FIELD} 
      />

      {/* Contextual Card: Check-in Alert */}
      <AnimatePresence>
        {nearbyProperty && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-8"
          >
            <Card className="bg-indigo-600 border-none shadow-2xl shadow-indigo-600/30 overflow-hidden rounded-3xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                      <MapPin className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white leading-tight">{nearbyProperty.title}</h3>
                      <p className="text-indigo-200 text-sm font-medium">Você está a 50m deste imóvel</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-white text-indigo-600 hover:bg-indigo-50 font-black h-12 rounded-xl">
                    Check-in
                  </Button>
                  <Button variant="ghost" className="text-indigo-100 hover:bg-white/10 h-12 rounded-xl" onClick={() => setNearbyProperty(null)}>
                    Ignorar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Quick Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black tracking-tight text-slate-200">Ações Rápidas</h2>
        <Button variant="ghost" size="icon" className="text-slate-500">
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <QuickActionButton 
          icon={<MessageCircle className="w-5 h-5 text-emerald-500" />}
          label="Proposta WhatsApp"
          sublabel="Template profissional"
          onClick={sendWhatAppProposal}
        />
        <QuickActionButton 
          icon={<CheckCircle2 className="w-5 h-5 text-blue-500" />}
          label="Atualizar Status"
          sublabel="Vendido, Reservado..."
        />
        <QuickActionButton 
          icon={<Search className="w-5 h-5 text-indigo-500" />}
          label="Buscar Próximos"
          sublabel="Raio de 10km"
        />
      </div>

      {/* Floating Overlays */}
      <AnimatePresence>
        {showVoiceCreator && (
          <VoicePropertyCreator onClose={() => setShowVoiceCreator(false)} />
        )}
        {showCamera && (
          <SmartCamera onClose={() => setShowCamera(false)} />
        )}
        {showSyncCenter && (
          <SyncCenter onClose={() => setShowSyncCenter(false)} />
        )}
        {showVisitNotes && (
          <VisitNotes onClose={() => setShowVisitNotes(false)} />
        )}
      </AnimatePresence>

      {/* Offline Barrier / Alert */}
      {syncStatus === 'OFFLINE' && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white py-1 px-4 text-center text-[10px] font-black uppercase tracking-widest z-[150]">
          Trabalhando Offline • Dados sendo salvos no celular
        </div>
      )}
    </div>
  );
}

function QuickActionButton({ icon, label, sublabel, onClick }: { icon: React.ReactNode, label: string, sublabel?: string, onClick?: () => void }) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="w-full h-20 bg-slate-900/40 border-slate-800/60 hover:bg-slate-800 hover:border-slate-700 flex items-center justify-between px-4 group active:scale-95 transition-all rounded-3xl"
    >
      <div className="flex items-center gap-4 text-left">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="font-black text-slate-100 uppercase text-xs tracking-wide">{label}</p>
          {sublabel && <p className="text-slate-500 text-[10px] font-black uppercase tracking-tight">{sublabel}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-700" />
    </Button>
  );
}

// Mock Data for Field Mode Radar
const MOCK_PROPERTIES_FIELD = [
  { id: '1', title: 'Cobertura Savassi', address: { neighborhood: 'Savassi' } },
  { id: '2', title: 'Apartamento Lourdes', address: { neighborhood: 'Lourdes' } },
  { id: '3', title: 'Casa Bandeirantes', address: { neighborhood: 'Pampulha' } }
];
