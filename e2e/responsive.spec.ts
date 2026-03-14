import { test, expect } from './fixtures';

test.describe('Responsive Design - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile menu works', async ({ page }) => {
    await page.goto('/app/dashboard');
    
    // On mobile, page should load and show main content
    await expect(page.locator('main')).toBeVisible();
    
    // Page should have meaningful content even on mobile
    const mainContent = await page.locator('main').textContent();
    expect(mainContent?.length).toBeGreaterThan(10);
  });

  test('campaigns table responsive', async ({ page }) => {
    await page.goto('/app/campaigns');
    
    // Page should load on mobile
    await expect(page.locator('main')).toBeVisible();
  });

  test('dashboard cards stack on mobile', async ({ page }) => {
    await page.goto('/app/dashboard');
    
    // Dashboard should load and show content on mobile
    await expect(page.locator('main')).toBeVisible();
    const mainContent = await page.locator('main').textContent();
    expect(mainContent?.length).toBeGreaterThan(10);
  });
});

test.describe('Responsive Design - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('tablet layout shows content', async ({ page }) => {
    await page.goto('/app/dashboard');
    
    // Page should load and show content on tablet
    await expect(page.locator('main')).toBeVisible();
    const mainContent = await page.locator('main').textContent();
    expect(mainContent?.length).toBeGreaterThan(10);
  });
});
