import { test, expect } from '@playwright/test';

test('embedded mode hides samples drawer toggle', async ({ page }) => {
  // The html-import test page uses samplesDrawerEnabled={false}
  await page.goto('/e2e/test-html-import.html');
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });

  // The samples drawer toggle (menu icon) should NOT be visible
  const menuIcon = page.locator('[data-testid="MenuOutlinedIcon"]');
  await expect(menuIcon).not.toBeVisible();

  // The collapse icon should also not be visible
  const collapseIcon = page.locator('[data-testid="FirstPageOutlinedIcon"]');
  await expect(collapseIcon).not.toBeVisible();
});

test('embedded mode allows inline HTML editing', async ({ page }) => {
  await page.goto('/e2e/test-html-import.html');
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });

  // The HTML content should be rendered
  await expect(page.locator('text=Welcome to our service')).toBeVisible({ timeout: 5_000 });

  // Click on the HTML content to select the block
  await page.locator('text=Welcome to our service').click();

  // The HtmlEditor shows a monospace textarea when selected — use the one inside the canvas (td)
  const textarea = page.locator('td textarea');
  await expect(textarea).toBeVisible({ timeout: 5_000 });

  // The textarea should contain the raw HTML source
  const value = await textarea.inputValue();
  expect(value).toContain('Welcome to our service');
});
