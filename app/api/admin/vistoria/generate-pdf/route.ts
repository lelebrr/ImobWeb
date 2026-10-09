import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PhotoAnnotation { x: number; y: number; label: string; }
interface PhotoData { dataUrl: string; name: string; annotations: PhotoAnnotation[]; }
interface VistoriaData {
  condominio: string; endereco: string; numero: string; conjApto: string; apto: string; cep: string;
  bairro: string; cidade: string; estado: string; tipoImovel: string; finalidade: string;
  metragem: string; mobiliado: string; andar: string;
  locadora: string; locadoraCpf: string; locadoraTelefone: string;
  locatario: string; locatarioCpf: string; locatarioTelefone: string;
  vistoriadora: string; dataFotografia: string;
  dataLaudo: string; solicitante: string; emailContestacao: string;
  tipoVistoria?: string;
  empresaNome?: string;
  watermark?: { text?: string; image?: string } | null;
  signatures?: { locadora?: string; locatario?: string; vistoriadora?: string };
  rooms: { name: string; items: string[]; photos: PhotoData[]; problems?: string[]; observations?: string; furniture?: string[]; damages?: string[]; checklist?: Record<string, string> }[];
  consideracoes: string;
  medidores?: Record<string, { numero?: string; leitura?: string }>;
  medidoresEntrada?: Record<string, { numero?: string; leitura?: string }>;
  chaves?: { descricao?: string; quantidade?: number }[];
  reparos?: { comodo?: string; descricao?: string; min?: number; max?: number; nota?: string }[];
}

import { requireUser, isSafeImageSrc } from '@/lib/vistoria/api-guard';

// Escapa texto vindo do usuário antes de entrar no HTML do laudo (evita XSS/HTML injection)
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const SIG_RE = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/;
function sigImg(src?: string): string {
  return src && src.length < 400_000 && SIG_RE.test(src) ? `<img class="sig-img" src="${src}" alt="Assinatura" />` : '';
}
const CL_LABEL: Record<string, string> = { ok: 'Bom', regular: 'Regular', ruim: 'Ruim', na: 'N/A' };
const TIPO_LABEL: Record<string, string> = { ENTRADA: 'de entrada', SAIDA: 'de saída', PERIODICA: 'periódica' };

const MED_LABEL: Record<string, { label: string; unit: string }> = { agua: { label: 'Água', unit: 'm³' }, luz: { label: 'Energia', unit: 'kWh' }, gas: { label: 'Gás', unit: 'm³' } };
const readNum = (v?: string): number | null => {
  const t = String(v ?? '').trim().replace(/\s/g, '');
  if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+([.,]\d+)?$/.test(t)) return null;
  const n = /,/.test(t) ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t);
  return Number.isFinite(n) ? n : null;
};
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const money = (v: unknown) => Math.min(500_000, Math.max(0, Math.round(Number(v) || 0)));

