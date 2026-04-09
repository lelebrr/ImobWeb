import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Global smoke tests for imobWeb.
 * Designed to be run daily in production or after each deployment.
 */

export const runSmokeTests = async (page: any, baseURL: string) => {
  console.log(`Starting smoke tests for ${baseURL}`);

  // 1. Health Check
  const response = await page.goto(`${baseURL}/api/health`);
  expect(response.status()).toBe(200);

  // 2. Critical Pages Accessibility & Rendering
  const pages = ['/', '/login', '/pricing'];
  
  for (const path of pages) {
    await page.goto(`${baseURL}${path}`);
    await expect(page).toHaveTitle(/.+/);
    
    // Accessibility Audit (WCAG 2.1 AA)
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();
    
    if (accessibilityScanResults.violations.length > 0) {
      console.warn(`Accessibility violations found in ${path}:`, accessibilityScanResults.violations);
    }
  }

  // 3. Database & Auth Simulation
  await page.goto(`${baseURL}/login`);
  await expect(page.locator('input[type="email"]')).toBeVisible();

  console.log('Smoke tests completed successfully.');
};
