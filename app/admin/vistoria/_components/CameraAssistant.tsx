'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Zap, ZapOff, Grid3x3, Check, RotateCcw, Camera, AlertTriangle, CheckCircle2, SwitchCamera, Timer, Trash2 } from 'lucide-react';
import { analyzeLuma, frameDiff, grabLuma, relaxBlur, tiltHint, type QualityReport } from '../_lib/photo-quality';
import { useCamera } from '../_lib/useCamera';
import { InspectionOverlay, InspectionList } from './InspectionView';
import { inspectionSummary, defectShort, MIN_CONFIDENCE } from '../_lib/inspection';
import type { PhotoInspection } from '@/lib/vistoria/shared';
import { cn } from '../_lib/utils';

interface Shot { id: number; url: string; blob: Blob; report: QualityReport | null; tip: number | null; insp?: PhotoInspection | null; scanning?: boolean }
interface Props {
  roomName: string; tips: string[]; onDone: (files: File[], inspections: (PhotoInspection | null)[]) => void; onClose: () => void;
  /** quando informado, cada foto é inspecionada pela IA logo após o disparo */
  inspect?: (dataUrl: string) => Promise<PhotoInspection | null>;
}
const blobToDataUrl = (b: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
type Live = { issue: string | null; level: 'ok' | 'warn' | 'bad'; dark: boolean };

const MAX_DIM = 1920;
const TICK_MS = 400;
const STABLE_TICKS = 4; // ~1,6 s firme e bem iluminado para o disparo automático
const PREF_KEY = 'vistoria:camera-prefs';

function loadPrefs(): { grid: boolean; auto: boolean } {
  try { const p = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); return { grid: p.grid !== false, auto: p.auto === true }; } catch { return { grid: true, auto: false }; }
}

/**
 * Assistente de câmera: avisos ao vivo (luz, contraluz, tremor, nível), zoom, foco por toque,
 * roteiro por cômodo, disparo automático quando estável e revisão de qualidade após cada foto.
 */