function buildExtrasHtml(data: VistoriaData): string {
  const out: string[] = [];
  const med = data.medidores && typeof data.medidores === 'object' ? data.medidores : {};
  const prev = data.medidoresEntrada && typeof data.medidoresEntrada === 'object' ? data.medidoresEntrada : null;
  const rows = Object.keys(MED_LABEL).map((k) => {
    const cur = med[k]; const old = prev?.[k];
    if (!cur?.leitura?.trim() && !old?.leitura?.trim()) return '';
    const a = readNum(old?.leitura); const b = readNum(cur?.leitura);
    const used = a != null && b != null && b >= a ? `${(Math.round((b - a) * 1000) / 1000).toLocaleString('pt-BR')} ${MED_LABEL[k].unit}` : '—';
    return `<tr><td>${MED_LABEL[k].label}</td><td>${esc(String(cur?.numero ?? '').slice(0, 30)) || '—'}</td>${prev ? `<td>${esc(String(old?.leitura ?? '').slice(0, 20)) || '—'}</td>` : ''}<td>${esc(String(cur?.leitura ?? '').slice(0, 20)) || '—'}</td>${prev ? `<td>${used}</td>` : ''}</tr>`;
  }).filter(Boolean);
  if (rows.length) {
    out.push(`<h3 class="ex-h">Leitura dos medidores</h3><table class="ex-t"><tr><th>Medidor</th><th>Nº</th>${prev ? '<th>Entrada</th>' : ''}<th>${prev ? 'Saída' : 'Leitura'}</th>${prev ? '<th>Consumo</th>' : ''}</tr>${rows.join('')}</table>`);
  }
  const chaves = (Array.isArray(data.chaves) ? data.chaves : []).slice(0, 40).filter((c) => c && String(c.descricao || '').trim());
  if (chaves.length) {
    out.push(`<h3 class="ex-h">Chaves, controles e acessos</h3><table class="ex-t"><tr><th>Item</th><th style="width:70px">Qtd.</th></tr>${chaves.map((c) => `<tr><td>${esc(String(c.descricao).slice(0, 80))}</td><td>${Math.min(99, Math.max(1, Math.round(Number(c.quantidade) || 1)))}</td></tr>`).join('')}</table>`);
  }
  const reparos = (Array.isArray(data.reparos) ? data.reparos : []).slice(0, 60).filter((r) => r && String(r.descricao || '').trim());
  if (reparos.length) {
    const tot = reparos.reduce<{ min: number; max: number }>((a, r) => ({ min: a.min + money(r.min), max: a.max + money(r.max) }), { min: 0, max: 0 });
    out.push(`<h3 class="ex-h">Estimativa de reparos (referencial)</h3><table class="ex-t"><tr><th>Cômodo</th><th>Reparo</th><th style="width:130px">Faixa estimada</th></tr>${reparos.map((r) => `<tr><td>${esc(String(r.comodo ?? '').slice(0, 60)) || '—'}</td><td>${esc(String(r.descricao).slice(0, 160))}${r.nota ? `<br><small>${esc(String(r.nota).slice(0, 200))}</small>` : ''}</td><td>${brl(money(r.min))} a ${brl(money(r.max))}</td></tr>`).join('')}<tr><td colspan="2"><b>Total estimado</b></td><td><b>${brl(tot.min)} a ${brl(tot.max)}</b></td></tr></table><p class="ex-n">Valores estimados apenas como referência, sem caráter de orçamento ou cobrança. Sujeitos a confirmação por profissional habilitado.</p>`);
  }
  return out.length ? `<div class="extras">${out.join('')}</div>` : '';
}

let ASSET_ORIGIN = '';
function safeSrc(src: string): string {
  if (!isSafeImageSrc(src)) return '';
  return src.startsWith('/') ? ASSET_ORIGIN + src : src;
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function formatDateLong(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    let day = parseInt(parts[0], 10); let month = parseInt(parts[1], 10); let year = parseInt(parts[2], 10);
    if (parts[2].length === 2) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) return `${day} de ${MONTHS[month - 1]} de ${year}`;
  }
  return dateStr;
}

// Build annotation SVG that stays INSIDE the photo
function buildAnnotationSvg(annotations: PhotoAnnotation[]): string {
  if (!annotations || annotations.length === 0) return '';
  const svgW = 100; const svgH = 100; // percentage-based viewBox
  const sorted = [...annotations].sort((a, b) => a.y - b.y || a.x - b.x);

  return sorted.map((ann, i) => {
    const cx = Math.min(100, Math.max(0, Number(ann.x) || 0)); const cy = Math.min(100, Math.max(0, Number(ann.y) || 0));
    const num = i + 1;

    // Label positioned below the marker, clamped inside the image
    const labelW = Math.min(String(ann.label ?? '').length * 1.2 + 4, 28);
    const labelH = 3.5;
    const labelY = Math.min(cy + 4, svgH - labelH - 1);
    const labelX = Math.max(labelW / 2 + 1, Math.min(cx, svgW - labelW / 2 - 1));

    return `
      <circle cx="${cx}" cy="${cy}" r="2.5" fill="#dc2626" stroke="white" stroke-width="0.5" />
      <text x="${cx}" y="${cy + 0.8}" text-anchor="middle" fill="white" font-size="2" font-weight="800" font-family="Arial">${num}</text>
      <line x1="${cx}" y1="${cy + 2.5}" x2="${cx}" y2="${labelY - 0.3}" stroke="#dc2626" stroke-width="0.3" />
      <line x1="${cx}" y1="${labelY - 0.3}" x2="${labelX}" y2="${labelY + 0.5}" stroke="#dc2626" stroke-width="0.25" stroke-dasharray="0.8,0.4" />
      <rect x="${labelX - labelW / 2}" y="${labelY}" width="${labelW}" height="${labelH}" rx="0.6" fill="#1e293b" stroke="#dc2626" stroke-width="0.15" />
      <text x="${labelX}" y="${labelY + 2.4}" text-anchor="middle" fill="white" font-size="1.6" font-weight="700" font-family="Arial">${esc(ann.label)}</text>`;
  }).join('\n');
}

