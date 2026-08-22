import { test, expect } from '@playwright/test';

test.describe('Authentication & Driver Profile Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to Driver Profile tab and show default driver account', async ({ page }) => {
    // Navigate to Driver Profile view
    await page.click('[data-testid="tab-user_profile"]');

    // Verify user profile details
    await expect(page.locator('text=Tesla Model Y / Dark Silver')).toBeVisible();
    await expect(page.locator('text=FREE TIER')).toBeVisible();
  });

  test('should support OAuth Sign-In and persist session in LocalStorage', async ({ page }) => {
    await page.click('[data-testid="tab-user_profile"]');

    // Click Apple Auth button
    await page.click('button:has-text("Apple Auth")');

    // Verify updated verified driver session
    await expect(page.locator('main h1')).toContainText('Apple Verified Driver');

    // Verify LocalStorage JWT token persistence
    const storedAuth = await page.evaluate(() => localStorage.getItem('safepark_auth_session_v1'));
    expect(storedAuth).not.toBeNull();
    const parsed = JSON.parse(storedAuth!);
    expect(parsed.authProvider).toBe('apple');
  });
});
