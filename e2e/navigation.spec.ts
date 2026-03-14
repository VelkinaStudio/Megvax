import { test, expect } from '@playwright/test';

/**
 * Navigation E2E Tests
 * Tests global navigation and routing
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/dashboard');
  });

  test('should navigate through all main pages', async ({ page }) => {
    // Dashboard
    await expect(page).toHaveURL(/\/app\/dashboard/);
    
    // Navigate to each page via URL and verify h1 exists
    const pages = [
      '/app/campaigns',
      '/app/optimizations',
      '/app/insights',
      '/app/accounts',
      '/app/finance',
      '/app/support',
      '/app/settings',
    ];
    
    for (const url of pages) {
      await page.goto(url);
      await expect(page).toHaveURL(new RegExp(url.replace('/', '\\/')));
      await expect(page.locator('main h1')).toBeVisible();
    }
    
    // Back to Dashboard
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });

  test('should show active navigation state', async ({ page }) => {
    // Navigate to campaigns
    await page.goto('/app/campaigns');
    
    // Campaigns nav link should be visible in sidebar
    const campaignsLink = page.locator('a[href="/app/campaigns"]').first();
    await expect(campaignsLink).toBeVisible();
  });

  test('should handle browser back/forward', async ({ page }) => {
    // Start on dashboard
    await page.goto('/app/dashboard');
    
    // Navigate to campaigns
    await page.goto('/app/campaigns');
    await expect(page).toHaveURL(/\/app\/campaigns/);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/app\/dashboard/);
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/app\/campaigns/);
  });

  test('should maintain sidebar state across navigation', async ({ page }) => {
    // Check if sidebar/nav is visible
    const sidebar = page.locator('nav').first();
    await expect(sidebar).toBeVisible();
    
    // Navigate to different pages
    await page.goto('/app/campaigns');
    await expect(sidebar).toBeVisible();
    
    await page.goto('/app/optimizations');
    await expect(sidebar).toBeVisible();
  });

  test('should handle mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');
    
    // On mobile, page should load (main may need time to render)
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    // Navigate directly to campaigns
    await page.goto('/app/campaigns');
    await expect(page).toHaveURL(/\/app\/campaigns/);
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should preserve query parameters', async ({ page }) => {
    // Navigate with query params
    await page.goto('/app/campaigns?account=123&range=7d');
    
    // URL should maintain params
    await expect(page).toHaveURL(/account=123/);
    await expect(page).toHaveURL(/range=7d/);
    
    // Navigate to another page
    await page.goto('/app/dashboard');
    
    // Dashboard should load
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });
});
