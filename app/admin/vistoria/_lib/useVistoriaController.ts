'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { analyzeDataUrl } from './photo-quality';
import { proposalsFromInspection, proposalsFromAnalysis, acceptProposals, hasSimilar } from './inspection';
import type { PhotoInspection } from '@/lib/vistoria/shared';
import {
  defaultPropertyInfo, defaultSettings,
  type ChecklistState, type PhotoAnnotation, type PhotoData, type Proposal, type Reparo, type PropertyInfo, type RoomData, type SavedLaudo, type Signatures, type VistoriaSettings,
} from './types';
import { LAUDO_TEMPLATES } from './constants';
import {
  listLaudos, getLaudoLight, getLaudoFull, hydrate, putLaudo, deleteLaudoById, clearLaudos, loadSettings, saveSettingsToDb,
  migrateLegacyStorage, seedExamplesOnce, exportBackup, importBackup, estimateUsage, requestPersistence,
} from './storage';
import { compressImage, downscaleDataUrl } from './image';
import { saveFile, openHtmlDocument, openExternal, openedHint } from './native';

export type VistoriaView = 'home' | 'wizard' | 'library' | 'config' | 'stats' | 'compare';

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const emptyRoom = (name = ''): RoomData => ({
  id: uid(), name, photos: [], items: [], furniture: [], damages: [], analyzing: false, analyzed: false,
});

const slug = (s: string) =>
  (s || 'vistoria').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'vistoria';

const THUMB_CACHE = new Map<string, string>();

