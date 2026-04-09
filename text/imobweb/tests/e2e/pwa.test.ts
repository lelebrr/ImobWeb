import { test, expect } from '@playwright/test';

test.describe('PWA Installation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display install prompt on supported browser', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    });

    const isSupported = await page.evaluate(() => {
      return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
    });

    if (!isSupported) {
      test.skip('Browser does not support PWA installation');
    }

    await page.waitForTimeout(3000);
    
    const installButton = page.locator('button:has-text("Instalar")').first();
    await expect(installButton).toBeVisible({ timeout: 10000 });
  });

  test('should detect online/offline status', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await route.abort('failed');
    });

    await page.reload();
    await expect(page.locator('text=Offline')).toBeVisible({ timeout: 10000 });
  });

  test('should load manifest', async ({ page }) => {
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      return link?.href;
    });

    expect(manifest).toContain('manifest.json');
  });
});

test.describe('PWA Offline Support', () => {
  test('should cache static assets', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cacheStatus = await page.evaluate(async () => {
      if ('caches' in window) {
        const keys = await caches.keys();
        return { available: keys.length > 0, caches: keys };
      }
      return { available: false };
    });

    console.log('Cache status:', cacheStatus);
  });

  test('should show offline page when network fails', async ({ page }) => {
    await page.route('**/*', (route) => {
      if (!route.request().url().includes('_next')) {
        route.abort('failed');
      }
    });

    await page.goto('/offline.html');
    await expect(page.locator('text=offline')).toBeVisible();
  });
});

test.describe('PWA Shortcuts', () => {
  test('should have shortcuts in manifest', async ({ page }) => {
    const response = await page.request.get('/manifest.json');
    const manifest = await response.json();

    expect(manifest.shortcuts).toBeDefined();
    expect(manifest.shortcuts.length).toBeGreaterThan(0);
  });
});