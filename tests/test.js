import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Welcome to SvelteKit' })).toBeVisible();
});

// navigate between pages
test('navigate between pages', async ({ page }) => {
	await page.goto('/');
	await page.click('text=about');

  await page.getByRole('button', { name: 'Pages' }).click();
  await page.getByRole('link', { name: 'About /' }).click();
	await expect(page.url()).toBe('http://localhost:3000/about');
	await page.goBack();
	await expect(page.url()).toBe('http://localhost:3000/');
})
