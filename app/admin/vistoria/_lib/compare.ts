import type { ChecklistState, RoomData, SavedLaudo } from './types';
import { CHECKLIST_ITEMS } from './constants';

const RANK: Record<ChecklistState, number> = { ok: 0, regular: 1, ruim: 2, na: -1 };
const LABEL: Record<ChecklistState, string> = { ok: 'Bom', regular: 'Regular', ruim: 'Ruim', na: 'N/A' };

export const normalizeName = (s: string) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim().toLowerCase();

export interface ChecklistChange {
  item: string;
  before?: ChecklistState;
  after?: ChecklistState;
  worsened: boolean;
  improved: boolean;
}

export interface RoomComparison {
  name: string;
  entrada?: RoomData;
  saida?: RoomData;
  /** avarias que existem na saída e não existiam na entrada */
  newDamages: string[];
  resolvedDamages: string[];
  /** móveis/equipamentos da entrada que não constam na saída */
  missingFurniture: string[];
  newFurniture: string[];
  checklist: ChecklistChange[];
  worsened: number;
  status: 'sem-alteracao' | 'alterado' | 'piorou' | 'sem-saida' | 'novo';
}

export interface AiDiff { type: string; description: string; severity: string; confidence: number }
export interface AiCompare {
  rooms: Record<string, { summary: string; differences: AiDiff[] }>;
  summary?: string;
  attention?: string[];
}

export const AI_DIFF_LABEL: Record<string, string> = {
  dano_novo: 'Dano novo', item_ausente: 'Item ausente', piora: 'Piora', melhoria: 'Melhoria', desgaste_normal: 'Desgaste normal', sem_alteracao: 'Sem alteração',
};

export interface Comparison {
  rooms: RoomComparison[];
  totals: { newDamages: number; worsened: number; missingFurniture: number; roomsWithIssues: number; roomsMissingExit: number };
}

const diff = (a: string[], b: string[]) => {
  const nb = new Set(b.map(normalizeName));
  return a.filter((x) => !nb.has(normalizeName(x)));
};

export function compareLaudos(entrada: SavedLaudo, saida: SavedLaudo): Comparison {
  const map = new Map<string, { name: string; e?: RoomData; s?: RoomData }>();
  for (const r of entrada.rooms) map.set(normalizeName(r.name), { name: r.name, e: r });
  for (const r of saida.rooms) {
    const k = normalizeName(r.name);
    const cur = map.get(k);
    if (cur) cur.s = r; else map.set(k, { name: r.name, s: r });
  }

  const rooms: RoomComparison[] = [...map.values()].map(({ name, e, s }) => {
    const newDamages = s ? diff(s.damages || [], e?.damages || []) : [];
    const resolvedDamages = e && s ? diff(e.damages || [], s.damages || []) : [];
    const missingFurniture = e && s ? diff(e.furniture || [], s.furniture || []) : [];
    const newFurniture = e && s ? diff(s.furniture || [], e.furniture || []) : [];
    const checklist: ChecklistChange[] = [];
    if (e && s) {
      for (const item of CHECKLIST_ITEMS) {
        const before = e.checklist?.[item];
        const after = s.checklist?.[item];
        if (!before && !after) continue;
        const worsened = !!before && !!after && RANK[before] >= 0 && RANK[after] > RANK[before];
        const improved = !!before && !!after && RANK[before] >= 0 && RANK[after] >= 0 && RANK[after] < RANK[before];
        if (before !== after) checklist.push({ item, before, after, worsened, improved });
      }
    }
    const worsenedCount = checklist.filter((c) => c.worsened).length;
    let status: RoomComparison['status'] = 'sem-alteracao';
    if (!s) status = 'sem-saida';
    else if (!e) status = 'novo';
    else if (newDamages.length || worsenedCount || missingFurniture.length) status = 'piorou';
    else if (resolvedDamages.length || newFurniture.length || checklist.length) status = 'alterado';
    return { name, entrada: e, saida: s, newDamages, resolvedDamages, missingFurniture, newFurniture, checklist, worsened: worsenedCount, status };
  });

  return {
    rooms,
    totals: {
      newDamages: rooms.reduce((n, r) => n + r.newDamages.length, 0),
      worsened: rooms.reduce((n, r) => n + r.worsened, 0),
      missingFurniture: rooms.reduce((n, r) => n + r.missingFurniture.length, 0),
      roomsWithIssues: rooms.filter((r) => r.status === 'piorou').length,
      roomsMissingExit: rooms.filter((r) => r.status === 'sem-saida').length,
    },
  };
}

export const stateLabel = (s?: ChecklistState) => (s ? LABEL[s] : '—');

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const safeImg = (src: string) => (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src) ? src : '');

const STATUS_TXT: Record<RoomComparison['status'], string> = {
  'sem-alteracao': 'Sem alterações', alterado: 'Alterações menores', piorou: 'Deterioração identificada', 'sem-saida': 'Sem registro de saída', novo: 'Cômodo novo na saída',
};

