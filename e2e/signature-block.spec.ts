import { test, expect } from '@playwright/test';

// The add-block divider button requires precise mouse hover positioning (within 20px)
// which is fragile in e2e tests. Instead we test signature rendering by loading
// a template that already includes a signature block.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Set up a template with a personal signature block already included
  const template = {
    root: {
      type: 'EmailLayout',
      data: {
        backdropColor: '#F2F5F7',
        canvasColor: '#FFFFFF',
        textColor: '#242424',
        fontFamily: 'MODERN_SANS',
        childrenIds: ['sig-1'],
      },
    },
    'sig-1': {
      type: 'Signature',
      data: {
        style: { padding: { top: 16, bottom: 16, left: 24, right: 24 } },
        props: {
          greeting: 'Best regards,',
          name: 'John Doe',
          title: 'Software Engineer',
          company: 'Acme Inc.',
          email: 'john@example.com',
          phone: '+1 234 567 890',
          website: 'www.example.com',
          address: '123 Main Street, City, Country',
        },
      },
    },
  };
  await page.evaluate((t) => {
    localStorage.setItem('lastEditedTemplate', JSON.stringify(t));
  }, template);
  await page.reload();
  await expect(page.locator('#drawer-container')).toBeVisible({ timeout: 10_000 });
});

test('signature block renders greeting and name', async ({ page }) => {
  await expect(page.locator('text=Best regards,')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('text=John Doe')).toBeVisible();
  await expect(page.locator('text=Acme Inc.')).toBeVisible();
});

test('signature sidebar panel shows on click', async ({ page }) => {
  await expect(page.locator('text=John Doe')).toBeVisible({ timeout: 5_000 });

  // Click on the signature block to select it
  await page.locator('text=John Doe').click();

  // The inspector should show "Signature block" panel
  await expect(page.locator('text=Signature block')).toBeVisible({ timeout: 5_000 });
});
