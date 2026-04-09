import { test, expect } from '@playwright/test';
import { PropertyFactory } from '../../lib/testing/test-factories';

/**
 * E2E test for the property registration flow.
 * Covers authentication, form filling, IA generation, and publication.
 */

test.describe('Property Management', () => {
  // Setup: Mock authentication if needed or use real dev credentials
  test.beforeEach(async ({ page }) => {
    // In a real scenario, we'd use a global-setup or a session storage to avoid logging in every time
    await page.goto('/login');
    
    // Using environment variables for security
    const email = process.env.TEST_USER_EMAIL || 'admin@imobweb.com.br';
    const password = process.env.TEST_USER_PASSWORD || 'password123';
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard or main page
    await expect(page).toHaveURL(/\/(dashboard)?/);
  });

  test('should create and publish a new property using the registration wizard', async ({ page }) => {
    const property = PropertyFactory.create();

    // Navigate to new property page
    await page.click('a[href="/properties/new"]');
    await expect(page).toHaveURL(/\/properties\/new/);

    // Step 1: Basic Information
    await page.fill('input[name="title"]', property.title);
    await page.selectOption('select[name="type"]', property.type);
    await page.selectOption('select[name="businessType"]', property.businessType);

    // Step 2: Description & AI
    // Simulate clicking the AI enhancement button
    const aiBtn = page.getByRole('button', { name: /melhorar com ia/i });
    if (await aiBtn.isVisible()) {
      await aiBtn.click();
      // Wait for AI spinner
      await expect(page.locator('textarea[name="description"]')).not.toBeEmpty();
    } else {
      await page.fill('textarea[name="description"]', property.description!);
    }

    // Step 3: Details & Price
    if (property.businessType === 'VENDA') {
      await page.fill('input[name="price"]', property.price!.toString());
    } else {
      await page.fill('input[name="priceRent"]', property.priceRent!.toString());
    }

    await page.fill('input[name="area"]', property.area!.toString());
    await page.fill('input[name="bedrooms"]', property.bedrooms!.toString());

    // Step 4: Address
    await page.fill('input[name="cep"]', property.cep!);
    // CEP search usually triggers auto-fill, wait for it
    await page.waitForTimeout(1000); 
    await page.fill('input[name="address"]', property.address!);
    await page.fill('input[name="neighborhood"]', property.neighborhood!);

    // Step 5: Media (Simulating dropzone upload)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('div#media-dropzone').click();
    const fileChooser = await fileChooserPromise;
    // Note: In CI, we use a fixture image
    await fileChooser.setFiles('tests/fixtures/sample-property.jpg');
    
    // Wait for upload progress
    await expect(page.locator('.progress-success')).toBeVisible();

    // Step 6: Publish
    await page.click('button#btn-publish');

    // Verification
    await expect(page).toHaveURL(/\/properties\/[a-z0-9]+/);
    await expect(page.locator('h1')).toContainText(property.title);
    await expect(page.locator('.badge-success')).toContainText(/publicado/i);
    
    // Check if property is in the list
    await page.goto('/properties');
    await expect(page.locator('table')).toContainText(property.title);
  });
});
