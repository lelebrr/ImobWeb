'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type CamFacing = 'environment' | 'user';
interface Caps { torch?: boolean; zoom?: { min: number; max: number; step?: number }; focusMode?: string[]; pointsOfInterest?: unknown }
export interface ZoomInfo { min: number; max: number; presets: number[] }

const errText = (e: unknown) => {
  const n = (e as DOMException)?.name;
  if (n === 'NotAllowedError' || n === 'SecurityError') return 'Permissão da câmera negada. Libere o acesso nas configurações do navegador ou use “Escolher da galeria”.';
  if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'Nenhuma câmera compatível foi encontrada neste aparelho.';
  if (n === 'NotReadableError') return 'A câmera está em uso por outro aplicativo. Feche-o e tente de novo.';
  return 'Não foi possível abrir a câmera.';
};

/** Controla o fluxo da câmera: abrir/fechar, trocar, lanterna, zoom, foco por toque e tela sempre acesa. */
export function useCamera(initialFacing: CamFacing = 'environment') {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeRef = useRef<{ release: () => Promise<void> } | null>(null);
  const [facing, setFacing] = useState<CamFacing>(initialFacing);
  const [status, setStatus] = useState<'starting' | 'live' | 'error'>('starting');
  const [error, setError] = useState('');
  const [torchOk, setTorchOk] = useState(false);
  const [torch, setTorch] = useState(false);
  const [zoomInfo, setZoomInfo] = useState<ZoomInfo | null>(null);
  const [zoom, setZoomState] = useState(1);
  const [canFocus, setCanFocus] = useState(false);
  const [resume, setResume] = useState(0);

  const track = () => streamRef.current?.getVideoTracks()[0] || null;
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void wakeRef.current?.release().catch(() => undefined);
    wakeRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('starting'); setTorch(false); setTorchOk(false); setZoomInfo(null); setZoomState(1);
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) { setError('Este navegador não permite usar a câmera aqui (é preciso conexão segura, https). Use “Escolher da galeria”.'); setStatus('error'); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) { v.srcObject = stream; await v.play().catch(() => undefined); }
        const t = stream.getVideoTracks()[0];
        t.addEventListener('ended', () => { if (!cancelled) { setError('A câmera foi desconectada.'); setStatus('error'); } });
        const caps = (t.getCapabilities?.() || {}) as Caps;
        setTorchOk(!!caps.torch);
        if (caps.zoom && caps.zoom.max > caps.zoom.min) {
          const { min, max } = caps.zoom;
          const presets = [min < 1 ? min : null, 1, 2, 3].filter((x): x is number => x != null && x >= min && x <= max);
          setZoomInfo({ min, max, presets: [...new Set(presets.map((x) => Math.round(x * 10) / 10))] });
        }
        setCanFocus(!!caps.focusMode?.length);
        // foco contínuo quando disponível
        if (caps.focusMode?.includes('continuous')) void t.applyConstraints({ advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet] }).catch(() => undefined);
        const wl = (navigator as unknown as { wakeLock?: { request: (k: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
        if (wl) wakeRef.current = await wl.request('screen').catch(() => null);
        setStatus('live');
      } catch (e) {
        if (!cancelled) { setError(errText(e)); setStatus('error'); }
      }
    })();
    return () => { cancelled = true; stop(); };
  }, [facing, resume, stop]);

  // economiza bateria e libera a câmera quando a aba/app vai para segundo plano
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) stop();
      else setResume((n) => n + 1);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [stop]);

  const toggleTorch = useCallback(async () => {
    const t = track();
    if (!t) return;
    try { await t.applyConstraints({ advanced: [{ torch: !torch } as unknown as MediaTrackConstraintSet] }); setTorch((x) => !x); } catch { setTorchOk(false); }
  }, [torch]);

  const setZoom = useCallback(async (z: number) => {
    const t = track();
    if (!t) return;
    try { await t.applyConstraints({ advanced: [{ zoom: z } as unknown as MediaTrackConstraintSet] }); setZoomState(z); } catch { /* sem suporte */ }
  }, []);

  /** foco/exposição no ponto tocado (x,y de 0 a 1) */
  const focusAt = useCallback(async (x: number, y: number) => {
    const t = track();
    if (!t) return;
    try {
      await t.applyConstraints({ advanced: [{ pointsOfInterest: [{ x, y }], focusMode: 'single-shot' } as unknown as MediaTrackConstraintSet] });
    } catch { /* aparelhos sem foco manual ignoram */ }
  }, []);

  const flip = useCallback(() => setFacing((f) => (f === 'environment' ? 'user' : 'environment')), []);
  return { videoRef, status, error, facing, flip, torchOk, torch, toggleTorch, zoomInfo, zoom, setZoom, canFocus, focusAt, stop };
}