/** Relatório HTML autocontido (imprimir → PDF). Todo texto é escapado. */
export function buildCompareHtml(entrada: SavedLaudo, saida: SavedLaudo, cmp: Comparison, ai?: AiCompare | null): string {
  const aiRoom = (name: string) => {
    const a = ai?.rooms[name];
    if (!a || (!a.summary && !a.differences.length)) return '';
    return `<div class="box ai"><b>Análise por IA</b>${a.summary ? `<p>${esc(a.summary)}</p>` : ''}${a.differences.length ? `<ul>${a.differences.map((d) => `<li><b>${esc(AI_DIFF_LABEL[d.type] || d.type)}</b> (${esc(d.severity)}, confiança ${Math.round(d.confidence * 100)}%): ${esc(d.description)}</li>`).join('')}</ul>` : ''}</div>`;
  };
  const aiSummary = ai?.summary ? `<div class="box ai"><b>Resumo da análise por IA</b><p>${esc(ai.summary)}</p>${ai.attention?.length ? `<ul>${ai.attention.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}<p style="font-size:11px;color:#64748b">Conteúdo gerado por IA; confira as fotos antes de qualquer conclusão.</p></div>` : '';
  const photos = (r?: RoomData) => (r?.photos || []).filter((p) => safeImg(p.dataUrl)).slice(0, 4)
    .map((p) => `<img src="${safeImg(p.dataUrl)}" alt="">`).join('');
  const list = (title: string, items: string[], cls: string) =>
    items.length ? `<div class="box ${cls}"><b>${esc(title)}</b><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>` : '';
  const rows = cmp.rooms.map((r) => `
  <section class="room">
    <h2>${esc(r.name)} <span class="st st-${r.status}">${esc(STATUS_TXT[r.status])}</span></h2>
    <div class="cols">
      <div><h3>Entrada</h3><div class="ph">${photos(r.entrada) || '<i>sem fotos</i>'}</div></div>
      <div><h3>Saída</h3><div class="ph">${photos(r.saida) || '<i>sem fotos</i>'}</div></div>
    </div>
    ${list('Novas avarias na saída', r.newDamages, 'bad')}
    ${list('Móveis/equipamentos da entrada não encontrados na saída', r.missingFurniture, 'bad')}
    ${list('Avarias resolvidas', r.resolvedDamages, 'good')}
    ${r.checklist.length ? `<table><tr><th>Elemento</th><th>Entrada</th><th>Saída</th></tr>${r.checklist.map((c) => `<tr class="${c.worsened ? 'w' : c.improved ? 'i' : ''}"><td>${esc(c.item)}</td><td>${esc(stateLabel(c.before))}</td><td>${esc(stateLabel(c.after))}</td></tr>`).join('')}</table>` : ''}
    ${aiRoom(r.name)}
    ${r.saida?.observations ? `<p class="obs"><b>Obs. da saída:</b> ${esc(r.saida.observations)}</p>` : ''}
  </section>`).join('');
  const i = entrada.propertyInfo;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Comparativo entrada x saída</title>
<style>
body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:24px;max-width:960px;margin:auto}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:0 0 8px;display:flex;justify-content:space-between;gap:8px}h3{font-size:12px;text-transform:uppercase;color:#64748b;margin:0 0 4px}
.sub{color:#64748b;font-size:12px;margin-bottom:16px}.kpis{display:flex;gap:8px;margin:12px 0 20px;flex-wrap:wrap}.kpi{border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;min-width:120px}.kpi b{display:block;font-size:22px}
.room{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:14px;break-inside:avoid}.cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ph{display:grid;grid-template-columns:1fr 1fr;gap:4px}.ph img{width:100%;height:110px;object-fit:cover;border-radius:6px}.ph i{color:#94a3b8;font-size:12px}
.box{border-radius:8px;padding:8px 12px;margin-top:8px;font-size:13px}.box ul{margin:4px 0 0;padding-left:18px}.bad{background:#fef2f2;border:1px solid #fecaca}.good{background:#f0fdf4;border:1px solid #bbf7d0}
table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}th,td{border:1px solid #e2e8f0;padding:5px 8px;text-align:left}tr.w td{background:#fef2f2}tr.i td{background:#f0fdf4}
.st{font-size:11px;font-weight:700;padding:3px 8px;border-radius:99px;background:#f1f5f9}.st-piorou{background:#fee2e2;color:#991b1b}.st-alterado{background:#fef3c7;color:#92400e}.st-sem-alteracao{background:#dcfce7;color:#166534}
.ai{background:#eef2ff;border:1px solid #c7d2fe}.ai p{margin:4px 0}.obs{font-size:12px;color:#475569}@media print{body{padding:0}.room{page-break-inside:avoid}}
</style></head><body>
<h1>Comparativo de vistorias — Entrada x Saída</h1>
<div class="sub">${esc(entrada.name)} · ${esc(i?.endereco)} ${esc(i?.numero)} ${esc(i?.conjApto)} · ${esc(i?.bairro)}, ${esc(i?.cidade)}/${esc(i?.estado)}<br>Entrada: ${esc(entrada.propertyInfo.dataLaudo)} · Saída: ${esc(saida.propertyInfo.dataLaudo)} · Locatário(a): ${esc(i?.locatario)}</div>
<div class="kpis">
<div class="kpi"><b>${cmp.totals.newDamages}</b>novas avarias</div>
<div class="kpi"><b>${cmp.totals.worsened}</b>itens que pioraram</div>
<div class="kpi"><b>${cmp.totals.missingFurniture}</b>itens não encontrados</div>
<div class="kpi"><b>${cmp.totals.roomsWithIssues}</b>cômodos com deterioração</div>
</div>${aiSummary}${rows}
<p style="font-size:11px;color:#94a3b8;margin-top:24px">Gerado por imobWeb Vistoria. Este comparativo é auxiliar e não substitui a análise dos laudos originais.</p>
</body></html>`;
}
