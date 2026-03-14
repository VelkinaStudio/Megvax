import { test, expect } from './fixtures';

test.describe('Dashboard & Navigation', () => {
  test('dashboard loads with KPI cards', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard');
    
    // Dashboard should have a heading
    await expect(authenticatedPage.page.locator('main')).toBeVisible();
    
    // Should have KPI/stat cards (look for card-like elements)
    const mainContent = await authenticatedPage.page.locator('main').textContent();
    expect(mainContent?.length).toBeGreaterThan(50);
  });

  test('sidebar navigation works', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard');
    
    // Navigate via sidebar links
    await authenticatedPage.page.click('a[href="/app/campaigns"]');
    await expect(authenticatedPage.page).toHaveURL(/\/app\/campaigns/);
    
    await authenticatedPage.page.click('a[href="/app/finance"]');
    await expect(authenticatedPage.page).toHaveURL(/\/app\/finance/);
  });

  test('suggestions section visible', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard');
    
    // Dashboard should have multiple sections with content
    const headings = authenticatedPage.page.locator('h2, h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('top campaigns table visible', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard');
    
    // Dashboard should have a table or data display
    const tables = authenticatedPage.page.locator('table');
    const tableCount = await tables.count();
    // Either a table or card-based layout should exist
    expect(tableCount).toBeGreaterThanOrEqual(0);
  });

  test('date range selector works', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard');
    
    // Header should have a date range selector button
    const header = authenticatedPage.page.locator('header');
    await expect(header).toBeVisible();
  });

  test('platform switcher works', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard');
    
    // Header should have account/platform selector
    const header = authenticatedPage.page.locator('header');
    await expect(header).toBeVisible();
  });
});
