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
  rooms: { name: string; items: string[]; photos: PhotoData[]; problems?: string[] }[];
  consideracoes: string;
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

function buildPhotoHtml(photo: PhotoData, globalIdx: number): string {
  const hasAnnotations = photo.annotations && photo.annotations.length > 0;
  const svgW = 600; const svgH = 450;
  let svgContent = '';
  if (hasAnnotations) {
    const sorted = [...photo.annotations].sort((a, b) => a.y - b.y || a.x - b.x);
    svgContent = sorted.map((ann, i) => {
      const cx = (ann.x / 100) * svgW; const cy = (ann.y / 100) * svgH;
      const goRight = ann.x < 55;
      const lineEndX = goRight ? svgW - 15 : 15;
      const elbowX = goRight ? Math.min(cx + 50, lineEndX - 30) : Math.max(cx - 50, lineEndX + 30);
      const labelX = goRight ? lineEndX + 5 : lineEndX - 5;
      const labelW = ann.label.length * 5.2 + 14;
      return `
        <circle cx="${cx}" cy="${cy}" r="16" fill="#dc2626" stroke="white" stroke-width="3" />
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="white" font-size="11" font-weight="800" font-family="Arial">${i + 1}</text>
        <line x1="${cx}" y1="${cy}" x2="${elbowX}" y2="${cy}" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,3" />
        <line x1="${elbowX}" y1="${cy}" x2="${lineEndX}" y2="${cy}" stroke="#dc2626" stroke-width="2" />
        <circle cx="${lineEndX}" cy="${cy}" r="4" fill="#dc2626" />
        <rect x="${goRight ? labelX : labelX - labelW}" y="${cy - 13}" width="${labelW}" height="26" rx="5" fill="#1e293b" stroke="#dc2626" stroke-width="0.8" />
        <text x="${goRight ? labelX + 4 : labelX - 4}" y="${cy + 4}" text-anchor="${goRight ? 'start' : 'end'}" fill="white" font-size="9.5" font-weight="700" font-family="Arial">${ann.label}</text>`;
    }).join('\n');
  }
  return `
    <div class="photo-cell${hasAnnotations ? ' annotated' : ''}">
      <div class="photo-number">Foto ${globalIdx}</div>
      <img src="${photo.dataUrl}" class="photo-img" />
      ${hasAnnotations ? `<svg class="photo-svg" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet">${svgContent}</svg>` : ''}
    </div>`;
}

function generateHtml(data: VistoriaData): string {
  let globalPhotoIdx = 0;
  const totalPhotos = data.rooms.reduce((s, r) => s + (r.photos?.length || 0), 0);
  const totalAnnotations = data.rooms.reduce((s, r) => s + (r.photos?.reduce((s2, p) => s2 + (p.annotations?.length || 0), 0) || 0), 0);

  const roomsHtml = data.rooms.map((room, idx) => {
    const photosHtml = room.photos && room.photos.length > 0
      ? `<div class="photo-grid">${room.photos.map((photo) => { globalPhotoIdx++; return buildPhotoHtml(photo, globalPhotoIdx); }).join('\n')}</div>`
      : '';
    const problemsHtml = room.problems && room.problems.length > 0
      ? `<div class="problems-box"><h4>Problemas Identificados</h4><ul>${room.problems.map(p => `<li>${p}</li>`).join('')}</ul></div>`
      : '';
    return `
    <div class="room-section">
      <div class="room-header">
        <span class="room-number">${idx + 1}</span>
        <h2>${room.name}</h2>
      </div>
      <ul class="items">${(room.items || []).map(item => `<li>${item}</li>`).join('\n')}</ul>
      ${problemsHtml}
      ${photosHtml}
    </div>`;
  }).join('\n');

  const sumarioHtml = data.rooms.map((room, idx) =>
    `<tr><td class="sum-num">${idx + 1}</td><td class="sum-name">${room.name}</td><td class="sum-photos">${room.photos?.length || 0} fotos</td></tr>`
  ).join('\n');

  const emailContestacao = data.emailContestacao || 'contato@imobweb.com.br';
  const andarText = data.andar ? `\nAndar: ${data.andar}` : '';
  const conjText = data.conjApto ? `\nConjunto: ${data.conjApto}` : '';
  const aptoText = data.apto ? `\nApartamento: ${data.apto}` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 18mm 15mm 20mm 15mm; }
  @page :first { margin-top: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 10pt; line-height: 1.55; color: #1a1a1a; }

  /* COVER */
  .cover { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; page-break-after: always; position: relative; }
  .cover::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #0b5bd3, #667eea, #8b5cf6); }
  .cover-title { font-size: 30pt; font-weight: 900; color: #0F172A; letter-spacing: -1px; line-height: 1.1; }
  .cover-highlight { display: block; background: linear-gradient(135deg, #0b5bd3, #667eea); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 34pt; margin-top: 8px; }
  .cover-subtitle { font-size: 13pt; color: #64748b; margin-top: 12px; font-weight: 400; }
  .cover-line { width: 80px; height: 3px; background: linear-gradient(90deg, #0b5bd3, #8b5cf6); border-radius: 2px; margin: 30px auto; }
  .cover-info { font-size: 11pt; color: #475569; margin-bottom: 6px; }
  .cover-info strong { color: #0F172A; }
  .cover-date { font-size: 10pt; color: #94a3b8; margin-top: 40px; font-style: italic; }
  .cover-footer { position: absolute; bottom: 30px; font-size: 8pt; color: #94a3b8; }

  /* CRITERIA */
  .criteria-page { page-break-after: always; }
  .criteria-title { font-size: 11pt; font-weight: 800; color: #0F172A; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
  .criteria-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
  .criteria-item { padding: 10px 14px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #0b5bd3; }
  .criteria-item.warn { border-left-color: #dc2626; background: #fef2f2; }
  .criteria-label { font-size: 8pt; font-weight: 700; color: #0b5bd3; text-transform: uppercase; letter-spacing: 0.5px; }
  .criteria-item.warn .criteria-label { color: #dc2626; }
  .criteria-desc { font-size: 9pt; color: #475569; margin-top: 2px; }

  .legal-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 14px 0; }
  .legal-text { font-size: 9pt; color: #475569; line-height: 1.7; text-align: justify; margin-bottom: 8px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
  .info-card { padding: 10px 14px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #0b5bd3; }
  .info-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700; }
  .info-value { font-size: 10pt; color: #0F172A; font-weight: 600; margin-top: 1px; }

  .summary-box { display: flex; gap: 12px; flex-wrap: wrap; margin: 14px 0; }
  .summary-stat { padding: 10px 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; text-align: center; min-width: 90px; }
  .summary-stat .num { font-size: 18pt; font-weight: 900; color: #0b5bd3; }
  .summary-stat .label { font-size: 7pt; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }

  .section-title { font-size: 12pt; font-weight: 800; color: #0F172A; border-bottom: 3px solid #0b5bd3; padding-bottom: 8px; margin-bottom: 14px; }

  /* SUMARIO */
  .sumario-page { page-break-after: always; }
  .sumario-title { font-size: 13pt; font-weight: 800; color: #0F172A; margin-bottom: 14px; }
  .sumario-table { width: 100%; border-collapse: collapse; }
  .sumario-table th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #0b5bd3; font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .sumario-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 10pt; }
  .sum-num { font-weight: 800; color: #0b5bd3; width: 30px; }
  .sum-name { font-weight: 600; color: #0F172A; }
  .sum-photos { text-align: right; color: #94a3b8; font-size: 9pt; }

  /* ROOMS */
  .rooms-title { font-size: 12pt; font-weight: 800; color: #0F172A; border-bottom: 3px solid #0b5bd3; padding-bottom: 8px; margin-bottom: 18px; }
  .room-section { margin-bottom: 28px; page-break-inside: avoid; }
  .room-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
  .room-number { width: 28px; height: 28px; background: linear-gradient(135deg, #0b5bd3, #667eea); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11pt; }
  .room-section h2 { font-size: 12pt; color: #0F172A; font-weight: 700; }
  .items { list-style: none; padding: 0; margin-bottom: 12px; }
  .items li { padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-size: 9.5pt; line-height: 1.5; color: #1e293b; display: flex; gap: 6px; }
  .items li::before { content: "✓"; color: #10b981; font-weight: bold; flex-shrink: 0; }

  .problems-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 14px; margin: 12px 0; }
  .problems-box h4 { font-size: 9pt; color: #991b1b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .problems-box ul { list-style: none; padding: 0; }
  .problems-box li { font-size: 9pt; color: #7f1d1d; padding: 2px 0; }
  .problems-box li::before { content: "⚠ "; }

  /* PHOTOS */
  .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 12px 0; page-break-inside: auto; }
  .photo-cell { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; page-break-inside: avoid; }
  .photo-cell.annotated { border: 2px solid #dc2626; }
  .photo-img { width: 100%; height: auto; display: block; }
  .photo-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
  .photo-number { position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.7); color: white; font-size: 7pt; font-weight: 700; padding: 2px 6px; border-radius: 4px; z-index: 5; }

  /* CONSIDERATIONS */
  .considerations { page-break-before: always; }
  .considerations h2 { font-size: 13pt; font-weight: 800; color: #0F172A; border-bottom: 3px solid #0b5bd3; padding-bottom: 8px; margin-bottom: 14px; }
  .considerations-text { font-size: 10pt; line-height: 1.8; color: #1e293b; text-align: justify; }
  .considerations-text p { margin-bottom: 10px; }

  .dispute-box { margin-top: 20px; padding: 14px 16px; background: #fefce8; border: 1px solid #fde68a; border-radius: 10px; }
  .dispute-box h3 { font-size: 11pt; color: #92400e; font-weight: 800; margin-bottom: 8px; }
  .dispute-box ol { margin-left: 16px; font-size: 9pt; color: #78350f; }
  .dispute-box li { margin-bottom: 4px; line-height: 1.5; }

  .contest-email { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; margin-top: 14px; font-size: 9pt; color: #0369a1; }

  /* SIGNATURES */
  .signatures { page-break-before: always; padding-top: 20px; }
  .signatures > p { font-size: 10pt; color: #475569; margin-bottom: 10px; line-height: 1.7; text-align: justify; }
  .sig-date { font-size: 10pt; color: #475569; margin-top: 24px; margin-bottom: 10px; }
  .sig-block { margin-top: 45px; text-align: center; }
  .sig-line { width: 280px; border-top: 1px solid #94a3b8; margin: 0 auto 8px; padding-top: 8px; }
  .sig-name { font-size: 11pt; font-weight: 700; color: #0F172A; }
  .sig-role { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

  .vistoriadora-note { margin-top: 50px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
  .vistoriadora-note p { font-size: 9pt; color: #64748b; }
  .vistoriadora-note strong { color: #0F172A; }

  .final-stamp { margin-top: 30px; text-align: center; font-size: 8pt; color: #94a3b8; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-title">Termo de vistoria
    <span class="cover-highlight">de entrada</span>
  </div>
  <div class="cover-subtitle">para fins locatícios</div>
  <div class="cover-line"></div>
  <div class="cover-info"><strong>VISTORIADORA:</strong> ${data.vistoriadora}</div>
  <div class="cover-info"><strong>FOTOGRAFADO EM:</strong> ${data.dataFotografia}</div>
  <div class="cover-date">${formatDateLong(data.dataLaudo)}</div>
  <div class="cover-footer">imobWeb · Sistema de Gestão de Vistorias</div>
</div>

<!-- CRITERIA + INFO -->
<div class="criteria-page">
  <div class="criteria-title">Critérios de avaliação do estado de conservação do imóvel (Aspecto visual)</div>
  <div class="criteria-grid">
    <div class="criteria-item"><div class="criteria-label">Novo estado</div><div class="criteria-desc">Primeiro uso, sem sinais de utilização</div></div>
    <div class="criteria-item"><div class="criteria-label">Ótimo estado</div><div class="criteria-desc">Semi novo, sem avarias</div></div>
    <div class="criteria-item"><div class="criteria-label">Bom estado</div><div class="criteria-desc">Com uso, podendo conter: leves manchas, riscos, trincas, desgaste e furos</div></div>
    <div class="criteria-item"><div class="criteria-label">Estado regular</div><div class="criteria-desc">Podendo conter: gotejamento, trincas, manchas e desgastes em grandes proporções</div></div>
    <div class="criteria-item warn" style="grid-column: span 2;"><div class="criteria-label">Estado ruim</div><div class="criteria-desc">Danos graves, podendo conter: infiltração, rachaduras, danificações, pragas e vazamento</div></div>
  </div>

  <div class="section-title">Termo de vistoria de entrada</div>
  <div class="legal-box">
    <p class="legal-text">O presente anexo faz parte integrante do "Contrato de Locação" do imóvel CONDOMÍNIO ${data.condominio} situado na ${data.endereco} nº ${data.numero}${conjText}${aptoText}${andarText} - CEP: ${data.cep} – ${data.bairro} – ${data.cidade}/${data.estado}, datado de ${formatDateLong(data.dataLaudo)}, tendo como partes:</p>
    <p class="legal-text"><strong>De um lado, na qualidade de LOCADORA:</strong> ${data.locadora}, inscrita no CPF/CNPJ nº ${data.locadoraCpf}${data.locadoraTelefone ? ` · Tel: ${data.locadoraTelefone}` : ''};</p>
    <p class="legal-text"><strong>De outro lado, na condição de LOCATÁRIO(A):</strong> ${data.locatario}, inscrito(a) no CPF/CNPJ nº ${data.locatarioCpf}${data.locatarioTelefone ? ` · Tel: ${data.locatarioTelefone}` : ''}.</p>
    <p class="legal-text" style="margin-top: 10px;">Este laudo de vistoria tem por objetivo retratar o estado de conservação e funcionamento do imóvel na data de sua realização, em atendimento ao disposto no art. 2, inciso V e art. 23, inciso III, ambos da Lei nº 8.245/91 (Lei do Inquilinato). A presente Vistoria foi realizada por observância estética da construção e acabamentos, não se atendo a aspectos estruturais de solidez, fundações e vícios ocultos.</p>
  </div>

  <div class="info-grid">
    <div class="info-card"><div class="info-label">Tipo de Imóvel</div><div class="info-value">${data.tipoImovel}</div></div>
    <div class="info-card"><div class="info-label">Finalidade</div><div class="info-value">${data.finalidade}</div></div>
    <div class="info-card"><div class="info-label">Metragem</div><div class="info-value">${data.metragem || 'Não informada'}</div></div>
    <div class="info-card"><div class="info-label">Mobiliado</div><div class="info-value">${data.mobiliado}</div></div>
    <div class="info-card"><div class="info-label">Solicitante</div><div class="info-value">${data.solicitante}</div></div>
    <div class="info-card"><div class="info-label">Total de Fotos</div><div class="info-value">${totalPhotos} registro(s)</div></div>
  </div>

  <div class="summary-box">
    <div class="summary-stat"><div class="num">${data.rooms.length}</div><div class="label">Cômodos</div></div>
    <div class="summary-stat"><div class="num">${totalPhotos}</div><div class="label">Fotos</div></div>
    ${totalAnnotations > 0 ? `<div class="summary-stat"><div class="num">${totalAnnotations}</div><div class="label">Anotações</div></div>` : ''}
  </div>
</div>

<!-- SUMÁRIO -->
<div class="sumario-page">
  <div class="sumario-title">Sumário</div>
  <table class="sumario-table">
    <thead><tr><th>#</th><th>Cômodo</th><th style="text-align:right">Fotos</th></tr></thead>
    <tbody>${sumarioHtml}</tbody>
  </table>
</div>

<!-- ROOMS -->
<div class="rooms-title">INDICAÇÃO DO ESTADO DO IMÓVEL, ACESSÓRIOS, SUAS PARTES E COMPONENTES</div>
${roomsHtml}

<!-- CONSIDERATIONS -->
<div class="considerations">
  <h2>Considerações Finais</h2>
  <div class="considerations-text">
    <p>${data.consideracoes || `Conforme laudo, o imóvel encontra-se em bom estado de conservação. O estado do imóvel foi relatado acima de forma textual. Foram testadas torneiras, vasos sanitários, interruptores e constatado que a parte hidráulica e elétrica está em funcionamento.`}</p>
    <p>O LOCATÁRIO(A) se responsabiliza pela conservação do imóvel, comprometendo-se a restituí-lo à LOCADORA nas condições recebidas e declaradas acima, exceto pelo desgaste natural.</p>
    <p>Em caso de modificações ou benfeitorias feitas pelo LOCATÁRIO(A) no imóvel durante o período de locação, deve ser informado e autorizado pela LOCADORA.</p>
    <p>As fotos poderão ser utilizadas como forma de comprovação do real estado do imóvel se caso o laudo escrito não o relate.</p>
    <p>Este laudo retrata o estado do imóvel no momento da vistoria. Caso algo não esteja relatado na forma de texto, mas visível nas fotos, as mesmas poderão ser utilizadas para efeitos de comprovação das características e estado de conservação.</p>
    <p>Em caso de necessidade de manutenção, troca, conserto, reparo, retiradas de alguns itens ou objetos do imóvel, tratar diretamente entre as partes para que seja providenciado tais ações, e que seja oficializado via e-mail. Alterações serão feitas no laudo desde que estejam dentro do prazo de contestação.</p>
    <p><strong>LOCATÁRIO(A) e LOCADORA terão até 10 (dez) dias a contar da data de recebimento da mesma para contestar algum item da vistoria para uma possível verificação, alteração ou reparo, caso haja.</strong></p>
  </div>

  <div class="dispute-box">
    <h3>📋 CONTESTAÇÃO</h3>
    <ol>
      <li>Verifique o prazo de contestação da vistoria. Serão aceitas contestações apenas dentro do prazo previsto (10 dias corridos);</li>
      <li>Verifique no registro textual e no zip de fotos deste relatório se as divergências já estão identificadas;</li>
      <li>Caso não estejam, formalize sua contestação via e-mail, apresentando a descrição dos problemas e as fotos para comprovar cada divergência.</li>
    </ol>
  </div>

  <div class="contest-email">
    📧 A vistoria está acompanhada de um arquivo de fotos que será enviado às partes via e-mail ou WhatsApp.<br>
    <strong>Caso haja alguma divergência no relatório, para contestação, favor enviar para o e-mail:</strong> ${emailContestacao}
  </div>
</div>

<!-- SIGNATURES -->
<div class="signatures">
  <p>E, assim, por estarem justos e contratados, LOCADORA e LOCATÁRIO(A) declaram terem vistoriado o imóvel, firmando o presente instrumento, acompanhado de fotografias, fazendo-o juntamente, para todos os fins e efeitos de direito.</p>
  <p class="sig-date">São Paulo, ${formatDateLong(data.dataLaudo)}.</p>

  <div class="sig-block">
    <div class="sig-line"></div>
    <div class="sig-name">${data.locadora}</div>
    <div class="sig-role">LOCADORA</div>
  </div>

  <div class="sig-block" style="margin-top: 60px;">
    <div class="sig-line"></div>
    <div class="sig-name">${data.locatario}</div>
    <div class="sig-role">LOCATÁRIO(A)</div>
  </div>

  <div class="vistoriadora-note">
    <p>Laudo elaborado por <strong>${data.vistoriadora}</strong></p>
    <p>${formatDateLong(data.dataLaudo)}</p>
  </div>

  <div class="final-stamp">
    <div style="margin-top: 20px; padding: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: inline-block;">
      <span style="font-size: 8pt; color: #94a3b8;">${data.solicitante ? `Solicitante: ${data.solicitante}` : ''}</span>
    </div>
  </div>
</div>

</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const data: VistoriaData = await request.json();
    if (!data.condominio || !data.rooms || data.rooms.length === 0) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }
    const html = generateHtml(data);
    return NextResponse.json({ success: true, html });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}
