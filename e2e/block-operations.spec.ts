import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });
});

test('delete a block using keyboard', async ({ page }) => {
  // Click on a text block to select it
  const textBlock = page.locator('text=If you ever need help').first();
  await expect(textBlock).toBeVisible({ timeout: 5_000 });
  await textBlock.click();

  // Wait for the block to be selected (textarea appears)
  const textarea = page.locator('td textarea[rows="1"]');
  await expect(textarea).toBeVisible({ timeout: 5_000 });

  // Click on the outline wrapper to take focus away from textarea
  // but keep the block selected
  const body = page.locator('body');
  await body.press('Escape');

  // Press Delete
  await page.keyboard.press('Delete');

  // The text should be gone
  await expect(page.locator('text=If you ever need help')).not.toBeVisible({ timeout: 5_000 });
});

test('block copy button appears in tune menu', async ({ page }) => {
  // Click on a text block
  const textBlock = page.locator('text=If you ever need help').first();
  await textBlock.click();

  // The tune menu should appear with a copy button
  const copyButton = page.locator('[data-testid="ContentCopyOutlinedIcon"]');
  await expect(copyButton).toBeVisible({ timeout: 5_000 });
});

test('inline edit a heading block', async ({ page }) => {
  // Click on the heading text
  const heading = page.locator('text=Reset your password').first();
  await expect(heading).toBeVisible({ timeout: 5_000 });
  await heading.click();

  // A textarea should appear for inline editing
  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible({ timeout: 5_000 });

  // Clear and type new text
  await textarea.focus();
  await textarea.selectText();
  await page.keyboard.type('New Heading Text', { delay: 20 });

  await expect(textarea).toHaveValue('New Heading Text');
});

test('links do not navigate in editor mode', async ({ page }) => {
  const initialUrl = page.url();

  // Click on a button block text
  const button = page.locator('span:has-text("Reset your password")').first();
  if (await button.isVisible()) {
    await button.click();
  }

  // URL should not have changed
  expect(page.url()).toBe(initialUrl);
});

test('preview tab renders content', async ({ page }) => {
  // Switch to preview tab
  await page.getByRole('button', { name: 'Preview' }).click();

  // The preview should still show the container
  await expect(page.locator('#drawer-container')).toBeVisible();

  // Switch back to editor
  await page.getByRole('button', { name: 'Editor' }).click();
  await expect(page.locator('#drawer-container')).toBeVisible();
});

test('html tab shows generated markup', async ({ page }) => {
  await page.getByRole('button', { name: 'HTML' }).click();

  // Should show HTML source
  await expect(page.locator('text=<!DOCTYPE html')).toBeVisible({ timeout: 5_000 });
});
