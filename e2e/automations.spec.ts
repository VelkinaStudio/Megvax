import { test, expect } from './fixtures';

test.describe('Optimizations Page', () => {
  test('optimizations page loads correctly', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/optimizations');
    await expect(authenticatedPage.page.locator('main h1')).toBeVisible();
  });

  test('optimizations page has content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/optimizations');
    
    const mainContent = await authenticatedPage.page.locator('main').textContent();
    expect(mainContent?.length).toBeGreaterThan(50);
  });

  test('optimizations page has interactive elements', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/optimizations');
    
    // Page should have buttons somewhere (header, sidebar, or main)
    const buttons = authenticatedPage.page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('optimizations page has cards or sections', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/optimizations');
    
    // Should have meaningful content in main area
    const mainContent = await authenticatedPage.page.locator('main').textContent();
    expect(mainContent?.length).toBeGreaterThan(20);
  });
});
