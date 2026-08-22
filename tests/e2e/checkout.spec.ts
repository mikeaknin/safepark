import { test, expect } from '@playwright/test';

test.describe('Stripe Payment & Consumer Safe Garages Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open B2C Stripe Checkout modal and upgrade driver to Premium tier', async ({ page }) => {
    // Navigate to Driver Profile
    await page.click('[data-testid="tab-profile"]');

    // Click Upgrade to Premium
    await page.click('button:has-text("Upgrade to Premium ($4.99/mo)")');

    // Verify Stripe Checkout modal is visible
    await expect(page.locator('text=Upgrade to Premium Protection')).toBeVisible();
    await expect(page.locator('text=Card Number (Stripe Encrypted)')).toBeVisible();

    // Submit Stripe Payment
    await page.click('button:has-text("Pay $4.99 & Activate Premium")');

    // Verify Premium Pro status is now active
    await expect(page.locator('text=PREMIUM PRO')).toBeVisible();
    await expect(page.locator('text=Unlimited Crime Alerts Active')).toBeVisible();
  });

  test('should navigate to Safe Garages tab and show vetted high-CSI covered facilities', async ({ page }) => {
    // Navigate to Safe Garages View
    await page.click('[data-testid="tab-safe_garages"]');

    // Verify Safe Garages view renders
    await expect(page.locator('h1:has-text("Vetted Safe Garages")')).toBeVisible();
    await expect(page.locator('text=Gated & Secured').first()).toBeVisible();
    await expect(page.locator('text=24/7 CCTV Monitoring').first()).toBeVisible();

    // Click Navigate on Map
    await page.locator('button:has-text("Navigate on Map")').first().click();

    // Verify returned to map view
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });
});
