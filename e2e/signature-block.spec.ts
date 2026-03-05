import { test, expect } from '@playwright/test';

/**
 * Helper to add a block by hovering over a divider area to trigger the add button,
 * then clicking it and selecting the block type from the menu.
 */
async function addBlock(page: any, blockLabel: string) {
  // The email canvas table — hover near the bottom to trigger the last add-block divider
  const table = page.locator('table[role="presentation"]').first();
  const box = await table.boundingBox();
  if (!box) throw new Error('Could not find canvas table');

  // Hover near the bottom center of the canvas to trigger the last divider add button
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 5);
  await page.waitForTimeout(300);

  // Click the add button that appears
  const addButton = page.locator('[data-testid="AddOutlinedIcon"]').last();
  await expect(addButton).toBeVisible({ timeout: 3_000 });
  await addButton.click();

  // Select the block type from the menu
  await page.getByText(blockLabel, { exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });
});

test('add personal signature and edit inline', async ({ page }) => {
  await addBlock(page, 'Personal Signature');

  // Default content should be visible
  await expect(page.locator('text=Best regards,')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('text=John Doe')).toBeVisible();

  // Click on the signature to select it — inputs should appear
  await page.locator('text=John Doe').click();

  // Find the name input and change it
  const nameInput = page.locator('input[placeholder="Name"]');
  await expect(nameInput).toBeVisible({ timeout: 5_000 });
  await nameInput.fill('Jane Smith');

  // Click elsewhere to deselect
  await page.locator('#drawer-container').click({ position: { x: 10, y: 10 } });

  // The new name should be rendered
  await expect(page.locator('text=Jane Smith')).toBeVisible();
});

test('add company signature with correct defaults', async ({ page }) => {
  await addBlock(page, 'Company Signature');

  // Company signature defaults
  await expect(page.locator('text=Acme Inc.')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('text=123 Main Street, City, Country')).toBeVisible();
  await expect(page.locator('text=support@example.com')).toBeVisible();
  await expect(page.locator('text=www.example.com')).toBeVisible();

  // Should NOT have personal greeting
  await expect(page.locator('text=Best regards,')).not.toBeVisible();
});

test('signature sidebar panel shows all fields', async ({ page }) => {
  await addBlock(page, 'Personal Signature');
  await expect(page.locator('text=John Doe')).toBeVisible({ timeout: 5_000 });

  // Click on the signature block to select it and open inspector
  await page.locator('text=John Doe').click();

  // The inspector should show "Signature block" panel
  await expect(page.locator('text=Signature block')).toBeVisible({ timeout: 5_000 });

  // Check that key fields are present in the sidebar
  await expect(page.getByRole('textbox', { name: 'Greeting' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Company' })).toBeVisible();
});
