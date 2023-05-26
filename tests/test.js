import { expect, test } from '@playwright/test';

test('Navigates to root-level page', async ({ page }) => {
	await page.goto('http://localhost:5173/theme-nonprofit');
	await page.click('button#toolbar--pages');
	await page.getByRole('link', { name: 'About /about' }).click();
	await page.getByRole('navigation', { name: 'toolbar' }).getByText('About')
	await expect(page.url()).toBe('http://localhost:5173/theme-nonprofit/about');
});