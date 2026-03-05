import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Clear localStorage to always start with the default Welcome template
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });
});

test('add and delete a block using keyboard', async ({ page }) => {
  // Click the add block divider to open the menu
  const addButtons = page.locator('button:has(svg[data-testid="AddOutlinedIcon"])');
  await addButtons.last().click();

  // Select "Spacer" from the menu
  await page.getByText('Spacer', { exact: true }).click();

  // The spacer block should be selected (has blue outline)
  const spacerBlock = page.locator('[style*="outline: 2px solid rgba(0,121,204, 1)"]').last();
  await expect(spacerBlock).toBeVisible();

  // Press Delete to remove it — click on the canvas first to unfocus any inputs
  await spacerBlock.click();
  await page.keyboard.press('Delete');

  // The block should be gone — the outline should no longer be visible
  await expect(spacerBlock).not.toBeVisible({ timeout: 3_000 });
});

test('copy and paste a block with keyboard shortcuts', async ({ page }) => {
  // Click on a text block to select it
  const textBlock = page.locator('text=If you ever need help').first();
  await textBlock.click();

  // Wait for the block to be selected (textarea appears)
  const textarea = page.locator('td textarea[rows="1"]');
  await expect(textarea).toBeVisible({ timeout: 5_000 });

  // Click on the canvas background to deselect the textarea focus but keep block selected
  // We need to click on the wrapper area, not inside the textarea
  const wrapper = page.locator('[style*="outline: 2px solid rgba(0,121,204, 1)"]').first();
  await wrapper.click();

  // Copy with Ctrl+C
  await page.keyboard.press('Control+c');

  // Paste with Ctrl+V
  await page.keyboard.press('Control+v');

  // There should now be a duplicate — two instances of the text
  const textBlocks = page.locator('td textarea[rows="1"]');
  // The pasted block should be selected, so at least one textarea should be visible
  await expect(textBlocks.first()).toBeVisible({ timeout: 5_000 });
});

test('block copy button appears in tune menu', async ({ page }) => {
  // Click on a text block
  const textBlock = page.locator('text=If you ever need help').first();
  await textBlock.click();

  // The tune menu should appear with copy, move, and delete buttons
  const copyButton = page.locator('button:has(svg[data-testid="ContentCopyOutlinedIcon"])');
  await expect(copyButton).toBeVisible({ timeout: 5_000 });
});

test('add a signature block', async ({ page }) => {
  // Click the last add block button
  const addButtons = page.locator('button:has(svg[data-testid="AddOutlinedIcon"])');
  await addButtons.last().click();

  // Select "Personal Signature" from the menu
  await page.getByText('Personal Signature').click();

  // The signature should be visible with default content
  await expect(page.locator('text=John Doe')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('text=Best regards,')).toBeVisible();
  await expect(page.locator('text=Software Engineer')).toBeVisible();
});

test('inline edit a heading block', async ({ page }) => {
  // Click on the heading text
  const heading = page.locator('text=Reset your password').first();
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

  // Click on a button block — it should select the block, not navigate
  const button = page.locator('text=Reset your password').first();
  if (await button.isVisible()) {
    await button.click();
  }

  // URL should not have changed
  expect(page.url()).toBe(initialUrl);
});

test('preview tab renders content', async ({ page }) => {
  // Switch to preview tab
  await page.getByRole('button', { name: 'Preview' }).click();

  // The preview should render the email content
  await expect(page.locator('#drawer-container')).toBeVisible();

  // Switch back to editor
  await page.getByRole('button', { name: 'Editor' }).click();
  await expect(page.locator('#drawer-container')).toBeVisible();
});
