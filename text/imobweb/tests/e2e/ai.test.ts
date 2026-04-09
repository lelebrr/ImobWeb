import { test, expect } from '@playwright/test';

test.describe('AI - Suggest Price', () => {
  test('should return valid price suggestion', async ({ request }) => {
    const response = await request.post('/api/ai/suggest-price', {
      data: {
        type: 'apartamento',
        area: 80,
        location: 'Centro de São Paulo',
        zone: 'centro',
        beds: 2,
        baths: 1,
        parking: 1,
      },
    });

    expect(response.ok()).toBe(true);
    
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.suggestedPrice).toBeGreaterThan(0);
    expect(json.data.formattedPrice).toContain('R$');
    expect(json.data.confidence).toBeGreaterThan(0);
  });

  test('should validate input schema', async ({ request }) => {
    const response = await request.post('/api/ai/suggest-price', {
      data: {
        type: 'castelo-inventado',
        area: 80,
        location: 'Centro',
      },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Dados inválidos');
  });

  test('should reject negative area', async ({ request }) => {
    const response = await request.post('/api/ai/suggest-price', {
      data: {
        type: 'apartamento',
        area: -50,
        location: 'Centro',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should handle missing optional fields', async ({ request }) => {
    const response = await request.post('/api/ai/suggest-price', {
      data: {
        type: 'casa',
        area: 100,
        location: 'Bairro',
      },
    });

    expect(response.ok()).toBe(true);
    const json = await response.json();
    expect(json.data.suggestedPrice).toBeGreaterThan(0);
  });

  test('GET endpoint should return documentation', async ({ request }) => {
    const response = await request.get('/api/ai/suggest-price');
    
    expect(response.ok()).toBe(true);
    const json = await response.json();
    expect(json.endpoint).toBe('/api/ai/suggest-price');
    expect(json.body).toBeDefined();
  });
});

test.describe('AI - Generate Description', () => {
  test('should generate description', async ({ request }) => {
    const response = await request.post('/api/ai/generate-description', {
      data: {
        location: 'Pinheiros, São Paulo',
        area: 90,
        propertyType: 'apartamento',
        beds: 2,
        baths: 2,
        parking: 1,
        features: ['piscina', 'academia', 'varanda'],
        tone: 'formal',
      },
    });

    expect(response.ok()).toBe(true);
    
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.descriptions.short).toBeTruthy();
    expect(json.data.descriptions.medium).toBeTruthy();
    expect(json.data.descriptions.full).toBeTruthy();
    expect(json.data.tags).toBeTruthy();
  });

  test('should generate different tones', async ({ request }) => {
    const baseData = {
      location: 'Jardim América',
      area: 150,
      beds: 3,
    };

    const formal = await request.post('/api/ai/generate-description', {
      data: { ...baseData, tone: 'formal' },
    });

    const informal = await request.post('/api/ai/generate-description', {
      data: { ...baseData, tone: 'informal' },
    });

    const formalJson = await formal.json();
    const informalJson = await informal.json();

    expect(formalJson.data.descriptions.full).not.toBe(informalJson.data.descriptions.full);
  });

  test('should validate input', async ({ request }) => {
    const response = await request.post('/api/ai/generate-description', {
      data: {
        location: 'Centro',
        area: -30,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should handle minimal input', async ({ request }) => {
    const response = await request.post('/api/ai/generate-description', {
      data: {
        location: 'Bairro Novo',
        area: 50,
      },
    });

    expect(response.ok()).toBe(true);
    const json = await response.json();
    expect(json.data.descriptions.short).toBeTruthy();
  });
});

test.describe('AI - Chat with Owner', () => {
  test('should respond to chat message', async ({ request }) => {
    const response = await request.post('/api/ai/chat-with-owner', {
      data: {
        message: 'Olá, preciso de ajuda para criar um anúncio',
      },
    });

    expect(response.ok()).toBe(true);
    
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.message).toBeTruthy();
  });

  test('should detect price intent', async ({ request }) => {
    const response = await request.post('/api/ai/chat-with-owner', {
      data: {
        message: 'Qual o preço deste imóvel?',
      },
    });

    const json = await response.json();
    expect(json.data.action).toBe('collect_property_info');
  });

  test('should detect description intent', async ({ request }) => {
    const response = await request.post('/api/ai/chat-with-owner', {
      data: {
        message: 'Preciso criar uma descrição',
      },
    });

    const json = await response.json();
    expect(json.data.action).toBe('collect_description_info');
  });

  test('should handle context', async ({ request }) => {
    const response = await request.post('/api/ai/chat-with-owner', {
      data: {
        message: 'Sim, confirmado',
        context: {
          propertyId: 'prop-123',
          previousMessages: [
            { role: 'user', content: 'Qual o preço?' },
            { role: 'assistant', content: 'Me passe os dados' },
          ],
        },
      },
    });

    expect(response.ok()).toBe(true);
  });

  test('should validate empty message', async ({ request }) => {
    const response = await request.post('/api/ai/chat-with-owner', {
      data: {
        message: '',
      },
    });

    expect(response.status()).toBe(400);
  });
});