'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, PenLine } from 'lucide-react';
import { cn } from '../_lib/utils';

/** Assinatura manuscrita na tela (mouse, toque ou caneta). Devolve um PNG em dataURL. */
export function SignaturePad({ label, value, onChange, disabled }: {
  label: string; value?: string; onChange: (dataUrl: string | undefined) => void; disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(!!value);

  const setup = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width * ratio);
    c.height = Math.round(rect.height * ratio);
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    if (value) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
  }, [value]);

  useEffect(() => {
    setup();
    setHasInk(!!value);
    const onResize = () => { if (!drawing.current) setup(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // redesenha apenas quando o valor externo muda (ex.: abrir outro laudo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const point = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const down = (e: React.PointerEvent) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(last.current.x, last.current.y, 0.6, 0, Math.PI * 2);
    ctx.stroke();
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    setHasInk(true);
    onChange(canvasRef.current!.toDataURL('image/png'));
  };
  const clear = () => {
    const c = canvasRef.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    onChange(undefined);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5"><PenLine className="w-3 h-3" />{label}</span>
        {hasInk && !disabled && (
          <button type="button" onClick={clear} className="text-[11px] text-slate-500 hover:text-red-300 flex items-center gap-1"><Eraser className="w-3 h-3" />Limpar</button>
        )}
      </div>
      <div className={cn('relative rounded-xl overflow-hidden border bg-white', hasInk ? 'border-emerald-500/40' : 'border-white/10')}>
        <canvas ref={canvasRef} role="img" aria-label={`Campo de assinatura: ${label}`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
          className="w-full h-28 touch-none cursor-crosshair block" />
        {!hasInk && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">Assine aqui</span>}
        <div className="pointer-events-none absolute left-4 right-4 bottom-6 border-b border-slate-300" />
      </div>
    </div>
  );
}