function generateHtml(data: VistoriaData): string {
  let globalPhotoIdx = 0;
  const totalPhotos = data.rooms.reduce((s, r) => s + (r.photos?.length || 0), 0);
  const totalAnnotations = data.rooms.reduce((s, r) => s + (r.photos?.reduce((s2, p) => s2 + (p.annotations?.length || 0), 0) || 0), 0);

  // Calculate pages for sumário
  // Page 1: Cover
  // Page 2: Criteria + Info
  // Page 3: Sumário
  // Pages 4+: Rooms (each room gets at least 1 page for items, + pages for photos)
  const wmText = typeof data.watermark?.text === 'string' && data.watermark.text ? esc(String(data.watermark.text).slice(0, 60)) : '';
  const wmImg = typeof data.watermark?.image === 'string' && isSafeImageSrc(data.watermark.image) && data.watermark.image.length < 400_000 ? data.watermark.image : '';
  const wmHtml = (wmImg ? `<img class="wm-img" src="${wmImg}" alt="" />` : '') + (wmText ? `<div class="wm">${wmText}</div>` : '');
  let pageNum = 4; // Start after cover, criteria, sumário
  const roomPages: { name: string; startPage: number; photoCount: number }[] = [];

  data.rooms.forEach((room) => {
    const startPage = pageNum;
    // Items page
    pageNum++;
    // Photos: 2 per page for annotated, 4 per page for regular
    const photos = room.photos || [];
    if (photos.length > 0) {
      const annotated = photos.filter(p => p.annotations && p.annotations.length > 0).length;
      const regular = photos.length - annotated;
      // Annotated photos: 2 per page, Regular: 4 per page
      const photoPages = Math.ceil(annotated / 2) + Math.ceil(regular / 4);
      pageNum += Math.max(1, photoPages);
    }
    roomPages.push({ name: room.name, startPage, photoCount: photos.length });
  });

  const considerationsPage = pageNum;
  const signaturesPage = pageNum + 1;

  // Build sumário with real page numbers
  const sumarioHtml = roomPages.map((rp, idx) =>
    `<tr><td class="sum-num">${idx + 1}</td><td class="sum-name">${esc(rp.name)}</td><td class="sum-info">${rp.photoCount} fotos</td><td class="sum-page">${rp.startPage}</td></tr>`
  ).join('\n');

  // Build rooms HTML with page breaks
  let roomsHtml = '';
  data.rooms.forEach((room, idx) => {
    const photosHtml = room.photos && room.photos.length > 0
      ? `<div class="photo-section"><div class="photo-section-title">Registro Fotográfico – ${esc(room.name)}</div><div class="photo-grid">${room.photos.map((photo) => {
          globalPhotoIdx++;
          const hasAnn = photo.annotations && photo.annotations.length > 0;
          return `<div class="photo-cell${hasAnn ? ' annotated' : ''}">
            <div class="photo-number">Foto ${globalPhotoIdx}</div>
            <img src="${safeSrc(photo.dataUrl)}" class="photo-img" />
            ${wmHtml}
            ${hasAnn ? `<svg class="photo-overlay" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${buildAnnotationSvg(photo.annotations)}</svg>` : ''}
          </div>`;
        }).join('\n')}</div></div>`
      : '';

    const problemsHtml = room.problems && room.problems.length > 0
      ? `<div class="problems-box"><h4>⚠ Problemas Identificados</h4><ul>${room.problems.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`
      : '';

    const furnitureHtml = room.furniture && room.furniture.length > 0
      ? `<div class="inv-box"><h4>Móveis e Equipamentos</h4><div class="chips">${room.furniture.map(f => `<span class="chip">${esc(f)}</span>`).join('')}</div></div>`
      : '';

    const damagesHtml = room.damages && room.damages.length > 0
      ? `<div class="problems-box"><h4>Avarias Registradas</h4><ul>${room.damages.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>`
      : '';

    const clEntries = Object.entries(room.checklist || {}).filter(([, v]) => CL_LABEL[v]);
    const checklistHtml = clEntries.length > 0
      ? `<div class="inv-box"><h4>Estado de Conservação</h4><table class="cl-table">${clEntries.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="cl-${esc(v)}">${esc(CL_LABEL[v])}</td></tr>`).join('')}</table></div>`
      : '';

    const obsHtml = room.observations
      ? `<div class="room-obs"><h4>📋 Observações</h4><p>${esc(room.observations)}</p></div>`
      : '';

    roomsHtml += `
    <div class="room-section">
      <div class="room-header">
        <span class="room-num">${idx + 1}</span>
        <h2>${esc(room.name)}</h2>
      </div>
      <ul class="items">${(room.items || []).map(item => `<li>${esc(item)}</li>`).join('\n')}</ul>
      ${furnitureHtml}
      ${checklistHtml}
      ${damagesHtml}
      ${problemsHtml}
      ${obsHtml}
      ${photosHtml}
    </div>`;
  });

  const emailContestacao = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(data.emailContestacao || '') ? data.emailContestacao! : '';
  const empresa = esc(typeof data.empresaNome === 'string' && data.empresaNome.trim() ? data.empresaNome.trim().slice(0, 80) : 'imobWeb');
  const andarText = data.andar ? `\nAndar: ${esc(data.andar)}` : '';
  const conjText = data.conjApto ? `\nConjunto: ${esc(data.conjApto)}` : '';
  const aptoText = data.apto ? `\nApartamento: ${esc(data.apto)}` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 18mm 15mm 20mm 15mm; }
  @page :first { margin-top: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 10pt; line-height: 1.5; color: #1a1a1a; }

  /* COVER */
  .cover { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; position: relative; }
  .cover::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #0b5bd3, #667eea, #8b5cf6); }
  .cover-title { font-size: 28pt; font-weight: 900; color: #0F172A; letter-spacing: -1px; line-height: 1.1; }
  .cover-highlight { display: block; background: linear-gradient(135deg, #0b5bd3, #667eea); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32pt; margin-top: 8px; }
  .cover-sub { font-size: 12pt; color: #64748b; margin-top: 10px; }
  .cover-line { width: 70px; height: 3px; background: linear-gradient(90deg, #0b5bd3, #8b5cf6); border-radius: 2px; margin: 25px auto; }
  .cover-info { font-size: 10pt; color: #475569; margin-bottom: 5px; }
  .cover-info strong { color: #0F172A; }
  .cover-date { font-size: 9pt; color: #94a3b8; margin-top: 35px; font-style: italic; }
  .cover-footer { position: absolute; bottom: 25px; font-size: 7.5pt; color: #94a3b8; }

  /* CRITERIA */
  .criteria-page { page-break-after: always; }
  .sec-title { font-size: 11pt; font-weight: 800; color: #0F172A; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
  .criteria-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 16px; }
  .crit { padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #0b5bd3; }
  .crit.warn { border-left-color: #dc2626; background: #fef2f2; }
  .crit-label { font-size: 7.5pt; font-weight: 700; color: #0b5bd3; text-transform: uppercase; letter-spacing: 0.5px; }
  .crit.warn .crit-label { color: #dc2626; }
  .crit-desc { font-size: 8.5pt; color: #475569; margin-top: 1px; }

  .legal-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin: 12px 0; }
  .legal-text { font-size: 8.5pt; color: #475569; line-height: 1.6; text-align: justify; margin-bottom: 6px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
  .info-card { padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #0b5bd3; }
  .info-label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700; }
  .info-value { font-size: 9.5pt; color: #0F172A; font-weight: 600; margin-top: 1px; }

  .summary-box { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0; }
  .stat-box { padding: 8px 14px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; text-align: center; min-width: 80px; }
  .stat-num { font-size: 16pt; font-weight: 900; color: #0b5bd3; }
  .stat-label { font-size: 6.5pt; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }

  /* SUMARIO */
  .sumario { page-break-after: always; }
  .sumario h2 { font-size: 12pt; font-weight: 800; color: #0F172A; margin-bottom: 12px; }
  .sumario table { width: 100%; border-collapse: collapse; }
  .sumario th { text-align: left; padding: 7px 10px; border-bottom: 2px solid #0b5bd3; font-size: 7.5pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .sumario td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 9.5pt; }
  .sum-num { font-weight: 800; color: #0b5bd3; width: 25px; }
  .sum-name { font-weight: 600; color: #0F172A; }
  .sum-info { color: #94a3b8; font-size: 8.5pt; }
  .sum-page { text-align: right; font-weight: 700; color: #0b5bd3; font-size: 9pt; }

  /* ROOMS */
  .rooms-heading { font-size: 11pt; font-weight: 800; color: #0F172A; border-bottom: 3px solid #0b5bd3; padding-bottom: 6px; margin-bottom: 16px; }
  .room-section { margin-bottom: 24px; page-break-before: always; }
  .room-section:first-of-type { page-break-before: auto; }
  .room-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
  .room-num { width: 24px; height: 24px; background: linear-gradient(135deg, #0b5bd3, #667eea); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10pt; }
  .room-section h2 { font-size: 11pt; color: #0F172A; font-weight: 700; }
  .items { list-style: none; padding: 0; margin-bottom: 10px; }
  .items li { padding: 3px 0; border-bottom: 1px solid #f1f5f9; font-size: 9pt; line-height: 1.4; color: #1e293b; }
  .items li::before { content: "✓"; color: #10b981; font-weight: bold; margin-right: 5px; }

  .problems-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 12px; margin: 10px 0; }
  .problems-box h4 { font-size: 8.5pt; color: #991b1b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .problems-box ul { list-style: none; padding: 0; }
  .problems-box li { font-size: 8.5pt; color: #7f1d1d; padding: 1px 0; }
  .problems-box li::before { content: "⚠ "; }

  .inv-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; margin: 10px 0; background: #f8fafc; }
  .inv-box h4 { font-size: 8.5pt; color: #334155; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .chip { font-size: 8pt; padding: 2px 8px; border-radius: 99px; background: #e2e8f0; color: #334155; }
  .cl-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  .cl-table td { border-bottom: 1px solid #e2e8f0; padding: 3px 4px; }
  .cl-table td:last-child { text-align: right; font-weight: 700; width: 70px; }
  .cl-ok { color: #15803d; } .cl-regular { color: #b45309; } .cl-ruim { color: #b91c1c; } .cl-na { color: #64748b; }
  .sig-img { display: block; margin: 0 auto -34px; height: 56px; max-width: 240px; object-fit: contain; position: relative; }
  .photo-cell { position: relative; }
  .wm { position: absolute; right: 6px; bottom: 6px; font: 700 7pt Arial, sans-serif; color: rgba(255,255,255,.88); text-shadow: 0 0 3px rgba(0,0,0,.85); pointer-events: none; }
  .wm-img { position: absolute; right: 6px; bottom: 6px; height: 26px; width: auto; opacity: .75; pointer-events: none; }
  .sig-flat { margin: 0 auto 4px; }
  .room-obs { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px 12px; margin: 10px 0; }
  .room-obs h4 { font-size: 8.5pt; color: #0369a1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .room-obs p { font-size: 8.5pt; color: #1e40af; line-height: 1.5; }

  /* PHOTOS */
  .photo-section { margin: 12px 0; }
  .photo-section-title { font-size: 8pt; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px dashed #e2e8f0; }
  .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; page-break-inside: auto; }
  .photo-cell { position: relative; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; page-break-inside: avoid; }
  .photo-cell.annotated { border: 2px solid #dc2626; }
  .photo-img { width: 100%; height: auto; display: block; }
  .photo-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
  .photo-number { position: absolute; top: 4px; left: 4px; background: rgba(0,0,0,0.7); color: white; font-size: 6.5pt; font-weight: 700; padding: 1px 5px; border-radius: 3px; z-index: 5; }

  /* CONSIDERATIONS */
  .considerations { page-break-before: always; }
  .extras { margin-bottom: 18px; }
  .ex-h { font-size: 10.5pt; font-weight: 800; color: #0F172A; margin: 14px 0 6px; }
  .ex-t { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 6px; }
  .ex-t th, .ex-t td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; vertical-align: top; }
  .ex-t th { background: #f1f5f9; }
  .ex-t small { color: #64748b; }
  .ex-n { font-size: 8pt; color: #64748b; text-align: left !important; }
  .considerations h2 { font-size: 12pt; font-weight: 800; color: #0F172A; border-bottom: 3px solid #0b5bd3; padding-bottom: 6px; margin-bottom: 12px; }
  .considerations p { font-size: 9.5pt; line-height: 1.7; color: #1e293b; text-align: justify; margin-bottom: 8px; }

  .dispute-box { margin-top: 16px; padding: 12px 14px; background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; }
  .dispute-box h3 { font-size: 10pt; color: #92400e; font-weight: 800; margin-bottom: 6px; }
  .dispute-box ol { margin-left: 14px; font-size: 8.5pt; color: #78350f; }
  .dispute-box li { margin-bottom: 3px; line-height: 1.4; }

  .contest-email { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px 14px; margin-top: 12px; font-size: 8.5pt; color: #0369a1; }

  /* SIGNATURES */
  .signatures { page-break-before: always; padding-top: 15px; }
  .signatures > p { font-size: 9.5pt; color: #475569; margin-bottom: 8px; line-height: 1.6; text-align: justify; }
  .sig-date { font-size: 9.5pt; color: #475569; margin-top: 20px; margin-bottom: 8px; }
  .sig-block { margin-top: 40px; text-align: center; }
  .sig-line { width: 260px; border-top: 1px solid #94a3b8; margin: 0 auto 6px; padding-top: 6px; }
  .sig-name { font-size: 10pt; font-weight: 700; color: #0F172A; }
  .sig-role { font-size: 7.5pt; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

  .vist-note { margin-top: 40px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center; }
  .vist-note p { font-size: 8.5pt; color: #64748b; }
  .vist-note strong { color: #0F172A; }
  .final-stamp { margin-top: 20px; text-align: center; font-size: 7.5pt; color: #94a3b8; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-title">Termo de vistoria<span class="cover-highlight">${esc(TIPO_LABEL[data.tipoVistoria || 'ENTRADA'] || 'de entrada')}</span></div>
  <div class="cover-sub">para fins locatícios</div>
  <div class="cover-line"></div>
  <div class="cover-info"><strong>VISTORIADORA:</strong> ${esc(data.vistoriadora)}</div>
  <div class="cover-info"><strong>FOTOGRAFADO EM:</strong> ${esc(data.dataFotografia)}</div>
  <div class="cover-date">${formatDateLong(data.dataLaudo)}</div>
  <div class="cover-footer">${empresa} · Laudo de Vistoria</div>
</div>

<!-- CRITERIA + INFO -->
<div class="criteria-page">
  <div class="sec-title">Critérios de avaliação do estado de conservação do imóvel</div>
  <div class="criteria-grid">
    <div class="crit"><div class="crit-label">Novo estado</div><div class="crit-desc">Primeiro uso</div></div>
    <div class="crit"><div class="crit-label">Ótimo estado</div><div class="crit-desc">Semi novo, sem avarias</div></div>
    <div class="crit"><div class="crit-label">Bom estado</div><div class="crit-desc">Com uso, leves manchas, riscos</div></div>
    <div class="crit"><div class="crit-label">Estado regular</div><div class="crit-desc">Gotejamento, trincas, manchas</div></div>
    <div class="crit warn" style="grid-column:span 2"><div class="crit-label">Estado ruim</div><div class="crit-desc">Infiltração, rachaduras, pragas</div></div>
  </div>

  <div class="sec-title">Termo de vistoria ${esc(TIPO_LABEL[data.tipoVistoria || 'ENTRADA'] || 'de entrada')}</div>
  <div class="legal-box">
    <p class="legal-text">O presente anexo faz parte integrante do "Contrato de Locação" do imóvel CONDOMÍNIO ${esc(data.condominio)} situado na ${esc(data.endereco)} nº ${esc(data.numero)}${conjText}${aptoText}${andarText} - CEP: ${esc(data.cep)} – ${esc(data.bairro)} – ${esc(data.cidade)}/${esc(data.estado)}, datado de ${formatDateLong(data.dataLaudo)}, tendo como partes:</p>
    <p class="legal-text"><strong>LOCADORA:</strong> ${esc(data.locadora)}, CPF/CNPJ nº ${esc(data.locadoraCpf)}${data.locadoraTelefone ? ` · Tel: ${esc(data.locadoraTelefone)}` : ''};</p>
    <p class="legal-text"><strong>LOCATÁRIO(A):</strong> ${esc(data.locatario)}, CPF/CNPJ nº ${esc(data.locatarioCpf)}${data.locatarioTelefone ? ` · Tel: ${esc(data.locatarioTelefone)}` : ''}.</p>
    <p class="legal-text">Este laudo tem por objetivo retratar o estado de conservação do imóvel na data da vistoria, em atendimento ao art. 2, inciso V e art. 23, inciso III da Lei nº 8.245/91.</p>
  </div>

  <div class="info-grid">
    <div class="info-card"><div class="info-label">Tipo</div><div class="info-value">${esc(data.tipoImovel)}</div></div>
    <div class="info-card"><div class="info-label">Finalidade</div><div class="info-value">${esc(data.finalidade)}</div></div>
    <div class="info-card"><div class="info-label">Metragem</div><div class="info-value">${esc(data.metragem || 'Não informada')}</div></div>
    <div class="info-card"><div class="info-label">Mobiliado</div><div class="info-value">${esc(data.mobiliado)}</div></div>
    ${data.andar ? `<div class="info-card"><div class="info-label">Andar</div><div class="info-value">${esc(data.andar)}</div></div>` : ''}
    ${data.conjApto ? `<div class="info-card"><div class="info-label">Conjunto</div><div class="info-value">${esc(data.conjApto)}</div></div>` : ''}
    ${data.apto ? `<div class="info-card"><div class="info-label">Apto</div><div class="info-value">${esc(data.apto)}</div></div>` : ''}
    <div class="info-card"><div class="info-label">Solicitante</div><div class="info-value">${esc(data.solicitante)}</div></div>
    <div class="info-card"><div class="info-label">Fotos</div><div class="info-value">${totalPhotos}</div></div>
    <div class="info-card"><div class="info-label">Data Vistoria</div><div class="info-value">${formatDateLong(data.dataLaudo)}</div></div>
    <div class="info-card"><div class="info-label">Data Fotos</div><div class="info-value">${esc(data.dataFotografia)}</div></div>
  </div>

  <div class="summary-box">
    <div class="stat-box"><div class="stat-num">${data.rooms.length}</div><div class="stat-label">Cômodos</div></div>
    <div class="stat-box"><div class="stat-num">${totalPhotos}</div><div class="stat-label">Fotos</div></div>
    ${totalAnnotations > 0 ? `<div class="stat-box"><div class="stat-num">${totalAnnotations}</div><div class="stat-label">Anotações</div></div>` : ''}
  </div>
</div>

<!-- SUMÁRIO -->
<div class="sumario">
  <h2>Sumário</h2>
  <table>
    <thead><tr><th>#</th><th>Cômodo</th><th>Conteúdo</th><th style="text-align:right">Pág.</th></tr></thead>
    <tbody>
      ${sumarioHtml}
      <tr><td></td><td><strong>Considerações Finais</strong></td><td></td><td class="sum-page">${considerationsPage}</td></tr>
      <tr><td></td><td><strong>Assinaturas</strong></td><td></td><td class="sum-page">${signaturesPage}</td></tr>
    </tbody>
  </table>
</div>

<!-- ROOMS -->
<div class="rooms-heading">INDICAÇÃO DO ESTADO DO IMÓVEL, ACESSÓRIOS, SUAS PARTES E COMPONENTES</div>
${roomsHtml}

<!-- CONSIDERATIONS -->
<div class="considerations">
  ${buildExtrasHtml(data)}
  <h2>Considerações Finais</h2>
  <p>${esc(data.consideracoes).replace(/\n/g, '<br>') || 'Não foram registradas considerações adicionais.'}</p>
  <p>O LOCATÁRIO(A) se responsabiliza pela conservação do imóvel, comprometendo-se a restituí-lo à LOCADORA nas condições recebidas, exceto pelo desgaste natural.</p>
  <p>Em caso de modificações ou benfeitorias, deve ser informado e autorizado pela LOCADORA.</p>
  <p>As fotos poderão ser utilizadas como comprovação do real estado do imóvel.</p>
  <p><strong>LOCATÁRIO(A) e LOCADORA terão até 10 dias para contestar algum item da vistoria.</strong></p>

  <div class="dispute-box">
    <h3>📋 CONTESTAÇÃO</h3>
    <ol>
      <li>Verifique o prazo (10 dias corridos);</li>
      <li>Verifique se as divergências já estão identificadas no relatório;</li>
      <li>Caso não estejam, formalize via e-mail com descrição e fotos.</li>
    </ol>
  </div>
  ${emailContestacao ? `<div class="contest-email">📧 Caso haja divergência, enviar para: <strong>${esc(emailContestacao)}</strong></div>` : ''}
</div>

<!-- SIGNATURES -->
<div class="signatures">
  <p>E, assim, LOCADORA e LOCATÁRIO(A) declaram terem vistoriado o imóvel, firmando o presente instrumento para todos os fins de direito.</p>
  <p class="sig-date">${data.cidade ? esc(data.cidade) + ', ' : ''}${formatDateLong(data.dataLaudo)}.</p>
  <div class="sig-block">${sigImg(data.signatures?.locadora)}<div class="sig-line"></div><div class="sig-name">${esc(data.locadora)}</div><div class="sig-role">LOCADORA</div></div>
  <div class="sig-block" style="margin-top:50px">${sigImg(data.signatures?.locatario)}<div class="sig-line"></div><div class="sig-name">${esc(data.locatario)}</div><div class="sig-role">LOCATÁRIO(A)</div></div>
  <div class="vist-note">${sigImg(data.signatures?.vistoriadora).replace('class="sig-img"', 'class="sig-img sig-flat"')}<p>Laudo elaborado por <strong>${esc(data.vistoriadora)}</strong></p><p>${formatDateLong(data.dataLaudo)}</p></div>
  <div class="final-stamp"><p>${data.solicitante ? `Solicitante: ${esc(data.solicitante)}` : ''}</p></div>
</div>

</body>
</html>`;
}

