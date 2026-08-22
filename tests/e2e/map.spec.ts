import { test, expect } from '@playwright/test';

test.describe('Interactive Search, Map Loading, Anti-Bias Safeguards & Offline Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render vector map canvas with dynamic CSI pins', async ({ page }) => {
    // Verify header and map canvas
    await expect(page.locator('header')).toContainText('SafePark');
    await expect(page.locator('text=City Risk & Lighting Grid Map')).toBeVisible();

    // Verify presence of spot pins
    const pins = page.locator('text=/CSI \\d+/');
    await expect(pins.first()).toBeVisible();
  });

  test('should perform destination autocomplete search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search destination"]');
    await searchInput.fill('Salesforce');

    // Verify autocomplete suggestions appear
    await expect(page.locator('text=Salesforce Tower Plaza')).toBeVisible();

    // Select suggestion
    await page.click('text=Salesforce Tower Plaza');
    await expect(page.locator('text=Destination: Salesforce')).toBeVisible();
  });

  test('should enforce anti-bias rejection on subjective hazard reports', async ({ page }) => {
    // Wait for parking spot cards to render
    const hazardButton = page.locator('button[title="Submit Verifiable Physical Hazard"]').first();
    await expect(hazardButton).toBeVisible();
    await hazardButton.click();

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

  test('should toggle subterranean offline mode and serve cached scores', async ({ page }) => {
    // Click Signal Loss toggle
    await page.click('button:has-text("Signal Loss")');

    // Verify Subterranean Banner is displayed
    await expect(page.locator('text=Subterranean Concrete Garage Mode')).toBeVisible();

    // Verify spot cards remain populated from local storage cache
    await expect(page.getByRole('heading', { name: 'Mission Bay Secure Underground Garage' })).toBeVisible();
  });
});
