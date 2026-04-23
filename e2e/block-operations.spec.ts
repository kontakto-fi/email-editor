import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });
});

test('delete a block using keyboard', async ({ page }) => {
  // Click on a text block to select it (Welcome template has this text)
  const textBlock = page.locator('text=If you ever need a hand').first();
  await expect(textBlock).toBeVisible({ timeout: 5_000 });
  await textBlock.click();

  // Wait for the block to be selected (textarea appears)
  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible({ timeout: 5_000 });

  // Press Escape to deselect textarea but keep block selected
  await page.keyboard.press('Escape');

  // Press Delete
  await page.keyboard.press('Delete');

  // The text should be gone
  await expect(page.locator('text=If you ever need a hand')).not.toBeVisible({ timeout: 5_000 });
});

test('block copy button appears in tune menu', async ({ page }) => {
  // Click on a text block
  const textBlock = page.locator('text=If you ever need a hand').first();
  await textBlock.click();

  // The tune menu should appear with a copy button
  const copyButton = page.locator('[data-testid="ContentCopyOutlinedIcon"]');
  await expect(copyButton).toBeVisible({ timeout: 5_000 });
});

test('inline edit a text block', async ({ page }) => {
  // Click on a text block
  const textBlock = page.locator('text=If you ever need a hand').first();
  await expect(textBlock).toBeVisible({ timeout: 5_000 });
  await textBlock.click();

  // A textarea should appear for inline editing
  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible({ timeout: 5_000 });

  // Clear and type new text
  await textarea.focus();
  await textarea.selectText();
  await page.keyboard.type('New text content', { delay: 20 });

  await expect(textarea).toHaveValue('New text content');
});

test('preview tab renders content', async ({ page }) => {
  // Tabs use icons only. Switch to preview (2nd tab, index 1)
  const previewTab = page.locator('[role="tab"]').nth(1);
  await previewTab.click();

  // The container should still be visible
  await expect(page.locator('#drawer-container')).toBeVisible();

  // Switch back to editor (1st tab, index 0)
  const editorTab = page.locator('[role="tab"]').nth(0);
  await editorTab.click();
  await expect(page.locator('#drawer-container')).toBeVisible();
});

