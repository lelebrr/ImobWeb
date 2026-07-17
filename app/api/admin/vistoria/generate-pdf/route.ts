import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PhotoAnnotation {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label: string;
}

interface PhotoData {
  dataUrl: string;
  name: string;
  annotations: PhotoAnnotation[];
}

interface VistoriaData {
  condominio: string;
  endereco: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  conjApto: string;
  tipoImovel: string;
  finalidade: string;
  metragem: string;
  mobiliado: string;
  locadora: string;
  locadoraCpf: string;
  locatario: string;
  locatarioCpf: string;
  vistoriadora: string;
  dataFotografia: string;
  dataLaudo: string;
  solicitante: string;
  rooms: {
    name: string;
    items: string[];
    photos: PhotoData[];
  }[];
  consideracoes: string;
}

function buildAnnotatedPhotoHtml(photo: PhotoData, globalIdx: number): string {
  if (!photo.annotations || photo.annotations.length === 0) {
    return `
      <div class="photo-container">
        <img src="${photo.dataUrl}" class="photo-img" />
      </div>`;
  }

  // Sort annotations by position for cleaner layout
  const sorted = [...photo.annotations].sort((a, b) => a.y - b.y || a.x - b.x);

  // Build SVG overlay with markers, lines, and labels
  const svgWidth = 600;
  const svgHeight = 450;

  const markers = sorted
    .map((ann, i) => {
      const cx = (ann.x / 100) * svgWidth;
      const cy = (ann.y / 100) * svgHeight;
      const num = i + 1;

      // Calculate line endpoint - push label to the right or left edge
      const goRight = ann.x < 65;
      const lineEndX = goRight ? svgWidth - 10 : 10;
      const lineEndY = cy;

      // Label position
      const labelX = goRight ? lineEndX + 4 : lineEndX - 4;
      const textAnchor = goRight ? 'start' : 'end';

      // Elbow point for the line
      const elbowX = goRight
        ? Math.min(cx + 40, lineEndX - 20)
        : Math.max(cx - 40, lineEndX + 20);

      return `
        <!-- Marker ${num} -->
        <circle cx="${cx}" cy="${cy}" r="14" fill="#dc2626" stroke="white" stroke-width="2.5" />
        <text x="${cx}" y="${cy + 4.5}" text-anchor="middle" fill="white" font-size="10" font-weight="800" font-family="Arial">${num}</text>

        <!-- Callout Line -->
        <polyline
          points="${cx},${cy} ${elbowX},${cy} ${lineEndX},${lineEndY}"
          fill="none"
          stroke="#dc2626"
          stroke-width="1.5"
          stroke-dasharray="4,2"
        />
        <circle cx="${lineEndX}" cy="${lineEndY}" r="3" fill="#dc2626" />

        <!-- Label Background -->
        <rect
          x="${labelX - (goRight ? 0 : ann.label.length * 5.5 + 8)}"
          y="${lineEndY - 11}"
          width="${ann.label.length * 5.5 + 12}"
          height="22"
          rx="4"
          fill="#1e293b"
          stroke="#dc2626"
          stroke-width="0.5"
        />
        <text
          x="${labelX}"
          y="${lineEndY + 4}"
          text-anchor="${textAnchor}"
          fill="white"
          font-size="9"
          font-weight="600"
          font-family="Arial"
        >${ann.label}</text>`;
    })
    .join('\n');

  return `
    <div class="photo-container annotated">
      <img src="${photo.dataUrl}" class="photo-img" />
      <svg class="photo-overlay" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet">
        ${markers}
      </svg>
    </div>`;
}

