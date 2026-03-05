import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });
});

test('add personal signature and edit inline', async ({ page }) => {
  // Add a personal signature block
  const addButtons = page.locator('button:has(svg[data-testid="AddOutlinedIcon"])');
  await addButtons.last().click();
  await page.getByText('Personal Signature').click();

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
  await page.locator('[style*="backdrop"]').first().click();

  // The new name should be rendered
  await expect(page.locator('text=Jane Smith')).toBeVisible();
});

test('add company signature with correct defaults', async ({ page }) => {
  const addButtons = page.locator('button:has(svg[data-testid="AddOutlinedIcon"])');
  await addButtons.last().click();
  await page.getByText('Company Signature').click();

  // Company signature defaults
  await expect(page.locator('text=Acme Inc.')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('text=123 Main Street, City, Country')).toBeVisible();
  await expect(page.locator('text=support@example.com')).toBeVisible();
  await expect(page.locator('text=www.example.com')).toBeVisible();

  // Should NOT have personal fields
  await expect(page.locator('text=Best regards,')).not.toBeVisible();
  await expect(page.locator('text=John Doe')).not.toBeVisible();
});

test('signature sidebar panel shows all fields', async ({ page }) => {
  // Add a personal signature
  const addButtons = page.locator('button:has(svg[data-testid="AddOutlinedIcon"])');
  await addButtons.last().click();
  await page.getByText('Personal Signature').click();
  await expect(page.locator('text=John Doe')).toBeVisible({ timeout: 5_000 });

  // Click on the signature block to select it and open inspector
  await page.locator('text=John Doe').click();

  // The inspector should show "Signature block" panel
  await expect(page.locator('text=Signature block')).toBeVisible({ timeout: 5_000 });

  // Check that key fields are present in the sidebar
  await expect(page.getByRole('textbox', { name: 'Greeting' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Company' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
});
