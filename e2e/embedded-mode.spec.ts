import { test, expect } from '@playwright/test';

test('embedded mode hides samples drawer toggle', async ({ page }) => {
  // The html-import test page uses samplesDrawerEnabled={false}
  await page.goto('/e2e/test-html-import.html');
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });

  // The samples drawer toggle (menu icon) should NOT be visible
  const menuButton = page.locator('button:has(svg[data-testid="MenuOutlinedIcon"])');
  await expect(menuButton).not.toBeVisible();

  // The first-page icon (collapse) should also not be visible
  const collapseButton = page.locator('button:has(svg[data-testid="FirstPageOutlinedIcon"])');
  await expect(collapseButton).not.toBeVisible();
});

test('embedded mode still allows inline editing', async ({ page }) => {
  await page.goto('/e2e/test-html-import.html');
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });

  // Click on the HTML content to select the block
  await page.locator('text=Welcome to our service').click();

  // A textarea should appear for editing the HTML source
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible({ timeout: 5_000 });
});