function generateHtml(data: VistoriaData): string {
  const roomCount = data.rooms.length;
  const totalPhotos = data.rooms.reduce((sum, r) => sum + (r.photos?.length || 0), 0);
  const totalAnnotations = data.rooms.reduce(
    (sum, r) => sum + (r.photos?.reduce((s, p) => s + (p.annotations?.length || 0), 0) || 0),
    0
  );

  let globalPhotoIdx = 0;

  const roomsHtml = data.rooms
    .map((room, idx) => {
      const photosHtml =
        room.photos && room.photos.length > 0
          ? `<div class="photo-grid">
              ${room.photos
                .map((photo) => {
                  globalPhotoIdx++;
                  return buildAnnotatedPhotoHtml(photo, globalPhotoIdx);
                })
                .join('\n')}
            </div>`
          : '<p class="no-photos">Fotos não disponíveis para este cômodo</p>';

      const annotationsList =
        room.photos && room.photos.some((p) => p.annotations?.length > 0)
          ? `<div class="annotations-list">
              <h4>Anotações nesta sala:</h4>
              <ol>
                ${room.photos
                  .flatMap((p, pi) =>
                    (p.annotations || []).map((a, ai) => `<li><strong>Foto ${pi + 1}:</strong> ${a.label}</li>`)
                  )
                  .join('\n')}
              </ol>
            </div>`
          : '';

      return `
    <div class="room-section">
      <h2>${idx + 1} – ${room.name}:</h2>
      <ul class="items">
        ${(room.items || []).map((item) => `<li>${item}</li>`).join('\n        ')}
      </ul>
      ${photosHtml}
      ${annotationsList}
    </div>`;
    })
    .join('\n');

  const sumarioHtml = data.rooms
    .map(
      (room, idx) => `
    <tr>
      <td>${idx + 1} – ${room.name}</td>
      <td class="page-ref"></td>
    </tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a1a;
    }

    /* === COVER === */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }
    .cover-title { font-size: 26pt; font-weight: 800; color: #0F172A; margin-bottom: 6px; }
    .cover-subtitle { font-size: 14pt; color: #64748b; margin-bottom: 50px; font-weight: 500; }
    .cover-info { font-size: 11pt; color: #334155; margin-bottom: 5px; }
    .cover-info strong { color: #0F172A; }
    .cover-line { width: 80px; height: 4px; background: linear-gradient(90deg, #0b5bd3, #667eea); border-radius: 2px; margin: 25px auto; }
    .cover-date { font-size: 10pt; color: #64748b; margin-top: 30px; }

    /* === INFO === */
    .info-page { page-break-after: always; }
    .info-page h2 { font-size: 14pt; color: #0F172A; border-bottom: 3px solid #0b5bd3; padding-bottom: 6px; margin-bottom: 16px; }
    .legal-text { font-size: 9pt; color: #475569; line-height: 1.6; margin: 10px 0; text-align: justify; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
    .info-item { padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #0b5bd3; }
    .info-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; }
    .info-value { font-size: 10pt; color: #0F172A; font-weight: 600; margin-top: 1px; }

    .criteria-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px 16px; margin: 16px 0; }
    .criteria-box h3 { font-size: 9pt; color: #0369a1; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .criteria-list { list-style: none; font-size: 9pt; }
    .criteria-list li { padding: 3px 0; color: #334155; }
    .criteria-list li::before { content: "•"; color: #0b5bd3; font-weight: bold; margin-right: 6px; }

    /* === SUMARIO === */
    .sumario-page { page-break-after: always; }
    .sumario-page h2 { font-size: 14pt; color: #0F172A; margin-bottom: 16px; }
    .sumario-table { width: 100%; border-collapse: collapse; }
    .sumario-table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; }

    /* === ROOMS === */
    .room-section { margin-bottom: 24px; page-break-inside: avoid; }
    .room-section h2 { font-size: 12pt; color: #0F172A; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
    .items { list-style: none; padding: 0; margin-bottom: 14px; }
    .items li { padding: 4px 0; border-bottom: 1px solid #f1f5f9; font-size: 9.5pt; line-height: 1.4; color: #1e293b; }
    .items li::before { content: "✓"; color: #10b981; font-weight: bold; margin-right: 6px; }

    /* === PHOTOS === */
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 12px 0;
      page-break-inside: auto;
    }
    .photo-container {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      page-break-inside: avoid;
    }
    .photo-container.annotated {
      border: 2px solid #dc2626;
    }
    .photo-img {
      width: 100%;
      height: auto;
      display: block;
    }
    .photo-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .annotations-list {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 10px 0;
    }
    .annotations-list h4 { font-size: 9pt; color: #991b1b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .annotations-list ol { margin-left: 16px; font-size: 9pt; color: #7f1d1d; }
    .annotations-list li { margin-bottom: 3px; }

    .no-photos { font-size: 9pt; color: #94a3b8; font-style: italic; margin: 8px 0; }

    /* === CONSIDERATIONS === */
    .considerations-page { page-break-before: always; }
    .considerations-page h2 { font-size: 14pt; color: #0F172A; border-bottom: 3px solid #0b5bd3; padding-bottom: 6px; margin-bottom: 16px; }
    .considerations-text { font-size: 10pt; line-height: 1.7; color: #1e293b; text-align: justify; }
    .considerations-text p { margin-bottom: 10px; }

    .dispute-section { margin-top: 24px; padding: 16px; background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; }
    .dispute-section h3 { font-size: 11pt; color: #92400e; margin-bottom: 10px; }
    .dispute-section ol { margin-left: 16px; font-size: 9pt; color: #78350f; }
    .dispute-section li { margin-bottom: 4px; }

    /* === SIGNATURES === */
    .signature-page { page-break-before: always; padding-top: 30px; }
    .signature-block { margin-top: 50px; text-align: center; }
    .signature-line { width: 280px; border-top: 1px solid #94a3b8; margin: 0 auto 6px; padding-top: 6px; }
    .signature-name { font-size: 10pt; font-weight: 700; color: #0F172A; }
    .signature-role { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .signature-date { font-size: 9pt; color: #64748b; margin-top: 30px; text-align: center; }

    .footer-note { margin-top: 30px; padding: 10px; background: #f8fafc; border-radius: 6px; font-size: 8pt; color: #64748b; text-align: center; }

    /* === SUMMARY BOX === */
    .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 12px 0; display: flex; gap: 20px; font-size: 9pt; }
    .summary-box span { color: #64748b; }
    .summary-box strong { color: #0F172A; }
  </style>
</head>
<body>

  <!-- COVER -->
  <div class="cover-page">
    <div class="cover-title">Termo de vistoria</div>
    <div class="cover-subtitle">de entrada para fins locatícios</div>
    <div class="cover-line"></div>
    <div class="cover-info"><strong>VISTORIADORA:</strong> ${data.vistoriadora}</div>
    <div class="cover-info"><strong>FOTOGRAFADO EM:</strong> ${data.dataFotografia}</div>
    <div class="cover-date">${data.dataLaudo}</div>
  </div>

  <!-- INFO -->
  <div class="info-page">
    <h2>Laudo de vistoria de entrada</h2>
    <p class="legal-text">
      O presente anexo faz parte integrante do "Contrato de Locação" do imóvel
      CONDOMÍNIO ${data.condominio} situado na ${data.endereco} nº ${data.numero}
      ${data.conjApto ? `- ${data.conjApto}` : ''} - CEP: ${data.cep} –
      ${data.bairro} – ${data.cidade}/${data.estado}, datado de ${data.dataLaudo},
      tendo como partes:
    </p>
    <p class="legal-text">De um lado, na qualidade de LOCADORA: ${data.locadora}, inscrita no CPF nº ${data.locadoraCpf};</p>
    <p class="legal-text">De outro lado, na condição de LOCATÁRIO(A): ${data.locatario}, inscrito(a) no CPF nº ${data.locatarioCpf}.</p>
    <p class="legal-text">
      Este laudo de vistoria tem por objetivo retratar o estado de conservação e funcionamento
      do imóvel na data de sua realização, em atendimento ao disposto no art. 2, inciso V e art. 23,
      inciso III, ambos da Lei nº 8.245/91 (Lei do Inquilinato). A presente Vistoria foi realizada por
      observância estética da construção e acabamentos, não se atendo a aspectos estruturais de
      solidez, fundações e vícios ocultos.
    </p>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Tipo de Imóvel</div><div class="info-value">${data.tipoImovel}</div></div>
      <div class="info-item"><div class="info-label">Finalidade</div><div class="info-value">${data.finalidade}</div></div>
      <div class="info-item"><div class="info-label">Metragem</div><div class="info-value">${data.metragem}</div></div>
      <div class="info-item"><div class="info-label">Mobiliado</div><div class="info-value">${data.mobiliado}</div></div>
      <div class="info-item"><div class="info-label">Cômodos</div><div class="info-value">${roomCount}</div></div>
      <div class="info-item"><div class="info-label">Solicitante</div><div class="info-value">${data.solicitante}</div></div>
    </div>

    <div class="summary-box">
      <div><span>Fotos:</span> <strong>${totalPhotos}</strong></div>
      <div><span>Anotações:</span> <strong>${totalAnnotations}</strong></div>
      <div><span>Cômodos:</span> <strong>${roomCount}</strong></div>
    </div>

    <div class="criteria-box">
      <h3>Critérios de avaliação do estado de conservação</h3>
      <ul class="criteria-list">
        <li><strong>Novo estado:</strong> primeiro uso</li>
        <li><strong>Ótimo estado:</strong> semi novo, sem avarias</li>
        <li><strong>Bom estado:</strong> com uso, podendo conter: leves manchas, riscos, trincas, desgaste e furos</li>
        <li><strong>Estado regular:</strong> podendo conter: gotejamento, trincas, manchas e desgastes em grandes proporções</li>
        <li><strong>Estado ruim:</strong> danos graves, podendo conter: infiltração, rachaduras, danificações, pragas e vazamento</li>
      </ul>
    </div>
  </div>

  <!-- SUMARIO -->
  <div class="sumario-page">
    <h2>Sumário</h2>
    <table class="sumario-table">
      ${sumarioHtml}
      <tr><td><strong>Considerações finais</strong></td><td></td></tr>
    </table>
  </div>

  <!-- ROOMS -->
  <h2 style="font-size: 12pt; color: #0F172A; border-bottom: 3px solid #0b5bd3; padding-bottom: 6px; margin-bottom: 16px;">
    INDICAÇÃO DO ESTADO DO IMÓVEL, ACESSÓRIOS, SUAS PARTES E COMPONENTES
  </h2>
  ${roomsHtml}

  <!-- CONSIDERATIONS -->
  <div class="considerations-page">
    <h2>Considerações finais</h2>
    <div class="considerations-text">
      <p>${data.consideracoes || 'Conforme laudo, o imóvel encontra-se em bom estado de conservação. O estado do imóvel foi relatado acima de forma textual. Foram testadas torneiras, vasos sanitários, interruptores e constatado que a parte hidráulica e elétrica está em funcionamento.'}</p>
      <p>O LOCATÁRIO(A) se responsabiliza pela conservação do imóvel, comprometendo-se a restituí-lo à LOCADORA nas condições recebidas e declaradas acima, exceto pelo desgaste natural.</p>
      <p>Em caso de modificações ou benfeitorias feitas pelo LOCATÁRIO(A) no imóvel durante o período de locação, deve ser informado e autorizado pela LOCADORA.</p>
      <p>As fotos poderão ser utilizadas como forma de comprovação do real estado do imóvel se caso o laudo escrito não o relate.</p>
      <p>LOCATÁRIO(A) e LOCADORA terão até 10 (dez) dias a contar da data de recebimento da mesma para contestar algum item da vistoria para uma possível verificação, alteração ou reparo, caso haja.</p>
    </div>

    <div class="dispute-section">
      <h3>CONTESTAÇÃO</h3>
      <ol>
        <li>Verifique o prazo de contestação da vistoria. Serão aceitas contestações apenas dentro do prazo previsto (10 dias corridos);</li>
        <li>Verifique no registro textual e no zip de fotos deste relatório se as divergências já estão identificadas;</li>
        <li>Caso não estejam, formalize sua contestação via e-mail, apresentando a descrição dos problemas e as fotos para comprovar cada divergência.</li>
      </ol>
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="signature-page">
    <p class="signature-date">São Paulo, ${data.dataLaudo}</p>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-name">${data.locadora}</div>
      <div class="signature-role">LOCADORA</div>
    </div>
    <div class="signature-block" style="margin-top: 60px;">
      <div class="signature-line"></div>
      <div class="signature-name">${data.locatario}</div>
      <div class="signature-role">LOCATÁRIO(A)</div>
    </div>
    <div class="footer-note">Laudo de vistoria gerado automaticamente · imobWeb · ${data.dataLaudo}</div>
  </div>

</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const data: VistoriaData = await request.json();

    if (!data.condominio || !data.rooms || data.rooms.length === 0) {
      return NextResponse.json(
        { error: 'Dados incompletos para gerar o laudo' },
        { status: 400 }
      );
    }

    const html = generateHtml(data);
    return NextResponse.json({ success: true, html });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}
