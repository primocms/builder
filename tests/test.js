import { expect, test } from '@playwright/test';

test('Navigates to root-level page', async ({ page }) => {
    await page.goto('http://localhost:5173/theme-nonprofit');
    await page.waitForSelector('.spinner-container', { state: 'detached' });
    await page.click('button#toolbar--pages');
    await page.getByRole('link', { name: 'About /about' }).click();
    await page.getByRole('navigation', { name: 'toolbar' }).getByText('About')
	await page.waitForTimeout(100);
    await expect(page.url()).toBe('http://localhost:5173/theme-nonprofit/about');
});

test('Navigates to child-level page', async ({ page }) => {
    await page.goto('http://localhost:5173/theme-nonprofit');
    await page.waitForSelector('.spinner-container', { state: 'detached' });
	await page.click('button#toolbar--pages');
    await page.getByRole('link', { name: 'Blog Post /blog-post' }).click();
	await page.getByRole('navigation', { name: 'toolbar' }).getByText('Blog Post')
	await page.waitForTimeout(100);
    await expect(page.url()).toBe('http://localhost:5173/theme-nonprofit/blog/blog-post');
});

test('Edits Site CSS', async ({ page }) => {
    await page.goto('http://localhost:5173/theme-minimal');
	await page.waitForSelector('.spinner-container', { state: 'detached' });
    await page.getByRole('button', { name: 'Site' }).click();
    await page.getByRole('button', { name: 'Toggle code mode' }).click();
    await page.getByText('rem').first().click();
    await page.getByText('1', { exact: true }).nth(2).click();
    await page.getByText('rem').first().click();
    await page.getByText('@import url("https://unpkg.com/@primo-app/primo@1.3.64/reset.css");#page { font-').fill('\n\n@import url("https://unpkg.com/@primo-app/primo@1.3.64/reset.css");\n\n\n#page {\n  font-family: system-ui, sans-serif;\n  color: var(--color);\n  line-height: 1.6; \n  font-size: 5rem;\n  background: var(--background);\n}\n\n\n.section-container {\n  max-width: var(--max-width, 1000px);\n  margin: 0 auto;\n  padding: 3rem var(--padding, 1rem); \n}\n\n\n.heading {\n  font-size: 3rem;\n  line-height: 1;\n  font-weight: 700;\n  margin: 0;\n}\n\n\n.button {\n  color: white;\n  background: var(--color-accent);\n  border-radius: 5px;\n  padding: 8px 20px;\n  transition: var(--transition);\n\n\n  &:hover {\n    box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.1);\n  } \n\n\n  &.inverted {');
    await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForTimeout(2000);

	const fontSize = await page.$eval('#page', (element) => {
		return window.getComputedStyle(element).getPropertyValue('font-size');
	});

	const expectedFontSizePixels = 80; // 5rem equals 80px for most browsers by default
	expect(parseFloat(fontSize)).toBe(expectedFontSizePixels);
});

test('Creates a new page', async ({ page }) => {
    await page.goto('http://localhost:5173/theme-nonprofit');
    await page.waitForSelector('.spinner-container', { state: 'detached' });
	await page.click('button#toolbar--pages');
    await page.getByRole('button', { name: 'Create Page' }).click();
	await page.getByPlaceholder('About Us', { exact: true }).fill('blankpage');
	await page.getByRole('combobox', { name: 'Create from' }).selectOption('null');
	await page.getByRole('listitem').filter({ hasText: 'Page Name Page URL Create from Blank───────AboutMissionHome PageTeamBlogBlog Pos' }).getByRole('button').click();
	const detailsElement = await page.$('.details:has-text("blankpage /blankpage")');
	expect(detailsElement).not.toBeNull();
});
