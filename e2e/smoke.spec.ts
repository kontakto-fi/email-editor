import { test, expect } from '@playwright/test';

test('editor loads without errors', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });
});

test('can type in a text block without losing focus', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });

  // Click on text content in the canvas
  const canvasText = page.locator('text=If you ever need a hand').first();
  await canvasText.click();

  // The canvas textarea is the one with rows="1" inside a td (from TextEditor)
  const textarea = page.locator('td textarea[rows="1"]');
  await expect(textarea).toBeVisible({ timeout: 5_000 });

  // Select all existing text and type new text
  await textarea.focus();
  await textarea.selectText();
  await page.keyboard.type('Test typing 123', { delay: 30 });

  // Verify the textarea still has focus after typing and contains the text
  await expect(textarea).toBeFocused();
  await expect(textarea).toHaveValue('Test typing 123');
});
