import { test, expect } from '@playwright/test';

test.describe('Stripe Payment & SaaS Checkout Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open B2C Stripe Checkout modal and upgrade driver to Premium tier', async ({ page }) => {
    // Navigate to Driver Profile
    await page.click('[data-testid="tab-user_profile"]');

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

  test('should execute B2B Garage Certification audit and Stripe SaaS subscription', async ({ page }) => {
    // Navigate to B2B Operator View
    await page.click('[data-testid="tab-b2b_portal"]');

    // Verify Operator Audit Portal renders
    await expect(page.locator('main h1')).toContainText('SafePark Certified™ Facility Portal');

    // Run audit calculation
    await page.click('button:has-text("Calculate SafePark Certification Tier")');

    // Verify Audit score and boost calculated
    await expect(page.locator('text=Audit & Rating Results')).toBeVisible();
    await expect(page.locator('text=SafePark Platinum Certified')).toBeVisible();

    // Click SaaS subscription activation
    await page.click('button:has-text("Subscribe to SaaS Certification")');

    // Apply to live consumer driver map
    await page.click('button:has-text("Apply Verified Certification to Live Driver Map")');
  });
});
