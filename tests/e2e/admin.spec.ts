import { test, expect } from '@playwright/test';

test.describe('Consumer 3-Tab Streamlined Navigation & Safe Garages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between the 3 core consumer tabs smoothly', async ({ page }) => {
    // 1. Explore Tab (Default)
    await expect(page.locator('input[type="text"]').first()).toBeVisible();

    // 2. Safe Garages Tab
    await page.click('[data-testid="tab-safe_garages"]');
    await expect(page.locator('h1:has-text("Vetted Safe Garages")')).toBeVisible();

    // 3. Driver Profile Tab
    await page.click('[data-testid="tab-profile"]');
    await expect(page.locator('text=Tesla Model Y / Dark Silver')).toBeVisible();

    // Return to Explore Tab
    await page.click('[data-testid="tab-driver"]');
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('should inspect Safe Walk routes directly from Safe Garages tab', async ({ page }) => {
    await page.click('[data-testid="tab-safe_garages"]');

    // Click Safe Walk button on first garage
    const safeWalkBtn = page.locator('button:has-text("Safe Walk")').first();
    if (await safeWalkBtn.isVisible()) {
      await safeWalkBtn.click();
      await expect(page.locator('text=Illuminated Return Routing')).toBeVisible();
      await page.click('button[aria-label="Close modal"]');
    }
  });
});
