import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) } }),
}));

import { POST } from './route';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const JPG = 'data:image/jpeg;base64,/9j/4AAQ';

function req(body: unknown) {
  return { json: async () => body, nextUrl: { origin: 'https://app.test' } } as never;
}

describe('POST /api/admin/vistoria/generate-pdf', () => {
  const base = {
    condominio: '<b>Edifício</b>', endereco: 'Rua A', numero: '1', locadora: 'Ana', locatario: '"><script>alert(1)</script>',
    tipoVistoria: 'SAIDA', dataLaudo: '08/10/2026', signatures: { locatario: PNG, locadora: 'javascript:alert(1)' },
    rooms: [{
      name: 'SALA <i>x</i>', items: ['✓ Piso <u>ok</u>'], furniture: ['Sofá'], damages: ['Risco <b>fundo</b>'],
      checklist: { Piso: 'ruim', Paredes: 'ok', Inválido: 'hack' }, observations: '<img src=x onerror=1>',
      photos: [
        { dataUrl: JPG, name: 'a', annotations: [{ x: 10, y: 20, label: '<svg onload=1>' }] },
        { dataUrl: '"><script>1</script>', name: 'evil', annotations: [] },
        { dataUrl: '/vistoria-exemplos/columbus/page_005.jpg', name: 'ex', annotations: [] },
      ],
    }],
  };

  it('gera o laudo e escapa todo conteúdo do usuário', async () => {
    const res = await POST(req(base));
    const json = await res.json();
    expect(json.success).toBe(true);
    const html: string = json.html;
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=1>');
    expect(html).not.toContain('<svg onload=1>');
    expect(html).not.toContain('<b>Edifício</b>');
    expect(html).toContain('&lt;b&gt;Edifício&lt;/b&gt;');
    expect(html).toContain('de saída');
    expect(html).toContain('Sofá');
    expect(html).toContain('Risco &lt;b&gt;fundo&lt;/b&gt;');
    expect(html).toContain('cl-ruim');
    expect(html).not.toContain('Inválido');
    // assinatura válida entra; inválida não
    expect(html).toContain(`src="${PNG}"`);
    expect(html).not.toContain('javascript:alert');
    // foto maliciosa descartada; exemplo recebe origem absoluta
    expect(html).not.toContain('evil');
    expect(html).toContain('https://app.test/vistoria-exemplos/columbus/page_005.jpg');
  });

  it('rejeita payload sem cômodos', async () => {
    const res = await POST(req({ ...base, rooms: [] }));
    expect(res.status).toBe(400);
  });

  it('aceita imóvel sem condomínio quando há endereço', async () => {
    const res = await POST(req({ ...base, condominio: '' }));
    expect((await res.json()).success).toBe(true);
  });

  it('inclui medidores, chaves e reparos escapados e com consumo', async () => {
    const res = await POST(req({
      ...base,
      medidoresEntrada: { agua: { numero: '1', leitura: '100' } },
      medidores: { agua: { numero: '<b>9</b>', leitura: '112,5' } },
      chaves: [{ descricao: '<i>Chave</i>', quantidade: 2 }],
      reparos: [{ comodo: 'Sala', descricao: '<script>x</script>', min: 100, max: 250, nota: 'n' }],
    }));
    const html: string = (await res.json()).html;
    expect(html).toContain('12,5 m³');
    expect(html).toContain('Estimativa de reparos');
    expect(html).not.toContain('<script>x</script>');
    expect(html).not.toContain('<b>9</b>');
    expect(html).toContain('&lt;i&gt;Chave&lt;/i&gt;');
  });
});