export function useVistoriaController() {
  const [view, setView] = useState<VistoriaView>('home');
  const [loaded, setLoaded] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo>(defaultPropertyInfo);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [signatures, setSignatures] = useState<Signatures>({});
  const [linkedId, setLinkedId] = useState<string | undefined>(undefined);
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
  const [annotatingPhoto, setAnnotatingPhoto] = useState<{ roomIdx: number; photoIdx: number } | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoData | null>(null);
  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [savedLaudos, setSavedLaudos] = useState<SavedLaudo[]>([]);
  const [editingLaudoId, setEditingLaudoId] = useState<string | null>(null);
  const [settings, setSettings] = useState<VistoriaSettings>(defaultSettings);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [searchEdit, setSearchEdit] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [storageUsage, setStorageUsage] = useState<{ usage: number; quota: number } | null>(null);
  const [compareIds, setCompareIds] = useState<{ entrada?: string; saida?: string }>({});
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model?: string; source?: string } | null>(null);
  const [aiWriting, setAiWriting] = useState(false);
  const [repairsBusy, setRepairsBusy] = useState(false);
  const [inspectingIds, setInspectingIds] = useState<string[]>([]);
  const [reviewRoomIdx, setReviewRoomIdx] = useState<number | null>(null);

  // Refs com o estado mais recente (evita closures velhas em timers/atalhos/async)
  const idRef = useRef<string | null>(null);
  const roomsRef = useRef(rooms);
  const infoRef = useRef(propertyInfo);
  const settingsRef = useRef(settings);
  const sigRef = useRef(signatures);
  const linkRef = useRef(linkedId);
  const viewRef = useRef(view);
  roomsRef.current = rooms;
  infoRef.current = propertyInfo;
  settingsRef.current = settings;
  sigRef.current = signatures;
  linkRef.current = linkedId;
  viewRef.current = view;
  idRef.current = editingLaudoId;

  const refreshUsage = useCallback(async () => setStorageUsage(await estimateUsage()), []);

  /** fetch para as rotas de IA; envia a chave do usuário (se houver) quando o servidor não tem uma */
  const aiFetch = useCallback(async (url: string, init?: { body?: unknown; method?: string }) => {
    const key = settingsRef.current.geminiApiKey?.trim();
    const res = await fetch(url, {
      method: init?.method || (init?.body ? 'POST' : 'GET'),
      headers: { 'Content-Type': 'application/json', ...(key ? { 'x-gemini-key': key } : {}) },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
    let data: Record<string, unknown> = {};
    try { data = await res.json(); } catch { /* corpo vazio */ }
    if (!res.ok || data.success === false) throw new Error(String(data.error || `Erro ${res.status}`));
    return data;
  }, []);

  const refreshAiStatus = useCallback(async () => {
    try {
      const d = await aiFetch('/api/admin/vistoria/analyze');
      setAiStatus({ configured: !!d.configured, model: d.model as string, source: d.source as string });
    } catch { setAiStatus({ configured: false }); }
  }, [aiFetch]);

  // ---------- Carga inicial ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        void requestPersistence();
        const migrated = await migrateLegacyStorage();
        await seedExamplesOnce();
        const [laudos, s] = await Promise.all([listLaudos(), loadSettings()]);
        if (cancelled) return;
        setSavedLaudos(laudos);
        setSettings(s);
        settingsRef.current = s;
        void refreshAiStatus();
        if (migrated > 0) toast.success(`${migrated} laudo(s) migrado(s) para o novo armazenamento`);
      } catch (err) {
        console.error('Erro ao carregar vistorias:', err);
        toast.error('Não foi possível acessar o armazenamento local');
      } finally {
        if (!cancelled) setLoaded(true);
        refreshUsage();
      }
    })();
    return () => { cancelled = true; };
  }, [refreshUsage, refreshAiStatus]);

  // ---------- Persistência ----------
  const makeThumb = async (room: RoomData[]): Promise<string | undefined> => {
    const first = room.flatMap((r) => r.photos).find((p) => p.dataUrl && p.dataUrl.startsWith('data:'));
    if (!first) return room.flatMap((r) => r.photos).find((p) => p.dataUrl)?.dataUrl;
    const key = first.id || first.name;
    const cached = THUMB_CACHE.get(key);
    if (cached) return cached;
    try {
      const blob = await (await fetch(first.dataUrl)).blob();
      const t = await compressImage(blob, 280, 0.65);
      THUMB_CACHE.set(key, t);
      return t;
    } catch {
      return undefined;
    }
  };

  const persist = useCallback(async (silent: boolean): Promise<string | null> => {
    const info = infoRef.current;
    let currentRooms = roomsRef.current;
    const hasContent = !!(info.condominio || info.endereco || currentRooms.some((r) => r.photos.length || r.items.length || r.name));
    if (!hasContent) {
      if (!silent) toast.info('Preencha ao menos o nome do imóvel ou um cômodo para salvar');
      return null;
    }
    // garante ids estáveis nas fotos (o armazenamento deduplica por id)
    if (currentRooms.some((r) => r.photos.some((p) => !p.id))) {
      currentRooms = currentRooms.map((r) => ({ ...r, photos: r.photos.map((p) => (p.id ? p : { ...p, id: uid() })) }));
      roomsRef.current = currentRooms;
      setRooms(currentRooms);
    }
    const id = idRef.current || uid();
    const now = new Date().toISOString();
    const existing = await getLaudoLight(id);
    const thumb = await makeThumb(currentRooms);
    const laudo: SavedLaudo = {
      id,
      name: info.condominio || info.endereco || `Laudo ${new Date().toLocaleDateString('pt-BR')}`,
      condominio: info.condominio,
      savedAt: now,
      createdAt: existing?.createdAt || now,
      favorite: existing?.favorite,
      isExample: existing?.isExample,
      thumb,
      signatures: sigRef.current,
      linkedId: linkRef.current,
      propertyInfo: { ...info },
      rooms: currentRooms.map((r) => ({ ...r, analyzing: false })),
    };
    let light: SavedLaudo;
    try {
      light = await putLaudo(laudo);
    } catch (err) {
      console.error(err);
      toast.error('Falha ao salvar: espaço de armazenamento insuficiente?');
      return null;
    }
    idRef.current = id;
    setEditingLaudoId(id);
    setSavedLaudos((prev) => (prev.some((l) => l.id === id) ? prev.map((l) => (l.id === id ? light : l)) : [...prev, light]));
    setLastSavedAt(now);
    setDirty(false);
    if (!silent) toast.success('Laudo salvo!');
    return id;
  }, []);

  const saveLaudo = useCallback((silent: boolean = false) => { void persist(silent); }, [persist]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (viewRef.current === 'wizard') setDirty(true);
  }, [propertyInfo, rooms, signatures]);

  useEffect(() => {
    if (view !== 'wizard' || !dirty) return;
    const t = setTimeout(() => { void persist(true); }, 2500);
    return () => clearTimeout(t);
  }, [view, dirty, propertyInfo, rooms, signatures, persist]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const goHome = useCallback(async () => {
    if (viewRef.current === 'wizard' && dirty) await persist(true);
    setView('home');
    refreshUsage();
  }, [dirty, persist, refreshUsage]);

  // ---------- Laudos ----------
  const loadFull = useCallback(async (id: string) => getLaudoFull(id), []);

  const openInWizard = (full: SavedLaudo) => {
    setPropertyInfo({ ...defaultPropertyInfo, ...full.propertyInfo });
    setRooms(full.rooms.map((r) => ({ ...r, analyzing: false })));
    setSignatures(full.signatures || {});
    setLinkedId(full.linkedId);
    setEditingLaudoId(full.id);
    idRef.current = full.id;
    setCurrentRoomIdx(0);
    setWizardStep(0);
    setDirty(false);
    setLastSavedAt(full.savedAt);
    setView('wizard');
  };

  const loadLaudo = async (laudo: SavedLaudo) => {
    try {
      openInWizard(await hydrate(laudo));
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível abrir o laudo');
    }
  };

  const deleteLaudo = async (id: string) => {
    await deleteLaudoById(id);
    setSavedLaudos((prev) => prev.filter((l) => l.id !== id));
    if (idRef.current === id) { idRef.current = null; setEditingLaudoId(null); }
    toast.success('Laudo removido');
    refreshUsage();
  };

  const clearAllLaudos = async () => {
    await clearLaudos();
    setSavedLaudos([]);
    idRef.current = null;
    setEditingLaudoId(null);
    toast.success('Todos os laudos foram removidos');
    refreshUsage();
  };

  const duplicateLaudo = async (laudo: SavedLaudo) => {
    const full = await hydrate(laudo);
    const now = new Date().toISOString();
    const copy: SavedLaudo = {
      ...full,
      id: uid(),
      name: `${full.name} (cópia)`,
      savedAt: now,
      createdAt: now,
      isExample: false,
      favorite: false,
      rooms: full.rooms.map((r) => ({ ...r, id: uid(), photos: r.photos.map((p) => ({ ...p, id: uid() })) })),
    };
    const light = await putLaudo(copy);
    setSavedLaudos((prev) => [...prev, light]);
    toast.success('Laudo duplicado');
    refreshUsage();
  };

  const toggleFavorite = async (laudo: SavedLaudo) => {
    const updated = await putLaudo({ ...laudo, favorite: !laudo.favorite });
    setSavedLaudos((prev) => prev.map((l) => (l.id === laudo.id ? updated : l)));
  };

  /** Cria uma vistoria de SAÍDA a partir de uma de entrada: mesmos cômodos e inventário, sem fotos. */
  const createExitFrom = async (entry: SavedLaudo) => {
    const full = await hydrate(entry);
    const now = new Date().toISOString();
    const today = new Date().toLocaleDateString('pt-BR');
    const exit: SavedLaudo = {
      ...full,
      id: uid(),
      name: `${full.name} — Saída`,
      savedAt: now,
      createdAt: now,
      isExample: false,
      favorite: false,
      thumb: undefined,
      signatures: {},
      linkedId: full.id,
      propertyInfo: {
        ...full.propertyInfo, tipoVistoria: 'SAIDA', dataLaudo: today, dataFotografia: today, consideracoes: '',
        medidoresEntrada: full.propertyInfo.medidores || full.propertyInfo.medidoresEntrada, medidores: undefined, reparos: [],
      },
      rooms: full.rooms.map((r) => ({
        ...r, id: uid(), photos: [], items: [], damages: [], analyzed: false, analyzing: false,
        checklist: {}, observations: '', photoProblems: [],
      })),
    };
    const light = await putLaudo(exit);
    setSavedLaudos((prev) => [...prev, light]);
    toast.success('Vistoria de saída criada a partir da entrada');
    openInWizard(exit);
    setWizardStep(3);
  };

  const openCompare = (ids: { entrada?: string; saida?: string } = {}) => {
    setCompareIds(ids);
    setView('compare');
  };

  const exportAll = async (ids?: string[]) => {
    const blob = await exportBackup(ids);
    saveFile(blob, `vistorias-backup-${new Date().toISOString().slice(0, 10)}.json`).catch((err) => toast.error(err instanceof Error ? err.message : 'Erro ao salvar backup'));
    toast.success('Backup exportado');
  };

  const importFromFile = async (file: File) => {
    try {
      const count = await importBackup(await file.text());
      setSavedLaudos(await listLaudos());
      toast.success(`${count} laudo(s) importado(s)`);
      refreshUsage();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao importar o backup');
    }
  };

  const saveSettings = async () => {
    await saveSettingsToDb(settings);
    toast.success('Configurações salvas!');
  };

  // ---------- Wizard ----------
  const startWizard = (template?: (typeof LAUDO_TEMPLATES)[0]) => {
    const s = settingsRef.current;
    const t = template || LAUDO_TEMPLATES.find((x) => x.id === selectedTemplate) || LAUDO_TEMPLATES[0];
    setPropertyInfo({
      ...defaultPropertyInfo,
      dataFotografia: new Date().toLocaleDateString('pt-BR'),
      dataLaudo: new Date().toLocaleDateString('pt-BR'),
      vistoriadora: s.defaultVistoriadora || '',
      solicitante: s.defaultSolicitante || '',
      emailContestacao: s.emailContestacao || '',
      cidade: s.defaultCidade || '',
      estado: s.defaultEstado || '',
      tipoImovel: t.tipoImovel || s.defaultTipoImovel || '',
      finalidade: t.finalidade || s.defaultFinalidade || 'RESIDENCIAL',
    });
    setRooms(t.rooms.filter(Boolean).map((name) => emptyRoom(name)));
    setSignatures({});
    setLinkedId(undefined);
    setCurrentRoomIdx(0);
    setWizardStep(0);
    setEditingLaudoId(null);
    idRef.current = null;
    setDirty(false);
    setLastSavedAt(null);
    setView('wizard');
  };

  const addRoom = () => setRooms((prev) => [...prev, emptyRoom()]);
  const removeRoom = (idx: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== idx));
    setCurrentRoomIdx((cur) => Math.max(0, Math.min(cur, roomsRef.current.length - 2)));
  };

  // ---------- Fotos + IA ----------
  const analyzeRoom = async (roomIdx: number, photosOverride?: string[]) => {
    const room = roomsRef.current[roomIdx];
    const photos = photosOverride || room?.photos.map((p) => p.dataUrl).filter((u) => u.startsWith('data:')) || [];
    if (!room || photos.length === 0) return;
    const rn = room.name || `Cômodo ${roomIdx + 1}`;
    const cfg = settingsRef.current;
    setRooms((prev) => prev.map((r, i) => (i === roomIdx ? { ...r, analyzing: true } : r)));
    try {
      const d = await aiFetch('/api/admin/vistoria/analyze', {
        body: {
          rooms: [{ name: rn, photos: photos.slice(0, 8), knownFurniture: room.furniture, knownDamages: room.damages }],
          propertyType: infoRef.current.tipoImovel,
          finality: infoRef.current.finalidade,
          tipoVistoria: infoRef.current.tipoVistoria || 'ENTRADA',
        },
      });
      const result = (d.results as Record<string, any>)?.[rn] || {};
      const photoCount = Math.min(photos.length, 8);
      setRooms((prev) => prev.map((r, i) => {
        if (i !== roomIdx) return r;
        // checklist: a IA só preenche o que a vistoria ainda não avaliou (editável no passo de inventário)
        const checklist = { ...(r.checklist || {}) };
        if (cfg.aiAutoChecklist) for (const [k, st] of Object.entries(result.checklist || {})) if (!checklist[k]) checklist[k] = st as ChecklistState;
        // itens, avarias e marcações viram sugestões para revisão (nada é gravado sem aceite)
        const photoIds = r.photos.filter((p) => p.dataUrl.startsWith('data:')).map((p) => p.id || '');
        const fresh = proposalsFromAnalysis(r, result, photoIds, cfg.aiAutoAnnotate);
        const queued = (r.proposals || []).map((x) => x.text);
        const proposals = [...(r.proposals || []), ...fresh.filter((c) => !hasSimilar(queued, c.text))];
        const photosOut = r.photos;
        return {
          ...r, photos: photosOut, items: result.items || r.items, checklist, proposals,
          aiAdvice: { missingShots: result.missingShots || [], photoNotes: result.photoNotes || [] },
          analyzing: false, analyzed: true,
        };
      }));
      const nNew = proposalsFromAnalysis(room, result, [], false).length;
      if (nNew > 0) toast.success(`${rn}: a IA sugeriu ${nNew} item(ns)/avaria(s). Revise antes de entrarem no laudo.`, { action: { label: 'Revisar', onClick: () => setReviewRoomIdx(roomIdx) }, duration: 12000 });
      else toast.success(`${rn} analisado. Nada novo para sugerir.`);
      if ((result.photoNotes || []).length) toast.warning(`${result.photoNotes.length} foto(s) com problema de qualidade — veja as sugestões da IA.`);
    } catch (err) {
      setRooms((prev) => prev.map((r, i) => (i === roomIdx ? { ...r, analyzing: false } : r)));
      toast.error(err instanceof Error && err.message ? err.message : 'Erro ao analisar');
    }
  };

  /** Redige as considerações finais com a IA a partir dos dados reais do laudo. */
  const generateConsiderations = async (entradaResumo?: string) => {
    if (aiWriting) return;
    setAiWriting(true);
    const previous = infoRef.current.consideracoes;
    try {
      const d = await aiFetch('/api/admin/vistoria/considerations', {
        body: {
          propertyInfo: infoRef.current,
          entradaResumo,
          rooms: roomsRef.current.map((r) => ({
            name: r.name, photoCount: r.photos.length, items: r.items.filter((i) => i.startsWith('✓')).slice(0, 10),
            furniture: r.furniture, damages: r.damages, problems: r.photoProblems || [], checklist: r.checklist || {}, observations: r.observations || '',
          })),
        },
      });
      const text = String(d.text || '').trim();
      if (!text) throw new Error('A IA não retornou texto');
      setPropertyInfo((p) => ({ ...p, consideracoes: text }));
      toast.success('Considerações geradas pela IA', {
        action: { label: 'Desfazer', onClick: () => setPropertyInfo((p) => ({ ...p, consideracoes: previous })) },
        duration: 8000,
      });
      return (d.highlights as string[]) || [];
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível gerar as considerações');
    } finally {
      setAiWriting(false);
    }
  };

  const estimateRepairs = async () => {
    if (repairsBusy) return;
    const info = infoRef.current;
    const damages = roomsRef.current.flatMap((r, i) => {
      const comodo = r.name || `Cômodo ${i + 1}`;
      const fromAnn = r.photos.flatMap((p) => p.annotations.map((a) => a.label));
      return [...new Set([...(r.damages || []), ...fromAnn])].filter(Boolean).map((descricao) => ({ comodo, descricao }));
    });
    if (damages.length === 0) { toast.info('Nenhuma avaria registrada para estimar'); return; }
    setRepairsBusy(true);
    try {
      const d = await aiFetch('/api/admin/vistoria/repairs', {
        body: { cidade: info.cidade || settingsRef.current.defaultCidade, estado: info.estado || settingsRef.current.defaultEstado, tipoImovel: info.tipoImovel, damages },
      });
      const fresh = ((d.repairs as Omit<Reparo, 'id' | 'origem'>[]) || []).map((r) => ({ ...r, id: uid(), origem: 'ia' as const }));
      if (fresh.length === 0) throw new Error('A IA não retornou estimativas');
      setPropertyInfo((p) => ({ ...p, reparos: [...(p.reparos || []).filter((r) => r.origem === 'manual'), ...fresh] }));
      toast.success(`${fresh.length} estimativa(s) gerada(s). Confira os valores antes de usar.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível estimar os reparos');
    } finally {
      setRepairsBusy(false);
    }
  };

  // ---- Inspeção inteligente: detecta objetos e defeitos em cada foto ----
  const inspectRequest = async (urls: string[], roomName: string): Promise<(PhotoInspection | null)[]> => {
    const small = await Promise.all(urls.map((u) => downscaleDataUrl(u, 1024, 0.72).catch(() => u)));
    const d = await aiFetch('/api/admin/vistoria/inspect', { body: { photos: small, room: roomName, propertyType: infoRef.current.tipoImovel } });
    const res = (d.results as PhotoInspection[]) || [];
    return urls.map((_, i) => res[i] || null);
  };

  /** usado pela câmera: inspeciona uma foto recém-tirada */
  const inspectOne = async (dataUrl: string, roomName: string): Promise<PhotoInspection | null> => {
    try { return (await inspectRequest([dataUrl], roomName))[0]; } catch { return null; }
  };

  /** Guarda a inspeção na foto e cria SUGESTÕES para revisão. Nada entra no laudo sem aceite. */
  const queueInspections = (roomIdx: number, items: { photoId: string; insp: PhotoInspection }[], opts: { open?: boolean } = {}) => {
    const base = roomsRef.current[roomIdx];
    if (!base || items.length === 0) return;
    let sim = base;
    const created: Proposal[] = [];
    for (const it of items) {
      const ps = proposalsFromInspection(sim, it.photoId, it.insp, settingsRef.current.aiAutoAnnotate);
      created.push(...ps);
      sim = { ...sim, proposals: [...(sim.proposals || []), ...ps] };
    }
    const byId = new Map(items.map((i) => [i.photoId, i.insp]));
    setRooms((prev) => prev.map((r, i) => {
      if (i !== roomIdx) return r;
      const queued = (r.proposals || []).map((x) => x.text);
      return {
        ...r,
        photos: r.photos.map((p) => (p.id && byId.has(p.id) ? { ...p, inspection: byId.get(p.id) } : p)),
        proposals: [...(r.proposals || []), ...created.filter((c) => !hasSimilar(queued, c.text))],
      };
    }));
    if (created.length === 0) { toast.info('Inspeção concluída: nada novo para sugerir.'); return; }
    if (opts.open) setReviewRoomIdx(roomIdx);
    else toast.success(`A IA encontrou ${created.length} sugestão(ões). Revise antes de entrarem no laudo.`, { action: { label: 'Revisar', onClick: () => setReviewRoomIdx(roomIdx) }, duration: 12000 });
  };

  /** Grava as sugestões aceitas (já com o texto editado) e retira da fila as decididas (aceitas + descartadas). */
  const resolveProposals = (roomIdx: number, accepted: (Proposal & { applyMark?: boolean })[], decidedIds: string[]) => {
    setRooms((prev) => prev.map((r, i) => (i === roomIdx ? { ...r, ...acceptProposals(r, accepted, decidedIds) } : r)));
    const nF = accepted.filter((a) => a.kind === 'furniture').length;
    const nD = accepted.filter((a) => a.kind === 'damage').length;
    toast.success(accepted.length ? `Adicionado ao laudo: ${nF} item(ns) e ${nD} avaria(s).` : 'Sugestões descartadas.');
  };

  const runInspection = async (roomIdx: number, photos: { id: string; dataUrl: string }[], open = true) => {
    const room = roomsRef.current[roomIdx];
    const todo = photos.filter((p) => p.id && p.dataUrl.startsWith('data:'));
    if (!room || todo.length === 0) return;
    const rn = room.name || `Cômodo ${roomIdx + 1}`;
    setInspectingIds((s) => [...s, ...todo.map((p) => p.id)]);
    try {
      const done: { photoId: string; insp: PhotoInspection }[] = [];
      for (let i = 0; i < todo.length; i += 3) {
        const chunk = todo.slice(i, i + 3);
        const res = await inspectRequest(chunk.map((c) => c.dataUrl), rn);
        chunk.forEach((c, k) => { if (res[k]) done.push({ photoId: c.id, insp: res[k]! }); });
      }
      queueInspections(roomIdx, done, { open });
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'Não foi possível inspecionar as fotos');
    } finally {
      const ids = new Set(todo.map((p) => p.id));
      setInspectingIds((s) => s.filter((x) => !ids.has(x)));
    }
  };

  /** inspeciona todas as fotos do cômodo (ou só as que ainda não foram inspecionadas) */
  const inspectRoom = (roomIdx: number, force = false) => {
    const room = roomsRef.current[roomIdx];
    if (!room) return;
    const list = room.photos.filter((p) => p.id && p.dataUrl.startsWith('data:') && (force || !p.inspection)).map((p) => ({ id: p.id!, dataUrl: p.dataUrl }));
    if (list.length === 0) { toast.info('Todas as fotos já foram inspecionadas'); return; }
    void runInspection(roomIdx, list);
  };
  const inspectPhoto = (roomIdx: number, photoIdx: number) => {
    const p = roomsRef.current[roomIdx]?.photos[photoIdx];
    if (p?.id && p.dataUrl.startsWith('data:')) void runInspection(roomIdx, [{ id: p.id, dataUrl: p.dataUrl }]);
  };

  const handlePhotoUpload = async (roomIdx: number, files: FileList | null, inspections?: (PhotoInspection | null | undefined)[]) => {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) { toast.error('Selecione arquivos de imagem'); return; }
    setUploading(true);
    try {
      const results = await Promise.allSettled(images.map(async (f) => ({ id: uid(), dataUrl: await compressImage(f), name: f.name, annotations: [] as PhotoAnnotation[] })));
      const pairs = results.flatMap((r, i) => (r.status === 'fulfilled' ? [{ photo: r.value, insp: inspections?.[i] ?? null }] : []));
      const ok = pairs.map((x) => (x.insp ? { ...x.photo, inspection: x.insp } : x.photo));
      const failed = results.length - ok.length;
      if (failed) toast.error(`${failed} foto(s) não puderam ser processadas`);
      if (ok.length === 0) return;
      void Promise.all(ok.map((p) => analyzeDataUrl(p.dataUrl).catch(() => null))).then((reps) => {
        const bad = reps.map((r, i) => ({ r, i })).filter((x) => x.r && !x.r.ok);
        if (bad.length === 0) return;
        const dark = bad.filter((x) => x.r!.issues.some((i) => i.id === 'dark')).length;
        const blur = bad.filter((x) => x.r!.issues.some((i) => i.id === 'blurry')).length;
        const bright = bad.filter((x) => x.r!.issues.some((i) => i.id === 'bright')).length;
        const parts = [dark && `${dark} escura(s)`, bright && `${bright} com luz estourada`, blur && `${blur} possivelmente tremida(s)`].filter(Boolean).join(', ');
        toast.warning(`Verifique as fotos: ${parts}. Se puder, refaça com a câmera guiada.`, { duration: 9000 });
      });
      const existing = roomsRef.current[roomIdx]?.photos.map((p) => p.dataUrl).filter((u) => u.startsWith('data:')) || [];
      setRooms((prev) => prev.map((r, i) => (i === roomIdx ? { ...r, photos: [...r.photos, ...ok] } : r)));
      const given = pairs.filter((x) => x.insp).map((x) => ({ photoId: x.photo.id, insp: x.insp! }));
      if (given.length) queueInspections(roomIdx, given, { open: true });
      const pendingInsp = pairs.filter((x) => !x.insp).map((x) => ({ id: x.photo.id, dataUrl: x.photo.dataUrl }));
      if (pendingInsp.length && settingsRef.current.aiAutoInspect && settingsRef.current.aiAnalysisEnabled && aiStatus?.configured) void runInspection(roomIdx, pendingInsp, false);
      if (settingsRef.current.aiAnalysisEnabled && settingsRef.current.autoAnalyze) {
        void analyzeRoom(roomIdx, [...existing, ...ok.map((p) => p.dataUrl)]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDragStart = (idx: number) => setDraggedPhotoIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIdx: number) => {
    if (draggedPhotoIdx === null || draggedPhotoIdx === targetIdx) return;
    setRooms((prev) => prev.map((r, i) => {
      if (i !== currentRoomIdx) return r;
      const p = [...r.photos];
      const [m] = p.splice(draggedPhotoIdx, 1);
      p.splice(targetIdx, 0, m);
      return { ...r, photos: p };
    }));
    setDraggedPhotoIdx(null);
  };

  const analyzeAllRooms = async () => {
    setBatchAnalyzing(true);
    try {
      for (let i = 0; i < roomsRef.current.length; i++) {
        const r = roomsRef.current[i];
        if (r.photos.length > 0 && !r.analyzed) await analyzeRoom(i);
      }
      toast.success('Todas as análises concluídas!');
    } finally {
      setBatchAnalyzing(false);
    }
  };

  // Atualiza campos de um cômodo (checklist, observações, problemas a fotografar)
  const patchRoom = (roomId: string, patch: Partial<RoomData>) =>
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...patch } : r)));

  // ---------- PDF / HTML ----------
  const renderLaudoHtml = async (info: PropertyInfo, laudoRooms: RoomData[], sig: Signatures = {}): Promise<string> => {
    const payloadRooms = await Promise.all(laudoRooms.map(async (r, i) => ({
      name: r.name || `Cômodo ${i + 1}`,
      items: r.items.length > 0 ? r.items : [`✓ Cômodo "${r.name || 'Sem nome'}" - sem análise automática`],
      furniture: r.furniture || [],
      damages: r.damages || [],
      checklist: r.checklist || {},
      observations: r.observations || '',
      problems: r.photoProblems || [],
      photos: await Promise.all(r.photos.filter((p) => p.dataUrl).map(async (p) => ({
        dataUrl: await downscaleDataUrl(p.dataUrl), name: p.name, annotations: p.annotations || [],
      }))),
    })));
    const res = await fetch('/api/admin/vistoria/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...info, signatures: sig, rooms: payloadRooms,
        emailContestacao: info.emailContestacao || settingsRef.current.emailContestacao || '',
        empresaNome: settingsRef.current.empresaNome || '',
        watermark: settingsRef.current.watermarkEnabled
          ? { text: settingsRef.current.watermarkText || '', image: settingsRef.current.watermarkImage || '' }
          : null,
      }),
    });
    if (res.status === 413) throw new Error('Laudo grande demais para gerar de uma vez. Remova algumas fotos.');
    const data = await res.json();
    if (!data.success || !data.html) throw new Error(data.error || 'Falha ao gerar o laudo');
    return data.html as string;
  };

  const generatePdf = async () => {
    setGenerating(true);
    setGenerationStep('Otimizando fotos...');
    try {
      setGenerationStep('Gerando HTML do laudo...');
      const html = await renderLaudoHtml(infoRef.current, roomsRef.current, sigRef.current);
      setPdfHtml(html);
      setGenerationStep('Laudo pronto!');
      setShowPdfPreview(true);
      toast.success('Laudo gerado!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar laudo');
      setGenerationStep('');
    } finally {
      setGenerating(false);
    }
  };

  const openBlobInTab = (html: string, name = 'laudo') => openHtmlDocument(html, name);

  const openLaudoHtml = async (laudo: SavedLaudo) => {
    const tId = toast.loading('Gerando laudo...');
    try {
      const full = await hydrate(laudo);
      await openBlobInTab(await renderLaudoHtml(full.propertyInfo, full.rooms, full.signatures), `laudo-${slug(laudo.name)}`);
      toast.success('Laudo pronto', { id: tId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao gerar laudo', { id: tId });
    }
  };

  const downloadLaudoHtml = async (laudo: SavedLaudo) => {
    const tId = toast.loading('Gerando arquivo...');
    try {
      const full = await hydrate(laudo);
      const html = await renderLaudoHtml(full.propertyInfo, full.rooms, full.signatures);
      const how = await saveFile(new Blob([html], { type: 'text/html' }), `laudo-${slug(laudo.name)}.html`);
      toast.success(how === 'shared' ? 'Arquivo pronto' : 'HTML baixado!', { id: tId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao baixar', { id: tId });
    }
  };

  const exportHtml = async () => {
    if (!pdfHtml) return;
    try {
      const how = await saveFile(new Blob([pdfHtml], { type: 'text/html' }), `laudo-${slug(propertyInfo.condominio || 'imovel')}.html`);
      toast.success(how === 'shared' ? 'Arquivo pronto' : 'HTML baixado!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const openPdfInTab = async () => {
    if (!pdfHtml) return;
    try {
      const kind = await openBlobInTab(pdfHtml, `laudo-${slug(propertyInfo.condominio || 'imovel')}`);
      toast.success(openedHint(kind));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao abrir laudo');
    }
  };

  const shareWhatsApp = () => {
    const photos = rooms.reduce((s, r) => s + r.photos.length, 0);
    const anns = rooms.reduce((s, r) => s + r.photos.reduce((s2, p) => s2 + p.annotations.length, 0), 0);
    const text = encodeURIComponent(
      `📋 Laudo de Vistoria (${propertyInfo.tipoVistoria === 'SAIDA' ? 'Saída' : propertyInfo.tipoVistoria === 'PERIODICA' ? 'Periódica' : 'Entrada'})\n\n🏢 ${propertyInfo.condominio}\n📍 ${propertyInfo.endereco} ${propertyInfo.numero}\n📅 ${propertyInfo.dataLaudo}\n\nVistoriadora: ${propertyInfo.vistoriadora}\nImóvel: ${propertyInfo.tipoImovel} - ${propertyInfo.finalidade}\n\nCômodos: ${rooms.length}\nFotos: ${photos}\nAnotações: ${anns}\n\nGerado por imobWeb Vistoria`,
    );
    openExternal(`https://wa.me/?text=${text}`);
  };

  // ---------- Atalhos ----------
  const generatePdfRef = useRef(generatePdf);
  generatePdfRef.current = generatePdf;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (viewRef.current !== 'wizard') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); void persist(false); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') { e.preventDefault(); void generatePdfRef.current(); }
      if (e.key === 'Escape' && !annotatingPhoto && !previewPhoto && !showPdfPreview) { void goHome(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [persist, goHome, annotatingPhoto, previewPhoto, showPdfPreview]);

  // ---------- Derivados ----------
  const totalPhotos = rooms.reduce((s, r) => s + r.photos.length, 0);
  const totalAnnotations = rooms.reduce((s, r) => s + r.photos.reduce((s2, p) => s2 + p.annotations.length, 0), 0);
  const analyzedRooms = rooms.filter((r) => r.analyzed).length;
  const currentRoom = rooms[currentRoomIdx];
  const canProceed = () => (wizardStep === 2 ? rooms.length > 0 : true);

  const handleNext = () => {
    if (wizardStep === 0 && !propertyInfo.metragem.trim()) {
      toast.warning('Metragem não informada - o laudo será gerado sem essa informação');
    }
    setWizardStep((s) => s + 1);
  };

  const sortedLaudos = useMemo(
    () => [...savedLaudos].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()),
    [savedLaudos],
  );

  return {
    view, setView, loaded, wizardStep, setWizardStep, propertyInfo, setPropertyInfo, rooms, setRooms,
    signatures, setSignatures, linkedId, compareIds,
    currentRoomIdx, setCurrentRoomIdx, annotatingPhoto, setAnnotatingPhoto, previewPhoto, setPreviewPhoto,
    draggedPhotoIdx, setDraggedPhotoIdx, generating, savedLaudos, sortedLaudos, editingLaudoId, settings, setSettings,
    selectedTemplate, setSelectedTemplate, pdfHtml, setPdfHtml, showPdfPreview, setShowPdfPreview,
    generationStep, batchAnalyzing, searchEdit, setSearchEdit,
    uploading, lastSavedAt, dirty, storageUsage,
    aiStatus, aiWriting, aiFetch, refreshAiStatus, generateConsiderations, estimateRepairs, repairsBusy, reviewRoomIdx, setReviewRoomIdx, resolveProposals, inspectOne, inspectRoom, inspectPhoto, inspectingIds,
    saveLaudo, loadLaudo, loadFull, deleteLaudo, clearAllLaudos, duplicateLaudo, toggleFavorite, createExitFrom, openCompare,
    exportAll, importFromFile, saveSettings, startWizard, addRoom, removeRoom, patchRoom, handlePhotoUpload,
    handleDragStart, handleDragOver, handleDrop, analyzeRoom, analyzeAllRooms, generatePdf, exportHtml, openPdfInTab,
    shareWhatsApp, openLaudoHtml, downloadLaudoHtml,
    totalPhotos, totalAnnotations, analyzedRooms, currentRoom, canProceed, handleNext, goHome,
  };
}

export type VistoriaController = ReturnType<typeof useVistoriaController>;
