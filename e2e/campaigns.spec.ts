import { test, expect } from './fixtures';

test.describe('Campaign Page', () => {
  test('campaigns page loads with table', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/campaigns');
    await expect(authenticatedPage.page.locator('main h1')).toBeVisible();
    await expect(authenticatedPage.page.locator('table')).toBeVisible();
  });

  test('campaigns page has search input', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/campaigns');
    const searchInput = authenticatedPage.page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('campaigns page shows campaign rows', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/campaigns');
    const rows = authenticatedPage.page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('campaigns page has status filter', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/campaigns');
    const select = authenticatedPage.page.locator('select').first();
    await expect(select).toBeVisible();
  });

  test('campaigns page has new campaign button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/campaigns');
    const newBtn = authenticatedPage.page.locator('button').filter({ hasText: /Yeni|New|Kampanya|Campaign/ });
    await expect(newBtn.first()).toBeVisible();
  });

  test('campaign rows have checkboxes', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/campaigns');
    const checkboxes = authenticatedPage.page.locator('tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('campaign table has proper headers', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/campaigns');
    const headers = authenticatedPage.page.locator('th');
    const count = await headers.count();
    // Table should have multiple column headers (including checkbox column)
    expect(count).toBeGreaterThan(2);
  });
});
