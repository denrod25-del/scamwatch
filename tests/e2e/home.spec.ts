import { test, expect } from '@playwright/test';

test('home page loads with the search entry and the not-legal-advice disclaimer', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/know before you click/i);
  await expect(page.getByRole('searchbox')).toBeVisible();
  await expect(page.getByText(/not legal advice/i)).toBeVisible();
});

test('@a11y the skip link is the first focusable element', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText(/skip to main content/i);
});
