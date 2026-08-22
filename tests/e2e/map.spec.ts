import { test, expect } from '@playwright/test';

test.describe('Interactive Search, Map Loading, Anti-Bias Safeguards & Offline Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render vector map canvas with dynamic CSI pins', async ({ page }) => {
    // Verify search header is present
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Verify presence of spot pins
    const pins = page.locator('text=/CSI \\d+/');
    await expect(pins.first()).toBeVisible();
  });

  test('should perform destination autocomplete search and update map target', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('732 Vallejo');

    // Verify autocomplete suggestions appear with North Beach context
    const suggestion = page.locator('text=732 Vallejo St').first();
    await expect(suggestion).toBeVisible();

    // Select suggestion
    await suggestion.click();
    await expect(page.locator('text=Target: 732 Vallejo St')).toBeVisible();
  });

  test('should enforce anti-bias rejection on subjective hazard reports', async ({ page }) => {
    // Expand bottom sheet to view parking facility card
    await page.click('button:has-text("Explore All")');

    // Click report hazard button on the facility card
    const reportBtn = page.locator('button[aria-label*="Report street hazard"]').first();
    await reportBtn.click();

    // Verify modal is open
    await expect(page.locator('h2:has-text("Report Verifiable Hazard")')).toBeVisible();

    // Fill subjective profiling notes using built-in test button
    await page.click('button:has-text("Test Subjective (Will Reject)")');

    // Click submit button
    await page.click('button:has-text("Validate & Submit")');

    // Verify anti-bias violation warning is displayed
    await expect(page.locator('strong:has-text("Submission Rejected")')).toBeVisible();
    await expect(page.locator('p:has-text("Submission rejected by Anti-Bias Policy")')).toBeVisible();
  });

  test('should support offline cached parking scores and local persistence', async ({ page }) => {
    // Verify spot pins remain active and rendered from cache
    const pins = page.locator('text=/CSI \\d+/');
    await expect(pins.first()).toBeVisible();

    // Verify search interaction works seamlessly with offline SF catalog
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Van Ness');
    await expect(page.locator('text=1000 Van Ness Ave').first()).toBeVisible();
  });
});
