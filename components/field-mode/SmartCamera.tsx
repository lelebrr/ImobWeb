'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, Loader2, Sparkles, Image as ImageIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldEngine } from '@/lib/field-mode/field-engine';
import { SmartCameraMedia } from '@/types/field-mode';
import { cn } from '@/lib/utils';

interface SmartCameraProps {
  onClose: () => void;
}

/**
 * SMART CAMERA IA - IMOBWEB 2026
 * Sequential photo capture with AI room detection and captioning.
 */
export function SmartCamera({ onClose }: SmartCameraProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<SmartCameraMedia[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [detectingRoom, setDetectingRoom] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = FieldEngine.getInstance();

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error('Camera Access Error:', err);
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.8));
    const previewUrl = URL.createObjectURL(blob);

    const newMedia: SmartCameraMedia = {
      id: Math.random().toString(36).substr(2, 9),
      blob,
      previewUrl,
      takenAt: new Date().toISOString()
    };

    setPhotos(prev => [newMedia, ...prev]);
    setIsCapturing(false);

    // Auto-detect room for the new photo
    analyzePhoto(newMedia.id);
  };

  const analyzePhoto = async (id: string) => {
    setDetectingRoom(true);
    // Simulate AI Room Detection
    const rooms = ['SALA', 'QUARTO', 'COZINHA', 'BANHEIRO', 'FACHADA'];
    const detected = rooms[Math.floor(Math.random() * rooms.length)];
    const caption = await engine.suggestCaption(detected);

    setPhotos(prev => prev.map(p =>
      p.id === id ? { ...p, detectedRoom: detected, aiCaption: caption } : p
    ));
    setDetectingRoom(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
      {/* Viewfinder */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay Tools */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-black/40 hover:bg-black/60 rounded-full text-white">
            <X className="w-6 h-6" />
          </Button>

          <div className="bg-emerald-600 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg scale-90 md:scale-100">
            <Zap className="w-4 h-4 text-white fill-white" />
            <span className="text-white text-xs font-bold uppercase tracking-widest">IA Active</span>
          </div>
        </div>

        {/* Dynamic Caption Display (Last photo) */}
        {photos.length > 0 && photos[0].aiCaption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-32 left-6 right-6 z-20"
          >
            <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-tighter">Legenda Sugerida</span>
                <span className="ml-auto bg-slate-800 px-2 py-0.5 rounded text-white text-[10px] font-bold">{photos[0].detectedRoom}</span>
              </div>
              <p className="text-white text-sm leading-relaxed">{photos[0].aiCaption}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="bg-slate-950 p-6 flex flex-col gap-6">
        {/* Gallery Strip */}
        <div className="flex gap-3 overflow-x-auto pb-2 h-16 scrollbar-hide">
          {photos.length === 0 && (
            <div className="w-16 h-12 rounded-lg border border-dashed border-slate-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-slate-700" />
            </div>
          )}
          {photos.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-800 shrink-0"
            >
              <img src={p.previewUrl} alt="Capture" className="w-full h-full object-cover" />
              {idx === 0 && detectingRoom && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="w-12" /> {/* Spacer */}

          <button
            onClick={takePhoto}
            disabled={isCapturing}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full bg-white scale-90 active:scale-100 transition-transform" />
          </button>

          <Button
            className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 font-bold h-12"
            disabled={photos.length === 0}
            onClick={onClose}
          >
            Continuar ({photos.length})
          </Button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default SmartCamera;
