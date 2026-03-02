import { test, expect } from '@playwright/test';

test('initialTemplate renders raw HTML string in an Html block', async ({ page }) => {
  await page.goto('/e2e/test-html-import.html');
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });

  // The raw HTML should be rendered inside the editor canvas via the Html block.
  // Our HTML_CONTENT has "Welcome to our service" as an h1 and "raw HTML" in bold.
  await expect(page.locator('text=Welcome to our service')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('text=raw HTML')).toBeVisible();

  // Click the HTML block to select it
  await page.locator('text=Welcome to our service').click();

  // The inspector sidebar should switch to the Html block panel
  // with a textarea containing the raw HTML
  await expect(page.getByRole('textbox', { name: 'Content' })).toBeVisible({ timeout: 5_000 });
  const sidebarTextarea = page.getByRole('textbox', { name: 'Content' });
  const value = await sidebarTextarea.inputValue();
  expect(value).toContain('Welcome to our service');
  expect(value).toContain('<strong>raw HTML</strong>');
});
