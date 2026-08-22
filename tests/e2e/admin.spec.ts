import { test, expect } from '@playwright/test';

test.describe('Admin Operations & Hazard Moderation Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to Admin Ops tab and display real-time revenue and system telemetry', async ({ page }) => {
    // Navigate to Admin Ops tab
    await page.click('[data-testid="tab-admin_ops"]');

    // Verify header and metrics
    await expect(page.locator('text=SafePark Operations & Governance Console')).toBeVisible();
    await expect(page.locator('text=$42,650')).toBeVisible();
    await expect(page.locator('text=3,842')).toBeVisible();
    await expect(page.locator('text=14 ms')).toBeVisible();
  });

  test('should trigger multi-city municipal data ETL sync and show completion badge', async ({ page }) => {
    await page.click('[data-testid="tab-admin_ops"]');

    // Click Trigger Multi-City ETL Sync
    await page.click('button:has-text("Trigger Multi-City ETL Sync")');

    // Verify feedback notification
    await expect(page.locator('text=Nightly municipal ETL sync completed: 270 incidents updated across 6 markets.')).toBeVisible();
  });

  test('should moderate and resolve community physical hazard reports', async ({ page }) => {
    await page.click('[data-testid="tab-admin_ops"]');

    // Verify hazard moderation queue is visible
    await expect(page.locator('text=Hazard Moderation Queue')).toBeVisible();
    await expect(page.locator('text=Alleyway Curbside Meter Zone (5th & Mission)')).toBeVisible();

    // Click Approve on pending hazard
    await page.click('button:has-text("Approve")');

    // Verify status updated to VERIFIED ACTIVE
    await expect(page.locator('text=VERIFIED ACTIVE').first()).toBeVisible();
  });
});
