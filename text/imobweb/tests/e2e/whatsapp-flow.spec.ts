import { test, expect } from '@playwright/test';
import { PropertyFactory, OwnerFactory } from '../../lib/testing/test-factories';

/**
 * E2E test for the WhatsApp automation flow.
 * Simulates a proprietor updating property information via a WhatsApp-triggered interface.
 */

test.describe('WhatsApp Business Automation', () => {
  test('should allow a proprietor to update property price after receiving a WhatsApp alert', async ({ page }) => {
    const property = PropertyFactory.create();
    const owner = OwnerFactory.create();

    // 1. Simulate the system sending a notification (Backend logic usually triggers this)
    // In E2E, we navigate directly to the unique "Magic Link" the proprietor would receive.
    const magicLink = `/p/update/${property.id}?token=mock-token-123`;
    
    await page.goto(magicLink);
    
    // 2. Verify UI visibility (Proprietor view is often simplified/PWA style)
    await expect(page.locator('h1')).toContainText(/atualizar seu imóvel/i);
    await expect(page.locator('.property-title')).toContainText(property.title);

    // 3. Perform Update
    const oldPrice = await page.inputValue('input[name="price"]');
    const newPrice = (parseInt(oldPrice || "500000") * 0.95).toString(); // 5% discount
    
    await page.fill('input[name="price"]', newPrice);
    await page.click('button#btn-update-confirm');

    // 4. Verification
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('text=Preço atualizado com sucesso')).toBeVisible();

    // 5. Check if it reflected in the main CRM (Admin view)
    await page.goto('/login');
    // ... Login logic (omitted for brevity, assuming session or mock)
    await page.goto(`/properties/${property.id}`);
    await expect(page.locator('.price-display')).toContainText(newPrice);
  });

  test('should handle WhatsApp webhook for image updates', async ({ page, request }) => {
    // This simulates the integration point where the WhatsApp Gateway sends a webhook
    // containing media URLs sent by the proprietor.
    
    const payload = {
      from: '5511999999999',
      type: 'image',
      media: {
        url: 'https://whatsapp.api/media/123.jpg',
        caption: 'Nova foto da sala'
      },
      propertyId: 'prop-123'
    };

    const response = await request.post('/api/whatsapp/webhook', {
      data: payload,
      headers: { 'X-Hub-Signature': 'mock-signature' }
    });

    expect(response.ok()).toBeTruthy();
    
    // Verify integration (e.g., check if photo appeared in property gallery)
    await page.goto('/properties/prop-123');
    await expect(page.locator('.gallery-item')).toHaveCount(1);
  });
});