export function CameraAssistant({ roomName, tips: baseTips, onDone, onClose, inspect }: Props) {
  const cam = useCamera('environment');
  const { videoRef, status } = cam;

  const prevGray = useRef<Uint8Array | null>(null);
  const history = useRef<QualityReport[]>([]);
  const lastMoveAt = useRef(0);
  const stableTicks = useRef(0);
  const cooldownUntil = useRef(0);
  const tiltRef = useRef<{ beta: number | null; gamma: number | null }>({ beta: null, gamma: null });
  const idRef = useRef(0);
  const shotsRef = useRef<Shot[]>([]);

  const [prefs] = useState(loadPrefs);
  const [grid, setGrid] = useState(prefs.grid);
  const [auto, setAuto] = useState(prefs.auto);
  const [live, setLive] = useState<Live>({ issue: null, level: 'ok', dark: false });
  const [tilt, setTilt] = useState<ReturnType<typeof tiltHint>>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [pending, setPending] = useState<Shot | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [ring, setRing] = useState<{ x: number; y: number; k: number } | null>(null);
  const [autoProgress, setAutoProgress] = useState(0);
  const [extraTips, setExtraTips] = useState<string[]>([]);
  const [scan, setScan] = useState<{ text: string; tone: 'wait' | 'ok' | 'warn' } | null>(null);
  const tips = [...baseTips, ...extraTips];

  shotsRef.current = shots;
  const doneTips = new Set(shots.map((s) => s.tip).filter((t): t is number => t != null));
  const firstOpen = tips.findIndex((_, i) => !doneTips.has(i));
  const activeTip = target != null && target < tips.length ? target : firstOpen;
  const activeTipRef = useRef(activeTip);
  activeTipRef.current = activeTip;

  const savePrefs = (g: boolean, a: boolean) => { try { localStorage.setItem(PREF_KEY, JSON.stringify({ grid: g, auto: a })); } catch { /* ignore */ } };

  // sensores de inclinação
  useEffect(() => {
    const on = (e: DeviceOrientationEvent) => { tiltRef.current = { beta: e.beta, gamma: e.gamma }; };
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    let added = false;
    (async () => {
      try { if (DOE?.requestPermission && (await DOE.requestPermission()) !== 'granted') return; } catch { return; }
      window.addEventListener('deviceorientation', on); added = true;
    })();
    return () => { if (added) window.removeEventListener('deviceorientation', on); };
  }, []);

  const runInspect = useCallback(async (shot: Shot) => {
    if (!inspect) return;
    setScan({ text: 'Analisando a foto…', tone: 'wait' });
    let insp: PhotoInspection | null = null;
    try { insp = await inspect(await blobToDataUrl(shot.blob)); } catch { insp = null; }
    const patch = { insp, scanning: false };
    setShots((x) => x.map((y) => (y.id === shot.id ? { ...y, ...patch } : y)));
    setPending((p) => (p && p.id === shot.id ? { ...p, ...patch } : p));
    if (!insp) { setScan({ text: 'Não foi possível analisar esta foto agora', tone: 'warn' }); window.setTimeout(() => setScan(null), 4000); return; }
    const sum = inspectionSummary(insp);
    const names = insp.objects.filter((o) => o.confidence >= MIN_CONFIDENCE).slice(0, 3).map((o) => o.name).join(', ');
    const text = sum.defects > 0 ? `${sum.defects} possível(is) defeito(s)${names ? ` · ${names}` : ''}` : names ? `Detectado: ${names}` : 'Nada relevante detectado';
    setScan({ text: `🔍 ${text}`, tone: sum.defects > 0 ? 'warn' : 'ok' });
    window.setTimeout(() => setScan(null), 6000);
    // cada defeito vira um item do roteiro: “fotografe de perto”
    const adds = insp.defects.filter((d) => d.confidence >= MIN_CONFIDENCE).map((d) => `Detalhe de perto: ${defectShort(d)}`);
    if (adds.length) setExtraTips((e) => [...new Set([...e, ...adds])].slice(0, 6));
  }, [inspect]);

  const capture = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth || pending || status !== 'live') return;
    const scale = Math.min(1, MAX_DIM / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(v.videoWidth * scale); c.height = Math.round(v.videoHeight * scale);
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    const g = grabLuma(c, c.width, c.height);
    let report = g ? analyzeLuma(g.gray, g.w, g.h) : null;
    if (report) report = relaxBlur(report, Date.now() - lastMoveAt.current);
    const tip = activeTipRef.current >= 0 ? activeTipRef.current : null;
    navigator.vibrate?.(25);
    setFlash(true); window.setTimeout(() => setFlash(false), 120);
    setTarget(null);
    c.toBlob((blob) => {
      if (!blob) return;
      const shot: Shot = { id: ++idRef.current, url: URL.createObjectURL(blob), blob, report, tip, scanning: !!inspect };
      if (!report || report.ok) setShots((s) => [...s, shot]);
      else setPending(shot);
      if (inspect) void runInspect(shot);
    }, 'image/jpeg', 0.88);
  }, [pending, status, videoRef, inspect, runInspect]);
  const captureRef = useRef(capture);
  captureRef.current = capture;

  // análise ao vivo
  const paused = status !== 'live' || !!pending || preview != null || confirmExit;
  useEffect(() => {
    if (paused) { setAutoProgress(0); return; }
    stableTicks.current = 0;
    const t = window.setInterval(() => {
      const v = videoRef.current;
      if (!v || v.readyState < 2 || document.hidden) return;
      const g = grabLuma(v, v.videoWidth, v.videoHeight);
      if (!g) return;
      const rep = analyzeLuma(g.gray, g.w, g.h);
      history.current = [...history.current.slice(-2), rep];
      const moving = prevGray.current ? frameDiff(prevGray.current, g.gray) > 9 : false;
      prevGray.current = g.gray;
      if (moving) lastMoveAt.current = Date.now();
      const count = (id: string) => history.current.filter((r) => r.issues.some((i) => i.id === id)).length;
      const need = Math.min(2, history.current.length);
      let issue: string | null = null; let level: Live['level'] = 'ok'; let dark = false;
      if (count('dark') >= need) { issue = 'Pouca luz'; level = 'bad'; dark = true; }
      else if (count('bright') >= need) { issue = 'Luz forte demais — evite apontar para a janela'; level = 'warn'; }
      else if (count('backlit') >= need) { issue = 'Contraluz — mude de ângulo ou ligue a lanterna'; level = 'warn'; }
      else if (moving) { issue = 'Segure firme…'; level = 'warn'; }
      setLive((p) => (p.issue === issue && p.level === level && p.dark === dark ? p : { issue, level, dark }));
      const o = window.screen?.orientation?.type || '';
      setTilt(!o || o.startsWith('portrait') ? tiltHint(tiltRef.current.beta, tiltRef.current.gamma) : null);

      // disparo automático quando está firme e sem problema de luz
      if (auto && level === 'ok' && !moving) stableTicks.current++; else stableTicks.current = 0;
      setAutoProgress(auto ? Math.min(1, stableTicks.current / STABLE_TICKS) : 0);
      if (auto && stableTicks.current >= STABLE_TICKS && Date.now() > cooldownUntil.current) {
        stableTicks.current = 0; cooldownUntil.current = Date.now() + 2500;
        captureRef.current();
      }
    }, TICK_MS);
    return () => window.clearInterval(t);
  }, [paused, auto, videoRef]);

  const addShot = (s: Shot) => setShots((x) => [...x, s]);
  const keepPending = () => { if (pending) { addShot(pending); setPending(null); } };
  const retake = () => { if (pending) URL.revokeObjectURL(pending.url); setPending(null); history.current = []; cooldownUntil.current = Date.now() + 1500; };
  const removeShot = (id: number) => {
    const s = shotsRef.current.find((x) => x.id === id);
    if (s) URL.revokeObjectURL(s.url);
    setShots((x) => x.filter((y) => y.id !== id)); setPreview(null);
  };

  const finish = () => {
    const safe = roomName.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() || 'foto';
    const inspections = shotsRef.current.map((s) => s.insp ?? null);
    const files = shotsRef.current.map((s, i) => new File([s.blob], `${safe}-${Date.now()}-${i + 1}.jpg`, { type: 'image/jpeg' }));
    shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
    shotsRef.current = [];
    cam.stop();
    onDone(files, inspections);
  };
  const discard = () => { shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url)); shotsRef.current = []; if (pending) URL.revokeObjectURL(pending.url); cam.stop(); onClose(); };
  const requestClose = () => {
    if (preview != null) setPreview(null);
    else if (confirmExit) setConfirmExit(false);
    else if (pending) retake();
    else if (shotsRef.current.length > 0) setConfirmExit(true);
    else discard();
  };

  // teclado (Esc fecha, Espaço/Enter fotografa) e travamento de rolagem
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => undefined);
  keyRef.current = (e) => {
    if (e.key === 'Escape') requestClose();
    else if ((e.key === ' ' || e.key === 'Enter') && !paused && !(e.target as HTMLElement)?.closest?.('button')) { e.preventDefault(); capture(); }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e);
    document.addEventListener('keydown', h);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url)); };
  }, []);

  const onViewerTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (status !== 'live' || !cam.canFocus) return;
    const el = e.target as HTMLElement;
    if (el !== e.currentTarget && el.tagName !== 'VIDEO') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    setRing({ x: e.clientX - r.left, y: e.clientY - r.top, k: Date.now() });
    window.setTimeout(() => setRing(null), 800);
    void cam.focusAt(x, y);
  };

  const levelCls = live.level === 'bad' ? 'bg-red-500/90' : live.level === 'warn' ? 'bg-amber-400/95 text-black' : 'bg-emerald-500/90';
  const previewShot = preview != null ? shots.find((s) => s.id === preview) : null;
  const iconBtn = 'w-11 h-11 grid place-items-center rounded-full backdrop-blur';

  return (
    <div className="fixed inset-0 z-[90] bg-black text-white flex flex-col landscape:flex-row h-dvh" role="dialog" aria-modal="true" aria-label={`Câmera guiada: ${roomName}`}>
      {/* visor */}
      <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden" onClick={onViewerTap}>
        <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover" />
        {grid && status === 'live' && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-white/15" />)}
          </div>
        )}
        {flash && <div className="absolute inset-0 bg-white/80 pointer-events-none" />}
        {ring && <span key={ring.k} className="absolute w-16 h-16 -ml-8 -mt-8 rounded-full border-2 border-amber-300 pointer-events-none animate-ping" style={{ left: ring.x, top: ring.y }} aria-hidden="true" />}

        {/* barra superior */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <button type="button" onClick={requestClose} aria-label="Fechar câmera" className={cn(iconBtn, 'bg-white/15 pointer-events-auto')}><X className="w-5 h-5" /></button>
          <div className="min-w-0 text-center">
            <p className="text-sm font-bold truncate max-w-[40vw]">{roomName || 'Cômodo'}</p>
            <p className="text-[11px] text-white/70">{shots.length} foto(s)</p>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            {cam.torchOk && <button type="button" onClick={() => void cam.toggleTorch()} aria-pressed={cam.torch} aria-label="Lanterna" className={cn(iconBtn, cam.torch ? 'bg-amber-400 text-black' : 'bg-white/15')}>{cam.torch ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}</button>}
            <button type="button" onClick={() => { setAuto((a) => { savePrefs(grid, !a); return !a; }); }} aria-pressed={auto} aria-label="Disparo automático quando estiver firme" className={cn(iconBtn, auto ? 'bg-emerald-400 text-black' : 'bg-white/15')}><Timer className="w-5 h-5" /></button>
            <button type="button" onClick={() => { setGrid((g) => { savePrefs(!g, auto); return !g; }); }} aria-pressed={grid} aria-label="Grade de enquadramento" className={cn(iconBtn, grid ? 'bg-white/30' : 'bg-white/15')}><Grid3x3 className="w-5 h-5" /></button>
            <button type="button" onClick={cam.flip} aria-label="Trocar câmera" className={cn(iconBtn, 'bg-white/15')}><SwitchCamera className="w-5 h-5" /></button>
          </div>
        </div>

        {status === 'starting' && <div className="absolute inset-0 grid place-items-center text-sm text-white/70">Abrindo a câmera…</div>}
        {status === 'error' && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div className="max-w-xs space-y-4">
              <AlertTriangle className="w-10 h-10 text-amber-300 mx-auto" />
              <p className="text-sm text-white/85">{cam.error}</p>
              <button type="button" onClick={discard} className="min-h-11 px-5 rounded-xl bg-white/15 text-sm font-semibold">Voltar</button>
            </div>
          </div>
        )}

        {status === 'live' && (
          <>
            {tilt && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                <div className="w-28 h-0.5 rounded transition-transform" style={{ transform: `rotate(${Math.max(-30, Math.min(30, tilt.roll))}deg)`, background: tilt.level ? '#34d399' : '#fbbf24' }} />
              </div>
            )}
            <div className="absolute top-[calc(env(safe-area-inset-top)+4.25rem)] inset-x-3 flex flex-col items-center gap-1.5 pointer-events-none" aria-live="polite">
              {scan && (
                <span className={cn('px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg max-w-full truncate', scan.tone === 'warn' ? 'bg-orange-500/95 text-black' : scan.tone === 'ok' ? 'bg-cyan-500/90 text-black' : 'bg-indigo-500/90')}>{scan.tone === 'wait' ? <span className="inline-block w-3 h-3 mr-1.5 align-[-2px] rounded-full border-2 border-white/40 border-t-white animate-spin" /> : null}{scan.text}</span>
              )}
              {live.issue ? (
                <span className={cn('px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2', levelCls)}>
                  {live.issue}
                  {live.dark && cam.torchOk && !cam.torch && (
                    <button type="button" onClick={() => void cam.toggleTorch()} className="pointer-events-auto -my-1 -mr-2 min-h-8 px-3 rounded-full bg-black/30 text-white">Ligar lanterna</button>
                  )}
                </span>
              ) : tilt?.message ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-400/95 text-black shadow-lg">{tilt.message}</span>
              ) : (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/85 shadow-lg flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{auto ? 'Segure firme: eu fotografo sozinho' : 'Pronto para fotografar'}</span>
              )}
            </div>

            <div className="absolute bottom-2 inset-x-0 px-3 pointer-events-none">
              {cam.zoomInfo && cam.zoomInfo.presets.length > 1 && (
                <div className="flex justify-center gap-1.5 mb-2 pointer-events-auto" role="group" aria-label="Zoom">
                  {cam.zoomInfo.presets.map((z) => (
                    <button key={z} type="button" onClick={() => void cam.setZoom(z)} aria-pressed={Math.abs(cam.zoom - z) < 0.05}
                      className={cn('min-w-11 min-h-9 px-2 rounded-full text-xs font-bold backdrop-blur', Math.abs(cam.zoom - z) < 0.05 ? 'bg-amber-300 text-black' : 'bg-black/55 text-white')}>{z}x</button>
                  ))}
                </div>
              )}
              {activeTip >= 0 && <p className="text-center text-xs mb-2"><span className="inline-block max-w-full px-3 py-1.5 rounded-full bg-black/65 backdrop-blur"><b className="text-indigo-300">Agora:</b> {tips[activeTip]}</span></p>}
              {tips.length > 0 && activeTip < 0 && <p className="text-center text-xs mb-2"><span className="px-3 py-1.5 rounded-full bg-emerald-600/70 backdrop-blur">✓ Roteiro completo. Toque em “Concluir”.</span></p>}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 pointer-events-auto">
                {tips.map((t, i) => (
                  <button key={t} type="button" onClick={() => setTarget(i)} aria-pressed={i === activeTip}
                    className={cn('shrink-0 min-h-9 px-3 rounded-full text-[11px] font-medium border backdrop-blur',
                      doneTips.has(i) ? 'bg-emerald-500/30 border-emerald-400/40 text-emerald-100' : i === activeTip ? 'bg-indigo-500/60 border-indigo-300/60 text-white' : 'bg-black/55 border-white/15 text-white/85')}>
                    {doneTips.has(i) && <Check className="w-3 h-3 inline mr-1" />}{t}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* revisão de foto com problema */}
        {pending && (
          <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-sm flex flex-col landscape:flex-row p-4 gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex-1 min-h-0 min-w-0 grid place-items-center overflow-hidden">
              <div className="relative inline-block max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pending.url} alt="Foto recém tirada" className="block max-w-full w-auto h-auto max-h-[calc(100dvh-17rem)] landscape:max-h-[calc(100dvh-2rem)] rounded-xl" />
                <InspectionOverlay inspection={pending.insp} />
              </div>
            </div>
            <div className="landscape:w-72 flex flex-col gap-3 justify-end">
              <div className="rounded-xl bg-amber-500/15 border border-amber-400/30 p-3 space-y-1.5">
                {pending.report?.issues.map((i) => <p key={i.id} className="text-sm"><b className="text-amber-200">{i.message}.</b> <span className="text-white/85">{i.tip}</span></p>)}
              </div>
              {pending.scanning && <p className="text-xs text-indigo-200">🔍 Procurando objetos e defeitos…</p>}
              <InspectionList inspection={pending.insp} />
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={retake} className="min-h-12 rounded-xl bg-indigo-600 font-semibold flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />Refazer</button>
                <button type="button" onClick={keepPending} className="min-h-12 rounded-xl bg-white/10 font-semibold">Usar assim</button>
              </div>
            </div>
          </div>
        )}

        {/* foto ampliada */}
        {previewShot && (
          <div className="absolute inset-0 z-30 bg-black/95 flex flex-col landscape:flex-row p-4 gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex-1 min-h-0 min-w-0 grid place-items-center overflow-hidden">
              <div className="relative inline-block max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewShot.url} alt="Foto tirada" className="block max-w-full w-auto h-auto max-h-[calc(100dvh-14rem)] landscape:max-h-[calc(100dvh-2rem)] rounded-xl" />
                <InspectionOverlay inspection={previewShot.insp} />
              </div>
            </div>
            <div className="landscape:w-64 flex flex-col gap-3 justify-end">
              <p className="text-xs text-white/70">{previewShot.tip != null ? tips[previewShot.tip] : 'Foto livre'}{previewShot.report && !previewShot.report.ok ? ` · ⚠ ${previewShot.report.issues.map((i) => i.message.toLowerCase()).join(', ')}` : ''}</p>
              <InspectionList inspection={previewShot.insp} className="max-h-32 overflow-y-auto" />
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => removeShot(previewShot.id)} className="min-h-12 rounded-xl bg-red-500/80 font-semibold flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" />Excluir</button>
                <button type="button" onClick={() => setPreview(null)} className="min-h-12 rounded-xl bg-white/10 font-semibold">Fechar</button>
              </div>
            </div>
          </div>
        )}

        {/* confirmar saída */}
        {confirmExit && (
          <div className="absolute inset-0 z-40 bg-black/80 grid place-items-center p-6">
            <div className="w-full max-w-sm rounded-2xl bg-[#16161f] border border-white/10 p-5 space-y-3" role="alertdialog" aria-label="Sair da câmera">
              <p className="text-base font-bold">Você tirou {shots.length} foto(s)</p>
              <p className="text-sm text-white/70">Quer usar essas fotos neste cômodo ou descartar?</p>
              <button type="button" onClick={finish} className="w-full min-h-12 rounded-xl bg-emerald-500 text-black font-bold">Usar {shots.length} foto(s)</button>
              <button type="button" onClick={() => setConfirmExit(false)} className="w-full min-h-12 rounded-xl bg-white/10 font-semibold">Continuar fotografando</button>
              <button type="button" onClick={discard} className="w-full min-h-12 rounded-xl text-red-300 font-semibold">Descartar e sair</button>
            </div>
          </div>
        )}
      </div>

      {/* controles */}
      <div className="shrink-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black flex items-center justify-between gap-3 landscape:flex-col landscape:w-36 landscape:px-3 landscape:py-3 landscape:pr-[max(0.75rem,env(safe-area-inset-right))]">
        <div className="flex-1 min-w-0 flex gap-1.5 overflow-x-auto scrollbar-hide landscape:flex-col landscape:overflow-y-auto landscape:overflow-x-hidden landscape:max-h-[40dvh] landscape:flex-none">
          {shots.slice(-6).map((s) => (
            <button key={s.id} type="button" onClick={() => setPreview(s.id)} aria-label="Ver esta foto" className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/25">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt="" className="w-full h-full object-cover" />
              {s.scanning && <span className="absolute inset-0 grid place-items-center bg-black/50"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /></span>}
              {inspectionSummary(s.insp).defects > 0 && <span className="absolute top-0 left-0 bg-red-500 text-white rounded-br text-[11px] leading-none px-1 py-0.5 font-bold">{inspectionSummary(s.insp).defects}</span>}
              {s.report && !s.report.ok && <span className="absolute bottom-0 right-0 bg-amber-400 text-black rounded-tl text-[11px] leading-none px-1">!</span>}
            </button>
          ))}
        </div>
        <div className="shrink-0 w-[84px] h-[84px] rounded-full p-1 grid place-items-center" style={{ background: `conic-gradient(#34d399 ${autoProgress * 360}deg, rgba(255,255,255,0.28) 0deg)` }}>
          <button type="button" onClick={capture} disabled={status !== 'live' || !!pending} aria-label="Tirar foto"
            className="w-full h-full rounded-full bg-black border-[3px] border-black grid place-items-center disabled:opacity-40 active:scale-95 transition-transform">
            <span className={cn('block w-[62px] h-[62px] rounded-full', live.level === 'bad' ? 'bg-red-400' : live.level === 'warn' ? 'bg-amber-300' : 'bg-white')}><Camera className="sr-only" /></span>
          </button>
        </div>
        <div className="flex-1 flex justify-end landscape:flex-none landscape:w-full">
          <button type="button" onClick={finish} disabled={shots.length === 0} className="min-h-12 px-5 rounded-xl bg-emerald-500 text-black font-bold text-sm disabled:opacity-30 landscape:w-full">Concluir{shots.length ? ` (${shots.length})` : ''}</button>
        </div>
      </div>
    </div>
  );
}
