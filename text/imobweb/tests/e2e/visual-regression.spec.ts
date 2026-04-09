import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for imobWeb.
 * Ensures the UI remains pixel-perfect across releases.
 * Recommended to run in CI (Linux) to avoid OS-specific font/rendering differences.
 */

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport and theme
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.emulateMedia({ colorScheme: 'light' });
  });

  test('Landing Page Snapshots', async ({ page }) => {
    await page.goto('/');
    // Wait for fonts/images
    await page.waitForLoadState('networkidle');
    
    // Mask dynamic elements or dates if any
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
      mask: [page.locator('.current-date'), page.locator('.dynamic-stats')],
    });
  });

  test('Dashboard View Snapshots', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/login');
    // Login logic...
    await page.goto('/dashboard');
    await page.waitForTimeout(2000); // Wait for animations
    
    await expect(page).toHaveScreenshot('dashboard-main.png', {
      mask: [page.locator('.user-avatar'), page.locator('.last-login-time')],
    });
  });

  test('Pricing Table Snapshot', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('.pricing-container')).toHaveScreenshot('pricing-table.png');
  });

  test('Mobile Responsive Snapshot', async ({ page }) => {
    // This is handled by Playwright projects in playwright.config.ts
    // but we can also trigger manually
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13
    await page.goto('/');
    await expect(page).toHaveScreenshot('landing-mobile.png');
  });
});