export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;
  try {
    const data: VistoriaData = await request.json();
    if (!data || !Array.isArray(data.rooms) || data.rooms.length === 0 || !(data.condominio || data.endereco)) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 });
    }
    if (data.rooms.length > 60) {
      return NextResponse.json({ success: false, error: 'Cômodos demais para um único laudo' }, { status: 400 });
    }
    // normaliza campos de texto ausentes para não imprimir "undefined"
    for (const k of Object.keys(data) as (keyof VistoriaData)[]) {
      if (k !== 'rooms' && data[k] == null) (data as unknown as Record<string, unknown>)[k] = '';
    }
    for (const r of data.rooms) {
      r.photos = (r.photos || []).filter((p) => isSafeImageSrc(p?.dataUrl));
      r.items = r.items || [];
      r.furniture = Array.isArray(r.furniture) ? r.furniture.map(String) : [];
      r.damages = Array.isArray(r.damages) ? r.damages.map(String) : [];
      r.problems = Array.isArray(r.problems) ? r.problems.map(String) : [];
      if (!r.checklist || typeof r.checklist !== 'object') r.checklist = {};
    }
    if (!data.signatures || typeof data.signatures !== 'object') data.signatures = {};
    ASSET_ORIGIN = request.nextUrl.origin;
    const html = generateHtml(data);
    return NextResponse.json({ success: true, html });
  } catch (error) {
    console.error('PDF error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}
